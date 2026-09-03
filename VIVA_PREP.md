# Project Viva Preparation Guide

This document is designed to help you confidently answer questions from your professor during your project viva or presentation.

---

## 1. Where is the MERN stack used in this project?

The acronym **MERN** stands for MongoDB, Express.js, React.js, and Node.js. This project utilizes every component of the stack to form a complete, full-stack application:

*   **M - MongoDB:** Acts as our primary database. It stores all of the application's persistent data, including user accounts, song metadata, playlists, and user viewing/listening history. We use it because its NoSQL structure maps perfectly to our JavaScript objects (JSON).
*   **E - Express.js:** This is the web framework that runs inside our Node.js server. In this project, Express handles all of the backend routing (like `/api/auth` or `/api/songs`), processes incoming HTTP requests, manages security middleware, and serves our uploaded media files statically.
*   **R - React.js:** This is our frontend user interface library. Everything the user sees and interacts with in the browser is built with React. It allows us to build a single-page application (SPA) where navigation is instant and the music player remains uninterrupted while the user browses different pages.
*   **N - Node.js:** This is the JavaScript runtime environment executing our backend server code. Our `server.js` file is run by Node.js, allowing JavaScript to operate outside of a web browser to manage our backend logic, file system operations (like audio uploads), and database connections.

---

## 2. How can I see the MongoDB database?

Since MongoDB is a database service rather than a physical file, you cannot just open a file to see the data. If the professor asks to see the database, explain and demonstrate the following steps:

**Using MongoDB Compass (The easiest GUI method):**
1. Mention that the application connects to the database using the connection string (`MONGO_URI`) located inside the `.env` file.
2. Tell the professor: *"To view the raw data visually, we use a graphical user interface called **MongoDB Compass** (or MongoDB Atlas if it's hosted in the cloud)."*
3. **To demonstrate:** Open MongoDB Compass on your computer, paste the `MONGO_URI` from your `.env` file into the connection bar, and click "Connect". 
4. From there, you can present the database name and expand it to show the individual **Collections** (which are like tables in SQL). Show them the collections you have created: `users`, `songs`, `playlists`, `favorites`, etc.

---

## 3. What all things (technologies/libraries) are used in this project?

Beyond the core MERN stack, this project leverages several modern, industry-standard libraries to improve security, design, and performance. You can categorize them as follows:

### Frontend (Client-side)
*   **Vite:** A modern, incredibly fast build tool used instead of standard 'create-react-app' to compile our React code and provide a rapid development server.
*   **React Router (`react-router-dom`):** Used to handle routing and page navigation on the frontend without refreshing the browser, preserving the state of the audio player.
*   **Bootstrap & React-Bootstrap:** Used for responsive styling, ensuring the application looks good on both mobile phones and desktop screens.
*   **Axios:** A promise-based HTTP client used inside our React components to easily send data (like logins or song uploads) to our backend Express API.
*   **React Icons:** Used to provide the scalable vector icons you see throughout the user interface.

### Backend (Server-side)
*   **Mongoose:** An Object Data Modeling (ODM) library used to enforce a strict schema/structure on our MongoDB data (making sure every User has an email and password, for example).
*   **JSON Web Tokens (`jsonwebtoken`):** Used for secure authorization. When a user logs in, they receive a token that verifies their identity on subsequent requests without needing to constantly send their password.
*   **Bcrypt (`bcryptjs`):** Used for security. It encrypts (hashes) user passwords before saving them in the database, meaning even if the database is breached, the literal passwords are unreadable.
*   **Multer:** Middleware specifically used to handle `multipart/form-data`. In this project, it is responsible for securely parsing and saving user file uploads (like MP3 audio files and image thumbnails) to the local disk.
*   **Helmet & CORS:** Security middleware. Helmet sets safe HTTP headers to prevent web vulnerabilities, and CORS ensures our frontend can safely communicate with our backend API.
