export enum Role {
  Admin = "ADMIN",
  Manager = "MANAGER",
  Donor = "DONOR",
  Recipient = "RECIPIENT",
  Volunteer = "VOLUNTEER",
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}
