# Build plan

Build in this order. Each phase ends with a working site you can show the client. Give Claude Code one phase at a time; paste the prompt, review the result on a phone-sized window, then commit.

Every prompt assumes Claude Code has read `CLAUDE.md`, `docs/decisions.md` and `docs/design.md`.

---

## Phase 1: Foundations
**Prompt**
> Read CLAUDE.md, docs/decisions.md and docs/design.md. Build the shared layout: Header (utility bar, logo, search, sign in, saved, bag with count; category bar that becomes a slide-out menu under 768 px), Footer (brand text, "We accept" MoMo badges, Shop/Help/About/Follow us columns, copyright), and the floating WhatsApp button component (only rendered on the pages listed in CLAUDE.md). Build the UI kit in `src/components/ui`: Button (primary, secondary, light, whatsapp; default, hover, focus, disabled), Input with label, helper and error text, Select, Checkbox, Badge, Panel, ProductCard, SectionHeader. Make all of it phone-first and test at 360, 768 and 1440 px.

**Done when** the header, footer and UI kit render on a `/kit` page at all three widths with no horizontal scroll.

## Phase 2: Catalogue
**Prompt**
> Using the Supabase schema in supabase/migrations, build: Home (hero banner from `banners`, trust strip, shop by category, product sections), Category page with filters (bottom sheet on phones) and sort, Product page (gallery, model picker from `product_variants`, stock state, out-of-stock "Notify me on WhatsApp", related products, sticky add-to-cart bar on phones), All products, Search with a no-results state, and 404. Read data with Server Components. Add metadata (title, description) to every page. Seed the database with the products in `docs/seed-products.csv` if it exists.

**Done when** a visitor can browse and search on a phone and every product page loads fast.

## Phase 3: Bag and checkout
**Prompt**
> Build the bag (stored in a cookie for guests, merged into the account on sign-in), the added-to-bag drawer, the Cart page and the Checkout page with the fields in docs/decisions.md and the "How delivery works" box. Validate with zod on the server and show field errors plus a summary banner. The online total is items only; the delivery fee shows as "Sent after you order". On submit, create the order and its items with status pending_payment.

**Done when** a guest can reach the payment step on a phone with valid and invalid inputs handled.

## Phase 4: Mobile Money payment
**Prompt**
> Integrate Paystack in test mode for Mobile Money (MTN, Telecel, AirtelTigo). Initialise the transaction on the server with the amount in pesewas and the order reference. Verify on the server (callback + signed webhook at /api/paystack/webhook) before setting the order to paid. Build the Payment step (network picker, MoMo number, "check your phone" state), Payment failed (retry), and Order confirmed pages. Add a scheduled job or cron route that cancels orders unpaid after 24 hours.

**Done when** a test payment marks the order paid only after server verification, and a failed payment can be retried.

## Phase 5: Emails and accounts
**Prompt**
> Add Supabase email + password auth: Sign in (with error states and lockout message), Create account, Forgot password (code by email), My account (orders, order detail with tracker, saved items, addresses, profile & password). Add Track order by order number + email for guests. Send emails with Resend using React Email templates matching docs/design.md: Order confirmed, Delivery fee, Password reset. Email the owner on every new paid order.

**Done when** a customer receives each email and can sign in, reset a password and see their orders.

## Phase 6: Admin panel
**Prompt**
> Build the admin panel at /admin, available only to profiles with role staff or owner, with 2-step sign-in. Pages: Dashboard (today's orders and sales, "orders needing a delivery quote", low stock), Orders and Order detail (status changes, delivery slip), Delivery quotes (list of paid orders waiting; form for fee, rider, rider phone, expected date; message preview; send by email and WhatsApp link; moves order to quote_sent), Products and Add/Edit product (variants, stock, photos uploaded to Supabase Storage and compressed), Categories, Banners & pages, Promotions (promo codes), Customers, Reports, Settings (WhatsApp number, hours, staff). On phones the sidebar becomes a bottom tab bar and tables become cards. Every form must be usable by a non-technical owner.

**Done when** the owner can add a product, handle an order from paid to delivered and send a quote from his phone.

## Phase 7: Launch checks
**Prompt**
> Run a launch review: Lighthouse on Home, Product and Checkout on mobile (aim for 90+ performance, accessibility, SEO); fix issues. Check every page at 360 px, keyboard navigation, alt text, contrast. Add sitemap.xml, robots.txt, Open Graph images, the cookie notice, Privacy and Terms pages. Confirm no secret keys reach the browser. Switch Paystack to live keys only after the client approves.

**Done when** the review passes and the client signs off.
