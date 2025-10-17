# EduLink LMS Backend

This is the backend server for the EduLink Learning Management System. It provides the API for managing users, courses, assignments, and more.

## About

The EduLink LMS backend is a Node.js application built with Express and MongoDB. It provides a RESTful API for the EduLink frontend to interact with.

## Features

*   **User Authentication:** Register and log in as a student or teacher.
*   **Course Management:** Create, view, and enroll in courses.
*   **Assignment Management:** Create assignments, submit work, and grade submissions.
*   **Role-Based Access Control:** Students and teachers have different permissions.

## Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/edulink.git
    ```
2.  Navigate to the server directory:
    ```bash
    cd edulink/server
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```
4.  Create a `.env` file in the `server` directory and add the following environment variables:
    ```
    MONGODB_URI=<your_mongodb_uri>
    JWT_SECRET=<your_jwt_secret>
    ```
5.  Start the server:
    ```bash
    npm start
    ```

## Usage

The server will start on port 5000 by default. You can use a tool like Postman or `curl` to test the API endpoints.

### Available Scripts

*   `npm start`: Starts the server in production mode.
*   `npm run dev`: Starts the server in development mode with `nodemon`.

## API Endpoints

### Auth

*   `POST /api/auth/register`: Register a new user.
*   `POST /api/auth/login`: Log in a user.

### Courses

*   `POST /api/courses`: Create a new course (teacher only).
*   `GET /api/courses`: Get all courses.
*   `POST /api/courses/:id/enroll`: Enroll in a course.

### Assignments

*   `POST /api/courses/:id/assignments`: Create a new assignment (teacher only).
*   `POST /api/assignments/:id/submit`: Submit an assignment.
*   `POST /api/assignments/:id/grade`: Grade an assignment (teacher only).

### User

*   `GET /api/me`: Get the current user's information.