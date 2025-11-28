# AadhaarAuth System - Frontend

A modern React-based frontend for the Aadhaar Document Verification and Fraud Detection System. This application provides an intuitive interface for uploading, analyzing, and managing Aadhaar documents with AI-powered fraud detection capabilities.

## Screenshots

### Login Page
![Login Page](../assets/login_page.png)

### Registration Page
![Registration Page](../assets/registration_page.png)

### Dashboard
![Dashboard](../assets/dashboard.png)

### Document Verification
![Verification Page](../assets/verification_page.png)

### Document Analysis
![Analyzed Page](../assets/analyzed_page.png)

### Documentation
![Documentation](../assets/documentation.png)

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | Core UI framework |
| React Router DOM | 7.9.6 | Client-side routing |
| TailwindCSS | 3.4.1 | Utility-first CSS styling |
| Framer Motion | 12.23.24 | Animations & transitions |
| Recharts | 3.5.0 | Data visualization charts |
| Axios | 1.13.2 | HTTP client for API calls |
| Headless UI | 2.2.9 | Accessible UI components |

## Project Structure

```
frontend/
├── public/                 # Static assets
│   ├── index.html         # HTML template
│   └── favicon.svg        # App favicon
├── src/
│   ├── components/        # Reusable components
│   │   ├── icons/         # Custom SVG icon components
│   │   ├── ui/            # UI component library
│   │   │   ├── Badge.js       # Status badges
│   │   │   ├── Button.js      # Button variants
│   │   │   ├── Card.js        # Card container
│   │   │   ├── EmptyState.js  # Empty state placeholder
│   │   │   ├── Footer.js      # App footer
│   │   │   ├── Header.js      # Navigation header with user menu
│   │   │   ├── ProgressBar.js # Progress indicators
│   │   │   └── Skeleton.js    # Loading skeletons
│   │   ├── AuthModal.jsx  # Login/Register modal component
│   │   ├── Layout.jsx     # Main layout wrapper
│   │   └── Toast.js       # Toast notification system
│   ├── contexts/          # React Context providers
│   │   └── AuthContext.js # Authentication state management
│   ├── pages/             # Page components
│   │   ├── Dashboard.jsx         # Main dashboard with stats & upload
│   │   ├── DocumentList.jsx      # Document management list
│   │   ├── DocumentDetail.jsx    # Individual document view
│   │   ├── VerificationResults.jsx # Verification statistics
│   │   ├── Documentation.jsx     # API documentation
│   │   ├── About.jsx             # About page
│   │   ├── Login.jsx             # User login page
│   │   └── Register.jsx          # User registration page
│   ├── services/
│   │   ├── api.js         # Document API service layer
│   │   └── auth.js        # Authentication API service
│   ├── styles/
│   │   └── index.css      # Global styles & Tailwind imports
│   ├── App.js             # Root component with routing
│   └── index.js           # Application entry point
├── tailwind.config.js     # Tailwind configuration
├── postcss.config.js      # PostCSS configuration
└── package.json           # Dependencies & scripts
```

## Features

### Authentication & User Management
- **User Registration** - Create new accounts with email verification
- **Login/Logout** - Secure authentication with username or email
- **JWT Token Management** - Access and refresh token handling
- **Auto Token Refresh** - Automatic token renewal on expiration
- **User Profile** - View and update user profile
- **Password Change** - Secure password update functionality
- **Session Persistence** - Remember login state across browser sessions

### Core Functionality
- **Document Upload** - Drag-and-drop or click to upload single/multiple Aadhaar documents
- **Auto-Analysis** - Automatic fraud detection upon upload (configurable)
- **Batch Operations** - Analyze or delete multiple documents at once
- **Document Management** - View, filter, and manage uploaded documents

### Fraud Detection
- **AI-Powered Analysis** - YOLO-based fraud detection model integration
- **Gemini AI Extraction** - Intelligent data extraction from documents
- **Verification Status** - Real-time status indicators (Authentic/Suspicious/Fraudulent)
- **Confidence Scores** - Detailed fraud probability metrics

### Data Visualization
- **Dashboard Statistics** - Overview of total, verified, suspicious, and fraudulent documents
- **Interactive Charts** - Bar charts and pie charts for verification distribution
- **Trend Analysis** - Track verification trends over time

### Export Options
- **Excel Export** - Export verification results to Excel format
- **CSV Export** - Export extracted data as CSV
- **JSON Export** - Export data in JSON format

## Pages Overview

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Main overview with stats, charts, and document upload |
| `/login` | Login | User authentication page |
| `/register` | Register | New user registration page |
| `/documents` | Document List | Browse and manage all uploaded documents |
| `/documents/:id` | Document Detail | View detailed analysis of a specific document |
| `/verification-results` | Verification Results | Comprehensive verification statistics and exports |
| `/documentation` | Documentation | API reference and system documentation |
| `/about` | About | Information about the system |

## Design System

### Color Palette
- **Primary** - Blue (#3b82f6) - Main actions and branding
- **Secondary** - Slate (#64748b) - Text and backgrounds
- **Success** - Emerald (#10b981) - Verified/authentic status
- **Warning** - Amber (#f59e0b) - Suspicious status
- **Error** - Red (#ef4444) - Fraudulent status

### Typography
- **Sans** - Inter, system-ui
- **Display** - Plus Jakarta Sans
- **Mono** - JetBrains Mono

### Animations
- Fade-in, fade-up transitions
- Slide-in effects
- Scale animations
- Shimmer loading effects
- Floating animations

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Backend server running on `http://127.0.0.1:8000`

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server on port 3000 |
| `npm test` | Run test suite in watch mode |
| `npm run build` | Build production bundle to `build/` folder |
| `npm run eject` | Eject from Create React App (one-way) |

## API Integration

The frontend connects to the Django backend API at `http://127.0.0.1:8000/api`. Key endpoints:

### Authentication Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register/` | POST | Register new user |
| `/auth/login/` | POST | Login with username/email |
| `/auth/logout/` | POST | Logout user |
| `/auth/refresh/` | POST | Refresh access token |
| `/auth/me/` | GET | Get current user profile |
| `/auth/profile/` | PUT | Update user profile |
| `/auth/change-password/` | POST | Change password |

### Document Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/documents/upload/` | POST | Upload documents |
| `/documents/` | GET | List all documents |
| `/documents/:id/` | GET | Get document details |
| `/documents/:id/analyze/` | POST | Trigger analysis |
| `/documents/batch_analyze/` | POST | Batch analysis |
| `/documents/batch_delete/` | POST | Batch deletion |
| `/documents/verification_results/` | GET | Get verification stats |
| `/documents/export_excel/` | GET | Export to Excel |
| `/documents/export_extracted_data/` | GET | Export extracted data |
| `/documents/fraud_analysis/` | GET | Get fraud analysis |

## Environment Configuration

To change the API base URL, modify `src/services/api.js`:

```javascript
const API_BASE_URL = 'http://127.0.0.1:8000/api';
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Author

Designed and developed by **Kumar Manglam**

## License

This project is part of the AadhaarAuth System.
