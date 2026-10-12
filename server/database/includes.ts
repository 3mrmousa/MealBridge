import { Prisma } from "@prisma/client";
import {
  donorWithUser,
  recipientWithUser,
  volunteerWithUser,
} from "./selectors.js";

export const deliveryDetailsInclude =
  Prisma.validator<Prisma.DeliveryInclude>()({
    volunteer: {
      select: volunteerWithUser,
    },
    donationClaim: {
      include: {
        recipient: {
          select: recipientWithUser,
        },
        donationRequest: true,
        donation: {
          include: {
            donor: {
              select: donorWithUser,
            },
          },
        },
      },
    },
  });
