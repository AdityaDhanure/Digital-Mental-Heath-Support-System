# Mental Health Backend API

A comprehensive Express.js backend for a Digital Mental Health and Psychological Support System. Provides secure RESTful APIs for user authentication, appointment booking, community forums, AI chat support, and admin management.

## Features

- **Authentication & Authorization**
  - JWT-based authentication with refresh tokens
  - Role-based access control (Student, Counselor, Admin)
  - Email verification with OTP
  - Password reset functionality
  - OAuth support ready

- **User Management**
  - Student profiles with enrollment details, department, year
  - Counselor profiles with specialization, availability, license
  - Privacy and notification settings
  - Profile management

- **Booking System**
  - Session scheduling with counselors
  - Availability management
  - Booking confirmation and reminders
  - Session history

- **Community Forum**
  - Create and manage posts
  - Reply and comment system
  - Anonymous posting option
  - Community guidelines enforcement

- **Resources**
  - Mental health articles and materials
  - Rating and feedback system
  - Category-based organization

- **AI Chat Support**
  - Integration with Python AI services
  - RAG-based responses
  - Safety content filtering

- **Notifications**
  - Email and push notifications
  - Booking reminders
  - Community updates

- **Admin Dashboard**
  - User management
  - Analytics and reporting
  - Content moderation

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Security**: Helmet, CORS, XSS protection, Rate limiting
- **Validation**: Express Validator
- **Email**: Nodemailer
- **File Storage**: Cloudinary
- **Caching**: Redis
- **Logging**: Winston
- **Code Quality**: ESLint, Prettier

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   │   └── cloudinary.js      # Cloudinary config
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── bookingController.js
│   │   ├── chatController.js
│   │   ├── communityController.js
│   │   ├── resourceController.js
│   │   ├── adminController.js
│   │   ├── availabilityController.js
│   │   └── notificationController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── rateLimitMiddleware.js
│   │   ├── roleMiddleware.js
│   │   ├── validationMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Booking.js
│   │   ├── Chat.js
│   │   ├── Post.js
│   │   ├── Resource.js
│   │   ├── Notification.js
│   │   └── Availability.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── communityRoutes.js
│   │   ├── resourceRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── availabilityRoutes.js
│   │   └── notificationRoutes.js
│   ├── services/
│   │   ├── emailService.js
│   │   └── notificationService.js
│   ├── utils/
│   │   ├── encryption.js
│   │   ├── tokenGenerator.js
│   │   ├── sanitizer.js
│   │   ├── logger.js
│   │   └── reportGenerator.js
│   ├── app.js                 # Express app configuration
│   └── server.js              # Server entry point
├── package.json
└── .env.example
```

## Installation

### Prerequisites

- Node.js 18+
- MongoDB
- Redis (optional, for rate limiting)
- Cloudinary account (for file uploads)

### Steps

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Update `.env` with your configuration**
   ```env
   # Server
   PORT=5000
   NODE_ENV=development

   # MongoDB
   MONGO_URI=mongodb://localhost:27017/mental-health

   # JWT
   JWT_SECRET=your-secret-key
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30

   # Redis (optional)
   REDIS_URL=redis://localhost:6379

   # Email
   SMTP_HOST=smtp.mailtrap.io
   SMTP_PORT=587
   SMTP_USER=your-user
   SMTP_PASS=your-password
   FROM_EMAIL=noreply@mentalhealth.com

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| POST | `/api/auth/forgot-password` | Password reset request |
| PUT | `/api/auth/reset-password/:token` | Reset password |
| POST | `/api/auth/send-verification` | Send email verification |
| PUT | `/api/auth/verify-email/:token` | Verify email |
| GET | `/api/auth/me` | Get current user |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users (admin) |
| GET | `/api/users/me` | Get current user profile |
| PUT | `/api/users/me` | Update current user |
| DELETE | `/api/users/me` | Delete account |
| GET | `/api/users/:id` | Get user by ID |
| GET | `/api/users/counselors` | Get all counselors |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | Get all bookings |
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/:id` | Get booking by ID |
| PUT | `/api/bookings/:id` | Update booking |
| DELETE | `/api/bookings/:id` | Cancel booking |
| PUT | `/api/bookings/:id/status` | Update status |

### Availability
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/availability` | Get availability |
| POST | `/api/availability` | Set availability |
| DELETE | `/api/availability` | Clear availability |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat` | Get chat history |
| POST | `/api/chat` | Send message |
| GET | `/api/chat/sessions` | Get chat sessions |

### Community
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/community/posts` | Get all posts |
| POST | `/api/community/posts` | Create post |
| GET | `/api/community/posts/:id` | Get post by ID |
| PUT | `/api/community/posts/:id` | Update post |
| DELETE | `/api/community/posts/:id` | Delete post |
| POST | `/api/community/posts/:id/reply` | Reply to post |
| DELETE | `/api/community/replies/:id` | Delete reply |

### Resources
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/resources` | Get all resources |
| POST | `/api/resources` | Create resource |
| GET | `/api/resources/:id` | Get resource by ID |
| PUT | `/api/resources/:id` | Update resource |
| DELETE | `/api/resources/:id` | Delete resource |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get notifications |
| PUT | `/api/notifications/:id/read` | Mark as read |
| DELETE | `/api/notifications/:id` | Delete notification |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | Get all users |
| PUT | `/api/admin/users/:id/role` | Update user role |
| DELETE | `/api/admin/users/:id` | Delete user |
| GET | `/api/admin/analytics` | Get analytics |
| GET | `/api/admin/reports` | Generate reports |

## User Roles

### Student
- Create profile and manage settings
- Browse counselors and book sessions
- Participate in community forums
- Rate and review resources
- Use AI chat support

### Counselor
- Manage availability and profile
- Accept/view bookings
- Respond to student queries
- Create and manage resources

### Admin
- Full system access
- User management
- Analytics and reporting
- Content moderation

## Security Features

- helmet.js for security headers
- CORS configuration
- XSS protection
- NoSQL injection prevention
- Rate limiting (100 requests/15min)
- Secure password hashing (bcrypt)
- JWT with expiration
- Input validation and sanitization
- Error handling middleware

## Logging

Uses Winston for structured logging:
- Console output in development
- File output in production
- HTTP request logging
- Error tracking

## Testing

```bash
npm run test
```

## Linting

```bash
npm run lint
```

## Code Formatting

```bash
npm run format
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | Yes |
| `NODE_ENV` | Environment | Yes |
| `MONGO_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT secret key | Yes |
| `JWT_EXPIRE` | JWT expiration | Yes |
| `SMTP_*` | Email configuration | Yes |
| `CLOUDINARY_*` | Cloudinary config | No |
| `REDIS_URL` | Redis URL | No |

## Dependencies

### Production
- express - Web framework
- mongoose - MongoDB ODM
- jsonwebtoken - JWT authentication
- bcryptjs - Password hashing
- helmet - Security headers
- cors - Cross-origin resource sharing
- express-validator - Input validation
- nodemailer - Email sending
- winston - Logging
- multer - File uploads
- cloudinary - File storage
- redis - Caching

### Development
- nodemon - Auto-reload
- eslint - Linting
- prettier - Formatting
- jest - Testing

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

## Related Projects

- [Frontend](https://github.com/your-repo/frontend)
- [Python AI Services](https://github.com/your-repo/python-services)