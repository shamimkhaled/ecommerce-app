# ElectroHub API

Base URL: `http://127.0.0.1:8000/api` (development)

All JSON responses use UTF-8. Decimal amounts are returned as JSON numbers or strings depending on the serializer context; the React client normalizes them to numbers.

## Authentication (JWT)

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| POST | `/auth/register/` | No | `{"name","email","password"}` | `201` User profile |
| POST | `/auth/login/` | No | `{"email","password"}` | `200` `access`, `refresh`, `user` |
| POST | `/auth/token/refresh/` | No | `{"refresh"}` | `200` `access` |
| POST | `/auth/logout/` | Yes | — | `200` (client discards tokens) |
| GET/PATCH | `/auth/me/` | Yes | — / partial profile | Current user |

**Example login**

```http
POST /api/auth/login/
Content-Type: application/json

{"email":"demo@example.com","password":"demo12345"}
```

```json
{
  "access": "<jwt>",
  "refresh": "<jwt>",
  "user": {
    "id": "1",
    "name": "Demo User",
    "email": "demo@example.com",
    "role": "user",
    "avatar": ""
  }
}
```

Use header `Authorization: Bearer <access>` on protected routes.

## Products & catalog

| Method | Path | Description |
|--------|------|-------------|
| GET | `/products/` | Paginated list. Query: `search`, `category` (name or slug), `brand` (comma-separated names), `price_min`, `price_max`, `ordering` (`price`, `-price`, `-created_at`, `latest`, `rating`, `-popularity`), `featured`, `trending`, `page`, `page_size` |
| GET | `/products/{id-or-slug}/` | Detail by numeric `id` or `slug` |
| GET | `/products/featured/` | Up to 12 featured products (no pagination) |
| GET | `/products/categories/` | `{ "results": [...], "names": ["All", ...] }` |
| GET | `/categories/` | List categories |
| GET | `/categories/{slug}/` | Category detail |
| GET | `/brands/` | List brands |
| GET | `/brands/{slug}/` | Brand detail |
| GET | `/homepage-sections/` | Curated sections (admin-driven) |
| GET | `/homepage-sections/{key}/` | Section by key (e.g. `featured`) |

**Product JSON shape (frontend-aligned)**

- `id` (string), `name`, `slug`, `description`, `price`, `discount` (%), `stock`
- `category`, `brand` (display names)
- `image` (primary URL), `images` (gallery URLs)
- `rating`, `reviewsCount`, `specs` (object), `isFeatured`

## Cart

Guest carts use the `X-Cart-Token` response header (UUID). Send it back on later requests as `X-Cart-Token: <uuid>` until the user logs in.

| Method | Path | Body | Notes |
|--------|------|------|--------|
| GET | `/cart/` | — | Empty list if guest and no token yet |
| POST | `/cart/` | `{"product_id": number, "quantity": number}` | Adds or increments line |
| POST | `/cart/set-quantity/` | `{"product_id", "quantity"}` | `quantity < 1` removes line |
| POST | `/cart/remove/` | `{"product_id"}` | |
| DELETE | `/cart/clear/` | — | |
| POST | `/cart/merge/` | `{"guest_token"}` | **Auth required** — merges guest cart into user cart |

Response body: `{"guest_token": "<uuid>|null", "items": [<product-shaped line + quantity>]}`.

## Orders & checkout

| Method | Path | Auth | Body |
|--------|------|------|------|
| POST | `/orders/checkout/` | Yes | See below |
| GET | `/orders/` | Yes | Order history |
| GET | `/orders/{order_number}/` | Yes | Detail + payment summary |
| GET | `/orders/{order_number}/track/` | Same as detail |

**Checkout body**

```json
{
  "shipping": {
    "first_name": "John",
    "last_name": "Doe",
    "address_line1": "123 Tech St",
    "city": "San Francisco",
    "postal_code": "94103",
    "country": "US"
  },
  "payment_method": "cod"
}
```

Totals: shipping `$0` if subtotal `> 500`, else `$25`; tax `8%` (matches the React checkout UI). A `Payment` row is created with method `cod` and status `pending`.

**Order list item**

- `id` (order number), `date` (`YYYY-MM-DD`), `status` (display label e.g. `Pending`, `Processing`), `total`, `items[]` with `name`, `quantity`, `price`, `image`

## Reviews

| Method | Path | Auth |
|--------|------|------|
| GET | `/products/{id-or-slug}/reviews/` | No (approved only) |
| POST | `/products/{id-or-slug}/reviews/` | Yes — body `{"rating": 1-5, "comment"}` |

POST is allowed only if the user has a **delivered** order line for that product. Duplicate `(user, product)` reviews are rejected. New reviews are `is_approved=false` until staff approves them in Django Admin.

## Admin

- URL: `/admin/`
- Manage products, images (inline), categories, brands, homepage sections, users, carts, orders (status), shipping, payments, reviews (moderation).

## Error format

DRF typically returns `{"detail": "..."}` or field errors as lists.
