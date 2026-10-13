import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { toStudentSectionDTO } from "@/lib/serializers/assessment";
import { UserRole } from "@prisma/client";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { id: attemptId } = await context.params;
    if (!attemptId) {
      return NextResponse.json(
        { success: false, message: "Attempt ID required." },
        { status: 400 }
      );
    }

    const attempt = await prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: {
        assessment: {
          include: {
            sections: {
              orderBy: { displayOrder: "asc" },
              include: {
                questions: {
                  orderBy: { displayOrder: "asc" },
                  include: {
                    options: { orderBy: { displayOrder: "asc" } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { success: false, message: "Assessment attempt not found." },
        { status: 404 }
      );
    }

    // Role check: must be STUDENT (or ADMIN for super-user preview)
    const isStudent = session.user.role === UserRole.STUDENT;
    const isAdmin = session.user.role === UserRole.ADMIN;

    if (!isStudent && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Access restricted to STUDENT or ADMIN." },
        { status: 403 }
      );
    }

    // Ownership check: Student may only start/resume/view their OWN AssessmentAttempt
    if (isStudent && attempt.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "Forbidden: You do not own this assessment attempt." },
        { status: 403 }
      );
    }

    // Student-facing questions endpoint strictly serializes through toStudentSectionDTO
    const serializedSections = (attempt.assessment?.sections || []).map(
      toStudentSectionDTO
    );

    return NextResponse.json({
      success: true,
      data: {
        attemptId: attempt.id,
        assessmentId: attempt.assessmentId,
        version: attempt.assessmentVersion,
        sections: serializedSections,
      },
    });
  } catch (error) {
    console.error("[GET /api/v1/attempts/[id]/questions error]:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
