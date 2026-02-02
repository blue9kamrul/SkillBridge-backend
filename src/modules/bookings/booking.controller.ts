import { Request, Response, NextFunction } from "express";
import { bookingService } from "./booking.service";

// Get all bookings
const getAllBookings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const bookings = await bookingService.getAllBookings(
      userId,
      userRole as string,
    );

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// Get single booking by ID
const getBookingById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const booking = await bookingService.getBookingById(
      id as string,
      userId,
      userRole as string,
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...booking,
        currentUser: { id: userId, role: userRole },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create new booking
const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { tutorId, startTime, endTime } = req.body;

    // Validation
    if (!tutorId || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: tutorId, startTime, endTime",
      });
    }

    const booking = await bookingService.createBooking(userId, {
      tutorId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// Update booking status
const updateBookingStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { status } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Please provide status",
      });
    }

    // Validate status
    const validStatuses = ["confirmed", "cancelled", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Must be one of: confirmed, cancelled, completed",
      });
    }

    const updatedBooking = await bookingService.updateBookingStatus(
      id as string,
      userId,
      userRole as string,
      status,
    );

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data: updatedBooking,
    });
  } catch (error: any) {
    console.error("[BookingController][updateBookingStatus] Error:", error);
    // Handle validation errors with 400 status
    if (
      error.message &&
      (error.message.includes("not found") ||
        error.message.includes("Only") ||
        error.message.includes("can only") ||
        error.message.includes("Cannot"))
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// Delete booking
const deleteBooking = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    await bookingService.deleteBooking(
      id as string,
      userId,
      userRole as string,
    );

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get bookings for authenticated tutor
const getTutorBookings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    console.log("[getTutorBookings] userId:", userId, "req.user:", req.user);
    if (!userId) {
      console.log("[getTutorBookings] No userId found in req.user");
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }
    // Get bookings for this tutor by userId
    const bookings = await bookingService.getBookingsByTutorUserId(
      userId as string,
    );
    console.log("[getTutorBookings] bookings:", bookings);
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("[getTutorBookings] error:", error);
    next(error);
  }
};

// Get bookings by tutor ID (public route for viewing tutor's booked slots)
const getBookingsByTutorId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { tutorId } = req.params;
    
    const bookings = await bookingService.getBookingsByTutorId(tutorId);
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const BookingController = {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  deleteBooking,
  getTutorBookings,
  getBookingsByTutorId,
};
