"use server";

import { prisma } from "@/lib/db/prisma";
import {
  completeRegistrationSchema,
  type CompleteRegistrationData,
} from "@/lib/validations/registration";
import { Decimal } from "decimal.js";

export async function createRegistration(data: CompleteRegistrationData) {
  try {
    // 1. Validate input
    const result = completeRegistrationSchema.safeParse(data);
    if (!result.success) {
      return { error: result.error.issues[0].message };
    }

    const validData = result.data;

    // 2. Get program and teacher info
    const program = await prisma.program.findUnique({
      where: { id: validData.programId },
      include: { teacher: true },
    });

    if (!program) {
      return { error: "Program not found" };
    }

    if (program.status !== "PUBLISHED") {
      return { error: "This program is not accepting registrations" };
    }

    // 3. Check capacity — waitlist if full
    let isWaitlisted = false;
    if (program.capacity) {
      const activeBookingCount = await prisma.booking.count({
        where: {
          programId: program.id,
          status: { notIn: ["CANCELLED", "WAITLISTED"] },
        },
      });

      if (activeBookingCount >= program.capacity) {
        isWaitlisted = true;
      }
    }

    // 4. Check if health form is required but not provided
    if (program.requiresHealthForm && !validData.healthForm) {
      return { error: "Health form is required for this program" };
    }

    // 5. Create or find student (unique by teacherId + email)
    let student = await prisma.student.findUnique({
      where: {
        teacherId_email: {
          teacherId: program.teacherId,
          email: validData.student.email,
        },
      },
    });

    if (student) {
      // Update existing student with latest info
      student = await prisma.student.update({
        where: { id: student.id },
        data: {
          name: `${validData.student.firstName} ${validData.student.lastName}`,
          firstName: validData.student.firstName,
          lastName: validData.student.lastName,
          dateOfBirth: validData.student.dateOfBirth
            ? new Date(validData.student.dateOfBirth)
            : null,
          gender: validData.student.gender || null,
          phone: validData.student.phone,
          emergencyContactName: validData.student.emergencyContactName,
          emergencyContactRelation: validData.student.emergencyContactRelation,
          emergencyContactPhone: validData.student.emergencyContactPhone,
        },
      });
    } else {
      // Create new student
      student = await prisma.student.create({
        data: {
          teacherId: program.teacherId,
          email: validData.student.email,
          name: `${validData.student.firstName} ${validData.student.lastName}`,
          firstName: validData.student.firstName,
          lastName: validData.student.lastName,
          dateOfBirth: validData.student.dateOfBirth
            ? new Date(validData.student.dateOfBirth)
            : null,
          gender: validData.student.gender || null,
          phone: validData.student.phone,
          emergencyContactName: validData.student.emergencyContactName,
          emergencyContactRelation: validData.student.emergencyContactRelation,
          emergencyContactPhone: validData.student.emergencyContactPhone,
        },
      });
    }

    // 6. Check for duplicate booking
    const existingBooking = await prisma.booking.findFirst({
      where: {
        studentId: student.id,
        programId: program.id,
      },
    });

    if (existingBooking) {
      return {
        error: "You are already registered for this program",
        bookingId: existingBooking.id,
      };
    }

    // 7. Determine payment details
    const paymentAmount = program.isFree ? null : program.priceAmount;
    const paymentStatus = program.isFree ? "WAIVED" : "PENDING";
    const bookingStatus = isWaitlisted
      ? "WAITLISTED"
      : program.isFree || validData.paymentMethod !== "ONLINE"
        ? "CONFIRMED"
        : "PENDING_PAYMENT";

    // 8. Create booking
    const booking = await prisma.booking.create({
      data: {
        studentId: student.id,
        programId: program.id,
        teacherId: program.teacherId,
        status: bookingStatus,
        paymentMethod: validData.paymentMethod,
        paymentStatus: paymentStatus,
        paymentAmount: paymentAmount ? new Decimal(paymentAmount.toString()) : null,
        paymentCurrency: program.priceCurrency,
      },
    });

    // 9. Create health form if provided
    if (validData.healthForm) {
      await prisma.healthForm.create({
        data: {
          studentId: student.id,
          bookingId: booking.id,
          howDidYouHear: validData.healthForm.howDidYouHear || null,
          previousYogaPractice: validData.healthForm.previousYogaPractice || null,
          hasLearnedIshaYoga: validData.healthForm.hasLearnedIshaYoga,
          ishaYogaPractices: validData.healthForm.ishaYogaPractices || null,
          healthConditions: validData.healthForm.healthConditions,
          conditionDetails: validData.healthForm.conditionDetails || null,
          isPregnant: validData.healthForm.isPregnant,
          hadRecentSurgery: validData.healthForm.hadRecentSurgery,
          consentGiven: validData.healthForm.consentGiven,
          consentTimestamp: new Date(),
        },
      });
    }

    // 10. Return success with booking details
    return {
      success: true,
      bookingId: booking.id,
      studentId: student.id,
      isWaitlisted,
      requiresPayment: bookingStatus === "PENDING_PAYMENT",
      message: isWaitlisted
        ? "The program is full. You have been added to the waitlist."
        : program.isFree
          ? "Registration successful!"
          : validData.paymentMethod === "ONLINE"
            ? "Please complete payment to confirm your booking"
            : "Registration successful! Please make payment as instructed.",
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      error: "Failed to complete registration. Please try again.",
    };
  }
}

export async function getBookingDetails(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        program: {
          include: {
            teacher: true,
            venue: true,
          },
        },
        student: true,
      },
    });

    if (!booking) {
      return { error: "Booking not found" };
    }

    return { booking };
  } catch (error) {
    console.error("Error fetching booking:", error);
    return { error: "Failed to fetch booking details" };
  }
}
