# ElectroHub Django API

## Setup

1. **Python 3.11+** recommended (tested with Django 6.x).

2. Create and activate a virtual environment, then install dependencies:

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Apply migrations and seed demo products:

```bash
python manage.py migrate
python manage.py seed_demo
```

4. Create an admin user (email-based accounts):

```bash
python manage.py createsuperuser
```

5. Optional: demo customer (after migrations):

```bash
python manage.py shell -c "from apps.users.models import User; User.objects.create_user(email='demo@example.com', name='Demo', password='demo12345')"
```

6. Run the server:

```bash
python manage.py runserver 0.0.0.0:8000
```

7. **Environment variables** (optional):

| Variable | Purpose |
|----------|---------|
| `DJANGO_SECRET_KEY` | Production secret key |
| `DJANGO_DEBUG` | `false` in production |
| `DJANGO_ALLOWED_HOSTS` | Comma-separated hosts |
| `CORS_ALLOWED_ORIGINS` | Comma-separated origins (e.g. `http://localhost:3000`) |
| `JWT_ACCESS_MINUTES` | Access token lifetime |
| `JWT_REFRESH_DAYS` | Refresh token lifetime |

## Connecting the React app

1. Copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL=http://127.0.0.1:8000/api` (or your server URL).

2. Ensure `CORS_ALLOWED_ORIGINS` includes your Vite dev origin (default includes `http://localhost:3000` and `http://localhost:5173`).

3. Start the frontend (`npm run dev` in `frontend/`). Login, catalog, cart, checkout, and orders use the API automatically.

## Postman / Insomnia workflow

1. **Register** `POST /api/auth/register/` or use the demo user.
2. **Login** `POST /api/auth/login/` — copy `access` into the Bearer token.
3. **List products** `GET /api/products/`.
4. **Cart** `POST /api/cart/` with body `{"product_id":1,"quantity":1}` — copy `X-Cart-Token` from response headers for guest flows.
5. **Checkout** `POST /api/orders/checkout/` with shipping JSON (requires Bearer token).

See [API.md](./API.md) for the full endpoint reference.

## PostgreSQL

SQLite is the default. For PostgreSQL, set `DATABASES` in `config/settings.py` (a commented example is included) or override via `dj-database-url` in your own deployment configuration.
