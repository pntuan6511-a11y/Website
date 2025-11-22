Updates made on schema and admin UI

- Prisma schema updated:
  - Added optional `tag Int?` to `Car` model.
  - Added optional `status Int?` to `TestDrive` and `PriceQuote` models.
  - `CarImage.imageType` comment updated to allow multiple `banner` images for site banner management.

- New files:
  - `src/lib/constants.ts` — contains Tag and status constants and labels.
  - `src/components/Icons.tsx` — shared SVG React components for common icons.

Developer action required:

1. Generate and run a Prisma migration to apply schema changes:

```bash
cd prisma
npm run prisma:migrate dev -- --name add-tags-and-status
```

Or use your existing migration flow. After migration, restart the app.

2. The admin car create/edit pages now include a `Tag` dropdown and the banner upload UI was removed. Website banner images should be uploaded via the CarImage gallery with `imageType = 'banner'` using the existing `/api/car-images` endpoints or a new gallery admin page you may add.
