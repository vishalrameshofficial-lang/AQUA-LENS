import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hasPermission } from "@/lib/auth";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !hasPermission(session.role, "canManageUsers")) {
      return NextResponse.json(
        { error: "Unauthorized. Administrator privileges required." },
        { status: 403 }
      );
    }

    const { action } = await request.json();

    if (action === "CLEAR_SAMPLE_DATA") {
      // Delete only records marked as sample data
      const deleted = await prisma.community.deleteMany({
        where: { isSampleData: true },
      });

      await prisma.auditLog.create({
        data: {
          userId: session.id,
          userName: session.name,
          action: "DELETE",
          entityType: "Community",
          entityId: "SAMPLE_DATA_PURGE",
          detailsJson: JSON.stringify({ deletedCount: deleted.count }),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Removed ${deleted.count} sample community baseline records without affecting imported real data.`,
      });
    }

    if (action === "RESET_DEMO_DATA") {
      // Execute the India WASH Intelligence seed script
      await execAsync("npx tsx prisma/seed.ts", { cwd: process.cwd() });

      return NextResponse.json({
        success: true,
        message: "Successfully reset database to verified Tamil Nadu, India WASH Intelligence demo dataset (12 Gram Panchayats, Census 2011, JJM, SBM-G, IMD & CWC registries).",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

