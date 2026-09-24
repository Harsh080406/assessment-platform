import { NextResponse } from "next/server";
import { seedDatabase } from "@/../prisma/seed";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Seed route disabled in production" }, { status: 403 });
  }

  try {
    const data = await seedDatabase();

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully with test users and sample assessment (v1)",
      users: [
        { email: data.student.email, role: data.student.role, password: "Password123!" },
        { email: data.staff.email, role: data.staff.role, password: "Password123!" },
        { email: data.admin.email, role: data.admin.role, password: "Password123!" },
      ],
      assessment: {
        id: data.assessment.id,
        title: data.assessment.title,
        version: data.assessment.version,
        sectionsCount: data.assessment.sections.length,
      },
    });
  } catch (error) {
    console.error("[Seed error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed database", details: String(error) },
      { status: 500 }
    );
  }
}
