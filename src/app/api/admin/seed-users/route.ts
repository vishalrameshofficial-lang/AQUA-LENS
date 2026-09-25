import { NextResponse } from "next/server";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

// POST /api/admin/seed-users — Creates demo admin + citizen accounts
export async function POST() {
  if (!isDatabaseAvailable) {
    return NextResponse.json({
      error: "Database not connected. Please set DATABASE_URL to a live Postgres instance.",
    }, { status: 503 });
  }

  try {
    // Get or create default org
    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: {
          name: "Global Water Resilience Alliance",
          slug: "global-water-alliance",
        },
      });
    }

    const accounts = [
      { email: "admin@aqualens.gov.in", name: "Dr. K. Senthil Nathan, IAS", password: "Admin@123456", role: "ADMIN" },
      { email: "citizen@aqualens.gov.in", name: "Ramesh Kumar", password: "User@123456", role: "USER" },
    ];

    const results = [];

    for (const account of accounts) {
      const existing = await prisma.user.findUnique({ where: { email: account.email } });
      if (existing) {
        // Update role to normalized value
        await prisma.user.update({
          where: { email: account.email },
          data: { role: account.role },
        });
        results.push({ email: account.email, status: "updated", role: account.role });
      } else {
        const passwordHash = await hashPassword(account.password);
        await prisma.user.create({
          data: {
            email: account.email,
            name: account.name,
            passwordHash,
            role: account.role,
            organizationId: org.id,
          },
        });
        results.push({ email: account.email, status: "created", role: account.role });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Demo accounts seeded successfully.",
      accounts: results,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
