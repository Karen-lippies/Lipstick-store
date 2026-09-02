# Karen Beauty

Luxury beauty e-commerce website built with **Next.js 14 + TypeScript + Tailwind CSS**.

## Live site

https://karen-lippies.github.io/Lipstick-store/

## This is the built static output

The root of this repo contains the **static export** (`out/` from `next build --output export`).
The Next.js app source lives in the `karen-beauty/` project folder (not tracked here).

## Routes

- `/` — Homepage
- `/products` — Product listing (filters, sort, pagination)
- `/products/[id]` — Product detail
- `/cart` — Shopping bag (coupons: `KAREN10`, `BEAUTY20`, `GLOW15`)
- `/checkout` — Multi-step checkout
- `/order-confirmation` — Order confirmation
- `/account` — Account / login / register / orders / wishlist

## Backend

All API calls are placeholders in `karen-beauty/src/lib/api.ts` returning mock data.
Replace them with your Supabase (`NEXT_PUBLIC_API_URL`) endpoints to go live.
