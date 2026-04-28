# QueueLess India 2.0 — Backend (Firebase)

## Architecture

This folder contains all backend logic for the QueueLess India platform, powered by **Firebase Firestore** and **Firebase Auth**.

```
Backend/
├── firebase/
│   └── firebase.js              # Firebase initialization (Firestore + Auth)
├── services/
│   ├── auth.service.js          # Firebase Auth + user profiles
│   ├── queue.service.js         # Real-time queue (transactions, onSnapshot)
│   ├── booking.service.js       # Slot-based bookings
│   └── service.service.js       # Service CRUD
├── hooks/
│   ├── useQueue.js              # Real-time queue hook (onSnapshot)
│   ├── useBooking.js            # Booking flow hook (Firestore)
│   └── useServices.js           # Real-time services hook
├── context/
│   ├── AuthContext.jsx           # Firebase Auth context (auto-session)
│   └── NotificationContext.jsx   # Real-time notifications
├── components/
│   └── QRGenerator/             # QR code generation for services
├── pages/
│   ├── CheckIn/                 # QR scan target (/checkin?serviceId=)
│   └── Admin/
│       ├── AdminDashboard.jsx   # Admin home with stats + QR
│       ├── AdminQueue.jsx       # Live queue table with actions
│       └── RegisterService.jsx  # Service onboarding form
├── rules/
│   ├── firestore.rules          # Firestore security rules
│   └── firestore.indexes.json   # Composite indexes
└── README.md
```

---

## Setup

### 1. Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication** → Email/Password
4. Enable **Cloud Firestore** → Start in test mode
5. Copy your project config

### 2. Configure
Edit `firebase/firebase.js` and replace the placeholder config:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  // ...
};
```

### 3. Deploy Firestore Rules
Go to Firebase Console → Firestore → Rules → paste contents of `rules/firestore.rules`

### 4. Create Indexes
Go to Firebase Console → Firestore → Indexes → Import from `rules/firestore.indexes.json`

---

## Key Design Decisions

### 🔐 Token Generation (Race-Safe)
Uses `runTransaction()` to atomically read the last token and increment — no duplicates even under concurrent load.

### 🛡️ Duplicate Prevention
`getUserActiveToken()` checks for existing WAITING/CALLED/SERVING tokens before allowing a user to join a queue.

### 📡 Real-Time Sync
All queue operations use `onSnapshot()` — when admin clicks "Call Next", the user's screen updates instantly.

### 🔒 Security Rules
- Users can only create entries for themselves
- Only service admins can update queue status
- Notifications can only be marked read by their owner
- No document deletion allowed

---

## Firestore Collections

| Collection | Purpose |
|---|---|
| `users` | User profiles with roles (user/admin) |
| `services` | Registered services with admin ownership |
| `queue` | Live queue entries with status tracking |
| `bookings` | Slot-based bookings |
| `notifications` | User notifications |

---

## Queue Status Flow

```
WAITING → CALLED → SERVING → COMPLETED
              ↓
           SKIPPED
```
