"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

// =============================================================================
// REQUEST CANCELLATION (student-facing)
// =============================================================================

export async function requestCancellation(bookingId: string, reason?: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, status: true },
  });

  if (!booking) return { error: "Booking not found" };

  if (booking.status === "CANCELLED" || booking.status === "CANCELLATION_REQUESTED") {
    return { error: "Cancellation already requested" };
  }

  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CANCELLATION_REQUESTED",
        cancelledReason: reason ?? null,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error requesting cancellation:", error);
    return { error: "Failed to request cancellation" };
  }
}

// =============================================================================
// APPROVE CANCELLATION (teacher-facing)
// =============================================================================

export async function approveCancellation(
  teacherId: string,
  bookingId: string,
  refundNotes?: string
) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, teacherId },
    select: { id: true, status: true },
  });

  if (!booking) return { error: "Booking not found" };

  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        refundNotes: refundNotes ?? null,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/programs");
    return { success: true };
  } catch (error) {
    console.error("Error approving cancellation:", error);
    return { error: "Failed to approve cancellation" };
  }
}

// =============================================================================
// DECLINE CANCELLATION (teacher-facing)
// =============================================================================

export async function declineCancellation(
  teacherId: string,
  bookingId: string
) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, teacherId },
    select: { id: true, status: true, paymentStatus: true },
  });

  if (!booking) return { error: "Booking not found" };

  // Restore to previous logical status
  const restoredStatus =
    booking.paymentStatus === "PAID" || booking.paymentStatus === "WAIVED"
      ? "CONFIRMED"
      : "PENDING_PAYMENT";

  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: restoredStatus,
        cancelledReason: null,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error declining cancellation:", error);
    return { error: "Failed to decline cancellation" };
  }
}

// =============================================================================
// OFFER WAITLIST SPOT (teacher-facing)
// =============================================================================

export async function offerWaitlistSpot(
  teacherId: string,
  bookingId: string
) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, teacherId, status: "WAITLISTED" },
    select: { id: true },
  });

  if (!booking) return { error: "Waitlisted booking not found" };

  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "WAITLIST_OFFERED" },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error offering spot:", error);
    return { error: "Failed to offer spot" };
  }
}

// =============================================================================
// UPDATE PAYMENT STATUS (teacher-facing)
// =============================================================================

export async function updatePaymentStatus(
  teacherId: string,
  bookingId: string,
  paymentStatus: "PENDING" | "PAID" | "REFUNDED" | "WAIVED"
) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, teacherId },
    select: { id: true, status: true },
  });

  if (!booking) return { error: "Booking not found" };

  try {
    const data: Record<string, unknown> = { paymentStatus };

    // Auto-confirm booking when payment is received
    if (
      paymentStatus === "PAID" &&
      (booking.status === "PENDING_PAYMENT" || booking.status === "WAITLIST_OFFERED")
    ) {
      data.status = "CONFIRMED";
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/programs");
    return { success: true };
  } catch (error) {
    console.error("Error updating payment:", error);
    return { error: "Failed to update payment status" };
  }
}
