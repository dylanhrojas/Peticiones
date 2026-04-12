# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Backend (Spring Boot) — from prayer-wall/
./mvnw spring-boot:run

# Frontend (React + Vite) — from prayer-wall/frontend/
npm run dev        # dev server on http://localhost:5173, proxies /api → localhost:8080

# Build frontend into Spring Boot static folder (production)
cd frontend && npm run build   # outputs to src/main/resources/static/

# Build full JAR (run frontend build first)
./mvnw package
```

Both servers must run simultaneously during development. The Vite dev server proxies all `/api/*` calls to Spring Boot on port 8080.

## Project Overview

**Muro Global de Oración** — A full-stack web platform where users publish prayer requests visualized on an interactive 3D globe. The core feature is a Globe.gl 3D globe with bars colored by prayer category and height by number of prayers received.

Full project spec is in [README.md](README.md).

## Stack

- **Backend:** Spring Boot (REST API + auth via Spring Security + OAuth2 Client)
- **Frontend:** React + Vite — built as static files and served by Spring Boot
- **Database:** PostgreSQL
- **Hosting:** Railway (single deployment — Spring Boot serves both the API and the React build, one URL)
- **3D Globe:** `react-globe.gl` (official React wrapper for Globe.gl)

- A prayer request stays active on the globe for **30 days**. The timer resets each time someone prays for it. After 30 days of no interaction it is automatically archived.

## Deployment Architecture

Everything runs on Railway as a single service. The React app is built with `npm run build` and the output is placed in Spring Boot's `src/main/resources/static/` so Spring Boot serves it as static files. The API is available at `/api/**`. No CORS configuration needed since frontend and backend share the same origin.

## Frontend Workflow

**Always use the 21st.dev Magic MCP for frontend inspiration.** Before creating or significantly redesigning any UI (page, hero, card, form, modal, etc.), call `mcp__magic__21st_magic_component_inspiration` (or `component_builder` when generating from scratch) to pull current design references. Adapt the result to the project's vocabulary — glassmorphism, Cormorant Garamond + DM Sans, gold accent — instead of copying literally.

## Routes

- `/` → LandingPage (hero, scripture, "how it works")
- `/globo` → HomePage (3D globe + feed view)
- `/testimonios` → TestimoniesPage
- `/nueva` → NewRequestPage (auth required)
- `/login`, `/registro` → auth pages

## Architecture Decisions Already Made

- **3D Globe:** Globe.gl, using the world-population example as visual reference — bars per location, color = category, height = prayer count
- **Dark mode only** — no toggle. Background `#0A1628`
- **Spanish only** for MVP — no i18n in first version
- **No push/email notifications in MVP**
- **No complex moderation UI** — moderators manage directly via DB

## User Roles

- **Visitor (no login):** view globe, read requests, tap "Oré por ti" (I prayed)
- **Registered user:** publish requests, comment, mark as answered + write testimony
- **Moderator:** direct DB access only, no special UI

## Core User Flow

Publish prayer → receive prayers → mark as answered → write testimony → request moves to Testimonies page and disappears from globe with animation.

## Design Tokens

```
Background:       #0A1628  (primary)
Background alt:   #142847
Accent gold:      #F5C26B
Accent cream:     #E8DCC4
Text:             #F5F5F0
Success:          #7FB069

Category colors:
  Salud (Health):       #E63946
  Familia (Family):     #F4A261
  Espiritual:           #F5C26B
  Trabajo/Provisión:    #2A9D8F
  Otros:                #A8A8B3
```

Fonts: Fraunces or Cormorant Garamond (headings) + Inter or DM Sans (body) — both on Google Fonts.
Icons: Lucide Icons or Phosphor Icons.

## Key MVP Features

1. Auth: email+password + Google OAuth (Spring Security + OAuth2 Client)
2. Post prayer requests (500 char max, 5–6 fixed categories, location, anonymous option)
3. 3D Globe (Globe.gl) — click bar → modal with request detail
4. List/feed view (mobile-friendly fallback for the globe)
5. "Oré por ti" button with satisfying animation
6. Mark as answered + testimony flow
7. Testimonies gallery page
8. Global counters: today's prayers offered, total answered

## Out of Scope for MVP

Push/email notifications, auto-translation, multiple languages, complex moderation UI, private groups, social sharing, advanced search, favorites, personal stats, dark/light toggle, native app, multiple auth providers, direct chat, media uploads, donations.
