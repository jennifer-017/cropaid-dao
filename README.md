# CropAid DAO

A decentralized crop insurance fund governed by farming communities, enabling fast and transparent disaster relief through DAO voting and smart contract simulation.

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn-style UI components
- MongoDB + Mongoose
- JWT auth (httpOnly cookie) + Role-based access (Farmer, Voter, Admin)
- DAO simulation layer (stake-based voting power)
- Recharts (charts) + Leaflet (maps)

## Project Structure

```
/app
	/api
		/admin
			/stats/route.ts
			/tx/route.ts
		/auth
			/login/route.ts
			/logout/route.ts
			/me/route.ts
			/register/route.ts
		/claims
			/[id]/comment/route.ts
			/[id]/vote/route.ts
			/[id]/route.ts
			/route.ts
		/pool
			/stake/route.ts
			/route.ts
		/weather/route.ts
	/admin/page.tsx
	/farmer/page.tsx
	/login/page.tsx
	/register/page.tsx
	/layout.tsx
	/page.tsx
/components
	/admin/RegionalClaimsMap.tsx
	/ui/*.tsx
	AppHeader.tsx
	LanguageSwitcher.tsx
/hooks
	useAuth.ts
/lib
	auth/*
	dao/*
	i18n/*
	db.ts
	env.ts
	utils.ts
/models
	Claim.ts
	Pool.ts
	TxLog.ts
	User.ts
/public/uploads
/utils/regions.ts
.env.example
```

## Local Setup

### 1) Prereqs

- Node.js **20 LTS** (Next.js 14 is not guaranteed to build on Node 22)
- MongoDB running locally (or MongoDB Atlas)

This repo includes `.nvmrc` and `.node-version` (recommended: Node 20.11.1).

### 2) Configure env

Create `.env.local`:

```bash
copy .env.example .env.local
```

Set values in `.env.local`:

- `MONGODB_URI`
- `JWT_SECRET` (>= 16 chars)

### 3) Install + run

```bash
npm install
npm run dev
```

Open:

- http://localhost:3000

## Demo Flow

1. Register 3 users (Farmer / Voter / Admin)
	 - Role selection is enabled in dev for hackathon demos.
2. Farmer: stake into pool and submit a claim with photo evidence
3. Voter: approve/reject claims; voting is stake-weighted
4. Admin: view map, pool usage, claims over time, and simulated tx log

## Git Initialization

```bash
git init
git add .
git commit -m "Initial MVP: CropAid DAO"
```

## Push to GitHub

```bash
git remote add origin https://github.com/<your-org-or-user>/cropaid-dao.git
git branch -M main
git push -u origin main
```

## Add Collaborators

1. Open your GitHub repo → **Settings** → **Collaborators and teams**
2. Invite teammates by GitHub username/email
3. For team workflows, enable branch protection on `main` and require PR reviews

## Notes

- Uploads are stored in `public/uploads` for MVP simplicity.
- If you see Windows `EPERM` errors, stop any running `next dev` processes and retry.
