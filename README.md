# iBILIB — Educational Library & Research Platform

A full-stack digital library for learning materials (organized by grade) and research projects
(categorized with chapter support), with file uploads, search, filtering, statistics and
rule-based related content.

**Status: functional first version (no authentication).** Login, user accounts, roles and
permissions are intentionally not implemented yet — CRUD endpoints are open for development.

## Architecture

```
FRONTEND (Next.js, :3000)
    ↓ REST API
BACKEND (Express + Prisma, :5000)
    ↓
DATABASE (SQLite via Prisma)
```

The frontend never talks to the database directly — it only uses the REST API.

```
┌──────────────────────────────┐
│ frontend/                    │  Next.js 14 (TypeScript), App Router
│   src/app        pages       │
│   src/components  UI         │
│   src/services    API layer  │
│   src/hooks       data hooks │
│   src/types        types     │
│   src/utils        helpers   │
└──────────────────────────────┘
┌──────────────────────────────┐
│ backend/                     │  Express + Prisma + SQLite
│   src/routes       API routes│
│   src/controllers  HTTP      │
│   src/services     logic     │
│   src/repositories data      │
│   src/models        Prisma   │
│   src/validators    zod      │
│   src/middleware             │
│   src/config                 │
│   uploads/          files    │
└──────────────────────────────┘
```

## Data Model

```
Grade → Subject → LearningMaterial → File
ResearchCategory → ResearchProject → ResearchChapter → File
Tag ↔ LearningMaterial (many-to-many)
View / Download (polymorphic: material | research | chapter)
```

## Running the project

Two independent apps. Backend first, then frontend.

### Backend

```bash
cd backend
npm install
npm run db:generate   # generate Prisma client
npm run db:push       # create SQLite database
npm run db:seed       # seed grades 7–12, subjects, categories + sample data
npm run dev           # http://localhost:5000  (API: http://localhost:5000/api)
```

### Frontend

```bash
cd frontend
npm install
npm run dev           # http://localhost:3000
```

Environment templates: `backend/.env.example`, `frontend/.env.example`.
Copy to `.env` and adjust if needed (defaults already point at the right ports).

## Pages

| URL | Purpose |
| --- | --- |
| `/` | Home — stats, grade links, popular materials, recent research |
| `/library` | All grade levels |
| `/library/grade-7` … `/library/grade-12` | Materials per grade, subject filter, sort, pagination |
| `/materials/:id` | Material detail — file, stats, download, related materials |
| `/research` | Research categories + recent projects |
| `/research/research-project` `/practical-research-1` `/practical-research-2` `/capstone` | Projects per category |
| `/research/:id` | Project detail — abstract, authors, chapters, references, download, related |
| `/search` | Global search with filters, sort, pagination |
| `/admin/*` | Development CRUD interfaces (materials, research, grades, subjects, categories, tags, files) |

## API overview

| Endpoint | Description |
| --- | --- |
| `GET /api/materials` | List materials (`grade`, `gradeId`, `subjectId`, `tag`, `q`, `sort=recent\|oldest\|title\|views\|downloads`, `page`, `limit`) |
| `GET/POST/PATCH/DELETE /api/materials/:id` | Material CRUD (multipart `file` upload supported) |
| `GET /api/materials/:id/related` | Rule-based related materials |
| `GET/POST/PATCH/DELETE /api/research` | Research CRUD |
| `GET /api/research/:id/related` | Rule-based related research |
| `GET /api/research/categories` | Research categories |
| `GET/POST /api/research/:id/chapters` | List / add chapters |
| `PATCH/DELETE /api/research/chapters/:chapterId` | Update / delete chapters |
| `GET /api/grades`, `GET /api/grades/:id` | Grades (also CRUD) |
| `GET /api/subjects`, `GET /api/subjects/:id` | Subjects (also CRUD) |
| `GET /api/tags` | Tags (also CRUD) |
| `POST /api/files` | Upload a file (multipart field `file`) |
| `GET /api/files/:id/raw` | Stream a file (`?download=1` forces attachment) |
| `GET /api/search?q=…` | Global search — materials + research (`grade`, `subjectId`, `categoryId`, `categorySlug`, `strand`, `type`, `sort=relevance\|recent\|title\|views\|downloads`, `page`, `limit`) |
| `POST /api/views` | `{ resourceType: material\|research\|chapter, resourceId }` |
| `POST /api/downloads` | Same shape as views |

Statistics (view/download counts, "most viewed", "most downloaded") are derived from the
`Views` and `Downloads` tables. Related content uses rule-based scoring (same subject/grade,
shared tags/topics, same category/keywords/strand) — no AI.

## Supported upload types

`pdf, doc, docx, ppt, pptx, xls, xlsx, png, jpg, jpeg` — max 50 MB.

## Roadmap (later phases)

- Authentication / registration / roles / permissions
- Admin authorization on CRUD routes
- Profiles and social features
- AI-powered recommendations
- Final visual design

## Development scripts

```bash
# backend
cd backend
npm run typecheck   # tsc --noEmit
npm run build       # tsc build
npm run db:reset    # wipe and recreate database (then re-seed)

# frontend
cd frontend
npm run typecheck   # tsc --noEmit
npm run build       # next build
```
