# Frontend API Usage: SMS & Plans

## 🎯 Overview

Practical API usage guide for implementing SMS usage tracking and subscription plans in the frontend. All endpoints are already implemented and tested.

## 📡 API Endpoints Usage

### **1. SMS Usage Tracking**

#### **Endpoint:**

```
GET /api/v1/subscriptions/subscriptions/sms-usage/
```

#### **When to Use:**

- On dashboard load
- Before sending any SMS
- After SMS is sent (to update count)
- In SMS settings page

#### **Usage Pattern:**

1. **Before SMS Send**: Check if user can send SMS
2. **After SMS Send**: Refresh usage count to update display
3. **Display Update**: Show progress bar and remaining SMS
4. **Limit Handling**: Show upgrade prompt when limit reached

#### **Response Data Structure:**

```json
{
  "usage": {
    "sent": 3,
    "limit": 5,
    "remaining": 2,
    "is_unlimited": false,
    "percentage_used": 60.0
  },
  "can_send": true,
  "message": "You can send 2 more SMS this month.",
  "plan_name": "Free Trial",
  "is_free_tier": true
}
```

#### **Frontend Actions:**

- **Free Tier**: Show progress bar (3/5 SMS used)
- **Approaching Limit**: Show warning when ≤2 SMS remaining
- **Limit Reached**: Block SMS and show upgrade prompt
- **Paid Plans**: Show "Unlimited SMS" status

### **2. Current Subscription Info**

#### **Endpoint:**

```
GET /api/v1/subscriptions/subscriptions/my-subscription/
```

#### **When to Use:**

- On profile/account page load
- Before upgrade/renewal actions
- In billing dashboard

#### **Usage Pattern:**

1. **Load Subscription**: Get current plan and status
2. **Display Info**: Show plan name, price, and status
3. **Check Expiry**: Show renewal reminder if ≤7 days
4. **Update UI**: Display subscription details and renewal options

#### **Response Data Structure:**

```json
{
  "id": 1,
  "plan": {
    "id": 2,
    "name": "Professional",
    "price": "50000.00",
    "currency": "TZS",
    "duration_days": 30
  },
  "status": "active",
  "start_date": "2026-01-01T00:00:00Z",
  "end_date": "2026-01-31T00:00:00Z",
  "days_remaining": 15,
  "is_expired": false,
  "auto_renew": false
}
```

#### **Frontend Actions:**

- **Display Plan**: Show "Professional - TZS 50000/30d"
- **Status Badge**: Show "active" status with color coding
- **Renewal Reminder**: Alert if ≤7 days remaining
- **Renewal Button**: Show if subscription is expired

### **3. Available Plans**

#### **Endpoint:**

```
GET /api/v1/subscriptions/plans/
```

#### **When to Use:**

- On plans/pricing page
- For upgrade flow
- In plan comparison

#### **Usage Pattern:**

1. **Load Plans**: Fetch all available subscription plans
2. **Load Current**: Get user's current subscription
3. **Render Plans**: Display plans with current plan highlighted
4. **Show Options**: Enable upgrade buttons for paid plans

#### **Response Data Structure:**

```json
{
  "count": 3,
  "results": [
    {
      "id": 1,
      "name": "Free Trial",
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
      "is_free_tier": true
    },
    {
      "id": 2,
      "name": "Professional",
      "price": "50000.00",
      "currency": "TZS",
      "duration_days": 30,
      "max_properties": 10,
      "max_units": 50,
      "max_tenants": 100,
      "sms_notifications": true,
      "contract_generation": true,
      "payment_tracking": true,
      "reports_analytics": true,
      "priority_support": false,
      "is_free_tier": false
    }
  ]
}
```

#### **Frontend Actions:**

- **Plan Cards**: Display all plans with features
- **Current Plan**: Highlight user's current plan
- **Free Plan**: Show "Free Plan" button (disabled)
- **Paid Plans**: Show "Upgrade Now" buttons
- **Feature Comparison**: Show SMS limits (5 vs Unlimited)

### **4. Subscription Upgrade**

#### **Endpoint:**

```
POST /api/v1/subscriptions/subscriptions/upgrade/
```

#### **When to Use:**

- When user clicks upgrade button
- After plan selection
- In upgrade flow

#### **Usage Pattern:**

1. **Get Providers**: Fetch available mobile money providers
2. **Show Payment Modal**: Display provider selection options
3. **Process Payment**: Submit upgrade request with payment details
4. **Poll Status**: Check payment completion status
5. **Update UI**: Refresh subscription and SMS usage after success

#### **Request Data:**

```json
{
  "plan_id": 2,
  "account_number": "0712345678",
  "provider": "mpesa"
}
```

#### **Response Data:**

```json
{
  "success": true,
  "message": "USSD push sent. Please confirm payment on your phone.",
  "payment_id": 123,
  "external_id": "SUB-1-456",
  "transaction_id": "TXN789",
  "amount": "50000.00",
  "currency": "TZS",
  "provider": "mpesa",
  "account_number": "255712345678",
  "status": "pending"
}
```

#### **Frontend Actions:**

- **Provider Options**: Show M-Pesa, Airtel Money, Tigo Pesa, etc.
- **Payment Modal**: Display phone number input and provider selection
- **USSD Instructions**: Show "Check your phone for USSD prompt"
- **Status Polling**: Check payment status every 10 seconds
- **Success Handling**: Refresh subscription data and show success message

### **5. Subscription Renewal**

#### **Endpoint:**

```
POST /api/v1/subscriptions/subscriptions/renew/
```

#### **When to Use:**

- When subscription is expiring
- On renewal button click
- In renewal flow

#### **Usage Pattern:**

1. **Get Current Plan**: Load user's current subscription details
2. **Get Providers**: Fetch available mobile money providers
3. **Show Renewal Modal**: Display current plan info and provider options
4. **Process Payment**: Submit renewal request with payment details
5. **Poll Status**: Monitor payment completion
6. **Update UI**: Refresh subscription after successful renewal

#### **Request Data:**

```json
{
  "account_number": "0712345678",
  "provider": "mpesa"
}
```

#### **Response Data:**

```json
{
  "success": true,
  "message": "USSD push sent. Please confirm payment on your phone.",
  "payment_id": 124,
  "external_id": "SUB-1-457",
  "transaction_id": "TXN790",
  "amount": "50000.00",
  "currency": "TZS",
  "provider": "mpesa",
  "account_number": "255712345678",
  "status": "pending"
}
```

#### **Frontend Actions:**

- **Current Plan Display**: Show "Renew Professional - TZS 50000/30d"
- **Provider Selection**: Same options as upgrade flow
- **Payment Processing**: USSD push to user's phone
- **Status Monitoring**: Poll for payment completion
- **Success Handling**: Update subscription end date

## 🔄 Real-time Updates

### **SMS Usage Updates:**

- **After SMS Send**: Immediately refresh SMS usage count
- **Periodic Refresh**: Update SMS usage every 5 minutes
- **Limit Warnings**: Show alerts when approaching limits
- **Progress Updates**: Update progress bars and counters

### **Subscription Monitoring:**

- **Expiry Warnings**: Alert when ≤3 days remaining
- **Status Updates**: Check subscription status every hour
- **Auto-renewal**: Handle automatic renewal notifications
- **Plan Changes**: Update UI when plan changes

## 📱 Integration Points

### **Dashboard Integration:**

- **Load Data**: Fetch SMS usage, subscription, and activity data
- **Display Status**: Show current plan and SMS usage
- **Quick Actions**: Provide upgrade and renewal buttons
- **Real-time Updates**: Keep data current

### **SMS Component Integration:**

- **Pre-send Validation**: Check SMS limits before sending
- **Usage Display**: Show remaining SMS count
- **Limit Handling**: Block sends when limit reached
- **Upgrade Prompts**: Show upgrade options when needed

### **Plan Page Integration:**

- **Plan Comparison**: Display all available plans
- **Current Plan**: Highlight user's current subscription
- **Upgrade Flow**: Handle complete upgrade process
- **Payment Processing**: Manage mobile money payments

### **Settings Integration:**

- **Subscription Info**: Display current subscription details
- **SMS Settings**: Show SMS usage and limits
- **Billing History**: Display payment history
- **Management Options**: Provide renewal and upgrade options

---

**🚀 This API usage guide provides practical implementation for all SMS and subscription functionality with real-time updates and proper error handling!**
