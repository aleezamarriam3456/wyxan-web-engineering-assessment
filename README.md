# MiniWeb — Full-Stack Mini Website Browser

A database-powered mini web platform that allows users to explore published websites, navigate between pages, search website content, and maintain individual browsing histories.

Built as a full-stack web engineering assessment using **Next.js, NestJS, MongoDB, and TypeScript**.

## Overview

MiniWeb provides a browser-like experience within a controlled mini web environment. Users can visit published websites through their addresses, follow internal links, navigate backward and forward, search across website content, and publish new websites.

The application maintains independent browsing sessions for different users, keeping their navigation histories separate.

## Key Features

- **Website Browsing:** Browse websites published within the MiniWeb environment using their unique addresses.
- **Internal Navigation:** Follow links between websites and handle unavailable addresses with an appropriate not-found page.
- **Browser History:** Navigate backward and forward through browsing sessions.
- **Navigation Branch Management:** Starting a new navigation after going back discards the previous forward history.
- **Scroll Restoration:** Restore the previous page and its scroll position when navigating back.
- **Individual User Sessions:** Maintain separate browsing sessions and histories for different users.
- **Browsing History:** View and revisit previously accessed websites.
- **Full-Text Search:** Search website content and open relevant results.
- **Website Publishing:** Publish new websites with their own titles, addresses, authors, and content.
- **Content Security:** Sanitize submitted website HTML and render website content within a restricted iframe.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Backend | NestJS, Node.js, TypeScript |
| Database | MongoDB |
| API | REST API |
| Development Tools | npm, Git, GitHub |

## Project Structure

```text
wyxan-web-engineering-assessment/
│
├── frontend/       # Next.js application
│
├── backend/        # NestJS REST API and database integration
│
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Node.js
- npm
- MongoDB

### 1. Clone the Repository

```bash
git clone https://github.com/aleezamarriam3456/wyxan-web-engineering-assessment.git
cd wyxan-web-engineering-assessment
```

### 2. Set Up the Backend

```bash
cd backend
npm install
```

Configure the backend environment variables and MongoDB connection according to the project's configuration.

Start the development server:

```bash
npm run start:dev
```

### 3. Set Up the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the application at:

```text
http://localhost:3000
```

Ensure the backend and MongoDB are running and the frontend is configured to communicate with the backend API.

## Production Builds

Build the frontend:

```bash
cd frontend
npm run build
```

Build the backend:

```bash
cd backend
npm run build
```

## Project Purpose

MiniWeb demonstrates full-stack application development, REST API integration, database-backed content management, browser navigation logic, independent user sessions, search functionality, and secure handling of user-submitted website content.

---

**Developed by Aleeza Mariam**

GitHub: [@aleezamarriam3456](https://github.com/aleezamarriam3456)

Repository: [Wyxan Web Engineering Assessment](https://github.com/aleezamarriam3456/wyxan-web-engineering-assessment)
