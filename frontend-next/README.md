# Mental Health Frontend

A modern Next.js 16 frontend for a Digital Mental Health and Psychological Support System. Provides a responsive, accessible interface for students, counselors, and administrators.

## Features

- **Authentication**
  - Login/Register with validation
  - Password reset flow
  - Email verification
  - Protected routes with role-based access

- **Student Dashboard**
  - Session booking with counselors
  - Upcoming appointments
  - Mood tracking
  - Quick actions

- **Counselor Dashboard**
  - Manage availability
  - View upcoming sessions
  - Student profiles
  - Resource management

- **Admin Dashboard**
  - User management
  - Analytics with charts
  - Community moderation
  - Resource approval

- **Booking System**
  - Browse available counselors
  - Book sessions by date/time
  - View and cancel bookings
  - Session history

- **Community Forum**
  - Create posts and discussions
  - Reply to posts
  - Anonymous posting
  - Like and share

- **Resources Library**
  - Browse mental health articles
  - Filter by category
  - Rating and reviews
  - Save favorites

- **AI Chat Assistant**
  - Real-time messaging
  - Context-aware responses
  - Safety filtering

- **Settings**
  - Profile management
  - Notification preferences
  - Privacy settings
  - Security settings (password change)

- **Profile Pages**
  - View own profile
  - View other users
  - Session statistics

## Tech Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Animations**: Framer Motion
- **Charts**: Chart.js
- **Real-time**: Socket.io Client
- **Icons**: Heroicons
- **UI Components**: Headless UI

## Project Structure

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── layout.tsx
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── verify-email/
│   │   ├── (admin)/
│   │   │   ├── layout.tsx
│   │   │   ├── admin/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── analytics/
│   │   │   │   ├── users/
│   │   │   │   ├── resources/
│   │   │   │   └── community/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   ├── bookings/
│   │   │   ├── community/
│   │   │   ├── resources/
│   │   │   ├── profile/
│   │   │   ├── settings/
│   │   │   ├── chat/
│   │   │   └── notifications/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── loading.tsx
│   │   └── error.tsx
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── Alert.tsx
│   │   │   └── Modal.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── SidebarNew.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── counselor/
│   │   │   │   └─��� CounselorDashboard.tsx
│   │   │   ├── student/
│   │   │   │   └── StudentDashboard.tsx
│   │   │   └── shared/
│   │   │       ├── WelcomeHeader.tsx
│   │   │       ├── StatCard.tsx
│   │   │       ├── QuickAction.tsx
│   │   │       ├── BookingCard.tsx
│   │   │       ├── WellnessTip.tsx
│   │   │       ├── EmptyState.tsx
│   │   │       └── SectionHeader.tsx
│   │   │
│   │   ├── community/
│   │   │   ├── student/
│   │   │   │   └── StudentCommunity.tsx
│   │   │   └── shared/
│   │   │       ├── PostCard.tsx
│   │   │       ├── PostList.tsx
│   │   │       ├── CreatePostModal.tsx
│   │   │       ├── ReplyModal.tsx
│   │   │       └── CommunityHeader.tsx
│   │   │
│   │   ├── resources/
│   │   │   ├── counselor/
│   │   │   │   └── CounselorResources.tsx
│   │   │   ├── student/
│   │   │   │   └── StudentResources.tsx
│   │   │   └── shared/
│   │   │       ├── ResourceCard.tsx
│   │   │       ├── ResourceGrid.tsx
│   │   │       ├── ResourceForm.tsx
│   │   │       ├── ResourceHero.tsx
│   │   │       ├── ResourceContent.tsx
│   │   │       ├── ResourceMeta.tsx
│   │   │       └── ResourceRating.tsx
│   │   │
│   │   ├── profile/
│   │   │   ├── counselor/
│   │   │   │   └── CounselorProfile.tsx
│   │   │   ├── student/
│   │   │   │   ├── StudentProfile.tsx
│   │   │   │   └── StudentDetail.tsx
│   │   │   └── shared/
│   │   │       ├── ProfileHeader.tsx
│   │   │       ├── ProfileStats.tsx
│   │   │       ├── SessionList.tsx
│   │   │       ├── MoodHistory.tsx
│   │   │       └── SessionStats.tsx
│   │   │
│   │   ├── settings/
│   │   │   ├── counselor/
│   │   │   │   └── CounselorAccountSettings.tsx
│   │   │   ├── student/
│   │   │   │   └── StudentAccountSettings.tsx
│   │   │   ├── shared/
│   │   │   │   ├── ProfileSettings.tsx
│   │   │   │   ├── SecuritySettings.tsx
│   │   │   │   ├── PrivacySettings.tsx
│   │   │   │   ├── NotificationSettings.tsx
│   │   │   │   ├── PreferencesSettings.tsx
│   │   │   │   ├── VerifyEmailSettings.tsx
│   │   │   │   └── SettingsSection.tsx
│   │   │   └── AvailabilitySettings.tsx
│   │   │
│   │   └── mood/
│   │       ├── MoodTracker.tsx
│   │       └── MoodTrackerFloat.tsx
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── axios.ts
│   │   │   ├── auth.ts
│   │   │   ├── users.ts
│   │   │   ├── booking.ts
│   │   │   ├── chat.ts
│   │   │   ├── community.ts
│   │   │   ├── resources.ts
│   │   │   ├── availability.ts
│   │   │   ├── notifications.ts
│   │   │   └── admin.ts
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   └── utils/
│   │       ├── index.ts
│   │       └── cn.ts
│   │
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── chatStore.ts
│   │   └── moodStore.ts
│   │
│   └── types/
│       ├── auth.types.ts
│       ├── booking.types.ts
│       ├── chat.types.ts
│       ├── community.types.ts
│       └── resource.types.ts
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── eslint.config.mjs
```

## Installation

### Prerequisites

- Node.js 18+
- npm or yarn

### Steps

1. **Clone the repository**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   NEXT_PUBLIC_APP_NAME=Mental Health
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   Navigate to `http://localhost:3000`

## Building for Production

```bash
npm run build
npm start
```

## Routing Structure

### Auth Routes `(auth)/`
- `/login` - User login
- `/register` - User registration
- `/forgot-password` - Password reset request
- `/verify-email` - Email verification

### Dashboard Routes `(dashboard)/`
- `/dashboard` - Role-based dashboard
- `/bookings` - Session bookings
- `/bookings/[id]` - Booking details
- `/community` - Community forum
- `/community/[postId]` - Post details
- `/resources` - Resources library
- `/resources/[id]` - Resource details
- `/resources/add` - Add resource (counselor)
- `/resources/edit/[id]` - Edit resource
- `/profile` - Own profile
- `/profile/[id]` - Other user profile
- `/settings` - Account settings
- `/chat` - AI chat assistant
- `/notifications` - Notifications

### Admin Routes `(admin)/`
- `/admin/dashboard` - Admin overview
- `/admin/analytics` - Analytics charts
- `/admin/users` - User management
- `/admin/resources` - Resource moderation
- `/admin/community` - Post moderation

## Component Categories

### Common Components
| Component | Description |
|-----------|-------------|
| Button | Reusable button with variants |
| Input | Form input with validation |
| Card | Content container |
| Loading | Loading spinner |
| Alert | Notification alerts |
| Modal | Dialog modal |

### Layout Components
| Component | Description |
|-----------|-------------|
| Header | Top navigation |
| Footer | Site footer |
| SidebarNew | Dashboard sidebar |
| DashboardLayout | Layout wrapper |
| ProtectedRoute | Auth protection |

### Dashboard Components
| Component | Description |
|-----------|-------------|
| StudentDashboard | Student home |
| CounselorDashboard | Counselor home |
| WelcomeHeader | Greeting header |
| StatCard | Statistics card |
| QuickAction | Quick action button |
| BookingCard | Session card |
| WellnessTip | Tips carousel |
| EmptyState | No data state |

### Community Components
| Component | Description |
|-----------|-------------|
| StudentCommunity | Forum view |
| PostCard | Post display |
| PostList | Posts grid |
| CreatePostModal | New post dialog |
| ReplyModal | Reply dialog |

### Resource Components
| Component | Description |
|-----------|-------------|
| StudentResources | Resource list |
| CounselorResources | Manage resources |
| ResourceCard | Resource preview |
| ResourceGrid | Resources grid |
| ResourceForm | Add/edit form |
| ResourceHero | Banner section |

### Profile Components
| Component | Description |
|-----------|-------------|
| StudentProfile | Student view |
| CounselorProfile | Counselor view |
| StudentDetail | Student info |
| ProfileHeader | Profile banner |
| SessionList | Sessions history |
| MoodHistory | Mood tracking |

### Settings Components
| Component | Description |
|-----------|-------------|
| StudentAccountSettings | Student settings |
| CounselorAccountSettings | Counselor settings |
| ProfileSettings | Profile form |
| SecuritySettings | Password change |
| PrivacySettings | Privacy options |
| NotificationSettings | Notifications |
| PreferencesSettings | Language/theme |
| AvailabilitySettings | Working hours |

### Mood Components
| Component | Description |
|-----------|-------------|
| MoodTracker | Mood entry |
| MoodTrackerFloat | Floating button |

## State Management

Using Zustand stores:

### authStore
- User authentication state
- Login/logout actions
- Role-based access

### chatStore
- Chat messages
- Sessions management
- Real-time updates

### moodStore
- Mood entries
- History tracking
- Statistics

## API Integration

Axios instance with interceptors:
- Request/Response logging
- Error handling
- Token refresh
- Auth headers

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | http://localhost:5000/api |
| `NEXT_PUBLIC_SOCKET_URL` | Socket server | http://localhost:5000 |
| `NEXT_PUBLIC_APP_NAME` | App name | Mental Health |

## Scripts

```bash
npm run dev     # Development server
npm run build   # Production build
npm run start   # Production server
npm run lint    # ESLint check
```

## Dependencies

### Core
- next - React framework
- react - UI library
- typescript - Type safety
- tailwindcss - Styling

### State & Data
- zustand - State management
- axios - HTTP requests
- date-fns - Date handling

### UI/UX
- framer-motion - Animations
- chart.js - Charts
- @heroicons/react - Icons
- @headlessui/react - Components

### Real-time
- socket.io-client - Real-time messaging

### Development
- eslint - Code linting
- postcss - CSS processing

## License

MIT

## Related Projects

- [Backend API](../backend/README.md)
- [Python AI Services](../python-services/README.md)