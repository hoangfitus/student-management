# Student Management Web Application

This is a lightweight web application built with TypeScript, React, and SQLite for managing a list of students. The app allows users to add, delete, update, and search for students. Data is persisted in an SQLite database stored locally, and the app supports exporting student data as an Excel file.

## Features

- **Add, Edit, Delete, and Search Students**
- **Pagination and Dynamic Display Count:** Choose to display 5, 10, or 15 students per page.
- **Export Data:** Save student data as an Excel file.
- **SQLite Database Integration:** Data persistence on the user's local machine.

## Source Code Structure

```plaintext
student-management/
├── public/             # Static assets (app icon)
├── src/
│   ├── components/     # UI components
│   ├── App.tsx         # Main application component
│   ├── main.tsx        # Application entry point
│   ├── types.d.ts      # Data types
│   ├── vite-env.d.ts   # Vite environment variables
├── db/                 # Folder containing the SQLite database file
├── eslint.config.js    # ESLint configuration
├── server.ts           # Node.js backend server to handle SQLite operations
├── package.json        # Project metadata and dependencies
├── tsconfig.app.json   # TypeScript configuration for the frontend
├── tsconfig.node.json  # TypeScript configuration for the backend
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite configuration
```

## Requirements

- **Node.js** (v20)
- **pnpm** (Node package manager)

## Installation

1. Extract the source code to a folder and navigate to the project directory:
   ```bash
   cd student-management
   ```
2. Install dependencies using pnpm:
   ```bash
   pnpm install
   ```

## Running the Application

### Frontend

```bash
pnpm dev
```

Access the app at `http://localhost:5173`

### Backend (SQLite Server)

```bash
pnpm start
```

This will start the Node.js backend to manage database operations.

## Building for Production

```bash
pnpm build
```

The compiled files will be available in the `dist/` directory.

## Exporting Student Data as Excel

To export the student data to Excel, click the "Export to Excel" button on the main page. The Excel file will be saved in the default `Downloads` directory.

## Usage Notes

- **SQLite File:** The database file (`db.sqlite`) is automatically created in the `db/` folder if it doesn't already exist.
# student-management
