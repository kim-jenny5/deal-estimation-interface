# Deal Estimation Interface (BDG)

This is a reimagined version of a feature I originally built at BDG, where the production app lives behind a company login. To make the work publicly visible and better aligned with modern frontend stacks, I recreated it using **React** and modern tooling.

This project demonstrates my ability to translate real-world business logic and UI/UX patterns into a polished, interactive frontend experience — this time, in a modern, React-based environment.

👉 [Link to deployed app](https://deal-estimation-interface.vercel.app/)

## Tech Stack

- **Next.js** – React framework with support for server actions and hybrid rendering
- **TypeScript** – safer, predictable code
- **Tailwind CSS** – utility-first styling
- **Heroicons** – simple, clean icon set to pair seamlessly with Tailwind
- **Neon** – serverless Postgres database
- **Prisma** – TypeScript ORM used for schema and queries
- **Zod** – schema validation for forms
- **Vercel** – seamless deployment for frontend and serverless API routes

## Architecture Notes

The project was initially scaffolded using Vite to enable quick iteration and performance-optimized local development. However, as the project grew in complexity, I migrated to Next.js to fully integrate with the Vercel ecosystem and take advantage of built-in routing, server actions, and hybrid rendering.

## Purpose

This project was rebuilt to:

- Showcase work I couldn't share due to company access restrictions
- Highlight my frontend engineering skills using React, TypeScript, and Tailwind
- Demonstrate the ability to design and build interactive, data-driven UIs
- Reflect a real-world project structure using serverless functions and a relational database

## Running Locally

**Prerequisites:** Node.js, pnpm, and a PostgreSQL database (local via Docker or a hosted provider like Neon).

1. Clone the repository

```bash
git clone https://github.com/kim-jenny5/the-great-estimation.git
cd the-great-estimation
```

2. Install dependencies

```bash
pnpm install
```

3. Set up environment variables — create a `.env` file at the root:

```
DATABASE_URL="postgresql://..."
```

4. Push the schema and seed the database

```bash
pnpm db:push
pnpm db:seed
```

5. Start the development server

```bash
pnpm dev
```

The app will be running at `http://localhost:3000`.

## Notes

- The original implementation was done in **Ruby on Rails**, but this version was reimplemented in **React** and **Next.js** to reflect my current focus on frontend development.
- No authentication is implemented — the app loads the first user in the database as the current user to simulate a logged-in state.
