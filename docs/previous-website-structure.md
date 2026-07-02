# Previous Website Structure Snapshot

Saved before the MatthewOS restructuring.

Reference commit before this change:

`f9ff6af Include imported calendar in daily events`

## Public Pages

- `/` public home page with professional/private dashboard positioning
- `/about`
- `/resume`
- `/gallery`
- `/contact`
- `/dashboard/login`
- `/dashboard`

## Dashboard

- Password-cookie middleware protected `/dashboard`
- Editable dashboard component at `components/EditableDashboard.tsx`
- R2-backed dashboard state through `/api/dashboard-data`
- R2-backed gallery through `/api/gallery`
- Apple Calendar feed through `/api/calendar`

## Revert Note

To inspect the exact old structure:

```bash
git show f9ff6af:components/EditableDashboard.tsx
git show f9ff6af:app/page.tsx
git show f9ff6af:app/dashboard/page.tsx
```
