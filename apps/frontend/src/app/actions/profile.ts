"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50),
  lastName: z.string().trim().min(1, "Last name is required").max(50),
  avatarUrl: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  dateOfBirth: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  school: z.string().trim().min(1, "School or institution name is required").max(120),
  grade: z.string().trim().min(1, "Current class / grade is required"),
  educationLevel: z.string().trim().min(1, "Education stage is required"),
  bio: z.string().trim().min(1, "Target career aspirations & interests are required").max(2000),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export async function updateStudentProfileAction(input: UpdateProfileInput) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized. Please sign in." };
    }

    const parsed = updateProfileSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues?.[0]?.message || "Invalid input",
      };
    }

    const {
      firstName,
      lastName,
      avatarUrl,
      phone,
      dateOfBirth,
      country,
      school,
      grade,
      educationLevel,
      bio,
    } = parsed.data;

    const dob = dateOfBirth ? new Date(dateOfBirth) : null;

    const updatedProfile = await prisma.studentProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        firstName,
        lastName,
        avatarUrl: avatarUrl || null,
        phone: phone || null,
        dateOfBirth: dob,
        country: country || null,
        school: school || null,
        grade: grade || null,
        educationLevel: educationLevel || null,
        bio: bio || null,
      },
      update: {
        firstName,
        lastName,
        avatarUrl: avatarUrl || null,
        phone: phone || null,
        dateOfBirth: dob,
        country: country || null,
        school: school || null,
        grade: grade || null,
        educationLevel: educationLevel || null,
        bio: bio || null,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/assessments");
    revalidatePath("/dashboard/careers");
    revalidatePath("/dashboard/results");

    return {
      success: true,
      data: updatedProfile,
      message: "Profile updated successfully!",
    };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return {
      success: false,
      message: "An error occurred while saving your profile. Please try again.",
    };
  }
}
