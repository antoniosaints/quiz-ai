# Services Context

## Purpose

This directory encapsulates external API communication, data fetching, and complex business logic that doesn't need to be tightly coupled to React components.

## Contents

- `quizService.ts`: Manages interaction with the backend API (Quiz AI api) and local storage (for results). Handles fetching quizzes, saving results, etc.

## Standards

- **Architecture**: Singleton pattern or export individual functions. current pattern uses an exported object `quizService` with methods.
- **Async/Await**: Use `async/await` for all asynchronous operations (fetch).
- **Error Handling**: Catch errors and throw or return standardized error objects.
- **Data persistence**: Use `fetch` for backend data and `localStorage`/`sessionStorage` for client-side persistence if needed.
