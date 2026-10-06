import { ReportStatus } from "@prisma/client";
import prisma from "../../database/index.js";
import AppError from "../../utils/errors/AppError.js";
import { sendReportToSupportTeam } from "../../utils/socket/socket.js";
import { createNotificationService } from "../notification/notification.service.js";
import { includes } from "zod";

export const createReportService = async (
  reporterId: string,
  title: string,
  description: string,
  reportedId?: string,
) => {
  if (!reporterId || !title || !description) {
    throw new AppError("Missing data", 400);
  }

  const report = await prisma.report.create({
    data: {
      reporterId,
      title,
      description,
      reportedUserId: reportedId,
    },
  });

  await sendReportToSupportTeam("new-report", {
    reportedUserId: reportedId,
    title,
    description,
  });

  await createNotificationService(
    reporterId,
    "Report submitted successfully",
    "Your report has been submitted successfully and will be reviewed by our support team.",
    report.id,
  );
};

export const getAllReportsService = async () => {
  return await prisma.report.findMany();
};

export const getSingleReportService = async (id: string) => {
  return await prisma.report.findUnique({
    where: {
      id,
    },
  });
};

export const handleReportService = async (
  reviewerId: string,
  id: string,
  status: ReportStatus,
  message?: string,
) => {
  const report = await prisma.report.findUnique({
    where: {
      id,
    },
  });

  if (!report) {
    throw new AppError("There is no report by this ID", 404);
  }

  if (
    report.status === ReportStatus.REJECTED ||
    report.status === ReportStatus.RESOLVED
  ) {
    throw new AppError(
      `The report has been ${report.status} you can't change it again`,
      403,
    );
  }

  await prisma.report.update({
    where: {
      id,
    },
    data: {
      status,
      reviewedById: reviewerId,
      reviewedAt: new Date(),
    },
  });

  if (status === ReportStatus.REJECTED || status === ReportStatus.RESOLVED) {
    await createNotificationService(
      report.reporterId,
      `About your report`,
      message ||
        `Your report has been ${status === ReportStatus.REJECTED ? "Rejected" : "Resolved"}`,
      report.id,
    );
  }
};
