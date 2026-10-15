"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { StorageService } from "@/lib/storage";

const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50),
  lastName: z.string().trim().min(1, "Last name is required").max(50),
  avatarUrl: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  dateOfBirth: z
    .string()
    .trim()
    .min(1, "Date of birth is required")
    .refine((val) => {
      const d = new Date(val);
      return !isNaN(d.getTime()) && d < new Date();
    }, "Please provide a valid date of birth in the past"),
  country: z
    .string()
    .trim()
    .min(1, "Country is required")
    .max(80),
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

export async function uploadAvatarAction(
  formData: FormData
): Promise<{ success: boolean; avatarUrl?: string; message?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized. Please sign in." };
    }

    const file = formData.get("file") as File | null;
    if (!file) {
      return { success: false, message: "No image file provided." };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { success: false, message: "Image must be under 5MB." };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!StorageService.isValidImageBuffer(buffer)) {
      return {
        success: false,
        message: "Invalid image format. Supported formats: JPG, PNG, WebP, GIF.",
      };
    }

    const { avatarUrl } = await StorageService.saveAvatar(
      session.user.id,
      buffer,
      file.type || "image/jpeg",
      file.name || "avatar.jpg"
    );

    // Update DB studentProfile
    await prisma.studentProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        firstName: session.user.name?.split(" ")[0] || "Student",
        lastName: session.user.name?.split(" ").slice(1).join(" ") || "",
        avatarUrl,
      },
      update: {
        avatarUrl,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");

    return {
      success: true,
      avatarUrl,
      message: "Avatar uploaded successfully to Cloudflare R2!",
    };
  } catch (err: any) {
    console.error("[uploadAvatarAction Error]:", err);
    return {
      success: false,
      message: err?.message || "Failed to upload avatar.",
    };
  }
}
