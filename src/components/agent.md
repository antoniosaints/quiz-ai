# Components Context

## Purpose

This directory contains all the React components used for the user interface. These components should be reusable, presentational (mostly), and focused on rendering specific parts of the UI.

## Contents

- `QuizPlayer.tsx`: The main player interface for taking a quiz. Handles question navigation, answer selection, and result display.
- `AdminPanel.tsx`: Interface for creating, editing, and deleting quizzes.
- `QuizCard.tsx`: A card component to display a summary of a quiz on the specific list.
- `Button.tsx`: Generic button component wrapping Tailwind styles.

## Standards

- **Component Structure**:
  - Props interface defined at the top.
  - Exported as `React.FC<Props>`.
  - JSX returned.
- **Styling**: Use Tailwind classes directly in `className`.
- **Props**: Use explicit interfaces. Avoid `any`.
- **Logic**: Keep business logic (like API calls) inside `App.tsx` or services, passing data down via props when possible. Components should focus on UI logic.
