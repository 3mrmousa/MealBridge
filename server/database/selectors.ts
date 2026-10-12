import { Prisma } from "@prisma/client";

export const userOnly = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  isEmailVerified: true,
  isBlocked: true,
  createdAt: true,
  updatedAt: true,
});

export const recipientOnly = Prisma.validator<Prisma.RecipientProfileSelect>()({
  id: true,
  userId: true,
  profilePicture: true,
  organizationName: true,
  organizationType: true,
  otherOrganizationType: true,
  address: true,
  verificationStatus: true,
  createdAt: true,
  updatedAt: true,
});

export const recipientWithUser =
  Prisma.validator<Prisma.RecipientProfileSelect>()({
    ...recipientOnly,
    user: {
      select: userOnly,
    },
  });

export const donorOnly = Prisma.validator<Prisma.DonorProfileSelect>()({
  id: true,
  userId: true,
  profilePicture: true,
  organizationName: true,
  organizationType: true,
  otherOrganizationType: true,
  address: true,
  verificationStatus: true,
  createdAt: true,
  updatedAt: true,
});

export const donorWithUser = Prisma.validator<Prisma.DonorProfileSelect>()({
  ...donorOnly,
  user: {
    select: userOnly,
  },
});

export const volunteerOnly = Prisma.validator<Prisma.VolunteerProfileSelect>()({
  id: true,
  userId: true,
  profilePicture: true,
  address: true,
  type: true,
  transportType: true,
  availabilityStatus: true,
  verificationStatus: true,
  createdAt: true,
  updatedAt: true,
});

export const volunteerWithUser =
  Prisma.validator<Prisma.VolunteerProfileSelect>()({
    ...volunteerOnly,
    user: {
      select: userOnly,
    },
  });

export const userWithProfiles = Prisma.validator<Prisma.UserSelect>()({
  ...userOnly,
  donorProfile: {
    select: donorOnly,
  },
  recipientProfile: {
    select: recipientOnly,
  },
  volunteerProfile: {
    select: volunteerOnly,
  },
});
