# Quiz AI (Frontend) Context

## Purpose

This directory contains the source code for the "Quiz AI" frontend application. It is a React application built with Vite, written in TypeScript, and styled with Tailwind CSS. It serves as the user interface for taking quizzes, viewing results, and managing quiz content (Admin).

## Contents

- `App.tsx`: Main application component. Handles routing (View state), global state, and initialization.
- `index.html`: Entry point HTML file.
- `vite.config.ts`: Configuration for the Vite build tool.
- `types.ts`: TypeScript interface definitions shared across the app (Quiz, Question, Option, etc.).
- `components/`: Directory for reusable UI components.
- `services/`: Directory for API integration and business logic services.

## Standards

- **Framework**: React (Functional Components with Hooks).
- **Language**: TypeScript (Strict typing preferred).
- **Styling**: Tailwind CSS (Utility-first).
- **State Management**: Local state (useState) or shared via props. No Redux/Context currently used (simple architecture).
- **Navigation**: Conditional rendering based on `view` state in `App.tsx` (Single Page Application without client-side routing library).
- **Conventions**:
  - PascalCase for components (`QuizPlayer.tsx`).
  - camelCase for functions and variables.
  - Explicit return types for complex functions.
