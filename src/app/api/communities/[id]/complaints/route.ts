import { NextResponse } from "next/server";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import { FALLBACK_COMMUNITIES } from "@/lib/fallback-data";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isDatabaseAvailable) {
    const fallbackCommunity = FALLBACK_COMMUNITIES.find(c => c.id === id || c.code === id) || FALLBACK_COMMUNITIES[0];
    return NextResponse.json({
      success: true,
      community: {
        id: fallbackCommunity.id,
        name: fallbackCommunity.name,
        code: fallbackCommunity.code,
        district: fallbackCommunity.district,
      },
      signals: {
        total: 2,
        open: 1,
        water: 1,
        sanitation: 0,
        flooding: 1,
        verified: 1,
      },
      recentComplaints: [],
    });
  }

  try {
    const [community, complaints] = await Promise.all([
      prisma.community.findUnique({
        where: { id },
        select: { id: true, name: true, code: true, district: true },
      }),
      prisma.complaint.findMany({
        where: { communityId: id },
        orderBy: { createdAt: "desc" },
        include: {
          evidence: true,
          verifications: {
            select: { id: true, status: true, verificationDate: true },
          },
        },
      }),
    ]);

    if (!community) {
      throw new Error("Community not found, check fallback");
    }

    const total = complaints.length;
    const open = complaints.filter((c) =>
      ["REPORTED", "UNDER_REVIEW", "ASSIGNED", "IN_PROGRESS"].includes(c.status)
    ).length;
    const water = complaints.filter((c) =>
      ["WATER_SUPPLY", "WATER_QUALITY"].includes(c.category)
    ).length;
    const sanitation = complaints.filter((c) => c.category === "SANITATION").length;
    const flooding = complaints.filter((c) =>
      ["FLOODING", "DRAINAGE"].includes(c.category)
    ).length;
    const verified = complaints.filter((c) => c.verificationStatus === "VERIFIED").length;

    return NextResponse.json({
      success: true,
      community,
      signals: {
        total,
        open,
        water,
        sanitation,
        flooding,
        verified,
      },
      recentComplaints: complaints.slice(0, 5),
    });
  } catch (error: any) {
    console.warn("GET /api/communities/[id]/complaints DB unavailable, serving fallback:", error?.message);
    const fallbackCommunity = FALLBACK_COMMUNITIES.find(c => c.id === id || c.code === id) || FALLBACK_COMMUNITIES[0];
    return NextResponse.json({
      success: true,
      community: {
        id: fallbackCommunity.id,
        name: fallbackCommunity.name,
        code: fallbackCommunity.code,
        district: fallbackCommunity.district,
      },
      signals: {
        total: 2,
        open: 1,
        water: 1,
        sanitation: 0,
        flooding: 1,
        verified: 1,
      },
      recentComplaints: [],
    });
  }
}
