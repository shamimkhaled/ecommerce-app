# Ecommerce Project Full Details Report

## 1) Project Overview
- **Project name:** ElectroHub Ecommerce Platform
- **Architecture:** Full-stack monorepo (`frontend` React + `backend` Django/DRF)
- **Primary goal:** Dynamic, admin-managed ecommerce platform with API-first integration
- **Current state:** Core commerce, auth, cart, checkout, reviews, coupons, shipping zones, site settings, and CMS are implemented

## 2) Tech Stack
- **Frontend:** React, TypeScript, Vite, Axios, Tailwind CSS
- **Backend:** Django 6, Django REST Framework, SimpleJWT
- **Database:** SQLite (development), designed for PostgreSQL migration
- **Media:** Django media storage via `ImageField`
- **Admin:** Django Admin with grouped fieldsets and singleton settings modules

## 3) Core Business Modules
- **Users/Auth:** register, login, JWT refresh, profile, forgot/reset password, Google login
- **Catalog:** products, categories, brands, product images, featured/trending logic
- **Cart:** guest token cart + authenticated cart + merge flow
- **Orders/Checkout:** checkout from cart, shipping address, order history, order tracking
- **Payments:** COD model with status lifecycle
- **Reviews:** delivered-order verification, duplicate prevention, rating/comment
- **Site Config/CMS:** dynamic branding, hero/promo content, theme colors, SEO, pages
- **Commerce Controls:** coupons, shipping zones, multi-currency (USD/BDT conversion)

## 4) Data Model Summary
- **Auth/User domain:** `users_user`, `users_wishlistitem`, `users_notification`
- **Catalog domain:** `catalog_category`, `catalog_brand`, `catalog_product`, `catalog_productimage`, `catalog_homepagesection`
- **Commerce domain:** `cart_cart`, `cart_cartitem`, `orders_order`, `orders_orderitem`, `orders_shippingaddress`, `payments_payment`, `orders_coupon`, `orders_shippingzone`
- **Feedback domain:** `reviews_review`
- **Configuration domain:** `siteconfig_sitesetting`, `siteconfig_emailsetting`, `siteconfig_cmspage`

## 5) Functional Highlights
- **Dynamic homepage content** from `SiteSetting` (hero and promo content + images + CTA links)
- **Dynamic shipping by area** using `ShippingZone` (`country` + optional `city`)
- **Coupon system** with validation rules (time windows, limits, thresholds)
- **Currency support** for USD and BDT with configurable exchange rate
- **Admin-first control** for content and storefront behavior

## 6) Security and Validation
- JWT-protected endpoints for user actions and checkout
- Delivered-only review eligibility checks
- Server-side coupon validation and shipping rule resolution
- Input validation via DRF serializers and form/model constraints

## 7) Performance/Scalability Notes
- Query optimization with `select_related` / `prefetch_related`
- Indexed lookup fields (`slug`, `status`, FK combinations)
- Pagination and filter support for product listing
- Architecture supports migration to PostgreSQL and external media storage

## 8) Deployment Readiness Checklist
- [ ] Set production `DJANGO_SECRET_KEY`
- [ ] Disable `DEBUG`
- [ ] Configure production DB (PostgreSQL)
- [ ] Configure media/static hosting (S3/CDN optional)
- [ ] Configure SMTP in `EmailSetting`
- [ ] Restrict CORS and ALLOWED_HOSTS
- [ ] Add backup/monitoring and CI checks

## 9) Deliverables Added
- Draw.io schema: `docs/ecommerce_database_schema.drawio`
- Full report: `docs/PROJECT_DETAILS_REPORT.md`
- Project/API docs: `docs/PROJECT_DOCUMENTATION.md`
- Postman collection: `postman/ElectroHub_API.postman_collection.json`
