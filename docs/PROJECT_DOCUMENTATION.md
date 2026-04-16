# ElectroHub Project Documentation

## Architecture
- `backend/`: Django + DRF API
- `frontend/`: React + TS storefront/admin-facing UI
- API base URL (dev): `http://127.0.0.1:8000/api`

## Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo
python manage.py createsuperuser
python manage.py runserver
```

## Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# set VITE_API_URL=http://127.0.0.1:8000/api
npm run dev
```

## Main API Modules
### Authentication
- `POST /auth/register/`
- `POST /auth/login/`
- `POST /auth/token/refresh/`
- `GET/PATCH /auth/me/`
- `POST /auth/forgot-password/`
- `POST /auth/reset-password/`
- `POST /auth/google/`

### Catalog
- `GET /products/` (search/filter/sort/pagination)
- `GET /products/{id-or-slug}/`
- `GET /products/featured/`
- `GET /products/categories/`
- `GET /categories/`, `GET /brands/`
- `GET /homepage-sections/`

### Cart
- `GET /cart/`
- `POST /cart/`
- `POST /cart/set-quantity/`
- `POST /cart/remove/`
- `DELETE /cart/clear/`
- `POST /cart/merge/`

### Orders & Checkout
- `POST /orders/checkout/`
- `POST /orders/coupon-preview/`
- `GET /orders/`
- `GET /orders/{order_number}/`
- `GET /orders/{order_number}/track/`

### Reviews
- `GET /products/{id-or-slug}/reviews/`
- `POST /products/{id-or-slug}/reviews/`
- `GET /products/{id-or-slug}/reviews/eligibility/`

### Site/CMS
- `GET /site/settings/`
- `GET /pages/`, `GET /pages/{slug}/`

## Admin Modules
- **Site settings (singleton):** branding, hero/promo content, theme colors, SEO, currency/rate
- **Email settings (singleton):** SMTP configuration
- **Catalog:** products/categories/brands/images/homepage sections
- **Orders:** order status, coupon management, shipping zones
- **Payments:** COD state tracking
- **Reviews:** moderation and lookup
- **Users:** profiles, notifications, wishlist entries

## Dynamic Features
- Homepage hero/promo text/image/CTA from admin
- Shipping charges resolved by `country + city` (shipping zones)
- Coupons (percent/fixed with min subtotal, validity, usage limits)
- Currency display switching USD/BDT with configurable exchange rate

## Testing Guide (Quick)
1. Login via `/auth/login/`.
2. Fetch `/products/`.
3. Add product to `/cart/`.
4. Call `/orders/coupon-preview/`.
5. Place order with `/orders/checkout/`.
6. Set order to `Delivered` in admin.
7. Submit review via `/products/{slug}/reviews/`.

## Useful References
- Legacy API summary: `backend/API.md`
- Backend setup notes: `backend/README.md`
