import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCommunityIntelligenceReport } from "@/lib/ai";
import { generateInterventionRecommendations } from "@/lib/recommendations";
import { FALLBACK_COMMUNITIES } from "@/lib/fallback-data";

export async function POST(request: Request) {
  let requestedId = "";
  try {
    const body = await request.json();
    requestedId = body?.communityId || "";

    let community = null;
    try {
      if (requestedId) {
        community = await prisma.community.findUnique({
          where: { id: requestedId },
        });
      }
    } catch (dbErr) {
      console.warn("DB findUnique failed, using fallback:", dbErr);
    }

    if (!community) {
      community = FALLBACK_COMMUNITIES.find(c => c.id === requestedId || c.code === requestedId) || FALLBACK_COMMUNITIES[0];
    }

    // Generate analytical synthesis
    const report = await generateCommunityIntelligenceReport(community);

    // Generate rule-based recommendations
    const recommendations = generateInterventionRecommendations({
      name: community.name,
      district: community.district,
      state: community.state,
      population: community.population,
      waterAccessPct: community.waterAccessPct,
      sanitationAccessPct: community.sanitationAccessPct,
      povertyRate: community.povertyRate,
      floodHazardLevel: community.floodHazardLevel,
      infrastructureScore: community.infrastructureScore,
      waterPointsCount: community.waterPointsCount,
      functioningWaterPointsCount: community.functioningWaterPointsCount,
      dataCompletenessPct: community.dataCompletenessPct,
    });

    return NextResponse.json({
      success: true,
      community: {
        id: community.id,
        name: community.name,
        code: community.code,
        state: community.state,
        district: community.district,
        block: community.block,
        population: community.population,
        waterAccessPct: community.waterAccessPct,
        sanitationAccessPct: community.sanitationAccessPct,
        floodHazardLevel: community.floodHazardLevel,
        compositeVulnerabilityScore: community.compositeVulnerabilityScore,
        vulnerabilityCategory: community.vulnerabilityCategory,
      },
      report,
      recommendations,
    });
  } catch (error: any) {
    console.error("POST /api/ai/analyze error:", error);
    const fallbackCommunity = FALLBACK_COMMUNITIES[0];
    const report = await generateCommunityIntelligenceReport(fallbackCommunity);
    return NextResponse.json({
      success: true,
      community: fallbackCommunity,
      report,
      recommendations: [],
    });
  }
}
