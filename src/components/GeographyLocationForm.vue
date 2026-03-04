<template>
  <div class="geography-location-form">
    <div class="form-grid">
      <!-- Country Selection -->
      <VaSelect
        v-model="selectedCountry"
        label="Country *"
        :options="countries"
        :loading="loadingCountries"
        text-by="name"
        track-by="id"
        @update:modelValue="onCountryChange"
        :rules="[validators.required]"
        class="mb-4"
      >
        <template #prepend>
          <VaIcon name="public" />
        </template>
      </VaSelect>

      <!-- Region Selection (Optional) -->
      <VaSelect
        v-model="selectedRegion"
        label="Region"
        placeholder="Search region..."
        :options="regions"
        :loading="loadingRegions"
        text-by="name"
        track-by="id"
        :disabled="!selectedCountry"
        @update:modelValue="onRegionChange"
        @scroll-bottom="loadMoreRegions"
        class="mb-4"
        searchable
      >
        <template #appended-options v-if="loadingMoreRegions">
          <div class="loading-more">
            <VaProgressCircle size="small" indeterminate />
            <span>Loading more...</span>
          </div>
        </template>
        <template #prepend>
          <VaIcon name="map" />
        </template>
      </VaSelect>

      <!-- City Selection -->
      <div class="city-selection-section">
        <VaSelect
          v-model="selectedCity"
          label="City *"
          placeholder="Select a city..."
          :options="cities"
          :loading="loadingCities"
          text-by="name"
          track-by="id"
          :disabled="!selectedCountry"
          :rules="[validators.required]"
          :searchable="true"
          search-placeholder="Search for a city..."
          @update:modelValue="onCitySelected"
          @update:search-text="onCitySearch"
          @scroll-bottom="loadMoreCities"
          class="mb-4"
        >
          <template #appended-options v-if="loadingMoreCities">
            <div class="loading-more">
              <VaProgressCircle size="small" indeterminate />
              <span>Loading more...</span>
            </div>
          </template>
          <!-- <template #prepend>
            <VaIcon name="location_city" />
          </template>
          <template #option="{ option, index }: any">
            <div class="city-option">
              <div class="city-name">{{ option.text }}</div>
            </div>
          </template> -->
        </VaSelect>
      </div>
    </div>

    <!-- Area Input -->
    <VaInput
      v-model="formData.area"
      label="Area/Neighborhood *"
      placeholder="Enter area or neighborhood"
      :rules="[validators.required]"
      class="mb-4"
    >
      <template #prepend>
        <VaIcon name="place" />
      </template>
    </VaInput>

    <!-- Selected Location Display -->
    <div v-if="selectedCity" class="selected-location">
      <div class="selected-header">
        <VaIcon name="check_circle" color="primary" />
        <span class="selected-title">Selected Location</span>
      </div>
      <div class="selected-info">
        <div class="location-name">
          {{ selectedCity.name }}, {{ selectedCity.country_name }}
        </div>
        <div class="location-details">
          {{ selectedCity.region_name }} • Area: {{ formData.area }}
        </div>
        <div class="location-coords">
          📍 {{ formatCoordinates(selectedCity) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useAppToast } from "@/composables/useAppToast";
import { validators } from "@/utils/validators";
import apiClient from "@/services/api";

// Types
interface Country {
  id: number;
  name: string;
  code2: string;
  code3: string;
}

interface Region {
  id: number;
  name: string;
  country: number;
  country_name: string;
}

interface City {
  id: number;
  name: string;
  country: number;
  country_name: string;
  region: number;
  region_name: string;
  latitude: number;
  longitude: number;
}

interface LocationFormData {
  country_obj: any;
  city_obj: any;
  region_obj?: number;
  area: string;
}

// Props & Emits
const emit = defineEmits<{
  locationSelected: [
    location: {
      country_obj: any;
      region_obj?: number | null;
      city_obj: any;
      area: string;
    },
  ];
  locationCleared: [];
}>();

const { error } = useAppToast();

// Reactive Data
const formData = ref<LocationFormData>({
  country_obj: null,
  city_obj: null,
  area: "",
});

const selectedCountry = ref<Country | null>(null);
const selectedRegion = ref<Region | null>(null);
const selectedCity = ref<City | null>(null);
const countries = ref<Country[]>([]);
const regions = ref<Region[]>([]);
const cities = ref<City[]>([]);
const loadingCountries = ref(false);
const loadingRegions = ref(false);
const loadingMoreRegions = ref(false);
const loadingCities = ref(false);
const loadingMoreCities = ref(false);
const citySearchTerm = ref("");
const isSearching = ref(false);
const regionsPage = ref(1);
const hasMoreRegions = ref(true);
const citiesPage = ref(1);
const hasMoreCities = ref(true);

// Methods
const loadCountries = async () => {
  loadingCountries.value = true;
  try {
    const response = await apiClient.get("/locations/countries/");
    countries.value = response.data.results;
  } catch (err: any) {
    console.error("Failed to load countries:", err);
    error("Failed to load countries");
  } finally {
    loadingCountries.value = false;
  }
};

const onCountryChange = (country: Country | null) => {
  // Update form data
  formData.value.country_obj = country?.id || null;

  // Clear all region/city-related data
  regions.value = [];
  selectedRegion.value = null;
  formData.value.region_obj = undefined;
  
  cities.value = [];
  citySearchTerm.value = "";
  formData.value.city_obj = null;
  selectedCity.value = null;
  citiesPage.value = 1;
  hasMoreCities.value = true;

  if (country && country.id > 0) {
    loadRegions(country.id);
    loadCities(country.id);
  }
};

const loadRegions = async (countryId: number, reset = true) => {
  if (reset) {
    regions.value = [];
    regionsPage.value = 1;
    hasMoreRegions.value = true;
    loadingRegions.value = true;
  } else {
    loadingMoreRegions.value = true;
  }

  try {
    const response = await apiClient.get(
      `/locations/regions/?country=${countryId}&page=${regionsPage.value}&page_size=20`,
    );

    const newRegions = response.data.results;

    if (reset) {
      regions.value = newRegions;
    } else {
      regions.value = [...regions.value, ...newRegions];
    }

    // Check if there are more regions
    hasMoreRegions.value = response.data.next !== null;
    regionsPage.value++;
  } catch (err: any) {
    if (err.response?.status === 404 && !reset) {
      hasMoreRegions.value = false;
      return;
    }
    console.error("Failed to load regions:", err);
    error("Failed to load regions");
  } finally {
    loadingRegions.value = false;
    loadingMoreRegions.value = false;
  }
};

const onRegionChange = (region: Region | null) => {
  formData.value.region_obj = region?.id;
  
  // Clear city selection but keep cities array if we want to reload
  selectedCity.value = null;
  formData.value.city_obj = null;
  citySearchTerm.value = "";
  
  if (selectedCountry.value) {
    loadCities(selectedCountry.value.id, true, region?.id);
  }
};

const loadCities = async (countryId: number, reset = true, regionId?: number) => {
  if (reset) {
    cities.value = [];
    citiesPage.value = 1;
    hasMoreCities.value = true;
    loadingCities.value = true;
  } else {
    loadingMoreCities.value = true;
  }

  try {
    let url = `/locations/cities/?country=${countryId}&page=${citiesPage.value}&page_size=20`;
    if (regionId) {
      url += `&region=${regionId}`;
    } else if (selectedRegion.value) {
      url += `&region=${selectedRegion.value.id}`;
    }

    const response = await apiClient.get(url);

    const newCities = response.data.results;

    if (reset) {
      cities.value = newCities;
    } else {
      cities.value = [...cities.value, ...newCities];
    }

    // Check if there are more cities
    hasMoreCities.value = response.data.next !== null;
    citiesPage.value++;
  } catch (err: any) {
    if (err.response?.status === 404 && !reset) {
      hasMoreCities.value = false;
      return;
    }
    console.error("Failed to load cities:", err);
    error("Failed to load cities");
  } finally {
    loadingCities.value = false;
    loadingMoreCities.value = false;
  }
};

let searchTimeout: any = null;
const onCitySearch = (searchTerm: string) => {
  if (!selectedCountry.value) return;

  // If the term is the same as current selected city, skip search to avoid clearing list
  if (selectedCity.value && searchTerm === selectedCity.value.name) {
    isSearching.value = false;
    return;
  }

  isSearching.value = searchTerm.length > 0;

  // Debounce search
  if (searchTimeout) clearTimeout(searchTimeout);
  
  searchTimeout = setTimeout(async () => {
    citySearchTerm.value = searchTerm;

    // Only clear and search if term is meaningful and different
    if (searchTerm === citySearchTerm.value && searchTerm.length > 0) {
      cities.value = [];
      citiesPage.value = 1;
      hasMoreCities.value = true;
      await searchCities(selectedCountry.value!.id, searchTerm.trim(), true, selectedRegion.value?.id);
    } else if (searchTerm.length === 0) {
      await loadCities(selectedCountry.value!.id, true, selectedRegion.value?.id);
    }
  }, 400);
};

const onCitySelected = (city: City | null) => {
  if (city) {
    selectCity(city);
  } else {
    formData.value.city_obj = null;
    selectedCity.value = null;
  }
};

const searchCities = async (
  countryId: number,
  searchTerm: string,
  reset = true,
  regionId?: number,
) => {
  if (reset) {
    cities.value = [];
    citiesPage.value = 1;
    hasMoreCities.value = true;
    loadingCities.value = true;
  } else {
    loadingMoreCities.value = true;
  }

  try {
    let url = `/locations/cities/?country=${countryId}&search=${encodeURIComponent(searchTerm)}&page=${citiesPage.value}&page_size=20`;
    if (regionId) {
      url += `&region=${regionId}`;
    } else if (selectedRegion.value) {
      url += `&region=${selectedRegion.value.id}`;
    }
    
    const response = await apiClient.get(url);

    const newCities = response.data.results;

    if (reset) {
      cities.value = newCities;
    } else {
      cities.value = [...cities.value, ...newCities];
    }

    // Check if there are more cities
    hasMoreCities.value = response.data.next !== null;
    citiesPage.value++;
  } catch (err: any) {
    if (err.response?.status === 404 && !reset) {
      hasMoreCities.value = false;
      return;
    }
    console.error("Failed to search cities:", err);
    error("Failed to search cities");
  } finally {
    loadingCities.value = false;
    loadingMoreCities.value = false;
  }
};

const selectCity = (city: City) => {
  selectedCity.value = city;
  formData.value.city_obj = city.id;
  formData.value.region_obj = city.region;
  citySearchTerm.value = city.name;

  // Auto-fill area if empty
  if (!formData.value.area) {
    formData.value.area = city.name;
  }

  // Emit clean numeric IDs to parent
  emit("locationSelected", {
    country_obj: selectedCountry.value?.id || null,
    region_obj: selectedRegion.value?.id || null,
    city_obj: city.id,
    area: formData.value.area,
  });
};

const formatCoordinates = (city: any): string => {
  if (!city) return "0.0000, 0.0000";

  // Handle both possible naming conventions (latitude/longitude and lat/lon/lng)
  const lat = city.latitude !== undefined ? city.latitude : (city.lat !== undefined ? city.lat : null);
  const lng = city.longitude !== undefined ? city.longitude : (city.lon !== undefined ? city.lon : (city.lng !== undefined ? city.lng : null));

  if (lat === null || lng === null) return "0.0000, 0.0000";

  // Parse if string (Django often returns Decimals as strings)
  const latNum = typeof lat === 'string' ? parseFloat(lat) : lat;
  const lngNum = typeof lng === 'string' ? parseFloat(lng) : lng;

  if (isNaN(latNum) || isNaN(lngNum)) return "0.0000, 0.0000";

  return `${latNum.toFixed(4)}, ${lngNum.toFixed(4)}`;
};

const loadMoreCities = async () => {
  if (!selectedCountry.value || !hasMoreCities.value || loadingMoreCities.value || loadingCities.value) {
    return;
  }

  if (isSearching.value && citySearchTerm.value) {
    await searchCities(selectedCountry.value.id, citySearchTerm.value, false, selectedRegion.value?.id);
  } else {
    await loadCities(selectedCountry.value.id, false, selectedRegion.value?.id);
  }
};

const loadMoreRegions = async () => {
  if (!selectedCountry.value || !hasMoreRegions.value || loadingMoreRegions.value || loadingRegions.value) {
    return;
  }
  await loadRegions(selectedCountry.value.id, false);
};


const clearSelection = () => {
  selectedCountry.value = null;
  selectedRegion.value = null;
  selectedCity.value = null;
  formData.value.area = "";
  citySearchTerm.value = "";
  regions.value = [];
  cities.value = [];

  emit("locationCleared");
};

// Lifecycle
onMounted(() => {
  loadCountries();
});

// Watch for area changes and re-emit with clean IDs
watch(
  () => formData.value.area,
  (newArea) => {
    if (selectedCity.value && selectedCountry.value && formData.value.city_obj && newArea) {
      emit("locationSelected", {
        country_obj: selectedCountry.value.id,
        region_obj: selectedRegion.value?.id || null,
        city_obj: selectedCity.value.id,
        area: newArea,
      });
    }
  },
);

// Expose methods for parent component
defineExpose({
  clearSelection,
  formData,
  selectedCity,
});
</script>

<style scoped>
.geography-location-form {
  width: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.city-search-section {
  position: relative;
}

.city-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--va-background-element);
  border: 1px solid var(--va-background-border);
  border-radius: 8px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-top: 0.5rem;
  scroll-behavior: smooth;
}

.city-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--va-background-border);
  transition: background-color 0.2s;
}

.city-item:hover {
  background: var(--va-background-primary);
}

.city-item.selected {
  background: var(--va-primary);
  color: white;
}

.city-item:last-child {
  border-bottom: none;
}

.city-option {
  padding: 8px 0;
}

.city-option .city-name {
  font-weight: 600;
  color: var(--va-text-primary);
  margin-bottom: 2px;
}

.city-option .city-details {
  font-size: 0.875rem;
  color: var(--va-text-secondary);
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 12px 16px;
  color: var(--va-text-secondary);
  font-size: 0.875rem;
}

.no-more-cities {
  display: flex;
  justify-content: center;
  padding: 12px 16px;
  color: var(--va-text-secondary);
  font-size: 0.875rem;
  font-style: italic;
}

.city-name {
  font-weight: 600;
  color: var(--va-text-primary);
  margin-bottom: 4px;
}

.city-item.selected .city-name {
  color: white;
}

.city-details {
  font-size: 0.875rem;
  color: var(--va-text-secondary);
}

.city-item.selected .city-details {
  color: rgba(255, 255, 255, 0.8);
}

.selected-location {
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--va-background-primary);
  border: 1px solid var(--va-primary);
  border-radius: 8px;
}

.selected-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.selected-title {
  font-weight: 600;
  color: var(--va-text-primary);
}

.location-name {
  color: var(--va-text-primary);
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.location-details {
  color: var(--va-text-secondary);
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.location-coords {
  color: var(--va-text-secondary);
  font-size: 0.8rem;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
