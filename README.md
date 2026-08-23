This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Property data and MongoDB

The real-estate experience uses a `properties` MongoDB collection. Copy `.env.example` to `.env.local`, set your connection values, and seed the collection:

```bash
npm run db:seed
```

The seed creates schema validation plus unique indexes for `listingId` and `slug`, a geospatial index for `location.geo`, and a compound search index. The application uses the bundled English seed document when MongoDB is not configured, so the UI remains available during local setup.

The same seed also creates the validated `users` collection and upserts the initial admin account from `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`. Passwords are stored only as bcrypt hashes. Set `AUTH_SECRET` to a random value of at least 32 characters before starting the application.

You can generate the authentication secret with `npx auth secret`, then set the initial admin values in `.env.local` before running the seed.

Useful routes:

- `/` — home page and Google Maps property explorer
- `/listings` — searchable property results
- `/properties/modern-villa-lavasan-130` — property detail page
- `/api/properties?type=villa&city=Lavasan&q=130` — JSON property search
- `/login` — secure NextAuth credentials login
- `/admin` — protected management dashboard
- `/admin/properties` — property CRUD panel

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
