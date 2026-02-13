# NexaProperty API Documentation

Complete API reference for frontend integration.

**Base URL**: `http://localhost:8000/api/v1/`

**API Documentation**: 
- Swagger UI: http://localhost:8000/api/docs/
- ReDoc: http://localhost:8000/api/redoc/

---

## Table of Contents

1. [Authentication (JWT)](#authentication-jwt)
2. [Auth API (Token Endpoints)](#auth-api-token-endpoints)
3. [Common Patterns](#common-patterns)
3. [Owners API](#owners-api)
4. [Locations API](#locations-api)
5. [Properties API](#properties-api)
6. [Units API](#units-api)
7. [Tenants API](#tenants-api)
8. [Tenancies API](#tenancies-api)
9. [Billing API](#billing-api)
10. [Payments API](#payments-api)
11. [Notifications API](#notifications-api)
12. [Workflows](#workflows)
13. [Error Handling](#error-handling)

---

## Authentication (JWT)

The API uses **JWT (JSON Web Tokens)**. All protected endpoints require the `Authorization` header with a valid access token.

### Flow

1. **Obtain tokens**: `POST /api/v1/auth/token/` with `username` and `password`.
2. **Use access token**: Send `Authorization: Bearer <access_token>` on every request.
3. **Refresh when expired**: `POST /api/v1/auth/token/refresh/` with `refresh` token to get a new access token.

### Headers

```javascript
headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + accessToken
}
```

### Token Lifetimes

- **Access token**: 60 minutes (use for API calls).
- **Refresh token**: 7 days (use to get a new access token without re-login).

### Example (JavaScript)

```javascript
// 1. Login – get tokens
const loginRes = await fetch('http://localhost:8000/api/v1/auth/token/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin123' })
});
const { access, refresh } = await loginRes.json();

// 2. Call API with access token
const res = await fetch('http://localhost:8000/api/v1/owners/', {
  headers: { 'Authorization': `Bearer ${access}` }
});

// 3. When access expires – refresh
const refreshRes = await fetch('http://localhost:8000/api/v1/auth/token/refresh/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refresh })
});
const { access: newAccess } = await refreshRes.json();
```

---

## Auth API (Token Endpoints)

### Obtain Token (Login)

```http
POST /api/v1/auth/token/
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:** `200 OK`
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `401 Unauthorized`: Invalid credentials.

---

### Refresh Token

```http
POST /api/v1/auth/token/refresh/
Content-Type: application/json
```

**Request Body:**
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Verify Token

```http
POST /api/v1/auth/token/verify/
Content-Type: application/json
```

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK` – empty body if valid.

**Response:** `401 Unauthorized` – if token is invalid or expired.

---

## Common Patterns

### Pagination

All list endpoints support pagination:

```javascript
GET /api/v1/owners/?page=1&page_size=20
```

**Response:**
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/v1/owners/?page=2",
  "previous": null,
  "results": [...]
}
```

### Filtering

Most endpoints support filtering:

```javascript
GET /api/v1/properties/?owner=1&property_type=residential
GET /api/v1/units/?status=vacant&property=5
GET /api/v1/bills/?status=unpaid&billing_period=2026-02
```

### Searching

Search across multiple fields:

```javascript
GET /api/v1/tenants/?search=john
// Searches: full_name, phone, email, id_number
```

### Ordering

```javascript
GET /api/v1/properties/?ordering=-created_at  // Descending
GET /api/v1/properties/?ordering=property_name  // Ascending
```

---

## Owners API

### List Owners

```http
GET /api/v1/owners/
```

**Query Parameters:**
- `owner_type` (optional): `individual` | `company`
- `search` (optional): Search in name, email, phone, contact_person
- `ordering` (optional): `name`, `-created_at`, etc.

**Response:**
```json
{
  "count": 10,
  "results": [
    {
      "id": 1,
      "owner_type": "individual",
      "name": "John Doe",
      "contact_person": "",
      "phone": "+1234567890",
      "email": "john@example.com",
      "address": "123 Main St",
      "created_at": "2026-02-13T10:00:00Z",
      "updated_at": "2026-02-13T10:00:00Z"
    }
  ]
}
```

### Create Owner

```http
POST /api/v1/owners/
Content-Type: application/json
```

**Request Body:**
```json
{
  "owner_type": "company",
  "name": "ABC Real Estate",
  "contact_person": "Jane Smith",
  "phone": "+1234567890",
  "email": "info@abcrealestate.com",
  "address": "456 Business Ave"
}
```

**Response:** `201 Created`
```json
{
  "id": 2,
  "owner_type": "company",
  "name": "ABC Real Estate",
  "contact_person": "Jane Smith",
  "phone": "+1234567890",
  "email": "info@abcrealestate.com",
  "address": "456 Business Ave",
  "created_at": "2026-02-13T10:05:00Z",
  "updated_at": "2026-02-13T10:05:00Z"
}
```

### Get Owner Details

```http
GET /api/v1/owners/{id}/
```

### Update Owner

```http
PUT /api/v1/owners/{id}/
PATCH /api/v1/owners/{id}/
```

### Delete Owner

```http
DELETE /api/v1/owners/{id}/
```

---

## Locations API

### List Locations

```http
GET /api/v1/locations/
```

**Query Parameters:**
- `country` (optional)
- `city` (optional)
- `region` (optional)
- `search` (optional): Search in country, city, region, area
- `ordering` (optional): `country`, `city`, etc.

**Response:**
```json
{
  "results": [
    {
      "id": 1,
      "country": "USA",
      "region": "California",
      "city": "Los Angeles",
      "area": "Downtown",
      "created_at": "2026-02-13T10:00:00Z",
      "updated_at": "2026-02-13T10:00:00Z"
    }
  ]
}
```

### Create Location

```http
POST /api/v1/locations/
```

**Request Body:**
```json
{
  "country": "USA",
  "region": "California",
  "city": "San Francisco",
  "area": "Mission District"
}
```

### CRUD Operations

- `GET /api/v1/locations/{id}/` - Get details
- `PUT /api/v1/locations/{id}/` - Full update
- `PATCH /api/v1/locations/{id}/` - Partial update
- `DELETE /api/v1/locations/{id}/` - Delete

---

## Properties API

### List Properties

```http
GET /api/v1/properties/
```

**Query Parameters:**
- `owner` (optional): Filter by owner ID
- `property_type` (optional): `residential` | `commercial` | `mixed`
- `location` (optional): Filter by location ID
- `search` (optional): Search in property_name, address, description
- `ordering` (optional): `property_name`, `-created_at`

**Response:**
```json
{
  "results": [
    {
      "id": 1,
      "owner": 1,
      "owner_name": "John Doe",
      "location": 1,
      "location_display": "Downtown, Los Angeles, California, USA",
      "property_name": "Sunset Apartments",
      "property_type": "residential",
      "address": "789 Sunset Blvd",
      "description": "Modern apartment complex",
      "created_at": "2026-02-13T10:00:00Z",
      "updated_at": "2026-02-13T10:00:00Z"
    }
  ]
}
```

### Create Property

```http
POST /api/v1/properties/
```

**Request Body:**
```json
{
  "owner": 1,
  "location": 1,
  "property_name": "Sunset Apartments",
  "property_type": "residential",
  "address": "789 Sunset Blvd",
  "description": "Modern apartment complex"
}
```

### CRUD Operations

- `GET /api/v1/properties/{id}/` - Get details
- `PUT /api/v1/properties/{id}/` - Full update
- `PATCH /api/v1/properties/{id}/` - Partial update
- `DELETE /api/v1/properties/{id}/` - Delete

---

## Units API

### List Units

```http
GET /api/v1/units/
```

**Query Parameters:**
- `property` (optional): Filter by property ID
- `unit_type` (optional): `apartment` | `studio` | `office` | `shop` | `warehouse` | `other`
- `status` (optional): `vacant` | `occupied` | `maintenance`
- `search` (optional): Search in unit_number, floor
- `ordering` (optional): `unit_number`, `rent_amount`, `-created_at`

**Response:**
```json
{
  "results": [
    {
      "id": 1,
      "property": 1,
      "property_name": "Sunset Apartments",
      "unit_number": "101",
      "floor": "1",
      "unit_type": "apartment",
      "rent_amount": "1500.00",
      "deposit_amount": "1500.00",
      "status": "vacant",
      "created_at": "2026-02-13T10:00:00Z",
      "updated_at": "2026-02-13T10:00:00Z"
    }
  ]
}
```

### Create Unit

```http
POST /api/v1/units/
```

**Request Body:**
```json
{
  "property": 1,
  "unit_number": "101",
  "floor": "1",
  "unit_type": "apartment",
  "rent_amount": "1500.00",
  "deposit_amount": "1500.00",
  "status": "vacant"
}
```

### CRUD Operations

- `GET /api/v1/units/{id}/` - Get details
- `PUT /api/v1/units/{id}/` - Full update
- `PATCH /api/v1/units/{id}/` - Partial update
- `DELETE /api/v1/units/{id}/` - Delete

---

## Tenants API

### List Tenants

```http
GET /api/v1/tenants/
```

**Query Parameters:**
- `search` (optional): Search in full_name, phone, email, id_number
- `ordering` (optional): `full_name`, `-created_at`

**Response:**
```json
{
  "results": [
    {
      "id": 1,
      "full_name": "Alice Johnson",
      "phone": "+1987654321",
      "email": "alice@example.com",
      "id_number": "ID123456",
      "emergency_contact": "Bob Johnson +1987654322",
      "created_at": "2026-02-13T10:00:00Z",
      "updated_at": "2026-02-13T10:00:00Z"
    }
  ]
}
```

### Create Tenant

```http
POST /api/v1/tenants/
```

**Request Body:**
```json
{
  "full_name": "Alice Johnson",
  "phone": "+1987654321",
  "email": "alice@example.com",
  "id_number": "ID123456",
  "emergency_contact": "Bob Johnson +1987654322"
}
```

### CRUD Operations

- `GET /api/v1/tenants/{id}/` - Get details
- `PUT /api/v1/tenants/{id}/` - Full update
- `PATCH /api/v1/tenants/{id}/` - Partial update
- `DELETE /api/v1/tenants/{id}/` - Delete

---

## Tenancies API

### List Tenancies

```http
GET /api/v1/tenancies/
```

**Query Parameters:**
- `tenant` (optional): Filter by tenant ID
- `unit` (optional): Filter by unit ID
- `status` (optional): `active` | `completed` | `terminated`
- `search` (optional): Search in tenant name, unit number
- `ordering` (optional): `move_in_date`, `-created_at`

**Response:**
```json
{
  "results": [
    {
      "id": 1,
      "tenant": 1,
      "tenant_name": "Alice Johnson",
      "unit": 1,
      "unit_number": "101",
      "property_name": "Sunset Apartments",
      "move_in_date": "2026-01-01",
      "move_out_date": null,
      "rent_amount": "1500.00",
      "deposit_amount": "1500.00",
      "contract_start": "2026-01-01",
      "contract_end": "2026-12-31",
      "status": "active",
      "created_at": "2026-02-13T10:00:00Z",
      "updated_at": "2026-02-13T10:00:00Z"
    }
  ]
}
```

### Create Tenancy (Move-In)

```http
POST /api/v1/tenancies/
```

**Request Body:**
```json
{
  "tenant": 1,
  "unit": 1,
  "move_in_date": "2026-01-01",
  "rent_amount": "1500.00",
  "deposit_amount": "1500.00",
  "contract_start": "2026-01-01",
  "contract_end": "2026-12-31",
  "status": "active"
}
```

**Note:** Creating a tenancy automatically:
- Marks the unit as `occupied`
- Generates the first bill for the current month

### Move-Out Tenant

```http
PUT /api/v1/tenancies/{id}/move-out/
```

**Request Body:**
```json
{
  "move_out_date": "2026-02-13"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "tenant": 1,
  "unit": 1,
  "move_in_date": "2026-01-01",
  "move_out_date": "2026-02-13",
  "status": "completed",
  ...
}
```

**Note:** This action:
- Sets the move-out date
- Changes status to `completed`
- Marks the unit as `vacant`

### CRUD Operations

- `GET /api/v1/tenancies/{id}/` - Get details
- `PUT /api/v1/tenancies/{id}/` - Full update
- `PATCH /api/v1/tenancies/{id}/` - Partial update
- `DELETE /api/v1/tenancies/{id}/` - Delete

---

## Billing API

### List Bills

```http
GET /api/v1/bills/
```

**Query Parameters:**
- `tenancy` (optional): Filter by tenancy ID
- `status` (optional): `unpaid` | `paid` | `partially_paid` | `overdue`
- `billing_period` (optional): Format `YYYY-MM` (e.g., `2026-02`)
- `search` (optional): Search in tenant name, unit number, billing_period
- `ordering` (optional): `billing_period`, `due_date`, `amount`, `-created_at`

**Response:**
```json
{
  "results": [
    {
      "id": 1,
      "tenancy": 1,
      "tenant_name": "Alice Johnson",
      "unit_number": "101",
      "property_name": "Sunset Apartments",
      "billing_period": "2026-02",
      "amount": "1500.00",
      "due_date": "2026-02-05",
      "status": "unpaid",
      "amount_paid": "0.00",
      "balance": "1500.00",
      "created_at": "2026-02-13T10:00:00Z",
      "updated_at": "2026-02-13T10:00:00Z"
    }
  ]
}
```

### Generate Monthly Bills

```http
POST /api/v1/bills/generate/
```

**Request Body:**
```json
{
  "billing_period": "2026-03",
  "due_day": 5
}
```

**Response:** `201 Created`
```json
{
  "created": 10,
  "skipped": 2,
  "bills": [
    {
      "id": 2,
      "tenancy": 1,
      "billing_period": "2026-03",
      "amount": "1500.00",
      "due_date": "2026-03-05",
      "status": "unpaid",
      ...
    }
  ]
}
```

**Note:** 
- Generates bills for all **active** tenancies
- Skips tenancies that already have a bill for that period
- `due_day` is the day of the month when rent is due (1-28)

### Mark Overdue Bills

```http
POST /api/v1/bills/mark-overdue/
```

**Response:** `200 OK`
```json
{
  "updated": 5
}
```

**Note:** Marks all unpaid bills past their due date as `overdue`

### CRUD Operations

- `GET /api/v1/bills/{id}/` - Get bill details
- `POST /api/v1/bills/` - Create bill manually
- `PUT /api/v1/bills/{id}/` - Full update
- `PATCH /api/v1/bills/{id}/` - Partial update
- `DELETE /api/v1/bills/{id}/` - Delete

---

## Payments API

### List Payments

```http
GET /api/v1/payments/
```

**Query Parameters:**
- `bill` (optional): Filter by bill ID
- `tenancy` (optional): Filter by tenancy ID
- `payment_method` (optional): `cash` | `bank` | `mobile_money` | `cheque` | `other`
- `payment_date` (optional): Filter by date
- `search` (optional): Search in reference_number, tenant name, notes
- `ordering` (optional): `payment_date`, `amount_paid`, `-created_at`

**Response:**
```json
{
  "results": [
    {
      "id": 1,
      "bill": 1,
      "bill_period": "2026-02",
      "tenancy": 1,
      "tenant_name": "Alice Johnson",
      "amount_paid": "1500.00",
      "payment_date": "2026-02-03",
      "payment_method": "bank",
      "reference_number": "TXN123456",
      "notes": "Payment received via bank transfer",
      "created_at": "2026-02-13T10:00:00Z",
      "updated_at": "2026-02-13T10:00:00Z"
    }
  ]
}
```

### Record Payment

```http
POST /api/v1/payments/
```

**Request Body:**
```json
{
  "bill": 1,
  "tenancy": 1,
  "amount_paid": "1500.00",
  "payment_date": "2026-02-03",
  "payment_method": "bank",
  "reference_number": "TXN123456",
  "notes": "Payment received via bank transfer"
}
```

**Response:** `201 Created`

**Note:** Recording a payment automatically:
- Updates the bill status:
  - If `amount_paid >= bill.amount` → status = `paid`
  - If `amount_paid > 0` → status = `partially_paid`

### CRUD Operations

- `GET /api/v1/payments/{id}/` - Get payment details
- `PUT /api/v1/payments/{id}/` - Full update
- `PATCH /api/v1/payments/{id}/` - Partial update
- `DELETE /api/v1/payments/{id}/` - Delete

---

## Notifications API

### List Notifications

```http
GET /api/v1/notifications/
```

**Query Parameters:**
- `tenancy` (optional): Filter by tenancy ID
- `notification_type` (optional): `upcoming_reminder` | `due_today` | `overdue` | `payment_received` | `general`
- `channel` (optional): `sms` | `whatsapp` | `email` | `in_app`
- `status` (optional): `pending` | `sent` | `failed`
- `search` (optional): Search in subject, message, tenant name
- `ordering` (optional): `-created_at`, `sent_at`

**Response:**
```json
{
  "results": [
    {
      "id": 1,
      "tenancy": 1,
      "tenant_name": "Alice Johnson",
      "notification_type": "upcoming_reminder",
      "channel": "in_app",
      "subject": "Rent Due Soon - 2026-02",
      "message": "Dear Alice Johnson, your rent of 1500.00 for period 2026-02 is due on 2026-02-05. Please make your payment on time.",
      "status": "sent",
      "sent_at": "2026-02-13T10:00:00Z",
      "created_at": "2026-02-13T10:00:00Z",
      "updated_at": "2026-02-13T10:00:00Z"
    }
  ]
}
```

### Create Notification

```http
POST /api/v1/notifications/
```

**Request Body:**
```json
{
  "tenancy": 1,
  "notification_type": "general",
  "channel": "email",
  "subject": "Important Notice",
  "message": "Your lease renewal is due next month.",
  "status": "pending"
}
```

### CRUD Operations

- `GET /api/v1/notifications/{id}/` - Get notification details
- `PUT /api/v1/notifications/{id}/` - Full update
- `PATCH /api/v1/notifications/{id}/` - Partial update
- `DELETE /api/v1/notifications/{id}/` - Delete

---

## Workflows

### Complete Move-In Workflow

```javascript
// 1. Create tenant (if new)
const tenant = await fetch('/api/v1/tenants/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    full_name: 'Alice Johnson',
    phone: '+1987654321',
    email: 'alice@example.com',
    id_number: 'ID123456',
    emergency_contact: 'Bob Johnson +1987654322'
  })
});

// 2. Create tenancy (move-in)
const tenancy = await fetch('/api/v1/tenancies/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tenant: tenant.id,
    unit: 1,
    move_in_date: '2026-01-01',
    rent_amount: '1500.00',
    deposit_amount: '1500.00',
    contract_start: '2026-01-01',
    contract_end: '2026-12-31',
    status: 'active'
  })
});

// Unit is automatically marked as occupied
// First bill is automatically generated
```

### Complete Move-Out Workflow

```javascript
// Move-out tenant
const response = await fetch(`/api/v1/tenancies/${tenancyId}/move-out/`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    move_out_date: '2026-02-13'
  })
});

// Unit is automatically marked as vacant
// Tenancy status changes to 'completed'
```

### Payment Workflow

```javascript
// 1. Get unpaid bills
const bills = await fetch('/api/v1/bills/?status=unpaid&tenancy=1');

// 2. Record payment
const payment = await fetch('/api/v1/payments/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    bill: billId,
    tenancy: tenancyId,
    amount_paid: '1500.00',
    payment_date: '2026-02-03',
    payment_method: 'bank',
    reference_number: 'TXN123456',
    notes: 'Payment received'
  })
});

// Bill status is automatically updated
```

### Monthly Bill Generation Workflow

```javascript
// Generate bills for next month
const response = await fetch('/api/v1/bills/generate/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    billing_period: '2026-03',
    due_day: 5
  })
});

// Returns: { created: 10, skipped: 2, bills: [...] }
```

---

## Error Handling

### Standard Error Response

```json
{
  "detail": "Error message here"
}
```

### Validation Errors

```json
{
  "field_name": [
    "This field is required.",
    "This field may not be blank."
  ],
  "another_field": [
    "Invalid value."
  ]
}
```

### Common HTTP Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Permission denied
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Example Error Handling (JavaScript)

```javascript
async function apiCall(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || JSON.stringify(error));
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Usage
try {
  const owners = await apiCall('/api/v1/owners/');
} catch (error) {
  // Handle error
  alert(error.message);
}
```

---

## Data Models Reference

### Owner

```typescript
interface Owner {
  id: number;
  owner_type: 'individual' | 'company';
  name: string;
  contact_person: string;  // Required for companies
  phone: string;
  email: string;
  address: string;
  created_at: string;  // ISO 8601 datetime
  updated_at: string;
}
```

### Location

```typescript
interface Location {
  id: number;
  country: string;
  region: string;
  city: string;
  area: string;
  created_at: string;
  updated_at: string;
}
```

### Property

```typescript
interface Property {
  id: number;
  owner: number;  // Owner ID
  owner_name: string;  // Read-only
  location: number | null;  // Location ID
  location_display: string;  // Read-only
  property_name: string;
  property_type: 'residential' | 'commercial' | 'mixed';
  address: string;
  description: string;
  created_at: string;
  updated_at: string;
}
```

### Unit

```typescript
interface Unit {
  id: number;
  property: number;  // Property ID
  property_name: string;  // Read-only
  unit_number: string;
  floor: string;
  unit_type: 'apartment' | 'studio' | 'office' | 'shop' | 'warehouse' | 'other';
  rent_amount: string;  // Decimal as string
  deposit_amount: string;
  status: 'vacant' | 'occupied' | 'maintenance';
  created_at: string;
  updated_at: string;
}
```

### Tenant

```typescript
interface Tenant {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  id_number: string;  // Unique
  emergency_contact: string;
  created_at: string;
  updated_at: string;
}
```

### Tenancy

```typescript
interface Tenancy {
  id: number;
  tenant: number;  // Tenant ID
  tenant_name: string;  // Read-only
  unit: number;  // Unit ID
  unit_number: string;  // Read-only
  property_name: string;  // Read-only
  move_in_date: string;  // YYYY-MM-DD
  move_out_date: string | null;
  rent_amount: string;
  deposit_amount: string;
  contract_start: string;  // YYYY-MM-DD
  contract_end: string | null;
  status: 'active' | 'completed' | 'terminated';
  created_at: string;
  updated_at: string;
}
```

### Bill

```typescript
interface Bill {
  id: number;
  tenancy: number;  // Tenancy ID
  tenant_name: string;  // Read-only
  unit_number: string;  // Read-only
  property_name: string;  // Read-only
  billing_period: string;  // YYYY-MM
  amount: string;
  due_date: string;  // YYYY-MM-DD
  status: 'unpaid' | 'paid' | 'partially_paid' | 'overdue';
  amount_paid: string;  // Read-only, calculated
  balance: string;  // Read-only, calculated
  created_at: string;
  updated_at: string;
}
```

### Payment

```typescript
interface Payment {
  id: number;
  bill: number;  // Bill ID
  bill_period: string;  // Read-only
  tenancy: number;  // Tenancy ID
  tenant_name: string;  // Read-only
  amount_paid: string;
  payment_date: string;  // YYYY-MM-DD
  payment_method: 'cash' | 'bank' | 'mobile_money' | 'cheque' | 'other';
  reference_number: string;
  notes: string;
  created_at: string;
  updated_at: string;
}
```

### Notification

```typescript
interface Notification {
  id: number;
  tenancy: number;  // Tenancy ID
  tenant_name: string;  // Read-only
  notification_type: 'upcoming_reminder' | 'due_today' | 'overdue' | 'payment_received' | 'general';
  channel: 'sms' | 'whatsapp' | 'email' | 'in_app';
  subject: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}
```

---

## Example Frontend Integration (React)

```javascript
// api.js
const API_BASE = 'http://localhost:8000/api';

export const api = {
  // Owners
  getOwners: () => fetch(`${API_BASE}/owners/`).then(r => r.json()),
  createOwner: (data) => fetch(`${API_BASE}/owners/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  // Properties
  getProperties: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return fetch(`${API_BASE}/properties/?${params}`).then(r => r.json());
  },
  createProperty: (data) => fetch(`${API_BASE}/properties/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  // Tenancies
  createTenancy: (data) => fetch(`${API_BASE}/tenancies/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  moveOut: (id, moveOutDate) => fetch(`${API_BASE}/tenancies/${id}/move-out/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ move_out_date: moveOutDate })
  }).then(r => r.json()),

  // Bills
  getBills: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return fetch(`${API_BASE}/bills/?${params}`).then(r => r.json());
  },
  generateBills: (period, dueDay = 5) => fetch(`${API_BASE}/bills/generate/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ billing_period: period, due_day: dueDay })
  }).then(r => r.json()),

  // Payments
  createPayment: (data) => fetch(`${API_BASE}/payments/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
};

// Usage in component
import { api } from './api';

function PropertiesList() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    api.getProperties({ owner: 1, status: 'occupied' })
      .then(data => setProperties(data.results));
  }, []);

  return (
    <div>
      {properties.map(prop => (
        <div key={prop.id}>{prop.property_name}</div>
      ))}
    </div>
  );
}
```

---

## Testing the API

### Using cURL

```bash
# List owners
curl http://localhost:8000/api/v1/owners/

# Create owner
curl -X POST http://localhost:8000/api/v1/owners/ \
  -H "Content-Type: application/json" \
  -d '{"owner_type":"individual","name":"John Doe","phone":"+1234567890"}'

# Generate bills
curl -X POST http://localhost:8000/api/v1/bills/generate/ \
  -H "Content-Type: application/json" \
  -d '{"billing_period":"2026-03","due_day":5}'
```

### Using Postman

1. Import the OpenAPI schema from: `http://localhost:8000/api/schema/`
2. Or manually create requests using the endpoints above

---

## Support

For API issues or questions:
- Check Swagger UI: http://localhost:8000/api/docs/
- Check ReDoc: http://localhost:8000/api/redoc/
- Review project documentation: `/docs/project_dev_doc.md`
