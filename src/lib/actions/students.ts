"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import {
  studentFilterSchema,
  updateStudentSchema,
  updateStudentTagsSchema,
  updateStudentNotesSchema,
  type StudentFilterData,
  type UpdateStudentData,
} from "@/lib/validations/students";

// =============================================================================
// GET STUDENTS — paginated, filtered list
// =============================================================================

export async function getStudents(
  teacherId: string,
  filters: Partial<StudentFilterData> = {}
) {
  const parsed = studentFilterSchema.safeParse(filters);
  if (!parsed.success) {
    return { error: "Invalid filter parameters" };
  }

  const { search, tag, programId, page, perPage } = parsed.data;
  const skip = (page - 1) * perPage;

  // Build where clause — always filter by teacherId
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    teacherId,
  };

  // Search by name, email, or phone
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  // Filter by tag
  if (tag) {
    where.tags = { has: tag };
  }

  // Filter by program (students who have a booking for this program)
  if (programId) {
    where.bookings = {
      some: { programId },
    };
  }

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: {
        bookings: {
          select: {
            id: true,
            programId: true,
            createdAt: true,
            program: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: perPage,
    }),
    prisma.student.count({ where }),
  ]);

  // Compute derived fields
  const studentsWithMeta = students.map((student) => {
    const programCount = new Set(student.bookings.map((b) => b.programId)).size;
    const lastBookingDate = student.bookings[0]?.createdAt ?? null;

    return {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone,
      whatsappPhone: student.whatsappPhone,
      tags: student.tags,
      programCount,
      lastBookingDate,
      createdAt: student.createdAt,
    };
  });

  return {
    students: studentsWithMeta,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

// =============================================================================
// GET ALL TAGS — for filter dropdown
// =============================================================================

export async function getAllStudentTags(teacherId: string): Promise<string[]> {
  const students = await prisma.student.findMany({
    where: { teacherId },
    select: { tags: true },
  });

  const tagSet = new Set<string>();
  for (const student of students) {
    for (const tag of student.tags) {
      tagSet.add(tag);
    }
  }

  return Array.from(tagSet).sort();
}

// =============================================================================
// GET STUDENT BY ID — full detail with bookings, health forms, practices
// =============================================================================

export async function getStudentById(teacherId: string, studentId: string) {
  const student = await prisma.student.findFirst({
    where: {
      id: studentId,
      teacherId, // Security: ensure teacher owns this student
    },
    include: {
      bookings: {
        include: {
          program: {
            select: {
              id: true,
              name: true,
              sessions: true,
              status: true,
            },
          },
          healthForm: true,
          payment: true,
        },
        orderBy: { createdAt: "desc" },
      },
      studentPractices: {
        include: {
          program: {
            select: { id: true, name: true },
          },
        },
        orderBy: { initiatedAt: "desc" },
      },
    },
  });

  return student;
}

// =============================================================================
// UPDATE STUDENT — edit contact info
// =============================================================================

export async function updateStudent(
  teacherId: string,
  studentId: string,
  data: UpdateStudentData
) {
  const parsed = updateStudentSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Verify ownership
  const existing = await prisma.student.findFirst({
    where: { id: studentId, teacherId },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Student not found" };
  }

  const d = parsed.data;

  try {
    await prisma.student.update({
      where: { id: studentId },
      data: {
        firstName: d.firstName,
        lastName: d.lastName,
        email: d.email,
        phone: d.phone || null,
        whatsappPhone: d.whatsappPhone || null,
        dateOfBirth: d.dateOfBirth ? new Date(d.dateOfBirth) : null,
        gender: d.gender ?? null,
        emergencyContactName: d.emergencyContactName || null,
        emergencyContactRelation: d.emergencyContactRelation || null,
        emergencyContactPhone: d.emergencyContactPhone || null,
      },
    });

    revalidatePath("/dashboard/students");
    revalidatePath(`/dashboard/students/${studentId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating student:", error);
    return { error: "Failed to update student" };
  }
}

// =============================================================================
// UPDATE STUDENT TAGS
// =============================================================================

export async function updateStudentTags(
  teacherId: string,
  studentId: string,
  tags: string[]
) {
  const parsed = updateStudentTagsSchema.safeParse({ tags });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Verify ownership
  const existing = await prisma.student.findFirst({
    where: { id: studentId, teacherId },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Student not found" };
  }

  try {
    await prisma.student.update({
      where: { id: studentId },
      data: { tags: parsed.data.tags },
    });

    revalidatePath("/dashboard/students");
    revalidatePath(`/dashboard/students/${studentId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating tags:", error);
    return { error: "Failed to update tags" };
  }
}

// =============================================================================
// UPDATE STUDENT NOTES
// =============================================================================

export async function updateStudentNotes(
  teacherId: string,
  studentId: string,
  notes: string
) {
  const parsed = updateStudentNotesSchema.safeParse({ notes });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Verify ownership
  const existing = await prisma.student.findFirst({
    where: { id: studentId, teacherId },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Student not found" };
  }

  try {
    await prisma.student.update({
      where: { id: studentId },
      data: { teacherNotes: parsed.data.notes },
    });

    revalidatePath(`/dashboard/students/${studentId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating notes:", error);
    return { error: "Failed to update notes" };
  }
}

// =============================================================================
// EXPORT STUDENTS CSV
// =============================================================================

export async function exportStudentsCSV(teacherId: string): Promise<string> {
  const students = await prisma.student.findMany({
    where: { teacherId },
    include: {
      bookings: {
        select: {
          programId: true,
          program: { select: { name: true } },
        },
      },
    },
    orderBy: { lastName: "asc" },
  });

  // CSV header
  const headers = [
    "First Name",
    "Last Name",
    "Email",
    "Phone",
    "WhatsApp",
    "Date of Birth",
    "Gender",
    "Emergency Contact",
    "Emergency Relation",
    "Emergency Phone",
    "Tags",
    "Programs",
    "Created At",
  ];

  const rows = students.map((s) => {
    const programs = [...new Set(s.bookings.map((b) => b.program.name))].join(
      "; "
    );

    return [
      escapeCsv(s.firstName),
      escapeCsv(s.lastName),
      escapeCsv(s.email),
      escapeCsv(s.phone ?? ""),
      escapeCsv(s.whatsappPhone ?? ""),
      s.dateOfBirth ? s.dateOfBirth.toISOString().split("T")[0] : "",
      s.gender ?? "",
      escapeCsv(s.emergencyContactName ?? ""),
      escapeCsv(s.emergencyContactRelation ?? ""),
      escapeCsv(s.emergencyContactPhone ?? ""),
      escapeCsv(s.tags.join(", ")),
      escapeCsv(programs),
      s.createdAt.toISOString().split("T")[0],
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
