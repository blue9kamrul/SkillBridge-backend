import { prisma } from "../../lib/prisma";

// Get all bookings
const getAllBookings = async (userId: string, userRole: string) => {
  // Admin sees all bookings
  if (userRole === "ADMIN") {
    const bookings = await prisma.booking.findMany({
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        tutor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
    });
    return bookings;
  }

  // Tutor sees bookings where they are the tutor
  if (userRole === "TUTOR") {
    const tutorProfile = await prisma.tutorProfile.findFirst({
      where: { userId },
    });

    if (!tutorProfile) {
      throw new Error("Tutor profile not found");
    }

    const bookings = await prisma.booking.findMany({
      where: {
        tutorId: tutorProfile.id,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        tutor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
    });
    return bookings;
  }

  // Student sees their own bookings
  const bookings = await prisma.booking.findMany({
    where: {
      studentId: userId,
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      tutor: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
    },
    orderBy: {
      startTime: "desc",
    },
  });

  return bookings;
};

// Get single booking by ID
const getBookingById = async (
  bookingId: string,
  userId: string,
  userRole: string,
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      tutor: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
    },
  });

  if (!booking) {
    return null;
  }

  // Admin can view any booking
  if (userRole === "ADMIN") {
    return booking;
  }

  // Tutor can view bookings where they are the tutor
  if (userRole === "TUTOR") {
    const tutorProfile = await prisma.tutorProfile.findFirst({
      where: { userId },
    });

    if (tutorProfile && booking.tutorId === tutorProfile.id) {
      return booking;
    }
  }

  // Student can view their own bookings
  if (booking.studentId === userId) {
    return booking;
  }

  throw new Error("You don't have permission to view this booking");
};

// Create new booking
const createBooking = async (
  studentId: string,
  data: {
    tutorId: string;
    startTime: Date;
    endTime: Date;
  },
) => {
  // Check if tutor exists
  const tutor = await prisma.tutorProfile.findUnique({
    where: { id: data.tutorId },
  });

  if (!tutor) {
    throw new Error("Tutor not found");
  }

  // Validate times
  if (data.startTime >= data.endTime) {
    throw new Error("End time must be after start time");
  }

  // Check if start time is in the future
  if (data.startTime < new Date()) {
    throw new Error("Booking must be in the future");
  }

  // Check for existing bookings that overlap with the requested time
  const existingBookings = await prisma.booking.findMany({
    where: {
      tutorId: data.tutorId,
      status: {
        in: ["confirmed", "pending"],
      },
      OR: [
        {
          // New booking starts during an existing booking
          AND: [
            { startTime: { lte: data.startTime } },
            { endTime: { gt: data.startTime } },
          ],
        },
        {
          // New booking ends during an existing booking
          AND: [
            { startTime: { lt: data.endTime } },
            { endTime: { gte: data.endTime } },
          ],
        },
        {
          // New booking completely contains an existing booking
          AND: [
            { startTime: { gte: data.startTime } },
            { endTime: { lte: data.endTime } },
          ],
        },
      ],
    },
  });

  if (existingBookings.length > 0) {
    const conflict = existingBookings[0]!;
    const startDate = conflict.startTime instanceof Date ? conflict.startTime : new Date(conflict.startTime);
    const endDate = conflict.endTime instanceof Date ? conflict.endTime : new Date(conflict.endTime);
    
    const conflictStart = startDate.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    const conflictEnd = endDate.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    throw new Error(
      `This tutor is already booked from ${conflictStart} to ${conflictEnd}. Please choose a different time slot.`
    );
  }

  // Validate against tutor availability if set
  if (tutor.availability && typeof tutor.availability === 'string' && tutor.availability.trim()) {
    const bookingDay = data.startTime.toLocaleDateString('en-US', { weekday: 'short' });
    const bookingHour = data.startTime.getHours();
    const availabilityText = tutor.availability.toLowerCase();
    
    // Simple validation: check if booking is on weekend (Friday/Saturday) when availability doesn't mention weekends
    const isWeekend = bookingDay === 'Fri' || bookingDay === 'Sat';
    const hasWeekendAvailability = availabilityText.includes('weekend') || 
                                   availabilityText.includes('friday') || 
                                   availabilityText.includes('saturday') ||
                                   availabilityText.includes('fri') ||
                                   availabilityText.includes('sat');
    
    if (isWeekend && !hasWeekendAvailability) {
      throw new Error(`This tutor is not available on weekends (Friday/Saturday). Available slots: ${tutor.availability}`);
    }
    
    // Check if booking is during typical off hours (before 6 AM or after 10 PM)
    if (bookingHour < 6 || bookingHour >= 22) {
      throw new Error(`Booking time is outside typical tutoring hours. Tutor availability: ${tutor.availability}`);
    }
  }

  // Create booking
  const booking = await prisma.booking.create({
    data: {
      studentId,
      tutorId: data.tutorId,
      startTime: data.startTime,
      endTime: data.endTime,
      status: "confirmed", // Instant confirmation
    },
    include: {
      tutor: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  return booking;
};

// Update booking
const updateBookingStatus = async (
  bookingId: string,
  userId: string,
  userRole: string,
  status: "confirmed" | "cancelled" | "completed",
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      tutor: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  // Validate status transitions based on user role
  if (status === "completed") {
    // Only tutor can mark as completed
    if (userRole !== "TUTOR") {
      throw new Error("Only tutors can mark sessions as completed");
    }
    const tutorProfile = await prisma.tutorProfile.findFirst({
      where: { userId },
    });
    if (!tutorProfile || booking.tutorId !== tutorProfile.id) {
      throw new Error("You can only mark your own sessions as completed");
    }
    // Can only mark confirmed bookings as completed
    if (booking.status !== "confirmed") {
      throw new Error("Only confirmed bookings can be marked as completed");
    }
  } else if (status === "cancelled") {
    // Student who created the booking or admin can cancel
    if (userRole !== "ADMIN" && booking.studentId !== userId) {
      throw new Error("You can only cancel your own bookings");
    }
    // Can only cancel confirmed bookings
    if (booking.status !== "confirmed") {
      throw new Error("Only confirmed bookings can be cancelled");
    }
  }

  // Update booking status
  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
    include: {
      tutor: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  return updatedBooking;
};

// Delete booking student and admin
const deleteBooking = async (
  bookingId: string,
  userId: string,
  userRole: string,
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  // Student and admin can delete
  if (userRole !== "ADMIN" && booking.studentId !== userId) {
    throw new Error("You don't have permission to delete this booking");
  }

  // Can only delete confirmed bookings (changed from pending)
  if (booking.status !== "confirmed") {
    throw new Error("Only confirmed bookings can be deleted");
  }

  await prisma.booking.delete({
    where: { id: bookingId },
  });

  return true;
};

// Get tutor profile by userId
const getTutorProfileByUserId = async (userId: string) => {
  // Find the first tutor profile for this user
  return prisma.tutorProfile.findFirst({ where: { userId } });
};

// Get tutor profile by tutorId
// const getTutorProfileByTutorId = async (tutorId: string) => {
//   return prisma.tutorProfile.findUnique({ where: { id: tutorId } });
// };

// Get bookings by tutorId
const getBookingsByTutorId = async (tutorId: string) => {
  return prisma.booking.findMany({
    where: { tutorId },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      tutor: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
    },
    orderBy: { startTime: "desc" },
  });
};
// Get bookings by tutor's userId directly
const getBookingsByTutorUserId = async (userId: string) => {
  return prisma.booking.findMany({
    where: {
      tutor: {
        userId,
      },
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      tutor: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
    },
    orderBy: { startTime: "desc" },
  });
};

export const bookingService = {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  deleteBooking,
  getBookingsByTutorId,
  getBookingsByTutorUserId,
};
