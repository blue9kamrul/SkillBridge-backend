# SkillBridge - Tutoring Platform Backend

A backend API for a tutoring platform that connects students with tutors. Built with Node.js, Express, TypeScript, Prisma and PostgreSQL.

## 🔗 Links

- **Live API**: [Coming Soon]
- **GitHub Repository**: [Your Repository URL]

## ✨ Features

### Student Features

- Register and login (email/password & OAuth)
- Browse tutors with filters - subject, category, price, rating, experience
- View top-rated tutors
- Book sessions instantly
- Manage and cancel bookings
- Leave reviews after completing sessions (1-5 stars)
- Update profile info

### Tutor Features

- Create tutor profile with bio, subjects and hourly rates
- Set availability using flexible JSON format
- Update profile anytime
- View all teaching sessions
- Mark sessions as completed
- See all ratings and reviews

### Admin Features

- Dashboard with stats
- Manage users - update roles, ban/unban
- CRUD operations for categories
- View all bookings

## 🛠️ Tech Stack

**Backend**: Node.js, Express.js, TypeScript  
**Database**: PostgreSQL with Prisma ORM  
**Auth**: Better-Auth (session-based with OAuth support)  
**Security**: Role-based access control

## 📊 Database Schema

```mermaid
erDiagram
    User ||--o{ Session : "has many"
    User ||--o{ Account : "has many"
    User ||--o| TutorProfile : "has one (if role=tutor)"
    User ||--o{ Booking : "makes (as student)"
    User ||--o{ Review : "writes (as student)"

    TutorProfile ||--o{ Booking : "receives"
    TutorProfile ||--o{ Review : "receives"
    TutorProfile }o--o{ Category : "belongs to"

    User {
        String id PK
        String name
        String email
        Boolean emailVerified "default: false"
        String image
        String role "student | tutor | admin"
        String phone
        String status "ACTIVE | BANNED"
        DateTime createdAt
        DateTime updatedAt
    }

    Session {
        String id PK
        String userId FK
        DateTime expiresAt
        String token
        String ipAddress
        String userAgent
        DateTime createdAt
        DateTime updatedAt
    }

    Account {
        String id PK
        String userId FK
        String accountId
        String providerId "google | email"
        String accessToken
        String refreshToken
        DateTime accessTokenExpiresAt
        DateTime refreshTokenExpiresAt
        String scope
        String password
        DateTime createdAt
        DateTime updatedAt
    }

    Verification {
        String id PK
        String identifier
        String value
        DateTime expiresAt
        DateTime createdAt
        DateTime updatedAt
    }

    TutorProfile {
        String id PK
        String userId FK
        String bio
        String[] subjects
        Decimal hourlyRate
        Int experience
        Json availability
    }

    Category {
        String id PK
        String name
        String description
    }

    Booking {
        String id PK
        String studentId FK
        String tutorId FK
        DateTime startTime
        DateTime endTime
        Enum status "confirmed | cancelled | completed"
        DateTime createdAt
        DateTime updatedAt
    }

    Review {
        String id PK
        String studentId FK
        String tutorId FK
        Int rating "1-5"
        String comment
        DateTime createdAt
    }
```

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL v14+
- npm or yarn

### Installation

1. **Clone and install**

   ```bash
   git clone [Your Repository URL]
   cd Backend
   npm install
   ```

2. **Setup environment variables** - Create `.env`:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/skillbridge"
   BETTER_AUTH_SECRET="your-secret-key"
   BETTER_AUTH_URL="http://localhost:5000"
   PORT=5000
   ```

3. **Setup database**

   ```bash
   npx prisma generate
   npx prisma migrate deploy
   npm run seed:admin  # creates admin@admin.com / admin1234
   ```

4. **Run the server**
   ```bash
   npm run dev  # Development
   npm run build && npm start  # Production
   ```

## API Endpoints

### Authentication

- `POST /api/auth/sign-up/email` - Register
- `POST /api/auth/sign-in/email` - Login
- `GET /api/auth/get-session` - Get current session

### Public

- `GET /api/tutors?subjects=&minRate=&maxRate=&categoryId=` - Browse tutors
- `GET /api/tutors/featured` - Top rated tutors
- `GET /api/tutors/:id` - Tutor details
- `GET /api/categories` - All categories
- `GET /api/reviews/tutor/:tutorId` - Reviews for tutor

### Student (Protected)

- `GET/PATCH /api/students/profile` - Manage profile
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - My bookings
- `DELETE /api/bookings/:id` - Cancel booking
- `POST /api/reviews` - Create review (needs completed session)

### Tutor (Protected)

- `POST /api/tutors/become-tutor` - Create profile
- `PUT /api/tutors/profile` - Update profile
- `PUT /api/tutors/availability` - Update availability
- `PATCH /api/bookings/:id/status` - Mark as completed

### Admin (Protected)

- `GET /api/admin/dashboard` - Stats
- `GET /api/admin/users` - All users
- `PATCH /api/admin/users/:id` - Update role/verification
- `PATCH /api/admin/users/:id/ban-status` - Ban/unban
- `POST/PATCH/DELETE /api/categories` - Manage categories

## Challenges & Solutions

### 1. Authentication & Authorization

Used Better-Auth which handles everything - password hashing, sessions, OAuth. Built custom middleware on top for role-based access.

### 2. Booking Status Flow

Made bookings instantly confirmed instead of pending approval. Only tutors can mark sessions as completed, only students can cancel. Added proper validation so status transitions make sense.

### 3. Review System

Students can only review after completing a session with a tutor. Also made sure one student can only leave one review per tutor.

## 👨‍💻 Author

Your Name - [Your GitHub Profile]
