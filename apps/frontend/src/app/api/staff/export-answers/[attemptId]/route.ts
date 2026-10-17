import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserRole, AuditResult } from "@prisma/client";
import { createAuditLog } from "@/lib/audit";
import { generateModuleWiseAnswersWorkbook } from "@/lib/excel/exportAnswers";

interface RouteParams {
  params: Promise<{
    attemptId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const { attemptId } = await params;
    if (!attemptId) {
      return NextResponse.json({ error: "Missing attempt ID." }, { status: 400 });
    }

    // Role verification: Staff or Admin only
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, email: true },
    });

    if (
      !currentUser ||
      (currentUser.role !== UserRole.STAFF && currentUser.role !== UserRole.ADMIN)
    ) {
      return NextResponse.json(
        { error: "Forbidden: Access restricted to authorized evaluation staff." },
        { status: 403 }
      );
    }

    // Fetch assessment attempt with complete responses and questions
    const attempt = await prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: {
        user: {
          include: {
            studentProfile: true,
          },
        },
        assessment: {
          include: {
            sections: {
              orderBy: { displayOrder: "asc" },
              include: {
                questions: {
                  orderBy: { displayOrder: "asc" },
                  include: {
                    options: {
                      orderBy: { displayOrder: "asc" },
                    },
                  },
                },
              },
            },
          },
        },
        responses: true,
      },
    });

    if (!attempt || !attempt.assessment) {
      return NextResponse.json(
        { error: "Assessment attempt not found." },
        { status: 404 }
      );
    }

    // Generate Excel Workbook buffer
    const excelBuffer = generateModuleWiseAnswersWorkbook({
      attempt: {
        id: attempt.id,
        userId: attempt.userId,
        assessmentTitle: attempt.assessment.title,
        assessmentVersion: attempt.assessmentVersion,
        status: attempt.status,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
      },
      student: {
        email: attempt.user?.email || "Unknown",
        phone: attempt.user?.phone || attempt.user?.studentProfile?.phone,
        profile: attempt.user?.studentProfile,
      },
      sections: attempt.assessment.sections,
      responses: attempt.responses.map((r) => ({
        questionId: r.questionId,
        answer: r.answer,
        answeredAt: r.answeredAt,
      })),
    });

    // Create Audit Log
    await createAuditLog({
      userId: currentUser.id,
      action: "STAFF_EXPORT_ANSWERS_EXCEL",
      resource: "AssessmentAttempt",
      resourceId: attemptId,
      metadata: {
        candidateId: attempt.userId,
        assessmentId: attempt.assessmentId,
        responsesCount: attempt.responses.length,
      },
      result: AuditResult.SUCCESS,
    });

    // Prepare human-readable filename
    const profile = attempt.user?.studentProfile;
    const rawName = `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() || "Candidate";
    const safeName = rawName.replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `${safeName}_Answers_ModuleWise.xlsx`;

    return new NextResponse(new Uint8Array(excelBuffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("Excel export error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate Excel export." },
      { status: 500 }
    );
  }
}
