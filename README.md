Best Car --- AI-Powered Car Rental Platform

Best Car is a production-shaped car-rental platform combining a customer
storefront, staff dashboard, AI-powered vehicle recommendations, AI lead
qualification, and automated high-priority lead notifications.

🚀 Live Demo

Customer: https://best-cars1.netlify.app

Admin: https://best-cars1.netlify.app/admin

AI / Automation Demo: https://www.awesomescreenshot.com/video/56020398?key=157b69265d404ea4b0041796db7d808b

Demo accounts

Role Email Password

Admin admin@bestcar.com Admin@123
Customer user@bestcar.com User@123

These credentials are intended for the assessment/demo environment.

✨ Key Features

Customer Frontend

Responsive car-rental storefront and fleet browsing

Search, filtering, sorting and pagination

Vehicle detail pages

Date-based availability checking

Booking and cancellation flow

Customer account and booking history

Password reset by emailed one-time link, sent through Resend

AI vehicle advisor

Vehicle and contact inquiry forms

Admin Dashboard

Sales and earnings analytics

Trends, best sellers, country sales and recent transactions

Fleet/product management with image uploads

Booking/order management

AI-qualified lead inbox with filtering and sorting

Lead status workflow and manual re-qualification

Real-time in-app notifications

Profile and store settings

🤖 AI Features

1. AI Vehicle Advisor

Customers can describe what they need in natural language, for example:

"Family of five, two weeks, automatic, four large suitcases, under
$90 a day."

The system:

Uses Google Gemini to extract structured requirements.

Retrieves real vehicle candidates from PostgreSQL.

Checks real date availability before recommendation.

Scores candidates deterministically in application code.

Uses Gemini only to rank/explain the retrieved shortlist.

Re-reads vehicle facts from the database before displaying them.

This design keeps the database as the source of truth and reduces
hallucinated vehicle, price and availability information.

2. AI Lead Qualification

Every customer inquiry can be automatically analyzed for:

Lead score

Priority

Intent

Budget

Rental duration

Vehicle preference

Urgency

Summary

Recommended action

Missing information

The final priority is calculated by application logic rather than
blindly trusting the model output.

⚙️ Automation

High-priority leads are automatically sent through:

Customer → Next.js → Supabase → Gemini → Lead Qualification → Zapier →
Secure Callback → Resend → Staff Email

The customer request is not blocked by the notification workflow. Lead
events are sent asynchronously, while the application remains
responsible for authentication, validation, email rendering and
security.

Automation screenshot: Add the Zapier workflow image here.

🏗️ Architecture

                         ┌─────────────────┐
                         │    Customer     │
                         │    Browser      │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │    Next.js      │
                         │ App Router/API  │
                         └───────┬─┬───────┘
                                 │ │
                    ┌────────────┘ └──────────────┐
                    ▼                             ▼
             ┌─────────────┐               ┌─────────────┐
             │  Supabase   │◄──────────────│   Gemini    │
             │ PostgreSQL  │               │     AI      │
             └──────┬──────┘               └─────────────┘
                    │
                    ▼
             ┌─────────────┐
             │   Zapier    │
             │ Automation  │
             └──────┬──────┘
                    │
                    ▼
             ┌─────────────┐
             │   Resend    │
             │ Email Alert │
             └──────┬──────┘
                    ▼
             ┌─────────────┐
             │    Staff    │
             └─────────────┘

🧰 Tech Stack

Layer Technology

Framework Next.js 16, App Router
Frontend React 19, TypeScript, Tailwind CSS
Charts Recharts
Database Supabase PostgreSQL
Authentication Supabase Auth
Storage Supabase Storage
AI Google Gemini
Validation Zod
Automation Zapier Webhooks
Email Resend
Hosting Netlify

🔐 Engineering & Security

Supabase Row Level Security across application tables

Server-only privileged database client

Staff authorization checks

Zod validation for request and AI output schemas

Rate limiting for AI endpoints

Authenticated webhook callback using a bearer secret

Constant-time webhook secret comparison

Booking idempotency

PostgreSQL date-overlap constraint to prevent double booking

AI interaction audit logging

Model output grounding and validation

Password reset that resists account enumeration and inbox flooding

🔑 Password Reset

Recovery tokens are minted with the Supabase admin API but never sent by
Supabase. The application builds its own link and delivers it through
Resend, so the template lives in code review and delivery is not capped
by Supabase's built-in mailer.

Request → emailed link → /auth/confirm → new password → other sessions
signed out

Demo note: this deployment sends from Resend's shared onboarding sender,
which only delivers to the Resend account owner until a domain is
verified. The flow is complete and works end to end for a real inbox;
the demo accounts above are not real mailboxes, so reset emails for them
cannot be delivered in the hosted demo. Verify a domain at
resend.com/domains and set RESEND_FROM_EMAIL to lift this. Set APP_URL
in every deployed environment: it builds the recovery link.

🧠 AI Design Principle

The central design decision is:

The AI assists with interpretation and ranking; the database remains
the source of truth.

For vehicle recommendations, availability, pricing, vehicle
specifications and booking state are retrieved from PostgreSQL rather
than generated by the model.

🛠️ Local Setup

Requirements: Node.js 20+ and a Supabase project.

git clone ADD_GITHUB_URL
cd best-car
npm install

cp .env.example .env.local

# Configure the required environment variables

supabase link --project-ref YOUR_PROJECT_REF
supabase db push

npm run seed:demo
npm run dev

Open http://localhost:3000.

See .env.example for the complete environment configuration. Never
expose server secrets through NEXT*PUBLIC*\* variables.

📁 Main Architecture Areas

src/
├── app/ # Customer, admin and API routes
├── components/ # Reusable UI components
├── lib/
│ ├── ai/ # AI extraction, scoring and grounding
│ ├── supabase/ # Database/auth clients
│ └── ...
└── ...

supabase/
└── migrations/ # Database schema, functions, RLS and triggers

The most important end-to-end scenario is:

Customer inquiry → AI qualification → priority decision → Zapier
automation → secure application callback → staff email notification.
