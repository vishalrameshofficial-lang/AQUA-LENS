import { NextResponse } from "next/server";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { FALLBACK_COMPLAINTS, FALLBACK_COMMUNITIES } from "@/lib/fallback-data";
import {
  findNearestCommunity,
  evaluateComplaintPriority,
  detectComplaintHotspots,
  ComplaintCategoryValue,
} from "@/lib/complaints";
import {
  determineComplaintDepartment,
  generateUniqueTrackingId,
} from "@/lib/complaint-routing";

export async function GET(request: Request) {
  const session = await getSessionUser();
  const isAdmin = !session || (session.role as string) === "ADMIN" || (session.role as string) === "ADMINISTRATOR";

  if (!isDatabaseAvailable) {
    const userFilteredComplaints = isAdmin
      ? FALLBACK_COMPLAINTS
      : FALLBACK_COMPLAINTS.filter(
          (c: any) =>
            c.reporterId === session?.id ||
            c.reporterContact === session?.email ||
            (c.reporterName && session?.name && c.reporterName.toLowerCase().includes(session.name.toLowerCase()))
        );

    return NextResponse.json({
      success: true,
      data: userFilteredComplaints,
      kpis: {
        total: userFilteredComplaints.length,
        open: userFilteredComplaints.filter((c: any) => c.status === "REPORTED" || c.status === "ROUTED").length,
        underReview: userFilteredComplaints.filter((c: any) => c.status === "UNDER_REVIEW").length,
        inProgress: userFilteredComplaints.filter((c: any) => c.status === "IN_PROGRESS" || c.status === "ASSIGNED").length,
        resolved: userFilteredComplaints.filter((c: any) => c.status === "RESOLVED").length,
        closed: userFilteredComplaints.filter((c: any) => c.status === "CLOSED").length,
        highPriority: userFilteredComplaints.filter((c: any) => c.priority === "HIGH" || c.priority === "CRITICAL").length,
        verified: userFilteredComplaints.filter((c: any) => c.verificationStatus === "VERIFIED").length,
      },
      categoryDistribution: [
        { category: "WATER_QUALITY", count: 2 },
        { category: "WATER_SUPPLY", count: 1 },
      ],
      statusDistribution: [
        { status: "IN_PROGRESS", count: 1 },
        { status: "ASSIGNED", count: 1 },
        { status: "INVESTIGATING", count: 1 },
      ],
      hotspots: [],
    });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase().trim();
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const communityId = searchParams.get("communityId");
    const verificationStatus = searchParams.get("verificationStatus");
    const assignedOfficerId = searchParams.get("assignedOfficerId");
    const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 200);

    const where: any = {};

    // ROLE-BASED SCOPING: Regular users can only see their own complaints
    if (!isAdmin && session?.id) {
      where.OR = [
        { reporterId: session.id },
        { reporterContact: session.email },
      ];
    } else if (!isAdmin && !session) {
      where.reporterId = "__none__";
    }

    if (category && category !== "ALL") where.category = category;
    if (status && status !== "ALL") where.status = status;
    if (priority && priority !== "ALL") where.priority = priority;
    if (communityId && communityId !== "ALL") where.communityId = communityId;
    if (verificationStatus && verificationStatus !== "ALL") where.verificationStatus = verificationStatus;
    if (assignedOfficerId && assignedOfficerId !== "ALL") where.assignedOfficerId = assignedOfficerId;

    if (search) {
      const searchConditions = [
        { complaintNumber: { contains: search } },
        { trackingId: { contains: search } },
        { title: { contains: search } },
        { description: { contains: search } },
        { locationName: { contains: search } },
      ];
      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchConditions }];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
    }

    const [complaints, allForStats] = await Promise.all([
      prisma.complaint.findMany({
        where,
        take: limit,
        orderBy: [{ createdAt: "desc" }],
        include: {
          community: {
            select: {
              id: true,
              name: true,
              code: true,
              district: true,
              block: true,
              state: true,
              compositeVulnerabilityScore: true,
              vulnerabilityCategory: true,
              waterAccessPct: true,
              sanitationAccessPct: true,
              floodHazardLevel: true,
              infrastructureScore: true,
            },
          },
          evidence: true,
          statusHistory: {
            orderBy: { createdAt: "desc" },
            take: 3,
          },
          verifications: {
            select: {
              id: true,
              status: true,
              verificationDate: true,
              officerName: true,
            },
          },
        },
      }),
      prisma.complaint.findMany({
        select: {
          id: true,
          category: true,
          status: true,
          priority: true,
          verificationStatus: true,
          latitude: true,
          longitude: true,
          communityId: true,
          community: {
            select: { name: true },
          },
        },
      }),
    ]);

    // KPI Calculations
    const total = allForStats.length;
    const open = allForStats.filter(c => c.status === "REPORTED" || c.status === "ROUTED").length;
    const underReview = allForStats.filter(c => c.status === "UNDER_REVIEW").length;
    const inProgress = allForStats.filter(c => c.status === "IN_PROGRESS" || c.status === "ASSIGNED").length;
    const resolved = allForStats.filter(c => c.status === "RESOLVED").length;
    const closed = allForStats.filter(c => c.status === "CLOSED").length;
    const highPriority = allForStats.filter(c => c.priority === "HIGH" || c.priority === "CRITICAL").length;
    const verified = allForStats.filter(c => c.verificationStatus === "VERIFIED").length;

    // Distribution by Category
    const catMap: Record<string, number> = {};
    allForStats.forEach(c => {
      catMap[c.category] = (catMap[c.category] || 0) + 1;
    });
    const categoryDistribution = Object.entries(catMap).map(([category, count]) => ({
      category,
      count,
    }));

    // Distribution by Status
    const statusMap: Record<string, number> = {};
    allForStats.forEach(c => {
      statusMap[c.status] = (statusMap[c.status] || 0) + 1;
    });
    const statusDistribution = Object.entries(statusMap).map(([status, count]) => ({
      status,
      count,
    }));

    let hotspots: any[] = [];
    try {
      hotspots = detectComplaintHotspots(allForStats as any);
    } catch (e) {
      console.warn("Hotspot detection skipped:", e);
    }

    return NextResponse.json({
      success: true,
      data: complaints,
      kpis: {
        total,
        open,
        underReview,
        inProgress,
        resolved,
        closed,
        highPriority,
        verified,
      },
      categoryDistribution,
      statusDistribution,
      hotspots,
    });
  } catch (error: any) {
    console.warn("GET /api/complaints DB unavailable, serving fallback grievances:", error?.message);
    const userFilteredComplaints = isAdmin
      ? FALLBACK_COMPLAINTS
      : FALLBACK_COMPLAINTS.filter(
          (c: any) =>
            c.reporterId === session?.id ||
            c.reporterContact === session?.email ||
            (c.reporterName && session?.name && c.reporterName.toLowerCase().includes(session.name.toLowerCase()))
        );

    return NextResponse.json({
      success: true,
      data: userFilteredComplaints,
      kpis: {
        total: userFilteredComplaints.length,
        open: userFilteredComplaints.filter((c: any) => c.status === "REPORTED" || c.status === "ROUTED").length,
        underReview: userFilteredComplaints.filter((c: any) => c.status === "UNDER_REVIEW").length,
        inProgress: userFilteredComplaints.filter((c: any) => c.status === "IN_PROGRESS" || c.status === "ASSIGNED").length,
        resolved: userFilteredComplaints.filter((c: any) => c.status === "RESOLVED").length,
        closed: userFilteredComplaints.filter((c: any) => c.status === "CLOSED").length,
        highPriority: userFilteredComplaints.filter((c: any) => c.priority === "HIGH" || c.priority === "CRITICAL").length,
        verified: userFilteredComplaints.filter((c: any) => c.verificationStatus === "VERIFIED").length,
      },
      categoryDistribution: [
        { category: "WATER_QUALITY", count: 2 },
        { category: "WATER_SUPPLY", count: 1 },
      ],
      statusDistribution: [
        { status: "IN_PROGRESS", count: 1 },
        { status: "ASSIGNED", count: 1 },
        { status: "INVESTIGATING", count: 1 },
      ],
      hotspots: [],
    });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    const body = await request.json();

    const {
      title,
      description,
      category,
      locationName,
      latitude,
      longitude,
      locationAccuracy,
      locationCapturedAt,
      evidenceCapturedAt,
      language = "en",
      communityId,
      reporterName,
      reporterContact,
      isAnonymous = false,
      evidence = [],
    } = body;

    if (!description || !category) {
      return NextResponse.json(
        { error: "Description and category are required." },
        { status: 400 }
      );
    }

    const resolvedTitle =
      (title || "").trim() ||
      String(category).replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) + " Grievance";

    const resolvedLocationName = (locationName || "").trim() || "Mandapam, Ramanathapuram, Tamil Nadu";

    const lat = typeof latitude === "number" ? latitude : parseFloat(latitude) || null;
    const lng = typeof longitude === "number" ? longitude : parseFloat(longitude) || null;
    const locAcc = typeof locationAccuracy === "number" ? locationAccuracy : parseFloat(locationAccuracy) || null;

    // Resolve Community
    let resolvedCommunityId = communityId || null;
    let resolvedCommunity: any = null;

    if (isDatabaseAvailable) {
      try {
        if (resolvedCommunityId) {
          resolvedCommunity = await prisma.community.findUnique({
            where: { id: resolvedCommunityId },
          });
        } else if (lat !== null && lng !== null) {
          const allCommunities = await prisma.community.findMany({
            select: {
              id: true,
              name: true,
              state: true,
              district: true,
              block: true,
              latitude: true,
              longitude: true,
              compositeVulnerabilityScore: true,
              vulnerabilityCategory: true,
            },
          });
          const nearest = findNearestCommunity(lat, lng, allCommunities);
          if (nearest) {
            resolvedCommunityId = nearest.community.id;
            resolvedCommunity = nearest.community;
          }
        }
      } catch (commErr) {
        console.warn("Could not query DB for community, falling back to mock community:", commErr);
      }
    }

    if (!resolvedCommunity) {
      if (resolvedCommunityId) {
        resolvedCommunity = FALLBACK_COMMUNITIES.find(c => c.id === resolvedCommunityId);
      }
      if (!resolvedCommunity && lat !== null && lng !== null) {
        const nearest = findNearestCommunity(lat, lng, FALLBACK_COMMUNITIES as any);
        if (nearest) {
          resolvedCommunityId = nearest.community.id;
          resolvedCommunity = nearest.community;
        }
      }
      if (!resolvedCommunity) {
        resolvedCommunity = FALLBACK_COMMUNITIES[0];
        resolvedCommunityId = resolvedCommunity?.id || "comm-01";
      }
    }

    // Determine Administrative Jurisdiction & Responsible Department Routing
    const routing = determineComplaintDepartment({
      category,
      district: resolvedCommunity?.district || "Ramanathapuram",
      block: resolvedCommunity?.block || "Mandapam",
      state: resolvedCommunity?.state || "Tamil Nadu",
      communityName: resolvedCommunity?.name || locationName,
    });

    let count = FALLBACK_COMPLAINTS.length;
    if (isDatabaseAvailable) {
      try {
        count = await prisma.complaint.count();
      } catch (e) {
        // ignore
      }
    }
    const complaintNumber = `CMP-2026-${String(count + 1).padStart(4, "0")}`;
    const trackingId = generateUniqueTrackingId({
      state: resolvedCommunity?.state || "Tamil Nadu",
      district: resolvedCommunity?.district || "Ramanathapuram",
      count,
    });

    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const { priority, reason: priorityReason } = evaluateComplaintPriority({
      category,
      communityVulnerabilityScore: resolvedCommunity?.compositeVulnerabilityScore || 50,
      similarRecentComplaintsCount: 1,
    });

    const finalReporterName = isAnonymous
      ? "Citizen (Anonymous)"
      : (reporterName?.trim() || session?.name || "Citizen Reporter");

    const finalReporterContact = isAnonymous ? null : (reporterContact?.trim() || session?.email || null);

    // Build complete record
    const newComplaintRecord: any = {
      id: `cmp-${Date.now()}`,
      complaintNumber,
      trackingId,
      title: resolvedTitle,
      description: description.trim(),
      category,
      status: "REPORTED",
      priority,
      priorityReason,
      language,
      locationName: resolvedLocationName,
      latitude: lat,
      longitude: lng,
      locationAccuracy: locAcc,
      locationCapturedAt: locationCapturedAt ? new Date(locationCapturedAt).toISOString() : lat ? new Date().toISOString() : null,
      evidenceCapturedAt: evidenceCapturedAt ? new Date(evidenceCapturedAt).toISOString() : null,
      routedDepartment: routing.department,
      jurisdiction: routing.jurisdiction,
      routingStatus: routing.routingStatus,
      clientIp,
      communityId: resolvedCommunityId,
      reporterId: session ? session.id : null,
      reporterName: finalReporterName,
      reporterContact: finalReporterContact,
      isAnonymous: !!isAnonymous,
      verificationStatus: "UNVERIFIED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      community: resolvedCommunity,
      evidence: Array.isArray(evidence)
        ? evidence.map((e: any, idx: number) => ({
            id: `ev-${Date.now()}-${idx}`,
            fileUrl: e.fileUrl || e.url || e.dataUrl || "https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=800&auto=format&fit=crop",
            caption: e.caption || "Live camera evidence",
            fileType: e.fileType || "image",
            captureType: e.captureType || "LIVE_CAMERA",
            latitude: e.latitude ?? lat,
            longitude: e.longitude ?? lng,
            locationAccuracy: e.locationAccuracy ?? locAcc,
          }))
        : [],
      statusHistory: [
        {
          id: `sh-${Date.now()}-1`,
          oldStatus: "NONE",
          newStatus: "REPORTED",
          changedByName: finalReporterName,
          notes: `Citizen registered grievance via Aqua-Lens Citizen Portal. Language: ${language.toUpperCase()}.`,
          createdAt: new Date().toISOString(),
        },
        {
          id: `sh-${Date.now()}-2`,
          oldStatus: "REPORTED",
          newStatus: "ROUTED",
          changedByName: "Automatic Department Routing Engine",
          notes: `Forwarded to ${routing.department} (${routing.jurisdiction}). Nodal Officer: ${routing.nodalOfficer}. SLA: ${routing.slaHours} hours.`,
          createdAt: new Date().toISOString(),
        },
      ],
      verifications: [],
    };

    // ALWAYS store in FALLBACK_COMPLAINTS so Admin Portal Complaint Center immediately shows it!
    FALLBACK_COMPLAINTS.unshift(newComplaintRecord);

    let dbComplaint: any = null;

    if (isDatabaseAvailable) {
      try {
        dbComplaint = await prisma.complaint.create({
          data: {
            complaintNumber,
            trackingId,
            title: resolvedTitle,
            description: description.trim(),
            category,
            status: "REPORTED",
            priority,
            priorityReason,
            language,
            locationName: resolvedLocationName,
            latitude: lat,
            longitude: lng,
            locationAccuracy: locAcc,
            locationCapturedAt: locationCapturedAt ? new Date(locationCapturedAt) : lat ? new Date() : null,
            evidenceCapturedAt: evidenceCapturedAt ? new Date(evidenceCapturedAt) : null,
            routedDepartment: routing.department,
            jurisdiction: routing.jurisdiction,
            routingStatus: routing.routingStatus,
            clientIp,
            communityId: resolvedCommunityId,
            reporterId: session ? session.id : null,
            reporterName: finalReporterName,
            reporterContact: finalReporterContact,
            isAnonymous: !!isAnonymous,
            verificationStatus: "UNVERIFIED",
            evidence: {
              create: Array.isArray(evidence)
                ? evidence.map((e: any) => ({
                    fileUrl: e.fileUrl || e.url || e.dataUrl,
                    caption: e.caption || "Live camera evidence",
                    fileType: e.fileType || "image",
                    captureType: e.captureType || "LIVE_CAMERA",
                    latitude: e.latitude ?? lat,
                    longitude: e.longitude ?? lng,
                    locationAccuracy: e.locationAccuracy ?? locAcc,
                  }))
                : [],
            },
            statusHistory: {
              create: [
                {
                  oldStatus: "NONE",
                  newStatus: "REPORTED",
                  changedById: session?.id || null,
                  changedByName: finalReporterName,
                  notes: `Citizen registered grievance via Aqua-Lens Citizen Portal. Language: ${language.toUpperCase()}.`,
                },
                {
                  oldStatus: "REPORTED",
                  newStatus: "ROUTED",
                  changedById: null,
                  changedByName: "Automatic Department Routing Engine",
                  notes: `Forwarded to ${routing.department} (${routing.jurisdiction}). Nodal Officer: ${routing.nodalOfficer}. SLA: ${routing.slaHours} hours.`,
                },
              ],
            },
          },
          include: {
            community: true,
            evidence: true,
            statusHistory: true,
          },
        });

        if (dbComplaint) {
          newComplaintRecord.id = dbComplaint.id;
        }

        // Notify Admins
        try {
          const adminUsers = await prisma.user.findMany({
            where: { role: { in: ["ADMIN", "ADMINISTRATOR"] } },
            select: { id: true },
          });
          if (adminUsers.length > 0) {
            await prisma.notification.createMany({
              data: adminUsers.map(admin => ({
                userId: admin.id,
                title: "🆕 NEW GRIEVANCE REGISTERED",
                message: `Tracking ID: ${trackingId} | Category: ${category.replace(/_/g, " ")} | Priority: ${priority} | Location: ${resolvedLocationName} | Reporter: ${finalReporterName}`,
                link: `/complaints/${dbComplaint.id}`,
                read: false,
              })),
            });
          }
        } catch (notifErr) {
          console.warn("Could not create admin notifications:", notifErr);
        }
      } catch (dbErr) {
        console.warn("Prisma create failed, falling back to in-memory complaint:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Grievance registered and routed successfully.",
      data: dbComplaint || newComplaintRecord,
      trackingId,
      complaintNumber,
      routing,
    });
  } catch (error: any) {
    console.error("POST /api/complaints error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create complaint" },
      { status: 500 }
    );
  }
}
