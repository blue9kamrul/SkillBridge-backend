import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";

function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let statusCode = 500;
  let errorMessage = "Internal Server Error";
  let errorDetails = err;

  // PrismaClientValidationError
  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    errorMessage = "You provide incorrect field type or missing fields!";
  }
  // PrismaClientKnownRequestError
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      statusCode = 404;
      errorMessage = "Record not found";
    } else if (err.code === "P2002") {
      statusCode = 409;
      const target = (err.meta?.target as string[]) || [];
      errorMessage = `Duplicate value for ${target.join(", ")}`;
    } else if (err.code === "P2003") {
      statusCode = 400;
      errorMessage = "Foreign key constraint failed";
    } else if (err.code === "P2014") {
      statusCode = 400;
      errorMessage = "Invalid ID provided";
    }
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = 500;
    errorMessage = "Error occurred during query execution";
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    if (err.errorCode === "P1000") {
      statusCode = 401;
      errorMessage = "Authentication failed. Please check your credentials!";
    } else if (err.errorCode === "P1001") {
      statusCode = 503;
      errorMessage = "Can't reach database server";
    }
  } else if (err.statusCode) {
    statusCode = err.statusCode;
    errorMessage = err.message || errorMessage;
  } else if (err.message) {
    errorMessage = err.message;
  }

  console.error("Error:", err);

  res.status(statusCode).json({
    success: false,
    message: errorMessage,
  });
}

export default errorHandler;
