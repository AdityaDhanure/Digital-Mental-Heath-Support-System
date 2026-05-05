# Digital Mental Health and Psychological Support System

## Comprehensive Project Report

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Frontend Architecture](#frontend-architecture)
7. [AI Services](#ai-services)
8. [Security Features](#security-features)
9. [User Roles and Permissions](#user-roles-and-permissions)
10. [Project Directory Structure](#project-directory-structure)
11. [Installation and Setup](#installation-and-setup)
12. [Features by User Role](#features-by-user-role)
13. [Future Enhancements](#future-enhancements)

---

## 1. Project Overview

This is a **Digital Mental Health and Psychological Support System** designed to provide mental health resources, counseling services, and AI-powered support to students. The system consists of three main components:

| Component | Technology | Purpose |
|----------|-----------|---------|
| **Backend** | Express.js | RESTful API, authentication, database |
| **Frontend** | Next.js 16 | User interface |
| **AI Services** | FastAPI | AI chat, RAG, safety monitoring |

### Core Functionalities

- User authentication with role-based access (student, counselor, admin)
- Session booking with counselors
- Community forum for peer support
- Mental health resources library
- AI-powered chat assistant with safety monitoring
- Real-time notifications
- Admin dashboard for analytics and management

---

## 2. System Architecture

```
                                    ┌─────────────────┐
                                    │   Frontend      │
                                    │  (Next.js 16)   │
                                    │   Port: 3000    │
                                    └────────┬────────┘
                                             │
                                             │ HTTP/WebSocket
                                             ▼
                                    ┌─────────────────┐
                                    │    Backend      │
                                    │ (Express.js)    │
                                    │   Port: 5000    │
                                    └────────┬────────┘
                                             │
                     ┌───────────────────────┼───────────────────────┐
                     │                       │                       │
                     ▼                       ▼                       ▼
            ┌────────────────┐      ┌────────────────┐       ┌────────────────┐
            │    MongoDB     │      │  Python AI     │       │  Cloudinary    │
            │   Database     │      │   Services     │       │    Storage     │
            │   Port: 27017  │      │   Port: 8000   │       │                │
            └────────────────┘      └────────────────┘       └────────────────┘
```

### Communication Flow

1. **User → Frontend**: Browser requests via Next.js
2. **Frontend → Backend**: Axios HTTP calls to Express API
3. **Backend → AI Services**: REST calls to FastAPI for AI processing
4. **Backend → Database**: MongoDB for persistent storage
5. **Backend → Cloudinary**: File uploads (images, documents)

---

## 3. Technology Stack

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 18+ | Runtime environment |
| Express.js | 4.22 | Web framework |
| MongoDB | 7+ | Primary database |
| Mongoose | 7.6 | MongoDB ODM |
| JWT | 9.0 | Authentication |
| bcryptjs | 2.4 | Password hashing |
| Helmet | 7.1 | Security headers |
| CORS | 2.8 | Cross-origin requests |
| express-validator | 7.0 | Input validation |
| Nodemailer | 8.0 | Email sending |
| Winston | 3.11 | Logging |
| Redis | 4.7 | Caching & rate limiting |
| Multer | 1.4 | File uploads |
| Cloudinary | 2.8 | Cloud storage |

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 16.1 | React framework |
| React | 19.2 | UI library |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 3.4 | Styling |
| Zustand | 5.0 | State management |
| Axios | 1.13 | HTTP client |
| Framer Motion | 12.2 | Animations |
| Chart.js | 4.5 | Charts |
| Socket.io Client | 4.8 | Real-time |
| Heroicons | 2.2 | Icons |
| Headless UI | 2.2 | UI components |
| date-fns | 4.1 | Date handling |

### Python Services

| Technology | Version | Purpose |
|-----------|---------|---------|
| Python | 3.10+ | Runtime |
| FastAPI | latest | Web framework |
| Uvicorn | latest | ASGI server |
| LangChain | latest | LLM framework |
| OpenAI | latest | AI models |
| FAISS | latest | Vector store |
| Sentence Transformers | latest | Embeddings |
| PyTorch | latest | ML framework |
| Transformers | latest | NLP models |
| NLTK | latest | Text processing |

---

## 4. Database Schema

### User Model (`users`)

```javascript
{
  // Basic Info
  name: String,          // Required, max 100 chars
  email: String,         // Unique, required
  password: String,     // Hashed, min 8 chars
  role: String,         // enum: ['student', 'counselor', 'admin']
  phone: String,        // Indian mobile format
  profilePicture: String,
  
  // Demographics
  dateOfBirth: Date,
  gender: String,       // enum: ['male', 'female', 'other', 'prefer_not_to_say']
  languagesKnown: [String],
  
  // Preferences
  languagePreference: String,  // enum: ['english', 'hindi', 'marathi']
  theme: String,            // enum: ['light', 'dark', 'auto']
  timezone: String,
  
  // Student Profile
  studentProfile: {
    studentId: String,
    enrollmentNumber: String,
    department: String,   // enum: ['CSE', 'ENTC', 'Mechanical', 'Civil', 'Electrical', 'IT']
    year: Number,          // 1-4
    course: String
  },
  
  // Counselor Profile
  counselorProfile: {
    availability: Map,
    specialization: [String],
    maxAppointmentsPerDay: Number,
    licenseNumber: String,
    experience: Number,
    bio: String
  },
  
  // Address (Counselor only)
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  
  // Notification Preferences
  notificationPreferences: {
    email: Boolean,
    push: Boolean,
    bookingReminders: Boolean,
    bookingUpdates: Boolean,
    communityUpdates: Boolean,
    communityReplies: Boolean,
    resourceRecommendations: Boolean,
    systemAnnouncements: Boolean,
    marketingEmails: Boolean
  },
  
  // Privacy Settings
  privacySettings: {
    profileVisibility: String,  // enum: ['public', 'students', 'private']
    showEmail: Boolean,
    showPhone: Boolean,
    anonymousPosting: Boolean,
    dataCollection: Boolean
  },
  
  // Verification & Security
  isEmailVerified: Boolean,
  isActive: Boolean,
  lastLogin: Date,
  passwordChangedAt: Date,
  emailOtp: String,
  emailOtpExpires: Date,
  
  // Consent
  termsAccepted: Boolean,
  privacyPolicyAccepted: Boolean,
  dataRetentionConsent: Boolean,
  
  timestamps: true
}
```

### Booking Model (`bookings`)

```javascript
{
  student: ObjectId,     // Ref: User
  counselor: ObjectId,  // Ref: User
  date: Date,
  time: String,
  status: String,      // enum: ['pending', 'confirmed', 'completed', 'cancelled']
  notes: String,
  isOnline: Boolean,
  meetingLink: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Post Model (`posts`)

```javascript
{
  author: ObjectId,      // Ref: User
  title: String,
  content: String,
  isAnonymous: Boolean,
  tags: [String],
  likes: [ObjectId],
  replies: [{
    author: ObjectId,
    content: String,
    createdAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Resource Model (`resources`)

```javascript
{
  title: String,
  content: String,
  category: String,    // enum: ['article', 'video', 'audio', 'exercise']
  tags: [String],
  author: ObjectId,   // Ref: User
  rating: Number,
  ratings: [{
    user: ObjectId,
    rating: Number
  }],
  isPublished: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Chat Model (`chats`)

```javascript
{
  user: ObjectId,       // Ref: User
  messages: [{
    sender: String,    // 'user' or 'ai'
    content: String,
    timestamp: Date,
    sentiment: String,
    emotions: Object
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Availability Model (`availabilities`)

```javascript
{
  counselor: ObjectId,   // Ref: User
  date: Date,
  slots: [{
    start: String,
    end: String,
    isBooked: Boolean
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Notification Model (`notifications`)

```javascript
{
  user: ObjectId,       // Ref: User
  type: String,       // enum: ['booking', 'community', 'system']
  title: String,
  message: String,
  isRead: Boolean,
  createdAt: Date
}
```

---

## 5. API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | User login | Public |
| POST | `/logout` | User logout | JWT |
| POST | `/forgot-password` | Request password reset | Public |
| PUT | `/reset-password/:token` | Reset password | Public |
| POST | `/send-verification` | Send verification email | JWT |
| PUT | `/verify-email/:token` | Verify email | Public |
| GET | `/me` | Get current user | JWT |
| POST | `/refresh-token` | Refresh JWT token | JWT |

### Users (`/api/users`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all users | Admin |
| GET | `/me` | Get current user | JWT |
| PUT | `/me` | Update current user | JWT |
| DELETE | `/me` | Delete account | JWT |
| GET | `/:id` | Get user by ID | JWT |
| GET | `/counselors` | Get all counselors | JWT |
| PUT | `/:id/role` | Update user role | Admin |
| DELETE | `/:id` | Delete user | Admin |

### Bookings (`/api/bookings`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all bookings | JWT |
| POST | `/` | Create booking | JWT |
| GET | `/:id` | Get booking by ID | JWT |
| PUT | `/:id` | Update booking | JWT |
| DELETE | `/:id` | Cancel booking | JWT |
| PUT | `/:id/status` | Update booking status | JWT |

### Availability (`/api/availability`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get availability | JWT |
| POST | `/` | Set availability | Counselor |
| DELETE | `/` | Clear availability | Counselor |

### Chat (`/api/chat`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get chat history | JWT |
| POST | `/` | Send message | JWT |
| GET | `/sessions` | Get chat sessions | JWT |

### Community (`/api/community`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/posts` | Get all posts | JWT |
| POST | `/posts` | Create post | JWT |
| GET | `/posts/:id` | Get post by ID | JWT |
| PUT | `/posts/:id` | Update post | JWT |
| DELETE | `/posts/:id` | Delete post | JWT |
| POST | `/posts/:id/reply` | Reply to post | JWT |
| DELETE | `/replies/:id` | Delete reply | JWT |

### Resources (`/api/resources`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all resources | JWT |
| POST | `/` | Create resource | Counselor |
| GET | `/:id` | Get resource by ID | JWT |
| PUT | `/:id` | Update resource | Counselor |
| DELETE | `/:id` | Delete resource | Counselor |

### Notifications (`/api/notifications`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get notifications | JWT |
| PUT | `/:id/read` | Mark as read | JWT |
| DELETE | `/:id` | Delete notification | JWT |

### Admin (`/api/admin`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users` | Get all users | Admin |
| PUT | `/users/:id/role` | Update user role | Admin |
| DELETE | `/users/:id` | Delete user | Admin |
| GET | `/analytics` | Get analytics | Admin |
| GET | `/reports` | Generate reports | Admin |

---

## 6. Frontend Architecture

### Page Routes

```
/ (root)
├── (auth)                    # Auth group - no layout
│   ├── login
│   ├── register
│   ├── forgot-password
│   └── verify-email
│
├── (dashboard)               # Dashboard group - with sidebar
│   ├── dashboard
│   │   └── students/[studentId]
│   ├── bookings
│   │   └── [id]
│   ├── community
│   │   └── [postId]
│   ├── resources
│   │   ├── [id]
│   │   ├── add
│   │   └── edit/[id]
│   ├── profile
│   │   └── [id]
│   ├── settings
│   ├── chat
│   └── notifications
│
└── (admin)                 # Admin group
    ├── admin
    │   ├── dashboard
    │   ├── analytics
    │   ├── users
    │   ├── resources
    │   └── community
```

### Components Structure

| Category | Components |
|----------|-----------|
| **Common** | Button, Input, Card, Loading, Alert, Modal |
| **Layout** | Header, Footer, Sidebar, DashboardLayout, ProtectedRoute |
| **Dashboard** | StudentDashboard, CounselorDashboard, StatCard, QuickAction, BookingCard |
| **Community** | PostCard, PostList, CreatePostModal, ReplyModal |
| **Resources** | ResourceCard, ResourceGrid, ResourceForm, ResourceHero |
| **Profile** | ProfileHeader, ProfileStats, SessionList, MoodHistory |
| **Settings** | ProfileSettings, SecuritySettings, PrivacySettings, NotificationSettings, AvailabilitySettings |
| **Mood** | MoodTracker, MoodTrackerFloat |

### State Management (Zustand)

```typescript
// authStore.ts
{
  user: User | null,
  token: string | null,
  isAuthenticated: boolean,
  login(credentials),
  logout(),
  updateUser(data)
}

// chatStore.ts
{
  messages: Message[],
  sessions: Session[],
  sendMessage(content),
  loadHistory(sessionId)
}

// moodStore.ts
{
  entries: MoodEntry[],
  addEntry(mood, notes),
  getHistory()
}
```

### API Layer

```typescript
// Axios instance with interceptors
- Request: Add auth token
- Response: Handle errors globally
- Transform: JSON parsing
```

---

## 7. AI Services

### Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   FastAPI (Port 8000)                       │
├─────────────────────────────────────────────────────────────┤
│  /health     │  Health Check                                │
│  /chat       │  AI Chat Endpoint                            │
│  /rag/*      │  RAG Operations                              │
│  /safety/*   │  Safety & Sentiment                          │
│  /embeddings │  Embedding Creation                          │
└─────────────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐   ┌──────────┐
    │LangChain │    │Safety    │   │  RAG     │
    │Service   │    │Service   │   │Service   │
    └──────────┘    └──────────┘   └──────────┘
         │                            │
         ▼                  ┌─────────┴─────────┐
    ┌──────────┐            ▼                   ▼
    │  LLM     │       ┌──────────┐        FAISS Index
    │(GPT-4)   │       │  NLTK    │
    └──────────┘       └──────────┘
``` 

### Chat Flow

1. User sends message via `/api/chat`
2. Backend forwards to AI service `/chat`
3. Safety service analyzes for crisis keywords
4. RAG retrieves relevant documents (if enabled)
5. LangChain generates response
6. Sentiment analysis performed
7. Response returned with metadata

### Safety Classification

| Risk Level | Score | Action |
|-----------|-------|--------|
| low | 0.0-0.3 | Normal processing |
| medium | 0.3-0.6 | Monitor closely |
| high | 0.6-0.8 | Log and flag |
| critical | 0.8-1.0 | Alert counselor |

---

## 8. Security Features

### Backend Security

- **Helmet**: Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- **CORS**: Configured with allowed origins
- **XSS Protection**: xss-clean middleware
- **NoSQL Injection**: express-mongo-sanitize
- **Rate Limiting**: 100 requests per 15 minutes
- **Password Hashing**: bcrypt with 12 rounds
- **JWT**: Tokens with expiration
- **Input Validation**: express-validator
- **Error Handling**: Centralized error middleware
- **Sanitization**: sanitize-html for user content
- **Logging**: Winston with file rotation

### Frontend Security

- **Protected Routes**: Role-based access control
- **Token Storage**: Secure state management
- **API Interceptors**: Auth header injection
- **Input Validation**: TypeScript types
- **XSS Protection**: React escaping

---

## 9. User Roles and Permissions

### Student

| Permission | Access |
|------------|--------|
| View dashboard | Yes |
| Book sessions | Yes |
| Create posts | Yes |
| Reply to posts | Yes |
| View resources | Yes |
| Use AI chat | Yes |
| Manage profile | Own only |
| View counselors | Yes |

### Counselor

| Permission | Access |
|------------|--------|
| View dashboard | Yes |
| Manage bookings | Own |
| Create resources | Yes |
| Manage profile | Own |
| Set availability | Yes |
| View students | Assigned |
| Use AI chat | Yes |

### Admin

| Permission | Access |
|------------|--------|
| View admin dashboard | Yes |
| Manage all users | Yes |
| View analytics | Yes |
| Moderate content | Yes |
| Generate reports | Yes |
| Change user roles | Yes |

---

## 10. Project Directory Structure

```
7.Mental-Health_Project/
├── backend/                    # Express.js Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── cloudinary.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── bookingController.js
│   │   │   ├── chatController.js
│   │   │   ├── communityController.js
│   │   │   ├── resourceController.js
│   │   │   ├── adminController.js
│   │   │   ├── availabilityController.js
│   │   │   └── notificationController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── rateLimitMiddleware.js
│   │   │   ├── roleMiddleware.js
│   │   │   ├── validationMiddleware.js
│   │   │   └── errorMiddleware.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Booking.js
│   │   │   ├── Chat.js
│   │   │   ├── Post.js
│   │   │   ├── Resource.js
│   │   │   ├── Notification.js
│   │   │   └── Availability.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── bookingRoutes.js
│   │   │   ├── chatRoutes.js
│   │   │   ├── communityRoutes.js
│   │   │   ├── resourceRoutes.js
│   │   │   ├── adminRoutes.js
│   │   │   ├── availabilityRoutes.js
│   │   │   └── notificationRoutes.js
│   │   ├── services/
│   │   │   ├── emailService.js
│   │   │   └── notificationService.js
│   │   ├── utils/
│   │   │   ├── encryption.js
│   │   │   ├── tokenGenerator.js
│   │   │   ├── sanitizer.js
│   │   │   ├── logger.js
│   │   │   └── reportGenerator.js
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│   └── README.md
│
├── frontend/                   # Next.js 16 Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   ├── (admin)/
│   │   │   └── (dashboard)/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── layout/
│   │   │   ├── dashboard/
│   │   │   ├── community/
│   │   │   ├── resources/
│   │   │   ├── profile/
│   │   │   ├── settings/
│   │   │   └── mood/
│   │   ├── lib/
│   │   │   ├── api/
│   │   │   ├── hooks/
│   │   │   └── utils/
│   │   ├── store/
│   │   ├── types/
│   │   └── app/
│   ├── package.json
│   └── README.md
│
├── python-services/           # FastAPI AI Services
│   ├── ai_service/
│   │   ├── config/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   │   ├── langchain_service.py
│   │   │   ├── rag_service.py
│   │   │   ├── embedding_service.py
│   │   │   └── safety_service.py
│   │   ├── data/
│   │   ├── main.py
│   │   └── dependencies.py
│   ├── analytics_service/
│   ├── requirements.txt
│   └── README.md
│
└── README.md                # This file
```

---

## 11. Installation and Setup

### Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB 7+
- Redis (optional)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Configure .env with your values
npm run dev  # Development
npm start    # Production
```

### Frontend Setup

```bash
cd frontend
npm install
# Create .env.local
npm run dev
```

### Python Services Setup

```bash
cd python-services
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Configure ai_service/.env
uvicorn ai_service.main:app --reload
```

---

## 12. Features by User Role

### Student Features

- Registration and login
- Profile management
- Browse counselors
- Book counseling sessions
- View booking history
- Cancel bookings
- Post in community forum
- Reply to posts
- Browse resources
- Rate resources
- Use AI chat assistant
- Track mood
- Receive notifications
- Settings management

### Counselor Features

- Profile with specialization
- Set availability slots
- View assigned bookings
- Accept/reject sessions
- Create resources
- Edit/delete resources
- View student profiles
- Use AI chat assistant
- Receive notifications
- Settings management

### Admin Features

- View all users
- Manage user roles
- View analytics dashboard
- View user statistics
- Moderate community posts
- Manage resources
- Generate reports
- System configuration

---

## 13. Future Enhancements

### Planned Features

- [ ] Video counseling sessions (WebRTC)
- [ ] Mobile apps (React Native)
- [ ] AI-powered resource recommendations
- [ ] Anonymous peer support matching
- [ ] Mental health assessments/quizzes
- [ ] Progress tracking dashboards
- [ ] Group counseling sessions
- [ ] Crisis intervention hotline integration
- [ ] Calendar integration (Google, Outlook)
- [ ] Push notifications
- [ ] Multi-language support expansion
- [ ] Advanced analytics and reports
- [ ] Export data (PDF, CSV)
- [ ] Gamification and rewards
- [ ] Virtual reality meditation

### Performance Optimizations

- [ ] Redis caching for frequently accessed data
- [ ] Database query optimization
- [ ] CDN for static assets
- [ ] Lazy loading for components
- [ ] Pagination for lists
- [ ] WebSocket for real-time updates

---

## License

MIT

## Authors

Mental Health Project Team

## Related Documentation

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [Python Services README](./python-services/README.md)