# Showtime Real Estate - Appointment Management System

Showtime is a full-stack web application designed to streamline the process of scheduling real estate viewings. It connects real estate agents with potential buyers, allowing for seamless property management, appointment booking, and real-time status updates.

## 🚀 Features

### For Real Estate Agents
*   **Property Management:** Add, edit, and **delete** property listings with images and details.
*   **Availability Control:** Set specific time slots for property viewings.
*   **Appointment Management:** View upcoming appointments in a card view.
*   **Request Handling:** Approve or Reject booking requests from buyers in real-time.
*   **Notifications:** Receive instant popup alerts when a buyer requests a booking.
*   **Smart Scheduling:** Past time slots are automatically disabled to prevent scheduling errors.
*   **Dashboard:** A comprehensive overview of properties and schedules.

### For Buyers
*   **Browse Properties:** View available property listings with price and location details.
*   **Easy Booking:** Book available time slots for property viewings.
*   **My Bookings:** specific dashboard to track status (Pending, Confirmed) of all requests.
*   **Smart Booking:** Only future time slots are shown; past slots are automatically hidden.
*   **Auto-Cleanup:** Past bookings automatically disappear from the view to keep the dashboard clean.

## 🛠️ Technology Stack

*   **Frontend:** React.js, Vite, Axios, React Router
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB (Mongoose)
*   **Real-time Communication:** Socket.io
*   **Notifications:** React Toastify
*   **Authentication:** JWT (JSON Web Tokens)
*   **Styling:** Custom CSS (Responsive Grid Layouts)
*   **Icons:** Lucide React

## 📦 Installation & Setup

### Prerequisites
*   Node.js installed
*   MongoDB installed and running (or a MongoDB Atlas URI)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd cfa_project_sem3
```

### 2. Backend Setup
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:
```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Start the backend server:
```bash
npm run dev
# Server runs on http://localhost:5001
```

### 3. Frontend Setup
Open a new terminal and navigate to the client directory:
```bash
cd client
npm install
```

Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5001/api
```

Start the frontend development server:
```bash
npm run dev
# Application usually runs on http://localhost:5173
```

## 🔑 Usage Guide

1.  **Register/Login:**
    *   Create an account as an **Agent** to list properties.
    *   Create an account as a **Buyer** to book appointments.
2.  **Agent Workflow:**
    *   Go to "My Properties" -> "Add Property".
    *   Click "Manage" on a property to add time slots (e.g., 09:00, 10:00).
    *   Wait for buyer requests and approve/reject them.
3.  **Buyer Workflow:**
    *   Browse "Available Properties" on the dashboard.
    *   Select a property and click a time slot to book.
    *   Wait for Agent confirmation (status changes from Pending to Confirmed).

## 📡 API Endpoints Structure

*   **Auth:** `/api/auth/register`, `/api/auth/login`
*   **Properties:** `/api/properties` (GET, POST, DELETE)
*   **Bookings:** `/api/bookings` (GET, POST, PUT status)

## 🤝 Contributing
1.  Fork the repository
2.  Create a feature branch (`git checkout -b feature/NewFeature`)
3.  Commit your changes
4.  Push to the branch
5.  Open a Pull Request
