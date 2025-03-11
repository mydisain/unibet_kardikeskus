# Kart Booking System

A comprehensive kart booking system with frontend and backend interfaces.

## Features

### Backend Features
- Admin interface for managing karts and bookings
- User management system
- Booking configuration settings
- Email notification system
- Dashboard with booking summary

### Frontend Features
- Intuitive booking process
- Date display in Estonian
- Timeslot selection with kart quantity options
- Booking summary and confirmation
- User-friendly interface

## Tech Stack
- **Frontend**: React, Redux, Material-UI
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **Email**: Nodemailer

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB

### Installation

1. Clone the repository
2. Install dependencies:
```
cd testkart
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/kart-booking
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

4. Start the development server:
```
npm run dev
```

## Project Structure
- `/client` - Frontend React application
- `/server` - Backend Express application
- `/server/models` - Database models
- `/server/routes` - API routes
- `/server/controllers` - Business logic
- `/server/middleware` - Custom middleware

## License
MIT
