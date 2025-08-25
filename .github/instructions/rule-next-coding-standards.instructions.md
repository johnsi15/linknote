---
description: Coding Standards & Rules for Nextjs 15 and React 19
---

# Project Structure And App Router

- Use the App Router (`app` directory) in Next.js 15
- Co-locate route handlers, loading and error states, and page-level components within the `app` directory
- Use route groups (parentheses) to organize without affecting URLs
- Use parallel or intercepting routes for complex layouts and modals
- Place API route handlers in `app/api`

# Server Components

- Default to Server Components for data fetching and rendering
- Keep them free of client-side hooks or browser APIs
- Use `Suspense` boundaries for streaming and granular loading states
- Use `generateMetadata` in `layout.tsx` or `page.tsx` for dynamic SEO metadata
- Prefer `fetch` with `revalidate` options for caching in Server Components
- Implement `generateStaticParams` for static builds of dynamic routes
- Use `unstable_noStore` for fully dynamic, non-cached rendering
- Use `Promise.all` for parallel data fetching and `React.cache` for request deduplication

# Client Components

- Mark Client Components with `"use client"` at the top
- Use `next/navigation` hooks such as `useRouter` and `usePathname` instead of `next/router`
- Handle form state with `useFormStatus`, `useFormState`, and `useOptimistic` when using Server Actions
- Include client-specific logic like user interaction and browser APIs here

# Data Fetching

- Use the built-in `fetch` in Server Components for data retrieval
- Pass caching strategies with `fetch(url, { next: { revalidate: <seconds> } })`
- Keep external requests minimal if deploying to serverless environments
- Avoid fetching in Client Components if it can be done on the server

# Route Handlers

- Replace deprecated `pages/api` routes with Route Handlers under `app/api`
- `GET` handlers are static by default unless otherwise configured
- Validate incoming data and use proper CORS or security measures
- Support JSON, text, and other file responses

# Server Actions

- Define Server Actions with the `use server` directive
- Call them from both Server and Client Components for data mutations
- Use `useFormStatus` and `useFormState` in Client Components to track form submissions
- Use `useOptimistic` to update the UI optimistically before server confirmation

# Middleware And Edge Runtime

- Use `middleware.ts` for route interception, authentication, redirects, and rewrites
- Use the Edge Runtime for faster startup and location-based personalization
- Handle cookies, headers, and dynamic rewrites in `middleware`
- Be mindful of constraints when running at the edge

# Styling And Assets

- Use CSS Modules, Tailwind CSS, or CSS-in-JS solutions
- Use the built-in `<Image />` component for optimized images
- Consider built-in font optimization with `@next/font` or newer APIs

# Performance

- Use streaming and `Suspense` for faster initial rendering
- Dynamically import large dependencies in Client Components
- Use `React.useMemo` and `React.useCallback` in Client Components to avoid re-renders
- Use `fetch` caching and revalidation carefully

# Deployment

- Use Vercel for integrated features or self-host with Node or Docker
- Test SSR and static outputs thoroughly
- Keep environment variables secure, never expose private values on the client

# Testing And Linting

- Use `next lint` with ESLint and integrate Prettier
- Use Jest, React Testing Library for testing and Playwright for testing E2E flows
- Keep test files near related components

# Dos

- Do organize routes and components in the `app` directory
- Do leverage Server Components for data fetching
- Do use Server Actions for form submissions
- Do use `next/link` for internal routing and prefetching
- Do implement loading states with `loading` files
- Do optimize images with the `<Image />` component
- Do separate server and client logic carefully

# Donts

- Dont mix the `pages` and `app` directories for routing
- Dont fetch data in Client Components if it can be done on the server
- Dont use `router.push` for form submissions when Server Actions are available
- Never expose sensitive environment variables in client code
- Dont import client-only modules into Server Components
- Avoid using `next/router` in App Router projects
