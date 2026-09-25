import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const roleStr = String(session.role || "");
    const normalizedRole =
      roleStr === "ADMIN" || roleStr === "ADMINISTRATOR" || roleStr === "OFFICER" || roleStr === "ANALYST"
        ? "ADMIN"
        : "USER";

    if (!isDatabaseAvailable) {
      return NextResponse.json({
        authenticated: true,
        user: {
          id: session.id,
          email: session.email,
          name: session.name,
          role: normalizedRole,
          organizationId: session.organizationId,
          avatarUrl: null,
          organization: {
            id: "org-01",
            name: "Global Water Resilience Alliance",
            slug: "global-water-alliance",
          },
        },
      });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: session.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          organizationId: true,
          avatarUrl: true,
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      if (user) {
        return NextResponse.json({
          authenticated: true,
          user: {
            ...user,
            role: user.role === "ADMIN" || user.role === "ADMINISTRATOR" ? "ADMIN" : "USER",
          },
        });
      }
    } catch (dbErr) {
      console.warn("DB user fetch error in /api/auth/me, falling back to session user:", dbErr);
    }

    // Fallback to session data
    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.id,
        email: session.email,
        name: session.name,
        role: normalizedRole,
        organizationId: session.organizationId,
        avatarUrl: null,
        organization: {
          id: "org-01",
          name: "Global Water Resilience Alliance",
          slug: "global-water-alliance",
        },
      },
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }
}

