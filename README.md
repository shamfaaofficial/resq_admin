# RESQ Admin Panel

A modern, feature-rich admin panel for managing the RESQ ride-sharing platform. Built with Node.js, Express, and EJS templating.

![Admin Panel](https://img.shields.io/badge/Status-Active-success)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [UI Documentation](#ui-documentation)
- [API Integration](#api-integration)

## 🎯 Overview

The RESQ Admin Panel provides a clean and modern interface designed for easy management of users, documents, and trip activities. The layout features a dark-themed sidebar for navigation and a main content area for operations.

## ✨ Features

### 🏠 Dashboard Overview
- **Colorful Stat Cards**: Modern gradient cards displaying key metrics
  - Total Trips (Blue) - with trend line chart
  - Active Trips (Cyan) - with trend line chart
  - Total Revenue (Yellow) - with trend line chart
  - Drivers Online (Coral) - with bar chart
- **Real-time Metrics**: Live data from API endpoints
- **Responsive Design**: Adapts to different screen sizes

### 📄 Document Approvals
- View all drivers with pending documents
- Documents grouped by driver for better organization
- Individual document approval/rejection
- Driver-level approval actions
- Document preview with signed URLs
- Status badges (Pending, Approved, Rejected)

### 🚗 Trip Management
- Comprehensive trip listing with pagination
- Filter by status (Pending, Completed, Cancelled)
- Search by booking number
- Detailed trip information display
- Driver and user details

### 👥 Users Management
- **Search & Filters**
  - Search bar for filtering by name, phone number, or email
  - Status filter dropdown (Active, Inactive, Blocked, All)
  - Quick search and clear controls
- **Users Table**
  - Name with username
  - Phone Number
  - Email
  - Status (colored badges)
  - Total Trips
  - Joined Date
  - Actions (View, Delete)
- **User Actions**
  - View user details
  - Delete users with confirmation dialog
  - Success/error message feedback

### 🔐 Authentication
- OTP-based login system
- 6-digit verification code
- Resend OTP functionality
- Session management
- Secure logout

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js
- **Templating**: EJS
- **HTTP Client**: Axios
- **Session Management**: express-session
- **Styling**: Custom CSS with modern gradients and animations

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd resq_admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   BASE_API_URL=https://dev.resq-qa.com
   SESSION_SECRET=your-secret-key
   PORT=3000
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## 🚀 Usage

### Login Flow
1. Navigate to `/login`
2. Enter admin phone number
3. Receive OTP via SMS
4. Enter 6-digit OTP on `/verify` page
5. Access dashboard upon successful verification

### Managing Documents
1. Navigate to **Document Approvals** from sidebar
2. View pending documents grouped by driver
3. Click document to preview
4. Use ✓ to approve or ✗ to reject individual documents
5. Use "Approve Driver" to approve all driver documents

### Managing Users
1. Navigate to **Users** from sidebar
2. Use search bar to find specific users
3. Filter by status using dropdown
4. View user details or delete users
5. Pagination controls at bottom of table

### Viewing Trips
1. Navigate to **Trips** from sidebar
2. Filter by status or search by booking number
3. View trip details including driver and user information
4. Use pagination to browse through trips

## 📘 UI Documentation

### Sidebar Navigation
A dark-themed sidebar (#000000) ensures good contrast and focuses attention on the main content.

**Menu Options:**
- Dashboard
- Document Approvals
- Trips
- Users

The sidebar remains consistent on every page for smooth navigation.

### Visual Design
- **Color Scheme**: 
  - Primary: Yellow/Gold (#ffde79, #dcbb56)
  - Sidebar: Black (#000000)
  - Background: Soft yellow gradient
  - Stat Cards: Blue, Cyan, Yellow, Coral gradients
- **Typography**: Poppins font family
- **Components**:
  - Rounded corners (8px-16px)
  - Soft shadows for depth
  - Smooth hover transitions
  - Colored status badges
  - Modern card layouts

### Top Right Section
- Displays currently logged-in admin's username/phone
- Logout button for quick account sign-out

## 🔌 API Integration

The admin panel integrates with the following API endpoints:

### Authentication
- `POST /api/v1/auth/admin/login` - Send OTP
- `POST /api/v1/auth/admin/verify-otp` - Verify OTP

### Dashboard
- `GET /api/v1/admin/stats` - Dashboard statistics
- `GET /api/v1/admin/drivers` - Driver metrics
- `GET /api/v1/admin/bookings` - Booking metrics

### Documents
- `GET /api/v1/admin/drivers/documents` - List documents
- `PATCH /api/v1/admin/drivers/:driverId/documents/:documentId` - Approve/Reject document
- `POST /api/v1/admin/drivers/:driverId/approve` - Approve driver

### Users
- `GET /api/v1/admin/users` - List users
- `DELETE /api/v1/admin/users/:userId` - Delete user

### Trips
- `GET /api/v1/admin/trips` - List trips

## 📁 Project Structure

```
resq_admin/
├── server.js                 # Main server file
├── package.json             # Dependencies
├── views/                   # EJS templates
│   ├── login.ejs           # Login page
│   ├── verify.ejs          # OTP verification
│   ├── dashboard.ejs       # Dashboard
│   ├── document-approvals.ejs
│   ├── trips.ejs
│   ├── users.ejs
│   └── partials/
│       └── sidebar.ejs     # Reusable sidebar
└── public/
    └── css/
        ├── style.css       # Global styles
        └── dashboard.css   # Dashboard-specific styles
```

## 🎨 Design Philosophy

The UI is designed to:
- Make user management simple and fast
- Allow admins to search, filter, and manage data in real time
- Maintain a professional, clean interface suitable for modern web applications
- Provide visual feedback for all actions
- Ensure accessibility and usability

## 📝 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Built with ❤️ for RESQ Platform**
