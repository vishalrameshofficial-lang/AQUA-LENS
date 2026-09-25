import { NextResponse } from "next/server";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { FALLBACK_COMPLAINTS } from "@/lib/fallback-data";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    const { id } = await params;
    const isAdmin = !session || (session.role as string) === "ADMIN" || (session.role as string) === "ADMINISTRATOR";

    if (isDatabaseAvailable) {
      try {
        const complaint = await prisma.complaint.findFirst({
          where: {
            OR: [{ id }, { complaintNumber: id }, { trackingId: id }],
          },
          include: {
            community: {
              select: {
                id: true,
                name: true,
                code: true,
                district: true,
                block: true,
                state: true,
                latitude: true,
                longitude: true,
                population: true,
                waterAccessPct: true,
                sanitationAccessPct: true,
                floodHazardLevel: true,
                infrastructureScore: true,
                compositeVulnerabilityScore: true,
                vulnerabilityCategory: true,
                sourceStatus: true,
                isSampleData: true,
              },
            },
            evidence: true,
            statusHistory: {
              orderBy: { createdAt: "desc" },
            },
            verifications: {
              include: {
                officer: {
                  select: { id: true, name: true, email: true },
                },
              },
              orderBy: { verificationDate: "desc" },
            },
            assignedOfficerUser: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        });

        if (complaint) {
          // If citizen user, check ownership
          if (!isAdmin && complaint.reporterId && session?.id !== complaint.reporterId) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
          }
          return NextResponse.json({ success: true, data: complaint });
        }
      } catch (dbErr) {
        console.warn("DB query in /api/complaints/[id] failed, checking fallback:", dbErr);
      }
    }

    // Fallback in-memory search
    const fallbackComplaint = (FALLBACK_COMPLAINTS as any[]).find(
      (c: any) => c.id === id || c.complaintNumber === id || c.trackingId === id
    );

    if (!fallbackComplaint) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
    }

    if (!isAdmin && fallbackComplaint.reporterId && session?.id !== fallbackComplaint.reporterId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: fallbackComplaint });
  } catch (error: any) {
    console.error("GET /api/complaints/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to load complaint" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();

    // Only ADMIN can update complaints
    const isAdmin = (session?.role as string) === "ADMIN" || (session?.role as string) === "ADMINISTRATOR";
    if (!session || !isAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const {
      status,
      priority,
      priorityReason,
      assignedOfficerId,
      assignedOfficerName,
      verificationStatus,
      resolutionNotes,
      note,
    } = body;

    // Update in fallback data first for immediate in-memory reflection
    const fallbackIndex = FALLBACK_COMPLAINTS.findIndex(
      (c: any) => c.id === id || c.complaintNumber === id || c.trackingId === id
    );

    let updatedFallback: any = null;
    if (fallbackIndex !== -1) {
      const existing = FALLBACK_COMPLAINTS[fallbackIndex];
      const oldStatus = existing.status;
      updatedFallback = {
        ...existing,
        status: status || existing.status,
        priority: priority || existing.priority,
        priorityReason: priorityReason || existing.priorityReason,
        assignedOfficerName: assignedOfficerName || existing.assignedOfficerName,
        verificationStatus: verificationStatus || existing.verificationStatus,
        updatedAt: new Date().toISOString(),
      };
      if (status && status !== oldStatus) {
        if (!updatedFallback.statusHistory) updatedFallback.statusHistory = [];
        updatedFallback.statusHistory.unshift({
          id: `sh-${Date.now()}`,
          oldStatus,
          newStatus: status,
          changedByName: session.name || "Administrator",
          notes: note || `Status updated from ${oldStatus} to ${status}.`,
          createdAt: new Date().toISOString(),
        });
      }
      FALLBACK_COMPLAINTS[fallbackIndex] = updatedFallback;
    }

    if (isDatabaseAvailable) {
      try {
        const existing = await prisma.complaint.findFirst({
          where: { OR: [{ id }, { complaintNumber: id }, { trackingId: id }] },
        });

        if (existing) {
          const updateData: any = {};
          let statusChangeNote: string | null = null;
          const oldStatus = existing.status;

          if (status && status !== oldStatus) {
            updateData.status = status;
            statusChangeNote = note || `Status updated from ${oldStatus} to ${status}.`;
            if (status === "RESOLVED") {
              updateData.resolvedAt = new Date();
              updateData.resolutionNotes = resolutionNotes || note || "Resolved by administration.";
            } else if (status === "CLOSED") {
              updateData.closedAt = new Date();
            }
          }

          if (priority) updateData.priority = priority;
          if (priorityReason) updateData.priorityReason = priorityReason;
          if (assignedOfficerId !== undefined) updateData.assignedOfficerId = assignedOfficerId || null;
          if (assignedOfficerName !== undefined) updateData.assignedOfficerName = assignedOfficerName || null;
          if (verificationStatus) updateData.verificationStatus = verificationStatus;

          const updated = await prisma.complaint.update({
            where: { id: existing.id },
            data: {
              ...updateData,
              ...(statusChangeNote
                ? {
                    statusHistory: {
                      create: {
                        oldStatus,
                        newStatus: status,
                        changedById: session.id,
                        changedByName: session.name,
                        notes: statusChangeNote,
                      },
                    },
                  }
                : {}),
            },
            include: {
              community: true,
              evidence: true,
              statusHistory: { orderBy: { createdAt: "desc" } },
            },
          });

          return NextResponse.json({
            success: true,
            message: "Complaint updated successfully",
            data: updated,
          });
        }
      } catch (dbErr) {
        console.warn("DB update in /api/complaints/[id] failed, returning fallback:", dbErr);
      }
    }

    if (updatedFallback) {
      return NextResponse.json({
        success: true,
        message: "Complaint updated successfully (demo mode)",
        data: updatedFallback,
      });
    }

    return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
  } catch (error: any) {
    console.error("PATCH /api/complaints/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update complaint" },
      { status: 500 }
    );
  }
}
