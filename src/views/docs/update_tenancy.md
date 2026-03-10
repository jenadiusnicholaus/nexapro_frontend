# Frontend Implementation Guide: Tenancy Billing & Payment Flow

This guide outlines the changes required in the frontend application to support the refined tenancy billing and payment workflow.

## 1. Tenancy Creation Flow
When creating a new tenancy, the system now distinguishes between a **Reservation** and an **Active Tenancy** based on the `deposit_paid` field.

- **Field**: `deposit_paid` (Boolean)
- **Field**: `deposit_payment_method` (String, required if `deposit_paid` is true)
- **Behavior**: 
  - If `deposit_paid` is `false` (default): The system sends a "Reservation" reminder SMS to the tenant.
  - If `deposit_paid` is `true`: The system sends a "Confirmation" SMS and auto-activates the tenancy logic.

**Action for Frontend**:
- Ensure the tenancy creation form allows toggling `deposit_paid`.
- Show a clear "Pending Deposit" status in the UI for tenancies where `deposit_paid` is false.

## 2. Admin Confirmation (CRUD)
Instead of manually creating a payment record separately, admins can now confirm a deposit directly from the Tenancy edit page.

- **Logic**: Toggling `deposit_paid` from `false` to `true` and saving the tenancy will:
  1. Auto-create a `Payment` record on the backend.
  2. Update the associated `Bill` status to `paid`.
  3. Send the confirmation SMS to both parties.

**Action for Frontend**:
- In the Tenancy details/edit view, provide a "Confirm Deposit" button or toggle.
- When clicked, send a `PATCH` request: `{"deposit_paid": true, "deposit_payment_method": "..."}`.
- Refresh the billing/payment list for that tenancy after successful update.

## 3. New Bill Status: `pending_payment`
The `Bill` model now has a new status value.

- **Value**: `pending_payment`
- **Meaning**: The bill is created but waiting for the initial deposit confirmation.

**Action for Frontend**:
- Update your status mapping/color coding to handle `pending_payment`.
- Recommended color: **Orange/Amber** (distinguishable from `unpaid` red and `paid` green).

## 4. Payment Recording
The `Payment` serializer has been simplified. All status transitions and SMS notifications are now handled by backend signals.

**Action for Frontend**:
- No changes required to your `POST /api/v1/payments/` implementation, but you can rely on the fact that the `Bill` status will be updated automatically by the backend upon success.

## 5. UI/UX Labels
- If a tenancy is in "Reservation" mode (`deposit_paid: false`), display a warning: *"Awaiting deposit confirmation. SMS reminder sent to tenant."*
- For the billing period, the backend now returns simplified labels like `"2026-03 to 2026-08"` for a 6-month contract. Ensure your tables handle these strings correctly.

## 6. API Usage Examples

### Create a Tenancy (Reservation)
`POST /api/v1/tenancies/`
```json
{
  "tenant": 12,
  "unit": 45,
  "rent_amount": 150000.00,
  "deposit_amount": 900000.00,
  "move_in_date": "2026-03-10",
  "duration_months": 6,
  "deposit_paid": false,
  "currency": "TZS"
}
```
*Response*: Tenancy created, initial bill status is `pending_payment`. SMS reminder sent.

### Confirm Deposit (Admin Update)
`PATCH /api/v1/tenancies/{id}/`
```json
{
  "deposit_paid": true,
  "deposit_payment_method": "Mobile Money",
  "deposit_payment_reference": "TXN998877"
}
```
*Backend Logic*: Auto-generates a `Payment` record, updates bill to `paid`, and sends confirmation SMS.

### Fetch Bills and Statuses
`GET /api/v1/billing/?tenancy={id}`
```json
[
  {
    "id": 101,
    "billing_period": "2026-03 to 2026-08",
    "amount": "900000.00",
    "amount_paid": "900000.00",
    "balance": "0.00",
    "status": "paid"
  }
]
```

### Manual Payment Recording
`POST /api/v1/payments/`
```json
{
  "tenancy": 5,
  "bill": 101,
  "amount_paid": 450000.00,
  "payment_method": "Cash",
  "payment_date": "2026-03-15"
}
```
*Backend Logic*: Signals will update the bill status to `partially_paid` and send receipts.

### Manual Reminder Trigger
`POST /api/v1/tenancies/{id}/send-reminder/`
```json
{}
```
*Response*: `{"success": true, "message": "Rent reminder sent successfully."}`

---
**Backend API Reference:**
- `GET/PATCH /api/v1/tenancies/{id}/`
- `GET /api/v1/billing/` (Check `status` column)
- `POST /api/v1/payments/`
- `POST /api/v1/tenancies/{id}/send-reminder/`
