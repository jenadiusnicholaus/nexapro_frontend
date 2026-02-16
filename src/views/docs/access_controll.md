# Subscription Access Control - Complete Guide

## Overview
When a subscription expires, the system **automatically locks access** to protected features. Owners cannot create new properties, units, or tenants until they upgrade.

---

## What Gets Locked

### When Subscription Expires:

**❌ BLOCKED:**
- Creating new properties
- Creating new units
- Creating new tenants
- Creating new tenancies
- Any feature requiring active subscription

**✅ ALLOWED:**
- Viewing subscription plans
- Upgrading/renewing subscription
- Viewing existing data (read-only)

---

## Access Control Permissions

### 1. HasActiveSubscription
**Checks:** Subscription status and expiry date

**Blocks access if:**
- Subscription status is `expired`
- End date has passed
- No subscription exists

**Error Message:**
```json
{
  "detail": "Your Free Trial subscription has expired. Please upgrade to continue using NexaPro features."
}
```

---

### 2. WithinSubscriptionLimits
**Checks:** Current usage vs plan limits

**Blocks creation if:**
- Properties: Current count >= `max_properties`
- Units: Current count >= `max_units`
- Tenants: Current count >= `max_tenants`

**Error Messages:**

**Property Limit:**
```json
{
  "detail": "Property limit reached (1). Upgrade to Basic to add more properties."
}
```

**Unit Limit:**
```json
{
  "detail": "Unit limit reached (5). Upgrade to Basic to add more units."
}
```

**Tenant Limit:**
```json
{
  "detail": "Tenant limit reached (10). Upgrade to Basic to add more tenants."
}
```

---

## Protected Endpoints

### Properties
**Endpoint:** `POST /api/v1/properties/`  
**Permissions:**
- `IsAdminOrPropertyOwner`
- `HasActiveSubscription` ✅
- `WithinSubscriptionLimits` ✅

**Example - Expired Subscription:**
```bash
POST /api/v1/properties/
Authorization: Bearer <token>

Response (403):
{
  "detail": "Your Free Trial subscription has expired. Please upgrade to continue using NexaPro features."
}
```

**Example - Limit Reached:**
```bash
POST /api/v1/properties/
Authorization: Bearer <token>

Response (403):
{
  "detail": "Property limit reached (1). Upgrade to Basic to add more properties."
}
```

---

### Units
**Endpoint:** `POST /api/v1/units/`  
**Permissions:**
- `IsAdminOrPropertyOwner`
- `HasActiveSubscription` ✅
- `WithinSubscriptionLimits` ✅

**Limit Check:**
- Free Trial: Max 5 units
- Basic: Max 15 units
- Professional: Max 50 units
- Enterprise: Max 999 units

---

### Tenants
**Endpoint:** `POST /api/v1/tenants/`  
**Permissions:**
- `IsAdminOrPropertyOwner`
- `HasActiveSubscription` ✅
- `WithinSubscriptionLimits` ✅

**Limit Check:**
- Free Trial: Max 10 tenants
- Basic: Max 30 tenants
- Professional: Max 100 tenants
- Enterprise: Max 9999 tenants

---

## Plan Limits Comparison

| Plan | Properties | Units | Tenants | Price |
|------|------------|-------|---------|-------|
| **Free Trial** | 1 | 5 | 10 | 0 TZS |
| **Basic** | 3 | 15 | 30 | 10,000 TZS |
| **Professional** | 10 | 50 | 100 | 25,000 TZS |
| **Enterprise** | 999 | 999 | 9999 | 50,000 TZS |

---

## User Experience Flow

### Scenario 1: Subscription Expires

**Day 30 - Free Trial Ends:**
```
1. Owner tries to create property
2. API returns 403 Forbidden
3. Error: "Your Free Trial subscription has expired"
4. Frontend shows upgrade dialog
5. Owner upgrades to Basic plan
6. Access restored immediately
```

**Frontend Handling:**
```javascript
const createProperty = async (propertyData) => {
  try {
    const response = await fetch('/api/v1/properties/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(propertyData),
    });
    
    if (response.status === 403) {
      const error = await response.json();
      
      // Show upgrade dialog
      Swal.fire({
        icon: 'warning',
        title: 'Subscription Expired',
        text: error.detail,
        showCancelButton: true,
        confirmButtonText: 'Upgrade Now',
        cancelButtonText: 'Later',
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/subscription/upgrade';
        }
      });
      
      return;
    }
    
    // Success
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

### Scenario 2: Limit Reached

**Free Trial - 1 Property Limit:**
```
1. Owner has 1 property (limit reached)
2. Tries to create 2nd property
3. API returns 403 Forbidden
4. Error: "Property limit reached (1). Upgrade to Basic"
5. Frontend shows upgrade options
```

**Frontend Handling:**
```javascript
const handleLimitReached = (errorMessage) => {
  // Extract suggested plan from error message
  const suggestedPlan = errorMessage.includes('Basic') ? 'Basic' : 
                       errorMessage.includes('Professional') ? 'Professional' : 
                       'Enterprise';
  
  Swal.fire({
    icon: 'info',
    title: 'Plan Limit Reached',
    html: `
      <p>${errorMessage}</p>
      <p>Upgrade to <strong>${suggestedPlan}</strong> to continue.</p>
    `,
    confirmButtonText: 'View Plans',
  }).then(() => {
    window.location.href = '/subscription/plans';
  });
};
```

---

## Current Usage Display

### Show Limits in Dashboard

```javascript
const SubscriptionUsage = ({ subscription }) => {
  const [usage, setUsage] = useState({});
  
  useEffect(() => {
    // Fetch current usage
    fetch('/api/v1/properties/').then(res => res.json())
      .then(data => setUsage(prev => ({...prev, properties: data.count})));
    
    fetch('/api/v1/units/').then(res => res.json())
      .then(data => setUsage(prev => ({...prev, units: data.count})));
    
    fetch('/api/v1/tenants/').then(res => res.json())
      .then(data => setUsage(prev => ({...prev, tenants: data.count})));
  }, []);
  
  const plan = subscription.plan_details;
  
  return (
    <div className="usage-card">
      <h3>Plan Usage</h3>
      
      <div className="usage-item">
        <span>Properties</span>
        <ProgressBar 
          current={usage.properties} 
          max={plan.max_properties} 
        />
        <span>{usage.properties}/{plan.max_properties}</span>
      </div>
      
      <div className="usage-item">
        <span>Units</span>
        <ProgressBar 
          current={usage.units} 
          max={plan.max_units} 
        />
        <span>{usage.units}/{plan.max_units}</span>
      </div>
      
      <div className="usage-item">
        <span>Tenants</span>
        <ProgressBar 
          current={usage.tenants} 
          max={plan.max_tenants} 
        />
        <span>{usage.tenants}/{plan.max_tenants}</span>
      </div>
      
      {usage.properties >= plan.max_properties && (
        <Alert color="warning">
          You've reached your property limit. 
          <Link to="/upgrade">Upgrade now</Link>
        </Alert>
      )}
    </div>
  );
};
```

---

## Testing Access Control

### Test Expired Subscription

```python
from apps.owners.models import Owner
from apps.subscriptions.models import Subscription
from datetime import timedelta
from django.utils import timezone

# Get owner
owner = Owner.objects.get(phone='+255765551397')
subscription = Subscription.objects.get(owner=owner)

# Expire subscription
subscription.end_date = timezone.now() - timedelta(days=1)
subscription.save()

print(f'Is expired: {subscription.is_expired()}')
# Output: True

# Try to create property via API - will be blocked
```

### Test Limit Reached

```python
from apps.properties.models import Property

# Check current count
owner = Owner.objects.get(phone='+255765551397')
current = Property.objects.filter(owner=owner).count()
limit = owner.subscription.plan.max_properties

print(f'Properties: {current}/{limit}')
# Output: Properties: 1/1

# Try to create another - will be blocked
```

---

## Permission Logic

### HasActiveSubscription

```python
def has_permission(self, request, view):
    owner = get_request_owner(request)
    subscription = owner.subscription
    
    # Check status and expiry
    if subscription.status == 'active' and not subscription.is_expired():
        return True  # ✅ Allow
    
    return False  # ❌ Block
```

### WithinSubscriptionLimits

```python
def has_permission(self, request, view):
    if request.method != 'POST':
        return True  # Only check on creation
    
    owner = get_request_owner(request)
    plan = owner.subscription.plan
    
    # Check properties limit
    if 'properties' in request.path:
        current = Property.objects.filter(owner=owner).count()
        if current >= plan.max_properties:
            return False  # ❌ Limit reached
    
    return True  # ✅ Within limit
```

---

## Bypass for Admins

Admins are **not restricted** by subscription limits:

```python
# In permissions.py
def has_permission(self, request, view):
    # Admin users bypass subscription checks
    if user_is_admin(request.user):
        return True
    
    # Regular owners must have active subscription
    owner = get_request_owner(request)
    ...
```

---

## Monitoring & Alerts

### Check Owners Near Limits

```python
from apps.subscriptions.models import Subscription
from apps.properties.models import Property

for subscription in Subscription.objects.filter(status='active'):
    owner = subscription.owner
    plan = subscription.plan
    
    # Check property usage
    current = Property.objects.filter(owner=owner).count()
    usage_percent = (current / plan.max_properties) * 100
    
    if usage_percent >= 80:
        print(f'{owner.name}: {usage_percent}% of property limit used')
        # Send upgrade suggestion SMS
```

---

## Summary

### Access Control Features:

✅ **Automatic blocking** when subscription expires  
✅ **Plan limit enforcement** for properties/units/tenants  
✅ **Clear error messages** with upgrade suggestions  
✅ **Read-only access** to existing data  
✅ **Immediate restoration** after upgrade  
✅ **Admin bypass** for system administrators  

### What Happens When Expired:

❌ **Cannot create** new properties, units, or tenants  
❌ **Cannot create** new tenancies  
✅ **Can view** existing data  
✅ **Can upgrade** subscription  
✅ **Can renew** subscription  

**Yes, the system locks plan benefits when subscription expires! Owners must upgrade to continue.** 🔒

