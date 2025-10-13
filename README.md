# EduLink - 24H Hackathon LMS

**Project:** EduLink (Learning Management System)  
**Goal:** Minimal, human-readable LMS scaffold (Student/Teacher roles) for hackathon submission.

## Team
- Team: YourTeamName
- Members: Member1, Member2

## Tech Stack
- Frontend: React (via CDN + JSX in browser for rapid demo)
- Backend: Node.js + Express
- Database: MongoDB (Mongoose)
- Auth: JWT + bcrypt
- Deploy: Backend -> Railway/Render; Frontend -> Netlify/Vercel (static)

## What’s included
- User registration & login (Student/Teacher)
- Course creation (Teacher) and course listing
- Enrollment (Student)
- Assignments (create/submit) & grading (Teacher)
- Simple notifications (frontend alert demo)
- File structure ready to push to GitHub

## How to run locally

### Backend
1. `cd server`
2. `npm install`
3. Create `.env` from `.env.example` and set `MONGODB_URI` and `JWT_SECRET`.
4. `npm run dev` (uses nodemon) or `node server.js`

### Frontend
1. Serve `client` directory via static server or open `client/index.html` in browser.
2. For CORS, ensure backend runs on port 5000 and set `API_BASE` in `client/app.js` if needed.

## Deploy
- Backend: push `server` to Railway/Render, set environment variables.
- Frontend: push `client` to Netlify/Vercel (static site).

## Notes
This scaffold is designed for a 24-hour hackathon demo — clean, human-friendly code and easy to extend.

Good luck! 🎓
