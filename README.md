<div align="center">

# 🍽️ MealBridge

**Connecting surplus food with those who need it most.**

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.10-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Redis](https://img.shields.io/badge/Redis-7.x-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)

---

*A robust, concurrency-safe, full-stack platform engineered to eliminate food waste by linking food donors (restaurants, cafes, hotels, catering, government, individuals) with verified recipients (shelters, charities, community centers) and dedicated volunteer drivers.*

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [User Roles & Permissions](#-user-roles--permissions)
- [Core Workflows & Concurrency](#-core-workflows--concurrency)
- [Database Schema & Enums](#-database-schema--enums)
- [Complete API Reference](#-complete-api-reference)
  - [1. Authentication (`/api/auth`)](#1-authentication-apiauth)
  - [2. User & Profiles (`/api/users`)](#2-user--profiles-apiusers--all-authenticated)
  - [3. Donors (`/api/donors`)](#3-donors-apidonors--donor-verified)
  - [4. Recipients (`/api/recipients`)](#4-recipients-apirecipients--recipient-verified)
  - [5. Volunteers (`/api/volunteers`)](#5-volunteers-apivolunteers--volunteer-verified)
  - [6. Admin & Management (`/api/admin`)](#6-admin--management-apiadmin--admin--manager)
  - [7. Notifications (`/api/notifications`)](#7-notifications-apinotifications--all-authenticated)
  - [8. Reports (`/api/reports`)](#8-reports-apireports--all-authenticated)
  - [9. Real-Time Chat (`/api/chats`)](#9-real-time-chat-apichats--all-authenticated)
- [Real-time Events & Email Notifications](#-real-time-events--email-notifications)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [UML Diagrams](#-uml-diagrams)

---

## 🌍 Overview

MealBridge tackles surplus food waste in the commercial food and hospitality sectors. Restaurants, hotels, cafes, and catering businesses frequently have excess edible food that would otherwise be discarded. MealBridge connects these donors with verified non-profit recipients and community centers. Volunteer drivers provide delivery logistics when recipients cannot pick up donations themselves.

### The 3-Stage Donation Lifecycle

```
[ Stage 1: Donation Listing & Request ]
  Donor posts Donation (AVAILABLE)
          │
          ▼
  Recipient submits DonationRequest (PENDING)
          │
          ▼
[ Stage 2: Donor Acceptance & Claim ]
  Donor accepts Request ───► Concurrency Lock (SELECT FOR UPDATE)
          │
          ├── Quantity deducted; status -> AVAILABLE or CLAIMED
          └── DonationClaim (ACTIVE) created
                    │
       ┌────────────┴────────────┐
       ▼                         ▼
[ Self-Pickup ]         [ Stage 3: Volunteer Delivery ]
Recipient claims meal     Recipient creates DeliveryRequest (PENDING)
via SELF pickup                   │
(status: COMPLETED)               ▼
                        Volunteer accepts request
                                  │
                                  ▼
                        Delivery created (PENDING)
                                  │
                                  ▼
                        Volunteer marks PICKED_UP
                                  │
                                  ▼
                        Volunteer/Recipient marks COMPLETED
                        (Claim & Delivery completed)
```

### Core Platform Goals

- **Zero Food Waste**: Frictionless donation creation taking under 3 steps for busy kitchen staff.
- **Strict Concurrency Safety**: PostgreSQL row-level locks (`SELECT ... FOR UPDATE`) inside database transactions protect against race conditions, double-claiming, and over-allocation.
- **Mandatory Document Verification**: Donors, recipients, and volunteers must submit official documentation approved by Admins or Managers before participating.
- **Instant Real-Time Sync**: Socket.io event broadcasting and targeted room delivery for notifications and support reports.
- **Fail-Safe Communications**: Automated, branded transactional emails via Nodemailer for every lifecycle status transition and cancellation.

---

## 🏗 System Architecture

MealBridge implements a layered, domain-driven REST API powered by Express.js v5 and TypeScript:

```
┌────────────────────────────────────────────────────────────────────────┐
│                              Client Apps                               │
│           (Web Dashboard / Mobile App / Admin Panel)                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / WebSocket
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        MealBridge API Server                           │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ Middleware Layer                                               │   │
│   │ • Helmet (Security Headers)  • CORS (Credentials)              │   │
│   │ • Cookie-Parser (JWT Auth)   • Express-Rate-Limit              │   │
│   │ • Multer (Memory Storage)    • Zod Validation                  │   │
│   │ • Protect & AuthorizeRoles   • isProfileVerified Guard         │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
│                                   │                                    │
│   ┌───────────────────────────────▼────────────────────────────────┐   │
│   │ Controllers Layer (Request / Response Orchestration)           │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
│                                   │                                    │
│   ┌───────────────────────────────▼────────────────────────────────┐   │
│   │ Services Layer (Domain Logic & Transaction Boundaries)         │   │
│   │ • SELECT ... FOR UPDATE Row Locks                              │   │
│   │ • Prisma Transaction Pipelines ($transaction)                  │   │
│   │ • Post-commit Event Emission (Sockets & Email)                 │   │
│   └───────────────┬───────────────────────────────┬────────────────┘   │
│                   │                               │                    │
│   ┌───────────────▼──────────────┐ ┌──────────────▼────────────────┐   │
│   │ Persistence & Data Access    │ │ Auxiliary Services            │   │
│   │ • Prisma ORM 7.10            │ │ • Redis (OTP & Weekly Limits) │   │
│   │ • PostgreSQL Connection Pool │ │ • Cloudinary (Image Storage)  │   │
│   │ • Custom Reusable Selectors  │ │ • Nodemailer (Gmail SMTP)     │   │
│   │   & Include Definitions      │ │ • Socket.io 4.8 Server        │   │
│   └──────────────────────────────┘ └───────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Runtime** | Node.js v20+ | ES Modules (`"type": "module"`) |
| **Language** | TypeScript 5.x | Strict type checking with project paths |
| **Web Framework** | Express.js v5 | Native async handling and modern routing |
| **Database** | PostgreSQL 16+ | Relational storage with ACID transaction guarantees |
| **ORM** | Prisma 7.10 | Multi-file schema with `@prisma/adapter-pg` pool |
| **Cache & Sessions** | Redis via `ioredis` 6.0 | OTP registration/reset sessions & weekly cancellation rate limits |
| **Authentication** | JWT + HttpOnly Cookies | Stateless tokens with database `tokenVersion` session invalidation |
| **Password Security** | `bcryptjs` | Salt rounds: 12 |
| **Validation** | Zod v4 | Strict schema validation on `body`, `query`, and `params` |
| **File Storage** | Cloudinary 2.11 | Profile pictures, verification documents, and donation images |
| **Real-time** | Socket.io 4.8 | Authenticated WebSocket connections with room-based messaging |
| **Transactional Mail** | Nodemailer 10 | Gmail SMTP with branded, responsive HTML templates |
| **Security & Limits** | Helmet, CORS, Rate-Limit | Strict HTTP headers, credentials support, and endpoint rate limiting |

---

## 👥 User Roles & Permissions

MealBridge enforces Role-Based Access Control (**RBAC**) across **5 distinct roles**:

| Role | Responsibilities | Key Capabilities |
| :--- | :--- | :--- |
| **`DONOR`** | Food businesses and individuals donating surplus items | • Create, edit, and cancel donations<br>• Review, accept, or reject recipient requests<br>• Manage donation claims and handle donor cancellations<br>• Upload business/food safety verification documents |
| **`RECIPIENT`** | Non-profits, shelters, and community centers | • Browse available donations and submit donation requests<br>• Manage claims and execute self-pickup (`SELF`)<br>• Browse verified volunteers and request delivery (`VOLUNTEER`)<br>• Cancel claims or delivery requests when necessary |
| **`VOLUNTEER`** | Drivers handling food logistics | • Toggle availability status<br>• Receive, accept, or reject delivery requests<br>• Mark deliveries as `PICKED_UP` and `COMPLETED`<br>• Use 1 emergency cancellation per week (Redis enforced) |
| **`ADMIN`** | Platform administrators | • Complete platform oversight<br>• Accept/reject user verification documents<br>• Block/unblock accounts and resolve user reports<br>• Full CRUD management over Manager accounts |
| **`MANAGER`** | Operational staff | • Review users and verification documents<br>• Block accounts and handle platform reports<br>• *Cannot create/edit managers or unblock users* |

> 🔒 **Verification Gate**: The `isProfileVerified()` middleware strictly blocks unverified Donors, Recipients, and Volunteers from creating donations, submitting requests, or accepting deliveries until approved by an Admin or Manager.

---

## 🛡️ Core Workflows & Concurrency

### 1. Concurrency-Safe Claiming (`SELECT ... FOR UPDATE`)
When multiple recipients simultaneously request the same donation, MealBridge guarantees consistency:
- When a Donor accepts a request, both the `donation` row and the `donation_request` row are locked using raw PostgreSQL `SELECT ... FOR UPDATE` inside an interactive `$transaction`.
- The donation's available quantity is verified.
- The requested quantity is decremented atomically.
- If the remaining quantity reaches `0`, the donation status automatically transitions to `CLAIMED`.
- A corresponding `DonationClaim` is created with a foreign-key link to the request.

### 2. Multi-Hop Cancellation & Restoration
- When a claim is canceled by either the Donor or Recipient:
  - The donation row is locked.
  - The claimed quantity is safely restored to the donation.
  - If the donation was `CLAIMED`, its status reverts to `AVAILABLE`.
  - All pending `DeliveryRequest` records are marked `CANCELLED`.
  - Any active `Delivery` is canceled, and the assigned Volunteer's `availabilityStatus` is restored.
  - Automated transactional emails and push notifications are dispatched to all parties.

### 3. Volunteer Single Active Delivery & Emergency Abort
- A volunteer can have **only one active delivery** (`PENDING` or `PICKED_UP`) at a time. Attempts to accept another request are rejected.
- Volunteers have access to an **Emergency Cancellation** feature limited to **1 cancellation per week**, tracked via Redis TTL keys (`weeklyLimit:{volunteerId}`).

### 4. Donor Emergency Cancellation Workflow
- Donors can trigger an emergency cancellation via `DELETE /api/donors/:id/emergency-cancel` when food spoils or poses public health and safety concerns.
- Acquires pessimistic database locks (`SELECT ... FOR UPDATE`) on the donation, its donation requests, claims, delivery requests, and active deliveries.
- Automatically transitions the donation to `CANCELLED`, cancels all pending donation requests and active claims, cancels pending and accepted delivery requests, marks ongoing deliveries as `CANCELLED`, resets volunteer availability to `true`, and sends urgent notifications and HTML emails to all affected recipients and volunteers.

### 5. Token Versioning & Session Revocation
- Passwords are encrypted with `bcryptjs` (cost: 12).
- JWTs encode `tokenVersion`. Whenever a user changes their password or an account is blocked, `tokenVersion` increments in PostgreSQL, immediately terminating active sessions across all devices.

---

## 🗄 Database Schema & Enums

The database is defined across modular Prisma schemas in `server/prisma/schema/` mapping to PostgreSQL.

### Entity Relationship Model

```mermaid
erDiagram
    User ||--o| DonorProfile : "has profile"
    User ||--o| RecipientProfile : "has profile"
    User ||--o| VolunteerProfile : "has profile"
    User ||--o{ Notification : receives
    User ||--o{ Report : "creates / reviews"
    User ||--o| BlockedUser : "blocked record"
    User ||--o{ SiteSetting : "updated by"

    DonorProfile ||--o{ Donation : creates
    Donation ||--o{ DonationRequest : receives
    RecipientProfile ||--o{ DonationRequest : submits

    DonationRequest ||--o| DonationClaim : "accepted into"
    Donation ||--o{ DonationClaim : "claims against"
    RecipientProfile ||--o{ DonationClaim : owns

    DonationClaim ||--o| Delivery : "fulfilled via"
    DonationClaim ||--o{ DeliveryRequest : "triggers"
    VolunteerProfile ||--o{ DeliveryRequest : "receives"
    VolunteerProfile ||--o{ Delivery : "executes"
    RecipientProfile ||--o{ Delivery : "drop-off"

    DonationClaim ||--o{ Conversation : "chat logistics"
    Conversation ||--o{ ConversationParticipant : members
    Conversation ||--o{ Message : messages
```

### Complete Enums Reference

| Enum | Allowed Values |
| :--- | :--- |
| **`Role`** | `DONOR`, `RECIPIENT`, `VOLUNTEER`, `ADMIN`, `MANAGER` |
| **`DonationStatus`** | `AVAILABLE`, `CLAIMED`, `COMPLETED`, `CANCELLED`, `EXPIRED` |
| **`DonationRequestStatus`** | `PENDING`, `ACCEPTED`, `REJECTED`, `CANCELLED` |
| **`ClaimStatus`** | `ACTIVE`, `COMPLETED`, `CANCELLED` |
| **`PickupMethod`** | `SELF`, `VOLUNTEER` |
| **`DeliveryRequestStatus`** | `PENDING`, `ACCEPTED`, `REJECTED`, `CANCELLED` |
| **`DeliveryStatus`** | `PENDING`, `PICKED_UP`, `CANCELLED`, `COMPLETED` |
| **`VolunteerType`** | `INDIVIDUAL`, `ORGANIZATION` |
| **`TransportType`** | `CAR`, `PUBLIC_TRANSPORT`, `VAN`, `BICYCLE`, `MOTORCYCLE`, `WALKING`, `OTHER` |
| **`DonorOrganizationType`** | `RESTAURANT`, `CAFE`, `HOTEL`, `CATERING`, `GOVERNMENT`, `INDIVIDUAL`, `OTHER` |
| **`RecipientOrganizationType`** | `SHELTER`, `COMMUNITY_CENTER`, `CHARITY`, `GOVERNMENT`, `INDIVIDUAL`, `OTHER` |
| **`ConversationType`** | `DONOR_RECIPIENT`, `RECIPIENT_VOLUNTEER` |
| **`ReportStatus`** | `PENDING`, `REVIEWED`, `RESOLVED`, `REJECTED` |

### Key Database Constraints
- `DonationRequest`: Unique constraint on `[recipientId, donationId]` (prevents duplicate spam requests).
- `DeliveryRequest`: Unique constraint on `[donationClaimId, volunteerId]` (prevents spamming the same volunteer).
- `DonationClaim`: Unique constraint on `donationRequestId` (strict 1:1 request to claim).
- `Delivery`: Unique constraint on `donationClaimId` (strict 1:1 claim to delivery).
- `Conversation`: Unique constraint on `[donationClaimId, conversationType]` (allows dedicated donor-recipient and recipient-volunteer chat channels per claim).
- `BlockedUser`: Unique constraint on `blockedId` (one active block record per user).

---

## 🔌 Complete API Reference

All protected endpoints require an authenticated session via HttpOnly `access_token` cookie.

### 1. Authentication (`/api/auth`)

| Method | Endpoint | Access | Rate Limit | Description |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/register/request` | Public | 10/hr | Send 6-digit registration OTP to email |
| `POST` | `/register/validate` | Public | Standard | Verify OTP, create user record, and set JWT cookie |
| `POST` | `/login` | Public | 10/hr | Authenticate with email/password and set JWT cookie |
| `POST` | `/logout` | 🔒 Authenticated | Standard | Invalidate token and clear cookie |
| `GET` | `/me` | 🔒 Authenticated | Standard | Retrieve current user profile and role data |
| `POST` | `/password/forgot/request` | Public | 10/hr | Request password reset OTP |
| `POST` | `/password/forgot/validate` | Public | Standard | Verify password reset OTP |
| `POST` | `/password/reset` | Public | Standard | Set new password and increment token version |

---

### 2. User & Profiles (`/api/users`) — 🔒 All Authenticated

| Method | Endpoint | Roles | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/profile` | Any | Fetch authenticated user profile with attached role details |
| `POST` | `/createProfile/donor` | DONOR | Initialize Donor profile (`organizationName`, `organizationType`, `address`) |
| `POST` | `/createProfile/recipient` | RECIPIENT | Initialize Recipient profile (`organizationName`, `organizationType`, `address`) |
| `POST` | `/createProfile/volunteer` | VOLUNTEER | Initialize Volunteer profile (`type`, `transportType`, `address`) |
| `PATCH` | `/profile/donor` | DONOR | Update donor profile details |
| `PATCH` | `/profile/recipient` | RECIPIENT | Update recipient profile details |
| `PATCH` | `/profile/volunteer` | VOLUNTEER | Update volunteer profile details |
| `PUT` | `/profile/profile-picture` | Any | Upload/replace profile picture via Cloudinary (Heavy limited) |
| `DELETE` | `/profile/profile-picture` | Any | Remove profile picture from DB and Cloudinary |
| `PATCH` | `/profile/verification-document` | Any | Upload up to 5 verification documents (Heavy limited) |
| `DELETE` | `/profile/verification-document` | Any | Remove a specific verification document by public ID |
| `PATCH` | `/change/password` | Any | Update password (requires current password; increments `tokenVersion`) |
| `PATCH` | `/change/email/request` | Any | Request email change OTP to current email address |
| `PATCH` | `/change/email/current/verify` | Any | Verify OTP sent to current email and dispatch OTP to new email |
| `PATCH` | `/change/email/new/verify-and-change` | Any | Verify OTP sent to new email and finalize email change |
| `PATCH` | `/change/phone` | Any | Update user phone number |

---

### 3. Donors (`/api/donors`) — 🔒 DONOR (Verified)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | List all own donations (paginated, sorted, status filter) |
| `POST` | `/` | Create a new donation with up to 5 pictures (Cloudinary upload) |
| `GET` | `/:id` | Get details of a single donation with its requests and claims |
| `PATCH` | `/:id` | Update donation details (blocked if pending requests or active claims exist) |
| `PATCH` | `/:id/cancel` | Cancel an active donation |
| `PATCH` | `/:id/add-pics` | Add additional photos to donation (up to 5 total) |
| `PATCH` | `/:id/remove-pics` | Remove a photo from donation |
| `GET` | `/:id/requests` | List all requests submitted for this donation |
| `GET` | `/:id/requests/:reqId` | Get single request details |
| `PATCH` | `/:id/requests/:reqId/accept` | **Accept request**: Locks rows, deducts quantity, creates claim, alerts recipient |
| `PATCH` | `/:id/requests/:reqId/reject` | **Reject request**: Locks rows, sets status REJECTED, alerts recipient |
| `GET` | `/:id/claims` | List all claims created for this donation |
| `GET` | `/:id/claims/:claimId` | Get details of a single claim |
| `PATCH` | `/:id/claims/:claimId/cancel` | **Cancel claim**: Restores quantity, cancels delivery, and notifies all parties |
| `DELETE` | `/:id/emergency-cancel` | **Emergency cancel donation**: Concurrency-locked cancel of donation, active claims, delivery requests, and active deliveries; resets volunteer availability and dispatches urgent notifications & emails |

---

### 4. Recipients (`/api/recipients`) — 🔒 RECIPIENT (Verified)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/donations` | Browse available donations across the platform |
| `GET` | `/donations/:id` | Get single donation details |
| `POST` | `/requests` | **Request donation**: Locks donation row, checks quantity, creates request |
| `GET` | `/requests` | List own donation requests (paginated, status filtered) |
| `GET` | `/requests/:id` | Get single donation request details |
| `PATCH` | `/requests/:id` | Update request quantity, address, or message |
| `PATCH` | `/donation-requests/:id/cancel` | Cancel a pending request |
| `GET` | `/claims` | List all own active/completed claims |
| `GET` | `/claims/:id` | Get single claim details |
| `PATCH` | `/claims/:id/cancel` | Cancel claim, restore donation stock, and notify donor/volunteer |
| `PATCH` | `/claims/:id/self-pickup` | Mark claim as **SELF** pickup and complete the claim |
| `GET` | `/volunteers` | Browse available, verified volunteers |
| `GET` | `/volunteers/:id` | Get details of a single volunteer |
| `POST` | `/delivery-requests` | Send a delivery request to a specific volunteer for an active claim |
| `GET` | `/delivery-requests` | List own delivery requests |
| `GET` | `/delivery-requests/:id` | Get single delivery request details |
| `PATCH` | `/delivery-requests/:id/cancel` | Cancel a pending delivery request |
| `GET` | `/delivery-requests/:id/has-delivery`| Check if claim already has an active delivery |
| `GET` | `/deliveries` | List active and historical deliveries for own claims |
| `GET` | `/deliveries/:id` | Get single delivery details |
| `PATCH` | `/deliveries/:id` | Mark delivery as received by recipient |
| `PATCH` | `/deliveries/:id/cancel` | Cancel an active delivery assignment |

---

### 5. Volunteers (`/api/volunteers`) — 🔒 VOLUNTEER (Verified)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/delivery-requests` | List delivery requests assigned to this volunteer |
| `PATCH` | `/delivery-requests/:id/accept` | **Accept delivery request**: Enforces single-delivery limit, creates Delivery, alerts donor/recipient |
| `PATCH` | `/delivery-requests/:id/reject` | Reject a delivery request |
| `GET` | `/deliveries` | List active and completed deliveries |
| `GET` | `/deliveries/:id` | Get single delivery details |
| `PATCH` | `/deliveries/:id/pickup` | Mark delivery status as `PICKED_UP` |
| `PATCH` | `/deliveries/:id/complete` | Mark delivery as `COMPLETED` (completes both Delivery and Claim) |
| `PATCH` | `/deliveries/:id/cancel` | **Emergency cancel delivery**: 1 cancellation/week limit enforced via Redis |

---

### 6. Admin & Management (`/api/admin`) — 🔒 ADMIN & MANAGER

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/users` | ADMIN, MANAGER | List all registered users (safe projection) |
| `GET` | `/users/with-profile` | ADMIN, MANAGER | Group users by role with full profiles (donors, recipients, volunteers) |
| `GET` | `/users/:id` | ADMIN, MANAGER | Get complete user profile by ID |
| `PATCH` | `/users/:id/verify/accept` | ADMIN, MANAGER | **Accept verification**: Row-locked update setting `verificationStatus: true` |
| `PATCH` | `/users/:id/verify/reject` | ADMIN, MANAGER | **Reject verification**: Row-locked update setting `verificationStatus: false` |
| `PATCH` | `/users/:id/block` | ADMIN, MANAGER | Block account with reason; records `BlockedUser` entry |
| `PATCH` | `/users/:id/unblock` | ADMIN only | Unblock account and remove `BlockedUser` record |
| `GET` | `/managers` | ADMIN only | List all manager accounts |
| `POST` | `/managers` | ADMIN only | Create a new manager account |
| `PATCH` | `/managers/:id` | ADMIN only | Update manager credentials/details |
| `DELETE` | `/managers/:id` | ADMIN only | Delete a manager account |
| `GET` | `/chats/:conversationId` | ADMIN, MANAGER | Read-only inspection of conversation messages and participants for moderation |

---

### 7. Notifications (`/api/notifications`) — 🔒 All Authenticated

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Fetch all in-app notifications for authenticated user (ordered by date desc) |
| `PATCH` | `/:notificationId/mark-as-read` | Mark a specific notification as read |

---

### 8. Reports (`/api/reports`) — 🔒 All Authenticated

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/` | Any | Submit a report regarding an issue or user to support team |
| `GET` | `/` | ADMIN, MANAGER | List all submitted reports |
| `GET` | `/:id` | ADMIN, MANAGER | Get details of a single report |
| `PATCH` | `/handle` | ADMIN, MANAGER | Review and update report status (`RESOLVED`, `REJECTED`) with decision message |

---

### 9. Real-Time Chat (`/api/chats`) — 🔒 All Authenticated

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/conversations` | List all active conversations for the authenticated user |
| `GET` | `/conversations/:id/messages` | Get message history and participant list for a specific conversation |

---

## 🔔 Real-time Events & Email Notifications

### Socket.io Architecture
The WebSocket server runs synchronously alongside the HTTP server, authenticating connections using the same JWT HttpOnly cookie:
- **`user:{userId}`**: Dedicated private room for user-specific real-time notifications and offline alerts.
- **`role:{Role}`**: Role-based rooms allowing broadcasts to all Admins/Managers (e.g. support reports).
- **`conversation:{conversationId}`**: Real-time room for active direct messages between participants (Donor-Volunteer, Recipient-Volunteer).
- **Socket Events**:
  - `new-notification` — Emitted when in-app notifications are generated.
  - `new-report` — Dispatched to `role:ADMIN` and `role:MANAGER` upon issue submission.
  - `join-chat` — Client joins an active conversation room (validates user membership).
  - `send-message` — Client sends a message; persisted to DB via Prisma and broadcasted to the conversation.
  - `receive-message` — Delivers incoming chat messages in real time to the conversation room.
  - `mark-read` — Updates `lastReadAt` in `ConversationParticipant`.
  - `messages-read` — Emits real-time read receipt updates to participants.

### Transactional Email Suite (Nodemailer)
MealBridge includes responsive, branded HTML email templates covering every interaction:
1. **Authentication**: `sendRegisterRequestOtpMail`, `sendForgotPasswordOtpMail`, `sendWelcomeMail`, `sendChangeEmailOtpMail`.
2. **Verification & Moderation**: `sendVerificationStatusChangeMail` (Accepted/Rejected), `sendBlockStatusChangeMail` (Blocked/Unblocked).
3. **Donation Requests**: `sendCreateRequestForDonorMail`, `sendAcceptDonationRequestRecipientPovMail`, `sendAcceptDonationRequestDonorPovMail`, `sendRejectDonationRequestRecipientPovMail`, `sendRejectDonationRequestDonorPovMail`.
4. **Claim & Emergency Cancellations**: `sendClaimCancelForDonorMail`, `sendClaimCancelForRecipientMail`, `sendClaimCancelForVolunteerMail`, `sendEmergencyDonationCancellationRecipientMail`, `sendEmergencyDonationCancellationVolunteerMail`.
5. **Delivery Lifecycle**: `sendCreateDeliveryRequestVolunteerMail`, `sendCancelDeliveryRequestVolunteerMail`, `sendAcceptDeliveryRecipientMail`, `sendAcceptDeliveryDonorMail`, `sendAcceptDeliveryVolunteerMail`, `sendRejectDeliveryRecipientMail`, `sendRejectDeliveryDonorMail`, `sendCompleteDeliveryRecipientMail`, `sendCompleteDeliveryDonorMail`, `sendCompleteDeliveryVolunteerMail`, `sendCancelDeliveryRecipientMail`, `sendCancelDeliveryDonorMail`, `sendCancelDeliveryVolunteerMail`.

---

## 📁 Project Directory Structure

```
MealBridge/
├── delivery.puml                      # Delivery workflow use case diagram
├── donation_request.puml              # Donation request workflow use case diagram
├── erd.puml                           # Entity Relationship Diagram (PlantUML)
├── main.puml                          # System-level use case diagram
├── docs.txt                           # Functional & non-functional requirements
├── README.md                          # Comprehensive project documentation
└── server/
    ├── config/
    │   ├── cloudinary.ts              # Cloudinary SDK credentials & configuration
    │   └── redis.ts                   # ioredis client initialization
    ├── database/
    │   ├── includes.ts                # Reusable Prisma include objects
    │   ├── index.ts                   # Prisma client with @prisma/adapter-pg pool
    │   └── selectors.ts               # Reusable, secure Prisma select projections
    ├── middlewares/
    │   ├── auth.middleware.ts         # protect, authorizeRoles, isProfileVerified
    │   ├── multer.middleware.ts       # Multer memory storage (PFP, Docs, Photos)
    │   ├── rateLimit.middleware.ts    # authRateLimiter & heavyRateLimiter
    │   └── validate.middleware.ts     # Zod schema validation middleware
    ├── modules/
    │   ├── admin/                     # User moderation, manager CRUD, doc verification
    │   │   ├── admin.controller.ts
    │   │   ├── admin.route.ts
    │   │   ├── admin.service.ts
    │   │   └── admin.zod.ts
    │   ├── auth/                      # OTP registration, login, logout, password reset
    │   │   ├── auth.controller.ts
    │   │   ├── auth.otp.store.ts
    │   │   ├── auth.route.ts
    │   │   ├── auth.service.ts
    │   │   └── auth.zod.ts
    │   ├── chat/                      # Real-time chat routes, controllers, and services
    │   │   ├── chat.controller.ts
    │   │   ├── chat.route.ts
    │   │   ├── chat.service.ts
    │   │   └── chat.zod.ts
    │   ├── donor/                     # Donations, image uploads, claims & request reviews
    │   │   ├── donor.controller.ts
    │   │   ├── donor.route.ts
    │   │   ├── donor.service.ts
    │   │   └── donor.zod.ts
    │   ├── notification/              # In-app notifications & read markers
    │   │   ├── notification.controller.ts
    │   │   ├── notification.route.ts
    │   │   ├── notification.service.ts
    │   │   └── notification.zod.ts
    │   ├── recipient/                 # Donation requests, claim pickups, volunteer requests
    │   │   ├── recipient.controller.ts
    │   │   ├── recipient.route.ts
    │   │   ├── recipient.service.ts
    │   │   └── recipient.zod.ts
    │   ├── report/                    # User reports, admin decisions
    │   │   ├── report.controller.ts
    │   │   ├── report.route.ts
    │   │   ├── report.service.ts
    │   │   └── report.zod.ts
    │   ├── user/                      # Multi-role profile CRUD, verification docs, credentials
    │   │   ├── user.controller.ts
    │   │   ├── user.otp.store.ts
    │   │   ├── user.route.ts
    │   │   ├── user.service.ts
    │   │   └── user.zod.ts
    │   └── volunteer/                 # Delivery requests, pickups, completions, emergency abort
    │       ├── volunteer.controller.ts
    │       ├── volunteer.route.ts
    │       ├── volunteer.service.ts
    │       └── volunteer.zod.ts
    ├── prisma/
    │   ├── migrations/                # Migration history & SQL scripts
    │   └── schema/
    │       ├── admin.prisma           # SiteSetting, Report, Notification, BlockedUser
    │       ├── chat.prisma            # Conversation, ConversationParticipant, Message
    │       ├── donation.prisma        # Donation, DonationRequest, DonationClaim, Delivery, DeliveryRequest
    │       ├── enums.prisma           # All domain enums
    │       ├── main.prisma            # Datasource & generator definition
    │       └── users.prisma           # User, DonorProfile, RecipientProfile, VolunteerProfile
    ├── utils/
    │   ├── cloudinary/                # Buffer streaming upload & delete helpers
    │   ├── errors/                    # AppError class & asyncHandler wrapper
    │   ├── jwt/                       # Cookie-based JWT generation
    │   ├── mail/                      # Nodemailer config & 12+ HTML templates
    │   ├── otp/                       # SHA-256 OTP generation & verification
    │   ├── password/                  # bcryptjs hashing and comparison
    │   ├── phoneNumber/               # Phone formatting & internationalization (+20)
    │   ├── redis/                     # Redis OTP sessions & weekly cancellation counters
    │   ├── socket/                    # Socket.io initialization, room join, event emitters
    │   └── types/                     # AuthRequest & sorting/pagination contracts
    ├── __tests__/                     # Vitest API test suites
    ├── index.ts                       # Server bootstrap, middleware pipeline & routing
    ├── package.json
    └── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v20 or higher)
- **PostgreSQL** (v15 or higher)
- **Redis** (v6 or higher)
- **Gmail Account with App Password** (for transactional emails)
- **Cloudinary Account** (for media assets)

### Installation & Local Setup

1. **Clone repository**:
   ```bash
   git clone https://github.com/3mrmousa/MealBridge.git
   cd MealBridge
   ```

2. **Install dependencies**:
   ```bash
   cd server
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the `server/` directory following the [Environment Variables](#-environment-variables) template.

4. **Apply database migrations**:
   ```bash
   npx prisma migrate dev
   ```

5. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

6. **Start development server**:
   ```bash
   npm run dev
   ```

   The server will start on your configured port (default: `http://localhost:3000`).

---

## 🔐 Environment Variables

Create a `server/.env` file:

```env
# Server & Environment Configuration
NODE_ENV=development                                                    # Runtime mode: 'development', 'production', or 'test'
PORT=3000                                                               # Port on which the Express server listens
CLIENT_URL=http://localhost:3001                                        # Main client frontend URL (used for CORS & Socket.IO)
ADMIN_CLIENT_URL=http://localhost:3002                                  # Admin dashboard frontend URL (used for CORS)

# Database (PostgreSQL via Prisma & pg)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mealbridge_database" # PostgreSQL connection URI

# Authentication & Security
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long        # Secret key used to sign & verify JWT cookies (min 32 chars)

# Redis (Caching, Sessions & Rate Limiting)
REDIS_URL=redis://localhost:6379                                        # Redis connection URI (required for cancellation limits)

# Cloudinary Media Storage (Photos & Verification Documents)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name                        # Cloudinary Cloud Name
CLOUDINARY_API_KEY=your_cloudinary_api_key                              # Cloudinary API Key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret                        # Cloudinary API Secret

# Transactional Email Service (Nodemailer via Gmail SMTP)
EMAIL_USER=your_email@gmail.com                                         # Gmail address used as the sender ('from')
EMAIL_PASS=your_gmail_16_character_app_password                         # 16-character Google App Password (not normal password)
```

---

## 📊 UML Diagrams

The project includes formal PlantUML diagrams documenting every architectural layer:

| Diagram | Source File | Description |
| :--- | :--- | :--- |
| **System Overview** | [`main.puml`](main.puml) | Use cases across all 5 system roles |
| **Donation & Request** | [`donation_request.puml`](donation_request.puml) | Donor and Recipient interaction lifecycle |
| **Delivery Workflow** | [`delivery.puml`](delivery.puml) | Volunteer pickup and drop-off flow |
| **Entity Relationship** | [`erd.puml`](erd.puml) | Complete PostgreSQL ERD (16 entities, 13 enums, constraints) |

> 💡 **Viewing UML**: Render the diagrams inside Visual Studio Code using the **PlantUML** extension or via the [PlantUML Online Server](https://www.plantuml.com/plantuml/uml/).

---

<div align="center">

**MealBridge — Engineered with care to fight hunger and eliminate food waste.**

</div>