# 🔧 PUT & PATCH Duration Editing API Guide

## 🎯 **Overview**

This API provides three endpoints for editing tenancy duration:
- **PUT**: Complete update with all required fields
- **PATCH**: Partial update (recommended for duration editing)
- **PREVIEW**: See changes before applying them

## 🌐 **Endpoints**

### **1. PUT Method (Complete Update)**
```
PUT /api/v1/tenancies/{id}/edit-duration/
```

### **2. PATCH Method (Partial Update)**
```
PATCH /api/v1/tenancies/{id}/edit-duration/
```

### **3. Preview Changes**
```
POST /api/v1/tenancies/{id}/preview-duration/
```

## 🔐 **Authentication**

- **Required**: Yes (JWT Token)
- **Permissions**: Admin users only
- **Preconditions**: Deposit must be confirmed

---

## 📋 **Request Bodies**

### **PUT Request (Complete Update)**
```json
{
  "edit_duration_months": 6,
  "rent_amount": "150000.00",
  "deposit_amount": "300000.00",
  "deposit_paid": true,
  "currency": "TZS"
}
```

### **PATCH Request (Partial Update)**
```json
{
  "edit_duration_months": 6
}
```

### **Preview Request**
```json
{
  "edit_duration_months": 6
}
```

---

## 📊 **Response Structures**

### **PUT & PATCH Response**
```json
{
  "success": true,
  "message": "Duration updated successfully using PUT method",
  "tenancy": {
    "id": 123,
    "tenant_name": "John Doe",
    "unit_number": "UNIT 23",
    "property_name": "Sunset Apartments",
    "rent_amount": "150000.00",
    "deposit_amount": "300000.00",
    "deposit_paid": true,
    "contract_start": "2026-03-01",
    "contract_end": "2026-09-01",
    "status": "active",
    "new_contract_end": "2026-07-01",
    "new_total_amount": "900000.00",
    "current_total_amount": "600000.00",
    "amount_difference": "300000.00"
  }
}
```

### **Preview Response**
```json
{
  "success": true,
  "preview": {
    "new_contract_end": "2026-07-01",
    "new_total_amount": 900000.00,
    "new_duration_months": 6
  },
  "current": {
    "current_contract_end": "2026-05-31",
    "current_total_amount": 600000.00,
    "current_duration_months": 3
  },
  "changes": {
    "amount_difference": 300000.00,
    "months_difference": 3,
    "bills_to_update": 3
  }
}
```

---

## 🔍 **Method Differences**

### **PUT Method**
- **Purpose**: Complete resource update
- **Required Fields**: All tenancy fields
- **Use Case**: When updating multiple fields simultaneously
- **Validation**: Full validation of all fields

### **PATCH Method**
- **Purpose**: Partial resource update
- **Required Fields**: Only `edit_duration_months`
- **Use Case**: When only changing duration
- **Validation**: Duration-specific validation only

### **Recommendation**
**Use PATCH for duration editing** - it's simpler and only requires the duration field.

---

## 📱 **Usage Examples**

### **JavaScript/React**

#### **PATCH Method (Recommended)**
```javascript
const editDuration = async (tenancyId, newMonths) => {
  try {
    const response = await fetch(`/api/v1/tenancies/${tenancyId}/edit-duration/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        edit_duration_months: newMonths
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('Duration updated:', result.tenancy);
      return result.tenancy;
    } else {
      throw new Error(result.edit_duration_months || 'Update failed');
    }
  } catch (error) {
    console.error('Error updating duration:', error);
    throw error;
  }
};

// Usage
editDuration(123, 6)
  .then(tenancy => {
    alert(`Contract updated! New end date: ${tenancy.new_contract_end}`);
  })
  .catch(error => {
    alert(`Failed to update: ${error.message}`);
  });
```

#### **PUT Method (Complete Update)**
```javascript
const updateTenancyComplete = async (tenancyId, updates) => {
  try {
    const response = await fetch(`/api/v1/tenancies/${tenancyId}/edit-duration/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('Tenancy updated:', result.tenancy);
      return result.tenancy;
    } else {
      throw new Error('Update failed');
    }
  } catch (error) {
    console.error('Error updating tenancy:', error);
    throw error;
  }
};

// Usage
updateTenancyComplete(123, {
  edit_duration_months: 6,
  rent_amount: "150000.00",
  deposit_amount: "300000.00",
  deposit_paid: true
});
```

#### **Preview Changes**
```javascript
const previewDuration = async (tenancyId, newMonths) => {
  try {
    const response = await fetch(`/api/v1/tenancies/${tenancyId}/preview-duration/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        edit_duration_months: newMonths
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('Preview:', result);
      return result;
    } else {
      throw new Error('Preview failed');
    }
  } catch (error) {
    console.error('Error previewing changes:', error);
    throw error;
  }
};

// Usage with confirmation dialog
const handleDurationEdit = async (tenancyId, newMonths) => {
  try {
    // Preview first
    const preview = await previewDuration(tenancyId, newMonths);
    
    // Show confirmation dialog
    const confirmed = confirm(
      `Duration will change from ${preview.current.current_duration_months} to ${preview.preview.new_duration_months} months.\n` +
      `Amount difference: ${preview.changes.amount_difference.toLocaleString()} TZS\n` +
      `Bills to update: ${preview.changes.bills_to_update}\n\n` +
      `Proceed with the change?`
    );
    
    if (confirmed) {
      const updated = await editDuration(tenancyId, newMonths);
      alert('Duration updated successfully!');
      return updated;
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
};
```

### **cURL Examples**

#### **PATCH Method**
```bash
curl -X PATCH "http://localhost:8000/api/v1/tenancies/123/edit-duration/" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "edit_duration_months": 6
  }'
```

#### **PUT Method**
```bash
curl -X PUT "http://localhost:8000/api/v1/tenancies/123/edit-duration/" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "edit_duration_months": 6,
    "rent_amount": "150000.00",
    "deposit_amount": "300000.00",
    "deposit_paid": true,
    "currency": "TZS"
  }'
```

#### **Preview Changes**
```bash
curl -X POST "http://localhost:8000/api/v1/tenancies/123/preview-duration/" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "edit_duration_months": 6
  }'
```

### **Python Examples**

#### **PATCH Method**
```python
import requests

def edit_tenancy_duration_patch(tenancy_id, new_months, token):
    url = f"http://localhost:8000/api/v1/tenancies/{tenancy_id}/edit-duration/"
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    data = {'edit_duration_months': new_months}
    
    response = requests.patch(url, headers=headers, json=data)
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Update failed: {response.json()}")

# Usage
try:
    result = edit_tenancy_duration_patch(123, 6, "your_jwt_token")
    print(f"Success! New end date: {result['tenancy']['new_contract_end']}")
except Exception as e:
    print(f"Error: {e}")
```

#### **PUT Method**
```python
def edit_tenancy_duration_put(tenancy_id, new_months, token, tenancy_data):
    url = f"http://localhost:8000/api/v1/tenancies/{tenancy_id}/edit-duration/"
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    data = {
        'edit_duration_months': new_months,
        **tenancy_data  # Include all required fields
    }
    
    response = requests.put(url, headers=headers, json=data)
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Update failed: {response.json()}")

# Usage
tenancy_data = {
    'rent_amount': '150000.00',
    'deposit_amount': '300000.00',
    'deposit_paid': True,
    'currency': 'TZS'
}

try:
    result = edit_tenancy_duration_put(123, 6, "your_jwt_token", tenancy_data)
    print(f"Success! {result['message']}")
except Exception as e:
    print(f"Error: {e}")
```

---

## 🔍 **Validation Rules**

### **Common Validations (All Methods)**
- ✅ Deposit confirmed (`deposit_paid = true`)
- ✅ Active tenancy status
- ✅ Contract not ended
- ✅ Duration: 1-36 months
- ✅ New end date within 3 years

### **Method-Specific Validations**

#### **PUT Method**
- ✅ All required tenancy fields present
- ✅ Complete field validation
- ✅ Data consistency check

#### **PATCH Method**
- ✅ Only `edit_duration_months` required
- ✅ Duration-specific validation
- ✅ Other fields remain unchanged

---

## 📧 **SMS Notifications**

Both PUT and PATCH methods trigger the same SMS notifications:

### **Tenant SMS**
```
Dear John Doe, your tenancy contract for UNIT 23 at Sunset Apartments has been updated to 6 months. New total: 900,000 TZS. Contract period: 01/03/2026 to 31/08/2026. - NEXA PRO
```

### **Owner SMS**
```
Dear Jane Smith, tenancy contract for UNIT 23 at Sunset Apartments has been updated to 6 months for John Doe. New total: 900,000 TZS. - NEXA PRO
```

---

## 🔄 **Process Flow**

### **PUT Method Flow**
1. **Validate**: All required fields present and valid
2. **Check**: Deposit confirmed, tenancy active
3. **Calculate**: New contract end and amounts
4. **Update**: All fields and contract end
5. **Fix Bills**: Update existing bill amounts
6. **Notify**: Send SMS to tenant and owner
7. **Respond**: Return updated tenancy data

### **PATCH Method Flow**
1. **Validate**: Duration field present and valid
2. **Check**: Deposit confirmed, tenancy active
3. **Calculate**: New contract end and amounts
4. **Update**: Duration and contract end only
5. **Fix Bills**: Update existing bill amounts
6. **Notify**: Send SMS to tenant and owner
7. **Respond**: Return updated tenancy data

### **Preview Flow**
1. **Validate**: Duration field present and valid
2. **Calculate**: New values without saving
3. **Return**: Preview of changes
4. **No SMS**: No notifications sent
5. **No Save**: No database changes

---

## 🛡️ **Error Handling**

### **Common Errors**
```json
{
  "edit_duration_months": "Cannot edit duration: Deposit must be confirmed first."
}
```

```json
{
  "edit_duration_months": "Cannot edit duration: Tenancy must be active. Current status: expired"
}
```

```json
{
  "edit_duration_months": "New end date (2029-03-01) exceeds maximum allowed date (2029-03-10)"
}
```

### **Method-Specific Errors**

#### **PUT Errors**
```json
{
  "rent_amount": "This field is required.",
  "deposit_amount": "This field is required."
}
```

#### **PATCH Errors**
```json
{
  "edit_duration_months": "This field is required for duration editing."
}
```

---

## 📊 **Comparison Table**

| Feature | PUT | PATCH | PREVIEW |
|---------|-----|-------|---------|
| **Purpose** | Complete update | Partial update | See changes |
| **Required Fields** | All tenancy fields | Only duration | Only duration |
| **Validation** | Full validation | Duration only | Duration only |
| **Database Changes** | ✅ Yes | ✅ Yes | ❌ No |
| **SMS Notifications** | ✅ Yes | ✅ Yes | ❌ No |
| **Complexity** | High | Low | Low |
| **Recommended** | For multiple updates | For duration only | For confirmation |

---

## 🎯 **Best Practices**

### **When to Use PUT**
- Updating multiple tenancy fields
- Complete data refresh
- Bulk data import
- Administrative corrections

### **When to Use PATCH**
- Only changing duration
- Quick updates
- User interface actions
- Mobile app updates

### **When to Use Preview**
- Before making changes
- User confirmation dialogs
- Impact analysis
- Testing scenarios

### **Recommended Workflow**
1. **Preview** changes first
2. **Confirm** with user
3. **Apply** using PATCH (if only duration)
4. **Apply** using PUT (if multiple fields)

---

## 🚀 **Implementation Summary**

### **Files Updated**
- **`apps/tenancies/views.py`**: Added PUT, PATCH, and preview actions
- **`apps/tenancies/serializers.py`**: Enhanced with duration editing
- **`apps/tenancies/tasks.py`**: SMS notification task
- **Documentation**: Complete API guides

### **Key Features**
- ✅ Both PUT and PATCH methods
- ✅ Preview functionality
- ✅ Comprehensive validation
- ✅ SMS notifications
- ✅ Error handling
- ✅ Audit trail

### **Ready for Production**
- ✅ Fully tested
- ✅ Documented
- ✅ Secure
- ✅ User-friendly

**🎉 Your NEXA PRO system now supports flexible duration editing with both PUT and PATCH methods!**
