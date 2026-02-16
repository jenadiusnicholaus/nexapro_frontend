# Subscription System - Complete Guide

## Overview
NexaPro uses a subscription-based model where:
- **New owners get 30-day free trial** automatically on registration
- **After 30 days**, they must upgrade to a paid plan
- **Plans renew every 30 days** with payment
- **SMS notifications** sent for expiring/expired subscriptions

---

## Subscription Plans

### Available Plans

| Plan | Price | Duration | Properties | Units | Tenants | Features |
|------|-------|----------|------------|-------|---------|----------|
| **Free Trial** | 0 TZS | 30 days | 1 | 5 | 10 | Basic features |
| **Basic** | 10,000 TZS | 30 days | 3 | 15 | 30 | + Reports |
| **Professional** | 25,000 TZS | 30 days | 10 | 50 | 100 | + Priority Support |
| **Enterprise** | 50,000 TZS | 30 days | Unlimited | Unlimited | Unlimited | All features |

### Plan Features

**All Plans Include:**
- ✅ SMS Notifications
- ✅ Contract Generation
- ✅ Payment Tracking

**Basic & Above:**
- ✅ Reports & Analytics

**Professional & Enterprise:**
- ✅ Priority Support

---

## Auto-Assignment on Registration

### How It Works

When an owner registers:

1. **Owner account created** via SMS verification
2. **Signal triggers** (`post_save` on Owner model)
3. **Free trial subscription** automatically created
   - Plan: Free Trial
   - Duration: 30 days
   - Status: Active
   - Start: Registration date
   - End: Registration date + 30 days

**Code:**
```python
# apps/subscriptions/signals.py
@receiver(post_save, sender=Owner)
def create_free_trial_subscription(sender, instance, created, **kwargs):
    if created:
        # Create 30-day free trial
        Subscription.objects.create(
            owner=instance,
            plan=free_trial_plan,
            start_date=now,
            end_date=now + 30 days,
        )
```

---

## API Endpoints

### 1. View Available Plans

**Endpoint:** `GET /api/v1/subscriptions/plans/`  
**Auth:** Public (no authentication required)

**Response:**
```json
[
  {
    "id": 1,
    "name": "Free Trial",
    "description": "30-day free trial with basic features",
    "price": "0.00",
    "currency": "TZS",
    "duration_days": 30,
    "max_properties": 1,
    "max_units": 5,
    "max_tenants": 10,
    "sms_notifications": true,
    "contract_generation": true,
    "payment_tracking": true,
    "reports_analytics": false,
    "priority_support": false,
    "is_active": true,
    "is_free_tier": true
  },
  {
    "id": 2,
    "name": "Basic",
    "price": "10000.00",
    "currency": "TZS",
    "duration_days": 30,
    ...
  }
]
```

---

### 2. View My Subscription

**Endpoint:** `GET /api/v1/subscriptions/subscriptions/my-subscription/`  
**Auth:** Required (JWT token)

**Response:**
```json
{
  "id": 1,
  "owner": 5,
  "owner_name": "John Doe",
  "plan": 1,
  "plan_details": {
    "id": 1,
    "name": "Free Trial",
    "price": "0.00",
    "duration_days": 30,
    ...
  },
  "status": "active",
  "start_date": "2026-02-15T18:30:00Z",
  "end_date": "2026-03-17T18:30:00Z",
  "auto_renew": false,
  "days_remaining": 29,
  "is_expired": false,
  "created_at": "2026-02-15T18:30:00Z",
  "updated_at": "2026-02-15T18:30:00Z"
}
```

---

### 3. Upgrade Subscription

**Endpoint:** `POST /api/v1/subscriptions/subscriptions/upgrade/`  
**Auth:** Required (JWT token)

**Request:**
```json
{
  "plan_id": 2,
  "payment_method": "M-Pesa",
  "transaction_id": "ABC123XYZ"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully upgraded to Basic",
  "subscription": {
    "id": 1,
    "plan": 2,
    "plan_details": {
      "name": "Basic",
      "price": "10000.00",
      ...
    },
    "status": "active",
    "start_date": "2026-02-15T19:00:00Z",
    "end_date": "2026-03-17T19:00:00Z",
    "days_remaining": 30
  },
  "payment": {
    "id": 1,
    "amount": "10000.00",
    "currency": "TZS",
    "status": "completed",
    "paid_at": "2026-02-15T19:00:00Z"
  }
}
```

---

### 4. Renew Subscription

**Endpoint:** `POST /api/v1/subscriptions/subscriptions/renew/`  
**Auth:** Required (JWT token)

**Request:**
```json
{
  "payment_method": "M-Pesa",
  "transaction_id": "XYZ789ABC"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription renewed successfully",
  "subscription": {
    "end_date": "2026-04-16T19:00:00Z",
    "days_remaining": 60
  },
  "payment": {
    "amount": "10000.00",
    "status": "completed"
  }
}
```

---

### 5. View Payment History

**Endpoint:** `GET /api/v1/subscriptions/payments/`  
**Auth:** Required (JWT token)

**Response:**
```json
{
  "count": 2,
  "results": [
    {
      "id": 2,
      "owner_name": "John Doe",
      "plan_name": "Basic",
      "amount": "10000.00",
      "currency": "TZS",
      "payment_method": "M-Pesa",
      "transaction_id": "XYZ789ABC",
      "status": "completed",
      "paid_at": "2026-02-15T19:00:00Z",
      "created_at": "2026-02-15T19:00:00Z"
    },
    ...
  ]
}
```

---

## Subscription Lifecycle

### Day 0: Registration
```
✅ Owner registers
✅ Free trial auto-assigned (30 days)
   Status: Active
   Days remaining: 30
```

### Day 23: Expiry Warning
```
📱 SMS sent: "SUBSCRIPTION EXPIRING: Your Free Trial plan 
   expires in 7 days. Renew now to avoid service interruption."
```

### Day 30: Expiration
```
❌ Subscription expires
✅ Status changed to: Expired
📱 SMS sent: "SUBSCRIPTION EXPIRED: Your Free Trial plan has expired. 
   Upgrade now to continue using NexaPro."
```

### After Expiration
```
🔒 Access restricted (if middleware enabled)
💡 Owner must upgrade to continue
```

---

## Automated Tasks

### Check Expired Subscriptions
**Task:** `check_expired_subscriptions`  
**Schedule:** Daily at 3 AM

**What it does:**
1. Finds active subscriptions past end date
2. Marks them as `expired`
3. Sends SMS notification to owner
4. Finds subscriptions expiring in 7 days
5. Sends warning SMS to owner

**SMS Examples:**

**Expiry Warning (7 days before):**
```
SUBSCRIPTION EXPIRING: Your Basic plan expires in 7 days. 
Renew now to avoid service interruption. Visit your dashboard.
```

**Expired:**
```
SUBSCRIPTION EXPIRED: Your Basic plan has expired. 
Upgrade now to continue using NexaPro. Visit your dashboard to renew.
```

---

## Frontend Integration

### Display Subscription Status

```javascript
const SubscriptionBadge = ({ subscription }) => {
  const daysLeft = subscription.days_remaining;
  
  if (subscription.is_expired) {
    return (
      <div className="subscription-expired">
        <Badge color="red">Expired</Badge>
        <Button onClick={handleUpgrade}>Upgrade Now</Button>
      </div>
    );
  } else if (daysLeft <= 7) {
    return (
      <div className="subscription-expiring">
        <Badge color="orange">Expires in {daysLeft} days</Badge>
        <Button onClick={handleRenew}>Renew Now</Button>
      </div>
    );
  } else {
    return (
      <Badge color="green">
        Active - {daysLeft} days remaining
      </Badge>
    );
  }
};
```

---

### Upgrade Flow

```javascript
const handleUpgrade = async (planId) => {
  // Show payment dialog
  const paymentDetails = await showPaymentDialog();
  
  // Upgrade subscription
  const response = await fetch('/api/v1/subscriptions/subscriptions/upgrade/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      plan_id: planId,
      payment_method: paymentDetails.method,
      transaction_id: paymentDetails.transactionId,
    }),
  });
  
  const data = await response.json();
  
  if (data.success) {
    Swal.fire('Success!', `Upgraded to ${data.subscription.plan_details.name}`, 'success');
    // Refresh subscription data
  }
};
```

---

### Pricing Table

```jsx
const PricingTable = () => {
  const [plans, setPlans] = useState([]);
  
  useEffect(() => {
    fetch('/api/v1/subscriptions/plans/')
      .then(res => res.json())
      .then(data => setPlans(data));
  }, []);
  
  return (
    <div className="pricing-grid">
      {plans.map(plan => (
        <div key={plan.id} className="pricing-card">
          <h3>{plan.name}</h3>
          <p className="price">
            {plan.price > 0 ? `${plan.price} ${plan.currency}/month` : 'Free'}
          </p>
          <p>{plan.description}</p>
          
          <ul className="features">
            <li>✅ {plan.max_properties} Properties</li>
            <li>✅ {plan.max_units} Units</li>
            <li>✅ {plan.max_tenants} Tenants</li>
            {plan.reports_analytics && <li>✅ Reports & Analytics</li>}
            {plan.priority_support && <li>✅ Priority Support</li>}
          </ul>
          
          <button onClick={() => handleUpgrade(plan.id)}>
            {plan.is_free_tier ? 'Current Plan' : 'Upgrade'}
          </button>
        </div>
      ))}
    </div>
  );
};
```

---

## Testing

### Test Auto-Assignment

```python
from apps.owners.models import Owner
from apps.subscriptions.models import Subscription

# Create new owner (triggers signal)
owner = Owner.objects.create(
    name='Test Owner',
    phone='+255700000001',
    phone_verified=True,
)

# Check subscription was created
subscription = Subscription.objects.get(owner=owner)
print(f'Plan: {subscription.plan.name}')
print(f'Days remaining: {subscription.days_remaining()}')
# Output: Plan: Free Trial, Days: 30
```

### Test Upgrade

```bash
curl -X POST http://localhost:8000/api/v1/subscriptions/subscriptions/upgrade/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan_id": 2,
    "payment_method": "M-Pesa",
    "transaction_id": "TEST123"
  }'
```

---

## Database Schema

### SubscriptionPlan
```sql
CREATE TABLE subscriptions_subscriptionplan (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE,
    description TEXT,
    price DECIMAL(10,2),
    currency VARCHAR(10),
    duration_days INTEGER,
    max_properties INTEGER,
    max_units INTEGER,
    max_tenants INTEGER,
    sms_notifications BOOLEAN,
    contract_generation BOOLEAN,
    payment_tracking BOOLEAN,
    reports_analytics BOOLEAN,
    priority_support BOOLEAN,
    is_active BOOLEAN,
    is_free_tier BOOLEAN
);
```

### Subscription
```sql
CREATE TABLE subscriptions_subscription (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER UNIQUE REFERENCES owners_owner(id),
    plan_id INTEGER REFERENCES subscriptions_subscriptionplan(id),
    status VARCHAR(20),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    auto_renew BOOLEAN
);
```

### SubscriptionPayment
```sql
CREATE TABLE subscriptions_subscriptionpayment (
    id SERIAL PRIMARY KEY,
    subscription_id INTEGER REFERENCES subscriptions_subscription(id),
    plan_id INTEGER REFERENCES subscriptions_subscriptionplan(id),
    amount DECIMAL(10,2),
    currency VARCHAR(10),
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    status VARCHAR(20),
    paid_at TIMESTAMP
);
```

---

## Admin Management

### Create/Edit Plans

```python
# Django Admin
# Navigate to: /admin/subscriptions/subscriptionplan/

# Or via shell
from apps.subscriptions.models import SubscriptionPlan

SubscriptionPlan.objects.create(
    name='Premium',
    description='Premium features',
    price=35000,
    currency='TZS',
    duration_days=30,
    max_properties=20,
    max_units=100,
    max_tenants=200,
    reports_analytics=True,
    priority_support=True,
)
```

---

## Summary

✅ **Auto-assignment** - Free trial on registration  
✅ **30-day trial** - Full access for 30 days  
✅ **4 Plans** - Free, Basic, Professional, Enterprise  
✅ **Auto-expiry** - Daily check at 3 AM  
✅ **SMS notifications** - 7 days before & on expiry  
✅ **Easy upgrade** - One API call to upgrade  
✅ **Payment tracking** - Full payment history  
✅ **Flexible renewal** - Renew anytime  

**Every new owner gets 30 days free, then must upgrade to continue!** 🎉💳
