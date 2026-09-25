import { NextResponse } from "next/server";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password, name, role = "USER" } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    // Normalize role — only ADMIN and USER
    const normalizedRole: string = role === "ADMIN" || role === "ADMINISTRATOR" ? "ADMIN" : "USER";

    if (!isDatabaseAvailable) {
      const mockId = `user-${Date.now()}`;
      const token = signToken({
        id: mockId,
        email: cleanEmail,
        name,
        role: normalizedRole as any,
        organizationId: "demo-org-id",
      });

      const redirectTo = normalizedRole === "ADMIN" ? "/" : "/user";

      const response = NextResponse.json({
        success: true,
        redirectTo,
        user: {
          id: mockId,
          email: cleanEmail,
          name,
          role: normalizedRole,
          organizationId: "demo-org-id",
        },
      });

      response.cookies.set({
        name: "aqua_lens_session",
        value: token,
        httpOnly: true,
        path: "/",
        maxAge: 7 * 24 * 3600,
        sameSite: "lax",
      });

      return response;
    }

    try {
      const existing = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (existing) {
        return NextResponse.json(
          { error: "A user with this email address already exists" },
          { status: 409 }
        );
      }

      const passwordHash = await hashPassword(password);

      // Get default org or create one
      let org = await prisma.organization.findFirst();
      if (!org) {
        org = await prisma.organization.create({
          data: {
            name: "Global Water Resilience Alliance",
            slug: "global-water-alliance",
          },
        });
      }

      const user = await prisma.user.create({
        data: {
          email: cleanEmail,
          passwordHash,
          name,
          role: normalizedRole,
          organizationId: org.id,
        },
      });

      const token = signToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: normalizedRole as any,
        organizationId: user.organizationId,
      });

      const redirectTo = normalizedRole === "ADMIN" ? "/" : "/user";

      const response = NextResponse.json({
        success: true,
        redirectTo,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: normalizedRole,
          organizationId: user.organizationId,
        },
      });

      response.cookies.set({
        name: "aqua_lens_session",
        value: token,
        httpOnly: true,
        path: "/",
        maxAge: 7 * 24 * 3600,
        sameSite: "lax",
      });

      return response;
    } catch (dbErr) {
      console.warn("DB user registration failed, falling back to mock session:", dbErr);
      const mockId = `user-${Date.now()}`;
      const token = signToken({
        id: mockId,
        email: cleanEmail,
        name,
        role: normalizedRole as any,
        organizationId: "demo-org-id",
      });

      const redirectTo = normalizedRole === "ADMIN" ? "/" : "/user";

      const response = NextResponse.json({
        success: true,
        redirectTo,
        user: {
          id: mockId,
          email: cleanEmail,
          name,
          role: normalizedRole,
          organizationId: "demo-org-id",
        },
      });

      response.cookies.set({
        name: "aqua_lens_session",
        value: token,
        httpOnly: true,
        path: "/",
        maxAge: 7 * 24 * 3600,
        sameSite: "lax",
      });

      return response;
    }
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration" },
      { status: 500 }
    );
  }
}

