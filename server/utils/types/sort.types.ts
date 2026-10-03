import type {
  ClaimStatus,
  DonationRequestStatus,
  DonationStatus,
  PickupMethod,
} from "@prisma/client";

interface PaginationOptions {
  page?: number;
  limit?: number;
  sortOrder?: "asc" | "desc";
}

export interface SortAndPaginateOnDonations extends PaginationOptions {
  status?: DonationStatus;
  sortBy?:
    | "createdAt"
    | "updatedAt"
    | "quantity"
    | "availableFrom"
    | "availableUntil";
}

export interface SortAndPaginateOnDonationRequests extends PaginationOptions {
  status?: DonationRequestStatus;
  sortBy?: "createdAt" | "updatedAt" | "quantityRequested";
}

export interface SortAndPaginateOnDonationClaims extends PaginationOptions {
  status?: ClaimStatus;
  pickupMethod?: PickupMethod;
  sortBy?:
    | "createdAt"
    | "updatedAt"
    | "quantityClaimed"
    | "collectedAt"
    | "pickupDeadline";
}
