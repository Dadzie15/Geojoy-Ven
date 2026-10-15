# CLAUDE.md: rules for building the GeoJoy Ventures store

Read this file, `docs/decisions.md` and `docs/design.md` before writing code.

## Product in one paragraph
An online store for a Ghanaian household and kitchen goods shop. Customers pay for items online with Mobile Money (Paystack). Delivery is anywhere in Ghana: after an order is paid, the owner books a rider, sends the delivery fee by email and WhatsApp, and the customer pays that fee to the rider on arrival. The owner is not technical, so every day-to-day change (products, prices, stock, orders, delivery quotes, banners, promotions) must be possible from the admin panel.

## Stack
Next.js 15 App Router, TypeScript (strict), Tailwind CSS 4 (tokens in `src/app/globals.css`), Supabase (Postgres, Auth, Storage) via `@supabase/ssr`, Paystack, Resend, deployed on Vercel.

## Non-negotiable rules
1. **Mobile first.** Build every page for a 360 px wide phone first, then scale up (sm, md, lg, xl). The Figma file shows desktop only; derive the phone layout from it: one column, a bottom-anchored or sticky "Add to cart" / "Pay" button, a slide-out menu for categories, filters in a bottom sheet. Tap targets at least 44 px. Test at 360, 768 and 1440 px before calling a page done.
2. **Use the design tokens.** Colours, fonts, radii and shadows come from `globals.css` (`bg-brown`, `text-muted`, `rounded-panel`, `shadow-panel`, `font-heading`). No raw hex values in components.
3. **Content sits on card panels** (`bg-card rounded-panel shadow-panel p-6 sm:p-8`) on the `bg-background` page, like the Figma screens. Sentence case for all text. One primary button per section.
4. **Money is Ghana cedis**, shown as `₵1,250`. Store amounts as `numeric(10,2)`; never use floats for totals. Paystack amounts are in pesewas (× 100).
5. **Payment truth comes from the server.** Never mark an order paid from the browser. Verify with Paystack's API (or a signed webhook) on the server, then update the order with the service role key.
6. **The online total is items only.** Delivery fee is never charged online. Show it as "Sent after you order" until a quote exists.
7. **Accounts are email + password.** Phone is optional on accounts but **required at checkout** (the rider calls it). Validate Ghana numbers: 10 digits starting 02 or 05 (or +233 + 9 digits).
8. **Secrets stay on the server.** Only `NEXT_PUBLIC_*` variables may reach the browser. Never log keys or full card/wallet details.
9. **Accessible by default.** Real `<button>` and `<a>` elements, labels on every input, alt text on product images, visible focus, colour contrast at least 4.5:1 for body text.
10. **Fast on mobile data.** Use `next/image` with sizes, lazy-load below the fold, keep each page's JavaScript small, prefer Server Components.
11. **Every page has a title and description** (Next.js `metadata`) for Google.

## Error and empty states to always build
Form field errors in terracotta under the field, a summary banner at the top of long forms, out-of-stock products (button disabled, "Notify me on WhatsApp"), empty bag, no search results, payment failed (retry), 404.

## WhatsApp
Number `233557843743`, hours Mon–Fri 9am–7pm, "Usually replies within 1 hour". The floating chat button appears ONLY on: Home, Product, Checkout, Payment failed, Track order, Help & contact. Links use `https://wa.me/233557843743?text=<url-encoded message>`.

## Before you finish any task
- `npm run lint && npm run typecheck && npm run build` pass.
- The page works at 360 px wide with no horizontal scroll.
- No hard-coded colours, no secrets in client code.
- Update `docs/decisions.md` if a decision changed.
