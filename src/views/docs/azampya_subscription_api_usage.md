# Frontend API Quick Reference

## Authentication
```bash
# Login
POST /api/v1/auth/token/
{
  "username": "user@example.com", 
  "password": "password123"
}

# Use token
Authorization: Bearer {access_token}
```

## Subscription Plans
```bash
# Get all plans
GET /api/v1/subscriptions/plans/
```

## Subscription Management
```bash
# Get user subscription
GET /api/v1/subscriptions/subscriptions/

# Upgrade/Change subscription
POST /api/v1/subscriptions/subscriptions/upgrade/
{
  "plan_id": 2,
  "account_number": "0712345678",
  "provider": "airtel"
}

# Renew subscription
POST /api/v1/subscriptions/subscriptions/renew/
{
  "plan_id": 2,
  "account_number": "0712345678",
  "provider": "tigo"
}
```

## Payment Status
```bash
# Get payment details
GET /api/v1/subscriptions/payments/{payment_id}/

# Get payment history
GET /api/v1/subscriptions/payments/
```

## User Profile
```bash
# Get current user info
GET /api/v1/profiles/
```

## Mobile Money Providers
- `mpesa` - M-Pesa
- `airtel` - Airtel Money  
- `tigo` - Tigo Pesa
- `halopesa` - Halopesa
- `azampesa` - Azampesa

## Phone Formats
- `0712345678` ✓
- `255712345678` ✓
- `712345678` ✓

## Response Examples

### Success (Sandbox)
```json
{
  "success": true,
  "payment_id": 123,
  "status": "completed",
  "message": "Subscription activated"
}
```

### Pending (Production)
```json
{
  "success": true,
  "payment_id": 123,
  "status": "pending",
  "message": "USSD push sent"
}
```

### Error
```json
{
  "error": "Payment request failed: Connection timeout"
}
```

## HTTP Codes
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error
