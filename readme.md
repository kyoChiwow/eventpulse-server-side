# Event Management Platform Backend

This is the backend API for the Event Management Platform, built with Node.js, Express, and MongoDB. It handles event creation, event data retrieval, attendee management, and real-time updates using Socket.IO.

## Features

- **Create Events**: Endpoint to create a new event with details like name, description, time, image, and initial attendees count.
- **Get Events**: Endpoint to fetch events, with support for filtering by "Upcoming" and "Past" events.
- **Real-Time Attendee Updates**: Socket.IO is used to send real-time updates when the number of attendees changes.
- **JWT Authentication**: Protected routes requiring user authentication via JWT tokens.
- **Image Upload**: Event images are uploaded to Cloudinary.

## Tech Stack

- **Node.js**: Backend runtime
- **Express.js**: Web framework for routing and API management
- **MongoDB**: Database for storing event details and attendee information
- **Socket.IO**: Real-time communication for live updates
- **Cloudinary**: Image hosting and management
- **JWT**: For user authentication and protected routes

## Installation

### Prerequisites

- Node.js and npm (Node Package Manager) installed
- MongoDB database (local or cloud)
- Cloudinary account for image uploads

### Clone the repository

```bash
git clone https://github.com/your-username/event-management-platform.git
cd event-management-platform/backend
