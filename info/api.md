# API Reference & Endpoints — Aura Apparel

## 1. Overview & General Conventions

All backend endpoints are hosted under `/api/*` and adhere to RESTful conventions.

- **Request & Response Body:** `application/json`
- **Authentication:** HTTP-only cookies (`aura_staff_token`, `aura_session`) containing signed JWT tokens.
- **Edge Rate Limiting:** Enforced via `middleware.ts`. When limits are exceeded, the API responds with HTTP `429 Too Many Requests`.

### Standard Error Schema
```json
{
  "error": "Descriptive human-readable error message",
  "code": "ERROR_MACHINE_CODE",
  "details": {}
}
```

---

## 2. Public Catalog & Discovery Endpoints

### `GET /api/products`
Retrieves products formatted with colors, available sizes, badges, and pricing.

**Query Parameters:**
- `category` *(optional, string)*: Filter by `OUTERWEAR`, `ESSENTIALS`, or `SUMMER_DROP`.
- `featured` *(optional, boolean)*: Set `true` to return editorial featured garments.

**Success Response (`200 OK`):**
```json
{
  "products": [
    {
      "id": "prod_cashmere_overcoat",
      "slug": "double-faced-cashmere-overcoat",
      "title": "Double-Faced Cashmere Overcoat",
      "subtitle": "Unstructured silhouette in 100% Mongolian cashmere",
      "price": 890.0,
      "category": "OUTERWEAR",
      "badge": "EXCLUSIVE",
      "details": [
        "100% Grade-A Mongolian Cashmere",
        "Hand-finished raw cut edges",
        "Horn button closures"
      ],
      "colors": [
        {
          "id": "col_obsidian",
          "name": "Obsidian Black",
          "hex": "#0D0D0D",
          "image": "/images/products/overcoat-black-1.webp",
          "secondaryImage": "/images/products/overcoat-black-2.webp"
        }
      ],
      "variants": [
        {
          "id": "var_oc_blk_m",
          "size": "M",
          "sku": "AURA-OC-BLK-M",
          "stock": 14
        }
      ]
    }
  ]
}
```

---

### `GET /api/search`
Debounced live search across title, subtitle, description, and luxury details.

**Query Parameters:**
- `q` *(required, string)*: Search keyword (e.g., `cashmere`, `linen`, `blazer`).
- `category` *(optional, string)*: Scopes search within a specific category.

**Success Response (`200 OK`):**
```json
{
  "results": [
    {
      "id": "prod_cashmere_overcoat",
      "title": "Double-Faced Cashmere Overcoat",
      "category": "OUTERWEAR",
      "price": 890.0,
      "matchScore": 0.94
    }
  ],
  "totalMatches": 1
}
```

---

## 3. Checkout & Payment Endpoints

### `POST /api/checkout/session`
Validates inventory, establishes a **10-minute atomic stock reservation**, and initializes a Stripe Checkout Session.

**Request Body:**
```json
{
  "items": [
    {
      "variantId": "var_oc_blk_m",
      "quantity": 1
    }
  ],
  "customerEmail": "patron@luxury.com",
  "currency": "USD"
}
```

**Success Response (`200 OK`):**
```json
{
  "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_sample123",
  "reservationId": "res_1727142000_89f3a",
  "expiresAt": "2026-09-24T05:35:00.000Z"
}
```

**Common Error Responses:**
- `400 Bad Request`: `{"error": "Cart is empty", "code": "EMPTY_CART"}`
- `409 Conflict`: `{"error": "Item out of stock or currently held by another patron", "code": "INSUFFICIENT_STOCK"}`

---

### `POST /api/webhooks/stripe`
Asynchronous listener for Stripe webhook lifecycle events. Validates Stripe signature header (`stripe-signature`).

**Key Events Processed:**
- `checkout.session.completed`: Marks reservation `COMMITTED`, reduces physical `stock` count, and creates an official `Order` record with status `PAID`.
- `payment_intent.payment_failed`: Releases the reserved stock back to the general pool immediately.

---

## 4. Customer & Authentication Endpoints

### `POST /api/auth/login`
Authenticates customers or staff. Issues an HTTP-Only secure JWT session cookie.

**Request Body:**
```json
{
  "email": "atelier.manager@aura-apparel.com",
  "password": "SecurePassword123!"
}
```

**Success Response (`200 OK`):**
```json
{
  "user": {
    "id": "usr_99812",
    "name": "Marco Rossi",
    "email": "atelier.manager@aura-apparel.com",
    "role": "MERCHANDISER"
  }
}
```

---

### `GET /api/auth/me`
Validates the current session token and returns identity and role privileges.

**Success Response (`200 OK`):**
```json
{
  "authenticated": true,
  "user": {
    "id": "usr_99812",
    "email": "atelier.manager@aura-apparel.com",
    "role": "MERCHANDISER"
  }
}
```

---

### `POST /api/auth/logout`
Clears session cookies (`aura_session`, `aura_staff_token`) and invalidates active server tokens.

---

## 5. Atelier Administration Endpoints

### `GET /api/admin/inventory`
Requires staff credentials (`MERCHANDISER`, `FULFILLMENT`, or `SUPER_ADMIN`).

**Success Response (`200 OK`):**
```json
{
  "inventory": [
    {
      "variantId": "var_oc_blk_m",
      "sku": "AURA-OC-BLK-M",
      "productTitle": "Double-Faced Cashmere Overcoat",
      "color": "Obsidian Black",
      "size": "M",
      "physicalStock": 20,
      "activeReservations": 2,
      "availableStock": 18,
      "warehouse": "MILAN_ATELIER"
    }
  ]
}
```

---

### `PATCH /api/admin/inventory`
Updates physical stock quantities directly.

**Request Body:**
```json
{
  "variantId": "var_oc_blk_m",
  "newStock": 25,
  "reason": "Restock shipment received from atelier"
}
```

**Success Response (`200 OK`):**
```json
{
  "success": true,
  "variantId": "var_oc_blk_m",
  "updatedStock": 25
}
```

---

## 6. System & Telemetry Endpoints

### `GET /api/health`
Health check for uptime monitors and container orchestration.

**Success Response (`200 OK`):**
```json
{
  "status": "healthy",
  "timestamp": "2026-09-24T05:25:00.000Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "stripe": "ready"
  },
  "version": "1.0.0"
}
```

---

### `POST /api/telemetry/vitals`
Captures browser Core Web Vitals (LCP, FID, CLS, INP) for real-time edge performance monitoring.
