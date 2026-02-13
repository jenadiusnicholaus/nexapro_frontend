# Real Estate Management System

## Development Guide

### 1. System Purpose

The system helps property owners or real estate companies: - Manage
properties and units - Track tenants - Generate rent bills - Monitor
payments - Send rent alerts - Track tenant move-ins and move-outs

------------------------------------------------------------------------

### 2. Ownership Model

The system supports: - Individual property owners - Real estate
companies

#### Structure

Owner → Property → Unit → Tenant → Tenancy → Bills → Payments

------------------------------------------------------------------------

### 3. User Roles

#### 1. Admin (Owner)

-   Full access to the system
-   Manage properties, tenants, and payments
-   View reports

#### 2. Property Manager

-   Manage assigned properties
-   Add tenants
-   Record payments

#### 3. Tenant (Optional)

-   View rent balance
-   Receive alerts
-   View payment history

------------------------------------------------------------------------

### 4. Core Modules

#### 4.1 Owner Module

Fields: - id - owner_type (individual or company) - name -
contact_person (for companies) - phone - email - address

------------------------------------------------------------------------

#### 4.2 Location Module

Fields: - id - country - region - city - area

Used to group properties geographically.

------------------------------------------------------------------------

#### 4.3 Property Module

Fields: - id - owner_id - location_id - property_name - property_type -
address - description

------------------------------------------------------------------------

#### 4.4 Unit Module

Fields: - id - property_id - unit_number - floor (optional) -
unit_type - rent_amount - deposit_amount - status (vacant, occupied,
maintenance)

------------------------------------------------------------------------

#### 4.5 Tenant Module

Fields: - id - full_name - phone - email - id_number - emergency_contact

------------------------------------------------------------------------

#### 4.6 Tenancy Module

Tracks tenant occupancy history.

Fields: - id - tenant_id - unit_id - move_in_date - move_out_date -
rent_amount - deposit_amount - contract_start - contract_end - status
(active, completed, terminated)

------------------------------------------------------------------------

#### 4.7 Billing Module

Fields: - id - tenancy_id - billing_period - amount - due_date - status
(unpaid, paid, overdue)

Logic: - Generate monthly rent bills for all active tenancies.

------------------------------------------------------------------------

#### 4.8 Payment Module

Fields: - id - bill_id - tenancy_id - amount_paid - payment_date -
payment_method (cash, bank, mobile money) - reference_number - notes

Logic: - Record payments - Update bill status

------------------------------------------------------------------------

#### 4.9 Notification Module

Types: - Upcoming rent reminder - Due today alert - Overdue alert

Channels: - SMS - WhatsApp - Email - In-app notification

------------------------------------------------------------------------

### 5. Key Workflows

#### 5.1 New Tenant Move-In

1.  Create tenant
2.  Select vacant unit
3.  Create tenancy record
4.  Mark unit as occupied
5.  Generate first bill

#### 5.2 Rent Payment

1.  System generates monthly bill
2.  Tenant receives reminder
3.  Manager records payment
4.  Bill marked as paid

#### 5.3 Tenant Move-Out

1.  Select tenancy
2.  Set move-out date
3.  Close tenancy
4.  Mark unit as vacant

------------------------------------------------------------------------

### 6. API Endpoints (Example)

Properties: - GET /api/properties - POST /api/properties - GET
/api/properties/{id} - PUT /api/properties/{id} - DELETE
/api/properties/{id}

Tenants: - GET /api/tenants - POST /api/tenants

Tenancies: - POST /api/tenancies - PUT /api/tenancies/{id}/move-out

Bills: - GET /api/bills - POST /api/bills/generate

Payments: - POST /api/payments

------------------------------------------------------------------------

### 7. Suggested Tech Stack

Backend: - Django + Django Rest Framework

Frontend: - Vue.js or React

Database: - PostgreSQL

Mobile (optional): - Flutter

Notifications: - SMS or WhatsApp API

------------------------------------------------------------------------

### 8. Background Jobs

Use: - Celery (Django)

Tasks: 1. Monthly bill generation 2. Daily overdue checks 3.
Notification sending

------------------------------------------------------------------------

### 9. MVP Scope

For first version:

1.  Owner module
2.  Property module
3.  Unit module
4.  Tenant module
5.  Tenancy module
6.  Billing module
7.  Payment module
8.  Basic dashboard
