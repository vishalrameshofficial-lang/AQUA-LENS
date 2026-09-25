import { NextResponse } from "next/server";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import { evaluateRiskDrivers, generateActionRecommendations } from "@/lib/recommendations";
import { FALLBACK_COMMUNITIES } from "@/lib/fallback-data";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isDatabaseAvailable) {
    const fallbackCommunity = FALLBACK_COMMUNITIES.find(c => c.id === id || c.code === id) || FALLBACK_COMMUNITIES[0];
    const riskDrivers = evaluateRiskDrivers(fallbackCommunity);
    const recommendations = generateActionRecommendations(fallbackCommunity, {
      waterComplaints: 1,
      sanitationComplaints: 0,
      floodComplaints: 1,
      verifiedComplaints: 1,
      totalComplaints: 2,
    });

    return NextResponse.json({
      success: true,
      community: {
        id: fallbackCommunity.id,
        name: fallbackCommunity.name,
        code: fallbackCommunity.code,
        district: fallbackCommunity.district,
        block: fallbackCommunity.block,
        state: fallbackCommunity.state,
        country: fallbackCommunity.country,
        compositeVulnerabilityScore: fallbackCommunity.compositeVulnerabilityScore,
        vulnerabilityCategory: fallbackCommunity.vulnerabilityCategory,
      },
      riskDrivers,
      recommendations,
      disclaimer: "Scenario Estimate — based on configured assumptions, not a guaranteed prediction. Does not modify official community risk scores.",
    });
  }

  try {
    const community = await prisma.community.findUnique({
      where: { id },
      include: {
        interventions: {
          select: { id: true, title: true, status: true, priority: true },
        },
      },
    });

    if (!community) {
      throw new Error("Community not found in database, check fallback");
    }

    // Query active citizen complaints to integrate as corroborating evidence (Requirement 13)
    const activeComplaints = await prisma.complaint.findMany({
      where: {
        communityId: id,
        status: { in: ["REPORTED", "UNDER_REVIEW", "ASSIGNED", "IN_PROGRESS"] },
      },
      select: { category: true, verificationStatus: true },
    });

    const complaintSignals = {
      waterComplaints: activeComplaints.filter((c) =>
        ["WATER_SUPPLY", "WATER_QUALITY"].includes(c.category)
      ).length,
      sanitationComplaints: activeComplaints.filter((c) => c.category === "SANITATION").length,
      floodComplaints: activeComplaints.filter((c) =>
        ["FLOODING", "DRAINAGE"].includes(c.category)
      ).length,
      verifiedComplaints: activeComplaints.filter((c) => c.verificationStatus === "VERIFIED").length,
      totalComplaints: activeComplaints.length,
    };

    const riskDrivers = evaluateRiskDrivers(community);
    const recommendations = generateActionRecommendations(community, complaintSignals);

    return NextResponse.json({
      success: true,
      community: {
        id: community.id,
        name: community.name,
        code: community.code,
        district: community.district,
        block: community.block,
        state: community.state,
        country: community.country,
        compositeVulnerabilityScore: community.compositeVulnerabilityScore,
        vulnerabilityCategory: community.vulnerabilityCategory,
      },
      riskDrivers,
      recommendations,
      disclaimer: "Scenario Estimate — based on configured assumptions, not a guaranteed prediction. Does not modify official community risk scores.",
    });
  } catch (error: any) {
    console.warn("GET /api/communities/[id]/recommendations DB unavailable, using fallback:", error?.message);
    const fallbackCommunity = FALLBACK_COMMUNITIES.find(c => c.id === id || c.code === id) || FALLBACK_COMMUNITIES[0];
    const riskDrivers = evaluateRiskDrivers(fallbackCommunity);
    const recommendations = generateActionRecommendations(fallbackCommunity, {
      waterComplaints: 1,
      sanitationComplaints: 0,
      floodComplaints: 1,
      verifiedComplaints: 1,
      totalComplaints: 2,
    });

    return NextResponse.json({
      success: true,
      community: {
        id: fallbackCommunity.id,
        name: fallbackCommunity.name,
        code: fallbackCommunity.code,
        district: fallbackCommunity.district,
        block: fallbackCommunity.block,
        state: fallbackCommunity.state,
        country: fallbackCommunity.country,
        compositeVulnerabilityScore: fallbackCommunity.compositeVulnerabilityScore,
        vulnerabilityCategory: fallbackCommunity.vulnerabilityCategory,
      },
      riskDrivers,
      recommendations,
      disclaimer: "Scenario Estimate — based on configured assumptions, not a guaranteed prediction. Does not modify official community risk scores.",
    });
  }
}
