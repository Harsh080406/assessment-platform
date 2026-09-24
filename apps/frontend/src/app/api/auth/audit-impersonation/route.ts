import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/audit";
import { AuditResult } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adminId, path, targetPortal } = body;

    if (adminId && path) {
      await createAuditLog({
        userId: adminId,
        action: "ADMIN_IMPERSONATION_VIEW",
        resource: targetPortal === "STUDENT" ? "StudentDashboard" : "StaffPortal",
        resourceId: path,
        metadata: {
          path,
          targetPortal,
          accessType: "Cross-Portal Super-User Inspection",
        },
        result: AuditResult.SUCCESS,
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
