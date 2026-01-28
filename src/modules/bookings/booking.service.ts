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
    const tutorProfile = await prisma.tutorProfile.findUnique({
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
    const tutorProfile = await prisma.tutorProfile.findUnique({
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

  // Create booking
  const booking = await prisma.booking.create({
    data: {
      studentId,
      tutorId: data.tutorId,
      startTime: data.startTime,
      endTime: data.endTime,
      status: "pending",
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

  // Can only delete pending bookings
  if (booking.status !== "pending") {
    throw new Error("Only pending bookings can be deleted");
  }

  await prisma.booking.delete({
    where: { id: bookingId },
  });

  return true;
};

export const bookingService = {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  deleteBooking,
};
