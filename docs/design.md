# Design reference

Figma: https://www.figma.com/design/EJmBEzSZFHuiJtpVYsj7KB/Untitled (page "Website – Desktop").

## Tokens (also in `src/app/globals.css`)

| Token | Value | Use |
| --- | --- | --- |
| brown | #563324 | Primary buttons, header bars, footer |
| brown-light | #6E4636 | Hover on brown |
| terracotta | #A35339 | Eyebrow text, links, errors |
| terracotta-tint | #E6CFC4 | Error banners |
| sand / sand-tint | #D3C1AD / #D9CDBE | Selected states, info boxes |
| background | #E3E1DD | Page background |
| card | #EAE8E4 | Panels |
| field | #F3F1EE | Inputs |
| image | #D5D0C9 | Image placeholders |
| ink / muted | #0D0705 / #655F59 | Text |
| line | #C9C5BF | Borders, dividers |
| whatsapp | #25D366 | WhatsApp button only |

Type: Montserrat 600/700 for headings, prices and buttons; Open Sans 400/600 for body. Section titles 28 px bold on desktop, 22 px on phones. Radii: 2 (chips), 4 (inputs, buttons), 8 (panels), 27 (pills). Panel shadow `0 3px 22px rgb(15 15 15 / 7%)`.

## Screens (Figma frame names)

Storefront: D1 Home · D2 Category · D3 Product · D4 Cart · D5 Checkout · D6 MoMo payment · D7 Order confirmed · D10 Search · D11 Sign in · D12 My orders · D13 Track order · D14 Saved items · D15 Deals · D16 Help & contact (includes FAQ) · D17 Delivery & returns · D18 About · D20 Payment failed · D21 Empty bag · D22 Create account · D23 Forgot password · D24 Order detail · D25 Addresses · D26 Profile & password · D27 All products · D28 Search, no results · D29 404 · D30 Privacy · D31 Terms · D32 Categories menu open · D33 Added-to-bag drawer.

States: E1 Sign-in error · E2 Create-account errors · E3 Checkout validation · E4 Out of stock · E5 Cookie notice. WhatsApp chat open: D1b, D3b, D5b, D13b, D16b, D20b.

Admin: A01 Sign in · A02 Dashboard · A03 Orders · A04 Order detail · A05 Products · A06 Add product · A07 Categories · A08 Delivery quotes · A09 Banners & pages · A10 Promotions · A11 Customers · A12 Reports · A13 Settings.

Emails: M1 Order confirmed · M2 Delivery fee · M3 Reset password.

## Phone layout guidance (not drawn in Figma)
- Header: logo + search icon + bag on one row; the category bar becomes a slide-out menu.
- Product grids: 2 columns on phones, 3 on tablets, 5 on desktop.
- Product page: gallery first, then name, price, model picker; sticky "Add to cart" bar at the bottom.
- Checkout: one column; the order summary collapses into a "Show order summary · ₵450" bar at the top; sticky "Pay with Mobile Money" button.
- Admin: sidebar becomes a bottom tab bar (Dashboard, Orders, Quotes, Products, More); tables become cards.
