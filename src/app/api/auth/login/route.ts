import { NextResponse } from "next/server";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import { comparePassword, signToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check for demo accounts or when DB is not available
    const isDemoAdmin = cleanEmail === "admin@aqualens.gov.in" && (password === "Admin@123456" || !isDatabaseAvailable);
    const isDemoCitizen = cleanEmail === "citizen@aqualens.gov.in" && (password === "User@123456" || !isDatabaseAvailable);

    if (!isDatabaseAvailable) {
      if (isDemoAdmin || cleanEmail.includes("admin")) {
        const token = signToken({
          id: "demo-admin-id",
          email: "admin@aqualens.gov.in",
          name: "Dr. K. Senthil Nathan, IAS",
          role: "ADMIN",
          organizationId: "demo-org-id",
        });

        const response = NextResponse.json({
          success: true,
          redirectTo: "/",
          user: {
            id: "demo-admin-id",
            email: "admin@aqualens.gov.in",
            name: "Dr. K. Senthil Nathan, IAS",
            role: "ADMIN",
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

      // Default citizen / user login in fallback mode
      const token = signToken({
        id: "demo-citizen-id",
        email: cleanEmail,
        name: cleanEmail === "citizen@aqualens.gov.in" ? "Ramesh Kumar" : "Citizen User",
        role: "USER",
        organizationId: "demo-org-id",
      });

      const response = NextResponse.json({
        success: true,
        redirectTo: "/user",
        user: {
          id: "demo-citizen-id",
          email: cleanEmail,
          name: cleanEmail === "citizen@aqualens.gov.in" ? "Ramesh Kumar" : "Citizen User",
          role: "USER",
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

    // Database is configured: attempt DB login
    try {
      const user = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (user) {
        const isValid = await comparePassword(password, user.passwordHash);
        if (isValid) {
          const normalizedRole =
            user.role === "ADMIN" || user.role === "ADMINISTRATOR" ? "ADMIN" : "USER";

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
        }
      }
    } catch (dbError) {
      console.warn("DB login lookup failed, checking demo fallback:", dbError);
    }

    // Check demo accounts as fallback even if DB had an error
    if (isDemoAdmin) {
      const token = signToken({
        id: "demo-admin-id",
        email: "admin@aqualens.gov.in",
        name: "Dr. K. Senthil Nathan, IAS",
        role: "ADMIN",
        organizationId: "demo-org-id",
      });

      const response = NextResponse.json({
        success: true,
        redirectTo: "/",
        user: {
          id: "demo-admin-id",
          email: "admin@aqualens.gov.in",
          name: "Dr. K. Senthil Nathan, IAS",
          role: "ADMIN",
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

    if (isDemoCitizen) {
      const token = signToken({
        id: "demo-citizen-id",
        email: "citizen@aqualens.gov.in",
        name: "Ramesh Kumar",
        role: "USER",
        organizationId: "demo-org-id",
      });

      const response = NextResponse.json({
        success: true,
        redirectTo: "/user",
        user: {
          id: "demo-citizen-id",
          email: "citizen@aqualens.gov.in",
          name: "Ramesh Kumar",
          role: "USER",
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

    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error during authentication" },
      { status: 500 }
    );
  }
}

