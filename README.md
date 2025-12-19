# EverLearn Hub – Backend

EverLearn Hub Backend is a **RESTful API server** built with **NestJS**, designed to power an E-Learning platform for students and working professionals. It handles authentication, course management, enrollments, payments, user progress tracking, and admin operations with a scalable, production-ready architecture.

This backend serves as the core system behind the EverLearn Hub frontend and represents an **MVP** of a real-world application.

---

## 🚀 Project Overview

* **Project Name:** EverLearn Hub – Backend
* **Type:** REST API / Backend Service
* **Project Status:** MVP
* **Framework:** NestJS
* **Database:** PostgreSQL (via Prisma ORM)
* **Frontend:** Next.js application (separate repository)

---

## 🛠 Tech Stack

* **Framework:** NestJS
* **Language:** TypeScript
* **ORM:** Prisma
* **Database:** PostgreSQL
* **Authentication:** JWT (Access & Refresh tokens)
* **Auth Strategy:** Passport + JWT
* **Caching / Session:** Redis (ioredis)
* **File Storage:** Cloudinary (images & PDFs)
* **Payments:** Stripe
* **Validation:** class-validator / class-transformer
* **API Documentation:** Swagger (OpenAPI)
* **Testing:** Jest + Supertest

---

## 🧩 Application Modules

The backend is organized using NestJS modules to ensure separation of concerns and scalability:

* **AuthModule** – Authentication, JWT, refresh tokens, guards
* **UsersModule** – User management and profiles
* **CoursesModule** – Course creation, listing, and management
* **LessonsModule** – Lesson content within courses
* **CategoriesModule** – Course categorization
* **EnrollmentsModule** – Course enrollment logic
* **ProgressesModule** – User learning progress tracking
* **DashboardModule** – User dashboard data
* **StatsModule** – Learning statistics and analytics
* **PaymentsModule** – Payment records and logic
* **StripeModule** – Stripe checkout and webhook handling
* **CloudinaryModule** – Image & PDF uploads
* **PdfsModule** – PDF lesson management
* **RedisModule** – Caching and token/session handling
* **HealthModule** – Health check endpoint
* **PrismaModule** – Database access layer

---

## ✨ Core Features

### 🔐 Authentication & Authorization

* User registration and login
* JWT-based authentication (access & refresh tokens)
* Refresh token stored in HTTP-only cookies
* Role-based access control (STUDENT / ADMIN)
* Protected routes using guards

### 📚 Course & Learning Management

* Course CRUD operations (admin only)
* Lesson management (text, PDF)
* Course categories and filtering

### 👤 User & Progress Tracking

* User profile management
* Avatar upload via Cloudinary
* Track enrolled courses
* Track lesson and course progress
* Learning activity statistics

### 📊 Dashboards & Analytics

* User dashboard statistics:
  * Total enrolled courses
  * Completed courses
  * Active learning days (yearly)

### 💳 Payments

* Stripe checkout integration
* Payment intent creation
* Enrollment activation after successful payment
* Payment history tracking

---

## 📄 API Documentation

Swagger UI is available for API exploration and testing:

```
GET http://localhost:3001/api
```

OpenAPI specification is used by the frontend to generate fully typed API clients.

---

## 🧱 Architecture & Patterns

* Modular NestJS architecture
* Clean separation between controllers, services, and modules
* Prisma as a single source of truth for database access
* Transaction-safe operations using Prisma `$transaction`
* Global configuration using `@nestjs/config`
* Environment-based behavior (development / production)

---

## ▶️ Getting Started

### Prerequisites

* Node.js >= 18
* PostgreSQL
* Redis
* Stripe account
* Cloudinary account

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
GLOBAL_PREFIX=api

DATABASE_URL=postgresql://user:password@localhost:5432/everlearn

JWT_SECRET=your_jwt_secret

REDIS_URL=redis://localhost:6379

STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_PUBLIC_KEY=your_stripe_public_key

CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

### Database Setup

```bash
npx prisma migrate dev
npx prisma db seed
```

### Run Development Server

```bash
npm run start:dev
```

Server will start at:

```
http://localhost:3001
```

---

## 🧠 Key Learnings & Challenges

* Designing scalable NestJS module architecture
* Implementing secure cookie-based refresh token flow
* Managing database transactions with Prisma
* Integrating Stripe payments and webhooks
* Handling file uploads with Cloudinary
* Using Redis for caching and token/session handling

---

## 🔮 Future Improvements

* Improve test coverage
* Add background jobs (queues)
* Add audit logs for admin actions
* Improve monitoring and logging

---

## 📌 Portfolio Note

This backend demonstrates:

* Real-world NestJS architecture
* Secure authentication & authorization
* Payment integration with Stripe
* Database modeling with Prisma
* API documentation with Swagger
* Production-oriented backend design

---

**EverLearn Hub Backend** – Powering scalable online learning platforms 🚀
