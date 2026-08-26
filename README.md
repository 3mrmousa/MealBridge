<div align="center">

# 🍽️ MealBridge

**Connecting surplus food with those who need it most.**

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)

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
                                              Recipient requests a Volunteer → Volunteer delivers
```

### Key Goals

- **Reduce food waste** by providing a frictionless platform for surplus food redistribution.
- **Real-time communication** between donors, recipients, and volunteers via WebSocket-powered chat.
- **Automated notifications** for events like new donations, accepted claims, and delivery updates.
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
│   │   Services   │  (Business logic)                │
│   └──────┬───────┘                                  │
│          ↓                                          │
│   ┌──────────────┐  ┌──────────────┐                │
│   │  Prisma ORM  │  │  Redis (OTP) │                │
│   └──────┬───────┘  └──────────────┘                │
│          ↓                                          │
│   ┌──────────────┐                                  │
│   │  PostgreSQL  │                                  │
│   └──────────────┘                                  │
└─────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Runtime** | Node.js |
| **Language** | TypeScript |
| **Framework** | Express.js v5 |
| **Database** | PostgreSQL |
| **ORM** | Prisma 7 (with `@prisma/adapter-pg`) |
| **Cache / Sessions** | Redis (via `ioredis`) |
| **Authentication** | JWT (HttpOnly cookies) |
| **Password Hashing** | bcryptjs (salt rounds: 12) |
| **Validation** | Zod v4 |
| **Email** | Nodemailer (Gmail SMTP) |
| **File Storage** | Cloudinary |
| **Real-time** | Socket.io (planned) |
| **Security** | Helmet, CORS, cookie-parser |

---

## 👥 User Roles

MealBridge supports **5 distinct user roles**, each with specific permissions:

| Role | Description |
| :--- | :--- |
| **Donor** | Restaurants, hotels, cafes — create, edit, and cancel food donations. Can chat with connected recipients/volunteers. |
| **Recipient** | Shelters, charities, community centers — request available donations, manage claims, and optionally request volunteer delivery. |
| **Volunteer** | Delivery drivers — accept pickup requests, update delivery status in real-time. Limited to one active delivery at a time. |
| **Admin** | Full platform oversight — manage users, view all activity logs, read chats (read-only), handle reports, and configure site settings. |
| **Manager** | Elevated administrative role with similar capabilities to Admin. |

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
  - Zod validation middleware

- [x] **Authentication Module** — Full auth flow
  - `POST /api/auth/register/request` — OTP-based registration (generates OTP → hashes password → stores session in Redis → sends branded email)
  - `POST /api/auth/register/validate` — Verifies OTP, creates user in DB, sets JWT cookie
  - `POST /api/auth/login` — Email/password login with JWT cookie
  - `POST /api/auth/logout` — Clears HttpOnly cookie (protected route)
  - `GET /api/auth/me` — Returns authenticated user profile (protected route)
  - `POST /api/auth/password/forgot/request` — Sends password reset OTP
  - `POST /api/auth/password/forgot/validate` — Verifies password reset OTP
  - `POST /api/auth/password/reset` — Resets password and cleans up Redis session

- [x] **Security Infrastructure**
  - JWT authentication with HttpOnly, Secure, SameSite cookies
  - `protect` middleware for route-level authentication
  - `authorizeRoles` middleware for role-based access control (RBAC)
  - OTP hashing with SHA-256 (never stored in plain text)
  - Password hashing with bcryptjs (12 salt rounds)
  - Helmet for HTTP security headers

- [x] **Email Service**
  - Branded HTML email templates with MealBridge styling
  - Registration OTP email
  - Forgot password OTP email
  - Proper error handling with Nodemailer error codes

- [x] **Database Schema** — Complete ERD with 14 entities
  - Users, DonorProfile, RecipientProfile, VolunteerProfile
  - Donation, DonationRequest, DonationClaim, PickupRequest
  - Conversation, ConversationParticipant, Message
  - Notification, Report, SiteSetting

- [x] **UML Documentation**
  - Main system use case diagram
  - Donation & Request use case diagram
  - Delivery use case diagram
  - Full Entity Relationship Diagram (ERD)

### Planned

- [ ] **Donation Module** — CRUD for food donations
- [ ] **Request Module** — Claim workflow (request → accept → claim)
- [ ] **Delivery Module** — Volunteer pickup request system
- [ ] **Chat Module** — Real-time messaging (Socket.io)
- [ ] **Notification Module** — Automated event-based alerts
- [ ] **Report Module** — User-to-admin issue reporting
- [ ] **Admin Module** — User management, logs, site settings
- [ ] **Profile Module** — Role-specific profile management
- [ ] **Client App** — User-facing frontend
- [ ] **Admin Panel** — Admin dashboard

---

## 🗄 Database Schema

The database is designed around a **3-stage donation workflow**:

```
Stage 1: DonationRequest     — Recipient requests a donation
Stage 2: DonationClaim       — Donor accepts → Claim is created
Stage 3: PickupRequest        — Recipient optionally requests volunteer delivery
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
    DonationClaim ||--o| PickupRequest : triggers
    DonationClaim ||--o{ Conversation : has
    Conversation ||--o{ Message : contains
    User ||--o{ Notification : receives
    User ||--o{ Report : creates
```

### Key Enums

| Enum | Values |
| :--- | :--- |
| `Role` | DONOR, RECIPIENT, VOLUNTEER, ADMIN, MANAGER |
| `DonationStatus` | AVAILABLE, RESERVED, COMPLETED, CANCELLED, EXPIRED |
| `DonationRequestStatus` | PENDING, ACCEPTED, REJECTED, CANCELLED |
| `ClaimStatus` | ACTIVE, COMPLETED, CANCELLED |
| `PickupMethod` | SELF, VOLUNTEER |
| `PickupRequestStatus` | PENDING, ACCEPTED, REJECTED, CANCELLED, COMPLETED, EXPIRED |

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

> 🔒 = Requires authentication (JWT cookie)

---

## 📁 Project Structure

```
MealBridge/
├── admin/                          # Admin panel (planned)
├── client/                         # Client app (planned)
├── server/
│   ├── config/
│   │   ├── cloudinary.ts           # Cloudinary SDK config
│   │   └── redis.ts                # Redis (ioredis) client
│   ├── database/
│   │   └── index.ts                # Prisma client with pg adapter
│   ├── middlewares/
│   │   ├── auth.middleware.ts       # protect + authorizeRoles
│   │   └── validate.middleware.ts   # Zod schema validation
│   ├── modules/
│   │   └── auth/
│   │       ├── auth.controller.ts   # HTTP handlers (req/res)
│   │       ├── auth.otp.store.ts    # OTP session type definitions
│   │       ├── auth.route.ts        # Express router
│   │       ├── auth.service.ts      # Business logic
│   │       ├── auth.types.ts        # Role enum, IUser, AuthRequest
│   │       └── auth.zod.ts          # Zod validation schemas + types
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
│   │   ├── errors/
│   │   │   ├── AppError.ts          # Custom error class
│   │   │   └── asyncHandler.ts      # Async wrapper for controllers
│   │   ├── jwt/
│   │   │   └── generateToken.ts     # JWT sign + HttpOnly cookie
│   │   ├── mail/
│   │   │   └── email.service.ts     # Nodemailer + HTML templates
│   │   ├── otp/
│   │   │   ├── generateOtp.ts       # OTP generate + verify (SHA-256)
│   │   │   └── otp.redis.ts         # Redis get/set/delete for OTP
│   │   └── password/
│   │       └── passwordFunctions.ts # bcryptjs hash + compare
│   ├── index.ts                     # App entry point
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
