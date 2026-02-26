# Profile API with Subscription Data

## Overview

The profile endpoint now includes complete subscription information, making it easy for the frontend to display subscription status, plan limits, and days remaining.

---

## Endpoint

**GET** `/api/v1/profiles/`  
**Auth:** Required (JWT token)

---

## Response Format

```json
{
  "user": {
    "id": 2,
    "username": "+255765551397",
    "email": "jenadius@gmail.com",
    "first_name": "",
    "last_name": "",
    "is_staff": false,
    "is_superuser": false
  },
  "role": "property_owner",
  "owner": {
    "id": 5,
    "name": "jone",
    "owner_type": "individual",
    "email": "jenadius@gmail.com",
    "phone": "+255765551397",
    "contact_person": "",
    "address": ""
  },
  "subscription": {
    "id": 2,
    "plan": {
      "id": 1,
      "name": "Free Trial",
      "price": "0.00",
      "currency": "TZS",
      "duration_days": 30,
      "max_properties": 1,
      "max_units": 5,
      "max_tenants": 10,
      "is_free_tier": true
    },
    "status": "active",
    "start_date": "2026-02-15T20:47:42.969334+00:00",
    "end_date": "2026-03-17T20:47:42.969334+00:00",
    "days_remaining": 28,
    "is_expired": false,
    "auto_renew": false
  },
  "permissions": {
    "can_manage_all_owners": false,
    "can_create_owner": false,
    "can_delete_owner": false,
    "can_manage_user_profiles": false,
    "can_manage_locations": true,
    "can_manage_properties": true,
    "can_manage_units": true,
    "can_manage_tenants": true,
    "can_manage_tenancies": true,
    "can_manage_bills": true,
    "can_manage_payments": true,
    "can_manage_notifications": true,
    "can_generate_bills": true,
    "can_mark_overdue_bills": true,
    "can_move_out_tenancy": true,
    "scoped_to_owner": true,
    "can_edit_owner": true
  },
  "image": null
}
```

---

## Subscription Object

The `subscription` object includes:

| Field            | Type     | Description                                    |
| ---------------- | -------- | ---------------------------------------------- |
| `id`             | integer  | Subscription ID                                |
| `plan`           | object   | Full plan details                              |
| `status`         | string   | `active`, `expired`, `cancelled`, or `pending` |
| `start_date`     | datetime | When subscription started                      |
| `end_date`       | datetime | When subscription ends                         |
| `days_remaining` | integer  | Days left in subscription                      |
| `is_expired`     | boolean  | Whether subscription has expired               |
| `auto_renew`     | boolean  | Whether auto-renewal is enabled                |

### Plan Object

| Field            | Type    | Description                             |
| ---------------- | ------- | --------------------------------------- |
| `id`             | integer | Plan ID                                 |
| `name`           | string  | Plan name (e.g., "Free Trial", "Basic") |
| `price`          | string  | Plan price                              |
| `currency`       | string  | Currency code (e.g., "TZS")             |
| `duration_days`  | integer | Plan duration in days (usually 30)      |
| `max_properties` | integer | Maximum properties allowed              |
| `max_units`      | integer | Maximum units allowed                   |
| `max_tenants`    | integer | Maximum tenants allowed                 |
| `is_free_tier`   | boolean | Whether this is the free trial plan     |

---

## Frontend Usage

### Display Subscription Status

```javascript
const SubscriptionBanner = ({ profile }) => {
  const { subscription } = profile;

  if (!subscription) {
    return <Alert>No subscription found</Alert>;
  }

  const { plan, days_remaining, is_expired, status } = subscription;

  if (is_expired || status === "expired") {
    return (
      <Alert color="danger">
        <strong>Subscription Expired</strong>
        <p>Your {plan.name} has expired. Upgrade now to continue.</p>
        <Button href="/subscription/upgrade">Upgrade Now</Button>
      </Alert>
    );
  }

  if (days_remaining <= 7) {
    return (
      <Alert color="warning">
        <strong>Subscription Expiring Soon</strong>
        <p>
          Your {plan.name} expires in {days_remaining} days.
        </p>
        <Button href="/subscription/renew">Renew Now</Button>
      </Alert>
    );
  }

  return (
    <div className="subscription-info">
      <Badge color="success">{plan.name}</Badge>
      <span>{days_remaining} days remaining</span>
    </div>
  );
};
```

---

### Display Plan Limits

```javascript
const PlanLimits = ({ profile }) => {
  const { subscription } = profile;

  if (!subscription) return null;

  const { plan } = subscription;

  return (
    <div className="plan-limits">
      <h4>Your Plan Limits</h4>

      <div className="limit-item">
        <span>Properties</span>
        <span>{plan.max_properties}</span>
      </div>

      <div className="limit-item">
        <span>Units</span>
        <span>{plan.max_units}</span>
      </div>

      <div className="limit-item">
        <span>Tenants</span>
        <span>{plan.max_tenants}</span>
      </div>

      {plan.is_free_tier && (
        <Button href="/subscription/plans">Upgrade for More</Button>
      )}
    </div>
  );
};
```

---

### Check Before Creating Resources

```javascript
const canCreateProperty = (profile) => {
  const { subscription } = profile;

  if (!subscription || subscription.is_expired) {
    return {
      allowed: false,
      message: "Your subscription has expired. Please upgrade.",
    };
  }

  // Note: Actual count check should be done via API
  // This is just for UI hints
  return {
    allowed: true,
    message: `You can create up to ${subscription.plan.max_properties} properties`,
  };
};

// Usage
const handleCreateProperty = () => {
  const check = canCreateProperty(profile);

  if (!check.allowed) {
    Swal.fire("Subscription Required", check.message, "warning");
    return;
  }

  // Proceed with creation
  createProperty();
};
```

---

### Complete Dashboard Example

```javascript
const Dashboard = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetch("/api/v1/profiles/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setProfile(data));
  }, []);

  if (!profile) return <Loading />;

  const { user, owner, subscription, permissions } = profile;

  return (
    <div className="dashboard">
      <header>
        <h1>Welcome, {owner.name}</h1>
        <SubscriptionBanner profile={profile} />
      </header>

      <div className="stats-grid">
        <StatCard
          title="Properties"
          count={propertyCount}
          limit={subscription.plan.max_properties}
          icon="building"
        />

        <StatCard
          title="Units"
          count={unitCount}
          limit={subscription.plan.max_units}
          icon="home"
        />

        <StatCard
          title="Tenants"
          count={tenantCount}
          limit={subscription.plan.max_tenants}
          icon="users"
        />
      </div>

      <PlanLimits profile={profile} />
    </div>
  );
};
```

---

## Testing

### cURL Example

```bash
curl -X GET $VITE_API_BASE_URL/profiles/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Expected Response

```json
{
  "user": {...},
  "role": "property_owner",
  "owner": {...},
  "subscription": {
    "id": 2,
    "plan": {
      "name": "Free Trial",
      "price": "0.00",
      "max_properties": 1,
      "max_units": 5,
      "max_tenants": 10
    },
    "status": "active",
    "days_remaining": 28,
    "is_expired": false
  },
  "permissions": {...},
  "image": null
}
```

---

## Summary

✅ **Subscription data** included in profile  
✅ **Plan limits** available for UI display  
✅ **Days remaining** for expiry warnings  
✅ **Status check** for access control  
✅ **Single API call** for all user data

**The profile endpoint now provides complete subscription information in one request!** 🎉
