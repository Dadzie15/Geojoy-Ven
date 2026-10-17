# Decisions (from SRS v1.1, confirmed by the client on 13 Oct 2026)

These override anything older. Update this file when the client changes a decision.

| Area | Decision |
| --- | --- |
| Customers | Local customers in Ghana. Guest checkout allowed. |
| Delivery | Nationwide, no zones or fixed fees. After payment, the owner books a rider and sends the delivery fee by email and WhatsApp. The customer pays the fee to the rider on arrival. Free shop pickup is a "Could" feature. |
| Checkout fields | Full name, email (required), phone (required, for the rider), region (16 regions), city or town, area/street/landmark, GhanaPost GPS (optional), delivery notes. |
| Payments | Paystack, Mobile Money only (MTN MoMo, Telecel Cash, AirtelTigo Money). No cash on delivery. The MoMo number on the payment step is required. Unpaid orders cancel after 24 hours. |
| Accounts | Email + password for customers and admins. Phone optional on accounts. Admins also use a 2-step code (authenticator app or email). |
| Order statuses | Pending payment, Paid (needs a quote), Quote sent, Out for delivery, Delivered, Cancelled. |
| Notifications | Email (order confirmed, delivery fee, password reset) and WhatsApp. No SMS. Owner gets an email/WhatsApp alert for each new order. |
| Returns | 7 days for unused items in original packaging. Refunds to the paying MoMo number within 3 working days. |
| Support | WhatsApp 055 784 3743, Mon–Fri 9am–7pm, "Usually replies within 1 hour". |
| Brand | Logo Option B ("Home & joy": a roof over a smile). Montserrat + Open Sans. Brown, terracotta, sand palette. |
| Mobile | Figma shows desktop; every page is built responsive and phone-first from 360 px. |
| Categories menu | Header bar, "All categories" menu, phone menu and footer "Shop" column all list the active top-level categories from the database (admin-editable, in sort order). The menu's deal card shows the most popular on-sale product in the hovered category, else the most popular in the shop, and is hidden when nothing is on sale. Menu names are shown in sentence case. |
| Product page | The chosen model is kept in the URL (`?model=<SKU>`); default is the first in-stock model. Stock badge shows "In stock · N left" at 15 or fewer. "You may also like · More in {top-level category}" shows the most popular products from the product's top-level category (child categories such as Kettles often hold one product). Out-of-stock models stay selectable and offer "Notify me on WhatsApp when it's back". |
| Search | `/search?q=` matches product names with partial words and small typos (`search_products`), sorted by relevance by default; the query is trimmed and cut to 100 characters, and an empty query goes to All products. Filters (Category = top-level categories among the results, Price, Availability) open in the bottom sheet on all screen sizes; 20 results per page. "Related" chips are the results' top-level categories, then up to 3 popular products from those categories that are not already results (max 5). No results shows "Try" chips (the 4 most popular products), all categories and the 5 most popular products. Search pages are `noindex, follow`. |

## Still waiting on the client
- Real product photos
- Final product list and prices (several items in the sales list need confirming)
- Social media handles
- Approval of the Privacy policy and Terms wording
