<div align="center">

# 🍽️ MealBridge

**Connecting surplus food with those who need it most.**

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)

---

*A full-stack platform designed to reduce food waste by seamlessly connecting food donors (restaurants, hotels, cafes) with verified recipients and volunteer delivery drivers.*

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [User Roles](#-user-roles)
- [Features & Progress](#-features--progress)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [UML Diagrams](#-uml-diagrams)

---

## 🌍 Overview

MealBridge is a food waste management platform that tackles the problem of surplus food in the hospitality industry. Restaurants, hotels, and cafes can list their excess food as donations. Verified recipients (shelters, community centers, charities) can request those donations, and volunteer drivers can pick them up and deliver them.

### Core Workflow

```
Donor lists food → Recipient requests it → Donor accepts → Claim is created
                                                              ↓
                                              Recipient picks up (SELF)
                                                       OR
                                              Recipient requests a Volunteer → Volunteer accepts/rejects → Delivers
```

### Key Goals

- **Reduce food waste** by providing a frictionless platform for surplus food redistribution.
- **Real-time communication** between donors, recipients, and volunteers via WebSocket-powered notifications.
- **Automated notifications & emails** for events like accepted requests, claim updates, and pickup decisions.
- **Concurrency-safe** operations using PostgreSQL row-level locking (`SELECT FOR UPDATE`) inside transactions.
- **Admin oversight** with full activity logs, user management, report handling, and site settings.

---

## 🏗 Architecture

MealBridge follows a **modular, domain-driven** architecture with a clear separation of concerns:

```
┌─────────────────────────────────────────────────────┐
│                     Client (TBD)                    │
├─────────────────────────────────────────────────────┤
│                    Admin Panel (TBD)                │
├─────────────────────────────────────────────────────┤
│                                                     │
│   Express.js Server (REST API + WebSockets)         │
│                                                     │
│   ┌──────────────┐  ┌──────────────┐                │
│   │   Routes     │→ │  Middleware   │                │
│   │              │  │  (Auth, Zod)  │                │
│   └──────┬───────┘  └──────────────┘                │
│          ↓                                          │
│   ┌──────────────┐                                  │
│   │  Controllers │  (HTTP layer — req/res only)     │
│   └──────┬───────┘                                  │
│          ↓                                          │
│   ┌──────────────┐                                  │
│   │   Services   │  (Business logic + locking)      │
│   └──────┬───────┘                                  │
│          ↓                                          │
│   ┌──────────────┐  ┌──────────────┐                │
│   │  Prisma ORM  │  │  Redis (OTP) │                │
│   └──────┬───────┘  └──────────────┘                │
│          ↓                                          │
│   ┌──────────────┐  ┌──────────────┐                │
│   │  PostgreSQL  │  │  Socket.io   │                │
│   └──────────────┘  └──────────────┘                │
└─────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Runtime** | Node.js v20+ |
| **Language** | TypeScript |
| **Framework** | Express.js v5 |
| **Database** | PostgreSQL |
| **ORM** | Prisma 7.10 (with `@prisma/adapter-pg`) |
| **Cache / Sessions** | Redis (via `ioredis`) |
| **Authentication** | JWT (HttpOnly cookies) + token versioning |
| **Password Hashing** | bcryptjs (salt rounds: 12) |
| **Validation** | Zod v4 |
| **Email** | Nodemailer 10 (Gmail SMTP) |
| **File Storage** | Cloudinary 2.11 |
| **Real-time** | Socket.io 4.8 (active — notifications & chat) |
| **Security** | Helmet, CORS, cookie-parser, express-rate-limit |
| **Concurrency** | PostgreSQL `SELECT FOR UPDATE` row-level locking |

---

## 👥 User Roles

MealBridge supports **5 distinct user roles**, each with specific permissions:

| Role | Description |
| :--- | :--- |
| **Donor** | Restaurants, hotels, cafes — create, edit, and cancel food donations. Accept or reject recipient requests. Can chat with connected recipients/volunteers. |
| **Recipient** | Shelters, charities, community centers — request available donations, manage claims, cancel claims, and optionally request volunteer delivery. |
| **Volunteer** | Delivery drivers — view assigned pickup requests, accept or reject them, with ownership verification. Limited to verified users only. |
| **Admin** | Full platform oversight — manage users, verify/reject documents, block/unblock accounts, read chats (read-only), handle reports. |
| **Manager** | Elevated administrative role with similar capabilities to Admin (except some admin-only actions like unblock). |

---

## ✅ Features & Progress

### Completed

- [x] **Project Foundation**
  - Express.js v5 server with TypeScript
  - Multi-file Prisma schema with full ERD implementation
  - PostgreSQL database with migrations
  - Redis integration for OTP session management
  - Cloudinary configuration for file uploads
  - Global error handling (`AppError` + `asyncHandler`)
  - Zod v4 validation middleware
  - Rate limiting middleware (`heavyRateLimiter`)

- [x] **Authentication Module** — Full auth flow
  - `POST /api/auth/register/request` — OTP-based registration
  - `POST /api/auth/register/validate` — Verifies OTP, creates user in DB, sets JWT cookie
  - `POST /api/auth/login` — Email/password login with JWT cookie
  - `POST /api/auth/logout` — Clears HttpOnly cookie
  - `GET /api/auth/me` — Returns authenticated user profile
  - `POST /api/auth/password/forgot/request` — Sends password reset OTP
  - `POST /api/auth/password/forgot/validate` — Verifies password reset OTP
  - `POST /api/auth/password/reset` — Resets password and cleans up Redis session

- [x] **Security Infrastructure**
  - JWT authentication with HttpOnly, Secure, SameSite cookies + token versioning
  - `protect` middleware for route-level authentication
  - `authorizeRoles` middleware for RBAC
  - OTP hashing with SHA-256 (never stored in plain text)
  - Password hashing with bcryptjs (12 salt rounds)
  - Helmet for HTTP security headers
  - CORS with credentials support

- [x] **Real-time Infrastructure (Socket.io)**
  - WebSocket server integrated with the HTTP server
  - Cookie-based JWT authentication for socket connections
  - `sendNotificationToUser` — emit live notifications to connected users
  - `sendReportToSupportTeam` — emit reports to all connected admins/managers
  - Proper cookie parsing using `parseCookie` from the `cookie` package

- [x] **Email Service** — Branded HTML templates
  - Registration & password reset OTP emails
  - Donation request accept/reject emails (recipient + donor POV)
  - Claim cancel emails
  - **Delivery request accept emails** (recipient + donor)
  - **Delivery request reject emails** (recipient only)
  - Admin/manager verification notifications

- [x] **User Module** (`/api/users`)
  - `GET /api/users/profile` — Get own profile
  - `PATCH /api/users/profile` — Update profile (role-specific)
  - `PUT /api/users/profile/profile-picture` — Upload profile picture (Cloudinary)
  - `DELETE /api/users/profile/profile-picture` — Remove profile picture
  - `PATCH /api/users/profile/verification-document` — Upload verification docs
  - `DELETE /api/users/profile/verification-document` — Remove verification doc
  - `PATCH /api/users/change/password` — Change password
  - `PATCH /api/users/change/email/request` — Request email change (OTP)
  - `PATCH /api/users/change/email/current/verify` — Verify current email OTP
  - `PATCH /api/users/change/email/new/verify-and-change` — Verify & apply new email
  - `PATCH /api/users/change/phone` — Change phone number

- [x] **Admin Module** (`/api/admin`)
  - `GET /api/admin/users` — List all users
  - `GET /api/admin/users/with-profile` — Users with full profiles
  - `GET /api/admin/users/:id` — Get single user by ID
  - `PATCH /api/admin/users/:id/verify/accept` — Accept verification docs (Admin/Manager)
  - `PATCH /api/admin/users/:id/verify/reject` — Reject verification docs (Admin/Manager)
  - `PATCH /api/admin/users/:id/block` — Block a user (Admin/Manager)
  - `PATCH /api/admin/users/:id/unblock` — Unblock a user (Admin only)
  - `GET /api/admin/managers` — List all managers (Admin only)
  - `POST /api/admin/managers` — Create a manager (Admin only)
  - `PATCH /api/admin/managers/:id` — Update a manager (Admin only)
  - `DELETE /api/admin/managers/:id` — Delete a manager (Admin only)

- [x] **Donor Module** (`/api/donors`) — Full donation lifecycle
  - `GET /api/donors/` — Get all own donations (paginated, sorted, filtered)
  - `POST /api/donors/` — Create a donation (with Cloudinary image upload)
  - `GET /api/donors/:id` — Get single donation
  - `PATCH /api/donors/:id` — Update donation
  - `PATCH /api/donors/:id/cancel` — Cancel donation
  - `PATCH /api/donors/:id/add-pics` — Add images to donation
  - `PATCH /api/donors/:id/remove-pics` — Remove images from donation
  - `GET /api/donors/:id/requests` — List all requests on a donation
  - `GET /api/donors/:id/requests/:reqId` — Get single request
  - `PATCH /api/donors/:id/requests/:reqId/accept` — Accept a request (with lock on donation + request)
  - `PATCH /api/donors/:id/requests/:reqId/reject` — Reject a request (with lock on donation + request, wrapped in transaction)
  - `GET /api/donors/:id/claims` — List all claims on a donation
  - `GET /api/donors/:id/claims/:claimId` — Get single claim

- [x] **Recipient Module** (`/api/recipients`)
  - `GET /api/recipients/requests` — List own requests
  - `POST /api/recipients/requests` — Create a donation request (with `FOR UPDATE` lock on donation)
  - `GET /api/recipients/requests/:id` — Get single request
  - `PATCH /api/recipients/requests/:id` — Update request (locks donation + request rows)
  - `PATCH /api/recipients/donation-requests/:id/cancel` — Cancel request (`deleteMany` + count check)
  - `GET /api/recipients/donations` — Browse available donations
  - `GET /api/recipients/donations/:id` — Get donation details
  - `GET /api/recipients/claims` — List own claims
  - `GET /api/recipients/claims/:id` — Get single claim
  - `PATCH /api/recipients/claims/:id/cancel` — Cancel a claim (with lock + status check)
  - `GET /api/recipients/volunteers` — Browse available volunteers
  - `GET /api/recipients/volunteers/:id` — Get volunteer details
  - `POST /api/recipients/delivery-requests` — Request a delivery from a volunteer
  - `GET /api/recipients/delivery-requests` — List own delivery requests

- [x] **Volunteer Module** (`/api/volunteers`) — *Refactored from pickup module*
  - `GET /api/volunteers/delivery-requests` — List all delivery requests assigned to this volunteer
  - `PATCH /api/volunteers/delivery-requests/:id/accept` — Accept a delivery request (row-level lock + ownership check + emails)
  - `PATCH /api/volunteers/delivery-requests/:id/reject` — Reject a delivery request
  - `GET /api/volunteers/deliveries` — List active deliveries
  - `GET /api/volunteers/deliveries/:id` — Get single delivery details
  - `PATCH /api/volunteers/deliveries/:id/pickup` — Mark delivery as picked up
  - `PATCH /api/volunteers/deliveries/:id/complete` — Mark delivery as completed
  - `PATCH /api/volunteers/deliveries/:id/cancel` — Emergency abort a delivery

- [x] **Notification Module** (`/api/notifications`)
  - `GET /api/notifications/` — Get all notifications for the authenticated user
  - `PATCH /api/notifications/:notificationId/mark-as-read` — Mark a notification as read
  - Real-time delivery via Socket.io on `new-notification` event

- [x] **Report Module** (`/api/reports`)
  - `POST /api/reports/` — Create a report (any authenticated user)
  - `GET /api/reports/` — List all reports (Admin/Manager only)
  - `GET /api/reports/:id` — Get a single report (Admin/Manager only)
  - `PATCH /api/reports/handle` — Accept or reject a report (Admin/Manager only)

- [x] **Concurrency & Data Integrity**
  - Row-level locking with `SELECT ... FOR UPDATE` inside interactive transactions
  - Fixed table name casing (`"donation"` not `"Donation"`) and `::uuid` casting in raw queries
  - `deleteMany` with `count` check for safe idempotent deletes
  - `rejectDonationRequestService` wrapped in `$transaction` (previously outside)

### In Progress / Planned

- [ ] **Donor**: Needs review, a way to request claim cancellation, pickup tracking, volunteer routes integration, and chat.
- [ ] **Recipient**: Needs review, a way to request claim cancellation, and chat integration.
- [ ] **Volunteer**: Needs review and completion of volunteer-specific routes.
- [ ] **Chat Module** — Real-time messaging between donor, recipient, and volunteer (Socket.io infrastructure is ready)
- [ ] **Client App** — User-facing frontend
- [ ] **Admin Panel** — Admin dashboard

---

## 🗄 Database Schema

The database is designed around a **3-stage donation workflow**:

```
Stage 1: DonationRequest     — Recipient requests a donation
Stage 2: DonationClaim       — Donor accepts → Claim is created
Stage 3: DeliveryRequest     — Recipient optionally requests volunteer delivery
```

### Entity Overview

```mermaid
erDiagram
    User ||--o| DonorProfile : has
    User ||--o| RecipientProfile : has
    User ||--o| VolunteerProfile : has
    DonorProfile ||--o{ Donation : creates
    Donation ||--o{ DonationRequest : receives
    RecipientProfile ||--o{ DonationRequest : submits
    DonationRequest ||--o| DonationClaim : becomes
    DonationClaim ||--o{ DeliveryRequest : triggers
    DonationClaim ||--o| Delivery : becomes
    VolunteerProfile ||--o{ DeliveryRequest : receives
    VolunteerProfile ||--o{ Delivery : executes
    DonationClaim ||--o{ Conversation : has
    Conversation ||--o{ Message : contains
    User ||--o{ Notification : receives
    User ||--o{ Report : creates
```

### Key Enums

| Enum | Values |
| :--- | :--- |
| `Role` | DONOR, RECIPIENT, VOLUNTEER, ADMIN, MANAGER |
| `DonationStatus` | AVAILABLE, COMPLETED, CANCELLED, EXPIRED |
| `DonationRequestStatus` | PENDING, ACCEPTED, REJECTED, CANCELLED |
| `ClaimStatus` | ACTIVE, COMPLETED, CANCELLED |
| `PickupMethod` | SELF, VOLUNTEER |
| `DeliveryRequestStatus` | PENDING, ACCEPTED, REJECTED, CANCELLED |
| `DeliveryStatus` | PENDING, PICKED_UP, CANCELLED, COMPLETED |
| `VolunteerType` | *(defined in schema)* |
| `TransportType` | *(defined in schema)* |

---

## 🔌 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/register/request` | ❌ | Send registration OTP to email |
| `POST` | `/register/validate` | ❌ | Verify OTP and create account |
| `POST` | `/login` | ❌ | Login with email and password |
| `POST` | `/logout` | 🔒 | Clear auth cookie |
| `GET` | `/me` | 🔒 | Get authenticated user profile |
| `POST` | `/password/forgot/request` | ❌ | Send password reset OTP |
| `POST` | `/password/forgot/validate` | ❌ | Verify password reset OTP |
| `POST` | `/password/reset` | ❌ | Reset password with new one |

### Users (`/api/users`) — 🔒 All routes require auth

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/profile` | Get own profile |
| `PATCH` | `/profile` | Update profile |
| `PUT` | `/profile/profile-picture` | Upload profile picture |
| `DELETE` | `/profile/profile-picture` | Delete profile picture |
| `PATCH` | `/profile/verification-document` | Upload verification docs |
| `DELETE` | `/profile/verification-document` | Delete verification doc |
| `PATCH` | `/change/password` | Change password |
| `PATCH` | `/change/email/request` | Request email change |
| `PATCH` | `/change/email/current/verify` | Verify current email OTP |
| `PATCH` | `/change/email/new/verify-and-change` | Apply new email |
| `PATCH` | `/change/phone` | Change phone number |

### Admin (`/api/admin`) — 🔒 Admin/Manager only

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/users` | List all users |
| `GET` | `/users/with-profile` | Users with full profiles |
| `GET` | `/users/:id` | Get single user |
| `PATCH` | `/users/:id/verify/accept` | Accept verification documents |
| `PATCH` | `/users/:id/verify/reject` | Reject verification documents |
| `PATCH` | `/users/:id/block` | Block a user |
| `PATCH` | `/users/:id/unblock` | Unblock a user (Admin only) |
| `GET` | `/managers` | List all managers (Admin only) |
| `POST` | `/managers` | Create a manager (Admin only) |
| `PATCH` | `/managers/:id` | Update a manager (Admin only) |
| `DELETE` | `/managers/:id` | Delete a manager (Admin only) |

### Donors (`/api/donors`) — 🔒 DONOR role

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Get all own donations |
| `POST` | `/` | Create a donation (with images) |
| `GET` | `/:id` | Get single donation |
| `PATCH` | `/:id` | Update donation |
| `PATCH` | `/:id/cancel` | Cancel donation |
| `PATCH` | `/:id/add-pics` | Add images |
| `PATCH` | `/:id/remove-pics` | Remove images |
| `GET` | `/:id/requests` | List requests on a donation |
| `GET` | `/:id/requests/:reqId` | Get single request |
| `PATCH` | `/:id/requests/:reqId/accept` | Accept a request |
| `PATCH` | `/:id/requests/:reqId/reject` | Reject a request |
| `GET` | `/:id/claims` | List claims |
| `GET` | `/:id/claims/:claimId` | Get single claim |

### Recipients (`/api/recipients`) — 🔒 RECIPIENT role

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/requests` | List own donation requests |
| `POST` | `/requests` | Create a donation request |
| `GET` | `/requests/:id` | Get single request |
| `PATCH` | `/requests/:id` | Update a request |
| `PATCH` | `/donation-requests/:id/cancel` | Cancel a request |
| `GET` | `/donations` | Browse available donations |
| `GET` | `/donations/:id` | Get donation details |
| `GET` | `/claims` | List own claims |
| `GET` | `/claims/:id` | Get single claim |
| `PATCH` | `/claims/:id/cancel` | Cancel a claim |
| `GET` | `/volunteers` | Browse volunteers |
| `GET` | `/volunteers/:id` | Get volunteer details |
| `POST` | `/delivery-requests` | Request volunteer delivery |
| `GET` | `/delivery-requests` | List own delivery requests |

### Volunteers (`/api/volunteers`) — 🔒 VOLUNTEER role

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/delivery-requests` | List assigned delivery requests |
| `PATCH` | `/delivery-requests/:id/accept` | Accept a delivery request |
| `PATCH` | `/delivery-requests/:id/reject` | Reject a delivery request |
| `GET` | `/deliveries` | List active deliveries |
| `GET` | `/deliveries/:id` | Get single delivery |
| `PATCH` | `/deliveries/:id/pickup` | Mark delivery as picked up |
| `PATCH` | `/deliveries/:id/complete` | Complete a delivery |
| `PATCH` | `/deliveries/:id/cancel` | Emergency abort a delivery |

### Notifications (`/api/notifications`) — 🔒 All roles

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Get all notifications |
| `PATCH` | `/:notificationId/mark-as-read` | Mark as read |

### Reports (`/api/reports`) — 🔒 All roles (GET/handle: Admin/Manager)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/` | Create a report |
| `GET` | `/` | List all reports (Admin/Manager) |
| `GET` | `/:id` | Get single report (Admin/Manager) |
| `PATCH` | `/handle` | Handle a report (Admin/Manager) |

> 🔒 = Requires authentication (JWT HttpOnly cookie)

---

## 📁 Project Structure

```
MealBridge/
├── server/
│   ├── config/
│   │   ├── cloudinary.ts           # Cloudinary SDK config
│   │   └── redis.ts                # Redis (ioredis) client
│   ├── database/
│   │   └── index.ts                # Prisma client with pg adapter
│   ├── middlewares/
│   │   ├── auth.middleware.ts       # protect + authorizeRoles
│   │   ├── multer.middleware.ts     # File upload handling
│   │   ├── rateLimit.middleware.ts  # Rate limiting (heavyRateLimiter)
│   │   └── validate.middleware.ts   # Zod schema validation
│   ├── modules/
│   │   ├── admin/                   # Admin & Manager operations
│   │   ├── auth/                    # Registration, login, password reset
│   │   ├── donor/                   # Donations, requests, claims (Donor POV)
│   │   ├── notification/            # In-app notifications
│   │   ├── recipient/               # Requests, claims, donations (Recipient POV)
│   │   ├── report/                  # User-to-admin issue reporting
│   │   ├── user/                    # Profile, settings, credentials
│   │   └── volunteer/               # Pickup request management (Volunteer POV)
│   ├── prisma/
│   │   ├── migrations/              # Database migration history
│   │   └── schema/
│   │       ├── main.prisma          # Prisma generator + datasource
│   │       ├── enums.prisma         # All enum definitions
│   │       ├── users.prisma         # User + role profiles
│   │       ├── donation.prisma      # Donation workflow entities
│   │       ├── chat.prisma          # Conversation + Message
│   │       └── admin.prisma         # Notification, Report, SiteSetting
│   ├── utils/
│   │   ├── cloudinary/
│   │   │   └── uploadImage.ts       # Cloudinary upload helpers
│   │   ├── errors/
│   │   │   ├── AppError.ts          # Custom error class
│   │   │   └── asyncHandler.ts      # Async wrapper for controllers
│   │   ├── jwt/
│   │   │   └── generateToken.ts     # JWT sign + HttpOnly cookie
│   │   ├── mail/
│   │   │   ├── mail.config.ts       # Nodemailer transporter + base layout
│   │   │   ├── email.service.ts     # Barrel export for all mail modules
│   │   │   ├── auth.mail.ts         # OTP emails
│   │   │   ├── admin.mail.ts        # Admin/verification emails
│   │   │   ├── donation.mail.ts     # Donation request accept/reject emails
│   │   │   ├── user.mail.ts         # User account emails
│   │   │   └── volunteer.mail.ts    # Pickup request accept/reject emails
│   │   ├── otp/
│   │   │   ├── generateOtp.ts       # OTP generate + verify (SHA-256)
│   │   │   └── otp.redis.ts         # Redis get/set/delete for OTP
│   │   ├── password/
│   │   │   └── passwordFunctions.ts # bcryptjs hash + compare
│   │   ├── phoneNumber/
│   │   │   └── formatPhoneNumber.ts # Phone number formatting
│   │   ├── socket/
│   │   │   └── socket.ts            # Socket.io server + notification helpers
│   │   └── types/
│   │       └── sort.types.ts        # Shared sort/pagination types
│   ├── index.ts                     # App entry point + route registration
│   ├── package.json
│   └── tsconfig.json
├── delivery.puml                    # Delivery use case diagram
├── donation_request.puml            # Donation & Request use case diagram
├── erd.puml                         # Entity Relationship Diagram
├── main.puml                        # System-level use case diagram
├── docs.txt                         # Project requirements document
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v20+
- **PostgreSQL** running locally or remotely
- **Redis** running locally or remotely
- **Gmail App Password** for email service ([guide](https://support.google.com/accounts/answer/185833))

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/3mrmousa/MealBridge.git
   cd MealBridge
   ```

2. **Install server dependencies**

   ```bash
   cd server
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the `server/` directory (see [Environment Variables](#-environment-variables)).

4. **Run database migrations**

   ```bash
   npx prisma migrate dev
   ```

5. **Generate Prisma client**

   ```bash
   npx prisma generate
   ```

6. **Start the development server**

   ```bash
   npm run dev
   ```

   The server will start on the port specified in your `.env` file.

---

## 🔐 Environment Variables

Create a `server/.env` file with the following variables:

```env
# Server
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/mealbridge_database

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_jwt_secret_here

# Email (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 📊 UML Diagrams

The project includes PlantUML diagrams documenting the system design:

| Diagram | File | Description |
| :--- | :--- | :--- |
| **System Overview** | `main.puml` | High-level use cases for all 4 roles |
| **Donation & Request** | `donation_request.puml` | Donor and Recipient interactions |
| **Delivery** | `delivery.puml` | Volunteer delivery workflow |
| **ERD** | `erd.puml` | Complete entity relationship diagram (14 entities, 16 enums) |

> To render the diagrams, use the [PlantUML extension](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml) for VS Code or the [PlantUML online server](https://www.plantuml.com/plantuml/uml/).

---

<div align="center">

**Built with ❤️ to fight food waste.**

</div>
