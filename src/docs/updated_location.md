# API Endpoint Updates - Region Filtering

## 🎯 Updated Endpoints Documentation

### **Cities Endpoint Enhancement**

#### **Before:**
```
GET /api/v1/locations/cities/?country={id}&search={term}
```

#### **After:**
```
GET /api/v1/locations/cities/?country={id}&region={id}&search={term}
```

### **Complete Endpoint List**

| Endpoint | Method | Parameters | Description |
|----------|--------|------------|-------------|
| `/api/v1/locations/countries/` | GET | - | Get all countries |
| `/api/v1/locations/regions/` | GET | `country={id}` | Get regions for country |
| `/api/v1/locations/cities/` | GET | `country={id}&region={id}&search={term}` | Search cities (filtered by country_id and region_id) |
| `/api/v1/locations/` | POST | Location data | Create location (ID-based) |

## 🔍 Cities Filtering Options

### **Parameters:**
- **`country`** (required): Filter cities by country ID
- **`region`** (optional): Filter cities by region ID  
- **`search`** (optional): Search cities by name

### **Usage Examples:**

#### **1. Get All Cities in Country:**
```bash
GET /api/v1/locations/cities/?country=4
```
*Response: All cities in Tanzania*

#### **2. Get Cities in Specific Region:**
```bash
GET /api/v1/locations/cities/?country=4&region=1
```
*Response: Cities in Dar es Salaam Region, Tanzania*

#### **3. Search Cities in Country:**
```bash
GET /api/v1/locations/cities/?country=4&search=dar
```
*Response: Cities matching "dar" in Tanzania*

#### **4. Search Cities in Region:**
```bash
GET /api/v1/locations/cities/?country=4&region=1&search=dar
```
*Response: Cities matching "dar" in Dar es Salaam Region, Tanzania*

## 📱 Frontend Implementation Updates

### **React + TypeScript**

#### **Service Method:**
```typescript
async searchCities(
  countryId: number,
  regionId?: number,
  searchTerm?: string,
): Promise<{ count: number; results: City[] }> {
  let url = `/locations/cities/?country=${countryId}`;
  if (regionId) {
    url += `&region=${regionId}`;
  }
  if (searchTerm) {
    url += `&search=${encodeURIComponent(searchTerm)}`;
  }
  return this.request(url);
}
```

#### **Component Usage:**
```typescript
// Load cities when region changes
useEffect(() => {
  if (formData.country_obj > 0) {
    const regionId = formData.region_obj > 0 ? formData.region_obj : undefined;
    loadCities(formData.country_obj, regionId);
  }
}, [formData.region_obj, formData.country_obj]);

// Search cities with region filter
const searchCities = async (countryId: number, regionId?: number, searchTerm?: string) => {
  const response = await geographyService.searchCities(countryId, regionId, searchTerm);
  setCities(response.results);
};
```

### **Vue.js**

#### **Service Method:**
```javascript
async searchCities(countryId, regionId = null, searchTerm = '') {
  let url = `/locations/cities/?country=${countryId}`;
  if (regionId) {
    url += `&region=${regionId}`;
  }
  if (searchTerm) {
    url += `&search=${encodeURIComponent(searchTerm)}`;
  }
  const response = await this.client.get(url);
  return response.data;
}
```

#### **Component Usage:**
```javascript
async onRegionChange() {
  // Clear cities when region changes
  this.cities = [];
  this.citySearchTerm = "";
  this.formData.city_obj = 0;
  
  // Reload cities filtered by region if selected
  if (this.formData.country_obj > 0) {
    const regionId = this.formData.region_obj > 0 ? this.formData.region_obj : null;
    await this.loadCities(this.formData.country_obj, regionId);
  }
}
```

### **Angular**

#### **Service Method:**
```typescript
searchCities(countryId: number, regionId?: number, searchTerm?: string): Observable<{ count: number; results: City[] }> {
  let url = `${this.baseUrl}/locations/cities/?country=${countryId}`;
  if (regionId) {
    url += `&region=${regionId}`;
  }
  if (searchTerm) {
    url += `&search=${encodeURIComponent(searchTerm)}`;
  }
  return this.http.get<{ count: number; results: City[] }>(url, { headers: this.getAuthHeaders() });
}
```

## 🎯 Frontend Workflow with Region Filtering

### **Complete User Flow:**

1. **Select Country** → Load regions + cities
   ```
   GET /api/v1/locations/regions/?country=4
   GET /api/v1/locations/cities/?country=4
   ```

2. **Select Region** → Filter cities by region
   ```
   GET /api/v1/locations/cities/?country=4&region=1
   ```

3. **Search Cities** → Search within country/region
   ```
   GET /api/v1/locations/cities/?country=4&region=1&search=dar
   ```

4. **Create Location** → Submit with IDs
   ```
   POST /api/v1/locations/
   {
     "country_obj": 4,
     "region_obj": 1,
     "city_obj": 345,
     "area": "Kigamboni"
   }
   ```

## 🚀 Benefits of Region Filtering

### **1. Improved User Experience:**
- ✅ Progressive filtering reduces options
- ✅ More targeted city selection
- ✅ Faster loading with smaller datasets

### **2. Better Performance:**
- ✅ Reduced API response sizes
- ✅ Faster client-side filtering
- ✅ More efficient database queries

### **3. Enhanced Functionality:**
- ✅ Optional region selection
- ✅ Flexible search combinations
- ✅ Proper geographic hierarchy

## 📊 Response Examples

### **Cities Response with Region Filtering:**
```json
{
  "count": 15,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 345,
      "name": "Dar es Salaam",
      "country": 4,
      "country_name": "Tanzania",
      "region": 1,
      "region_name": "Dar es Salaam Region",
      "latitude": -6.823490,
      "longitude": 39.269510
    },
    {
      "id": 346,
      "name": "Kinondoni",
      "country": 4,
      "country_name": "Tanzania",
      "region": 1,
      "region_name": "Dar es Salaam Region",
      "latitude": -6.742890,
      "longitude": 39.208760
    }
  ]
}
```

## ✅ Implementation Complete

The geography API now fully supports:
- ✅ Country-based city filtering
- ✅ Region-based city filtering  
- ✅ Combined country + region filtering
- ✅ Search within filtered results
- ✅ Proper frontend integration examples

**🎉 The API endpoints are now properly documented with region filtering capabilities!**
