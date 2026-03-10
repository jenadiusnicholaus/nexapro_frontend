# 📊 Stats API Documentation

## 🎯 **Overview**

The Stats API provides comprehensive dashboard statistics for the NEXA PRO property management system. It returns real-time data about properties, units, tenants, financials, and recent activity.

## 🌐 **Endpoint**

```
GET /api/v1/stats/
```

## 🔐 **Authentication**

- **Required**: Yes (JWT Token or Session)
- **Permissions**: Authenticated users
- **Role-based**: Admins see all data, Property Owners see only their data

## 📋 **Request Headers**

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## 📊 **Response Structure**

### **Main Sections:**

```json
{
  "summary": {
    "total_properties": 15,
    "active_properties": 15,
    "total_units": 28,
    "occupied_units": 16,
    "vacant_units": 12,
    "occupancy_rate": 57.1,
    "total_tenants": 19,
    "active_tenants": 19,
    "total_tenancies": 19,
    "active_tenancies": 19
  },
  "financial": {
    "total_revenue": 19160150.0,
    "current_month_revenue": 9260150.0,
    "last_month_revenue": 4500000.0,
    "monthly_rent_potential": 2850000.0,
    "outstanding_amount": 4480000.0,
    "overdue_amount": 1200000.0,
    "avg_rent_amount": 150000.0,
    "revenue_growth": 105.8
  },
  "billing": {
    "total_bills": 45,
    "paid_bills": 32,
    "unpaid_bills": 13,
    "overdue_bills": 3,
    "current_month_bills": 19,
    "current_month_paid": 12,
    "payment_rate": 71.1
  },
  "tenancy_status": {
    "expired_tenancies": 2,
    "expiring_next_30_days": 4,
    "total_payments": 32,
    "current_month_payments": 12
  },
  "recent_activity": {
    "recent_payments": [...],
    "recent_tenancies": [...]
  },
  "metadata": {
    "generated_at": "2026-03-10T18:15:30.123456Z",
    "user_role": "admin",
    "currency": "TZS"
  }
}
```

---

## 📈 **Section Details**

### **1. Summary Section**

| Field               | Type    | Description                                 |
| ------------------- | ------- | ------------------------------------------- |
| `total_properties`  | integer | Total number of properties                  |
| `active_properties` | integer | Properties that are active (all properties) |
| `total_units`       | integer | Total number of units across all properties |
| `occupied_units`    | integer | Units currently occupied                    |
| `vacant_units`      | integer | Units currently vacant                      |
| `occupancy_rate`    | float   | Occupancy percentage (1 decimal)            |
| `total_tenants`     | integer | Total number of tenants                     |
| `active_tenants`    | integer | Active tenants (all tenants)                |
| `total_tenancies`   | integer | Total tenancy contracts                     |
| `active_tenancies`  | integer | Currently active tenancies                  |

### **2. Financial Section**

| Field                    | Type  | Description                                        |
| ------------------------ | ----- | -------------------------------------------------- |
| `total_revenue`          | float | Total revenue from all successful payments         |
| `current_month_revenue`  | float | Revenue for current calendar month                 |
| `last_month_revenue`     | float | Revenue for previous calendar month                |
| `monthly_rent_potential` | float | Sum of all active tenancy monthly rents            |
| `outstanding_amount`     | float | Total amount of unpaid bills                       |
| `overdue_amount`         | float | Total amount of overdue bills                      |
| `avg_rent_amount`        | float | Average rent amount across active tenancies        |
| `revenue_growth`         | float | Percentage growth from last month to current month |

### **3. Billing Section**

| Field                 | Type    | Description                       |
| --------------------- | ------- | --------------------------------- |
| `total_bills`         | integer | Total number of bills generated   |
| `paid_bills`          | integer | Bills that have been paid         |
| `unpaid_bills`        | integer | Bills that are currently unpaid   |
| `overdue_bills`       | integer | Unpaid bills past their due date  |
| `current_month_bills` | integer | Bills generated for current month |
| `current_month_paid`  | integer | Current month bills that are paid |
| `payment_rate`        | float   | Percentage of bills that are paid |

### **4. Tenancy Status Section**

| Field                    | Type    | Description                        |
| ------------------------ | ------- | ---------------------------------- |
| `expired_tenancies`      | integer | Tenancies that have expired        |
| `expiring_next_30_days`  | integer | Tenancies expiring in next 30 days |
| `total_payments`         | integer | Total number of payments recorded  |
| `current_month_payments` | integer | Payments made in current month     |

### **5. Recent Activity Section**

#### **Recent Payments Array:**

```json
[
  {
    "id": 123,
    "amount": 150000.0,
    "date": "2026-03-10",
    "tenant": "John Doe",
    "property": "Sunset Apartments",
    "unit": "UNIT 23"
  }
]
```

#### **Recent Tenancies Array:**

```json
[
  {
    "id": 456,
    "tenant": "Jane Smith",
    "property": "Sunset Apartments",
    "unit": "UNIT 15",
    "rent_amount": 150000.0,
    "status": "active",
    "start_date": "2026-03-01",
    "end_date": "2026-09-01"
  }
]
```

### **6. Metadata Section**

| Field          | Type   | Description                             |
| -------------- | ------ | --------------------------------------- |
| `generated_at` | string | ISO timestamp when stats were generated |
| `user_role`    | string | "admin" or "property_owner"             |
| `currency`     | string | Currency code (TZS)                     |

---

## 🎭 **Role-Based Access**

### **Admin Users:**

- See statistics for **all properties** in the system
- Complete overview of entire NEXA PRO platform
- Full financial and operational data

### **Property Owners:**

- See statistics **only for their properties**
- Filtered data based on property ownership
- Personal dashboard for their portfolio

---

## 📱 **Usage Examples**

### **JavaScript/React Example:**

```javascript
// Fetch stats with JWT token
const response = await fetch("/api/core/stats/", {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

const stats = await response.json();

// Use the data
console.log(`Occupancy Rate: ${stats.summary.occupancy_rate}%`);
console.log(`Monthly Revenue: ${stats.financial.current_month_revenue} TZS`);
```

### **cURL Example:**

```bash
curl -X GET "http://localhost:8000/api/v1/stats/" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

### **Python Example:**

```python
import requests

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

response = requests.get('http://localhost:8000/api/v1/stats/', headers=headers)
stats = response.json()

print(f"Total Properties: {stats['summary']['total_properties']}")
print(f"Occupancy Rate: {stats['summary']['occupancy_rate']}%")
```

---

## 🎯 **Dashboard Integration**

### **Key Metrics Display:**

```javascript
// Dashboard cards
const dashboardCards = [
  {
    title: "Properties",
    value: stats.summary.total_properties,
    icon: "building",
  },
  {
    title: "Occupancy Rate",
    value: `${stats.summary.occupancy_rate}%`,
    icon: "chart-line",
  },
  {
    title: "Monthly Revenue",
    value: `${stats.financial.current_month_revenue.toLocaleString()} TZS`,
    icon: "money",
  },
  {
    title: "Active Tenancies",
    value: stats.summary.active_tenancies,
    icon: "users",
  },
];
```

### **Charts Data:**

```javascript
// Revenue chart
const revenueData = {
  current: stats.financial.current_month_revenue,
  previous: stats.financial.last_month_revenue,
  growth: stats.financial.revenue_growth,
};

// Occupancy chart
const occupancyData = {
  occupied: stats.summary.occupied_units,
  vacant: stats.summary.vacant_units,
};
```

---

## ⚡ **Performance Notes**

- **Caching**: Consider implementing Redis caching for stats (5-10 minutes)
- **Database**: Uses efficient queries with aggregates
- **Real-time**: Data is calculated on each request
- **Optimized**: Uses `select_related` and `prefetch_related` where possible

---

## 🔧 **Error Handling**

### **401 Unauthorized:**

```json
{
  "detail": "Authentication credentials were not provided."
}
```

### **403 Forbidden:**

```json
{
  "detail": "You do not have permission to perform this action."
}
```

### **500 Internal Server Error:**

```json
{
  "detail": "Internal server error occurred while generating statistics."
}
```

---

## 🚀 **Future Enhancements**

### **Potential Additions:**

- **Date Range Filtering**: Stats for specific periods
- **Property Filtering**: Filter by specific properties
- **Export Options**: CSV/PDF export of statistics
- **Historical Data**: Trend analysis over time
- **Comparative Stats**: Year-over-year comparisons
- **Advanced Metrics**: ROI, vacancy trends, etc.

### **Performance Improvements:**

- **Background Calculation**: Pre-calculate stats periodically
- **Database Indexing**: Optimize frequent queries
- **Caching Strategy**: Multi-level caching
- **Pagination**: For large datasets

---

## 🎉 **Summary**

The Stats API provides a comprehensive, real-time view of your NEXA PRO property management operations. Perfect for:

- **Dashboard displays**
- **Executive reports**
- **Performance monitoring**
- **Business intelligence**
- **Operational insights**

**🚀 Ready to power your NEXA PRO dashboard!**
