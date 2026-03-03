<template>
  <div class="location-search">
    <VaInput
      v-model="searchQuery"
      label="Search Location"
      placeholder="Start typing to search for a location..."
      @input="handleSearch"
      :loading="loading"
      class="mb-4"
    >
      <template #prepend>
        <VaIcon name="search" />
      </template>
    </VaInput>

    <!-- Search Results Dropdown -->
    <div v-if="searchResults.length > 0" class="search-results">
      <div
        v-for="result in searchResults"
        :key="result.place_id"
        class="search-result-item"
        @click="selectLocation(result)"
      >
        <div class="result-name">{{ result.display_name }}</div>
        <div class="result-details">
          {{ result.type }}, {{ result.class }}
        </div>
      </div>
    </div>

    <!-- Selected Location Display -->
    <div v-if="selectedLocation" class="selected-location">
      <div class="selected-header">
        <VaIcon name="place" color="primary" />
        <span class="selected-title">Selected Location</span>
      </div>
      <div class="selected-info">
        <div class="location-name">{{ selectedLocation.display_name }}</div>
        <div class="location-coords">
          Lat: {{ selectedLocation.lat }}, Lng: {{ selectedLocation.lon }}
        </div>
      </div>
      <VaButton
        preset="plain"
        size="small"
        @click="clearSelection"
        class="clear-btn"
      >
        Clear
      </VaButton>
    </div>

    <!-- Hidden inputs for form data -->
    <VaInput
      v-model="latitude"
      name="latitude"
      type="hidden"
    />
    <VaInput
      v-model="longitude"
      name="longitude"
      type="hidden"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface LocationResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  type: string
  class: string
  address: {
    country?: string
    city?: string
    region?: string
    area?: string
  }
}

const emit = defineEmits<{
  locationSelected: [location: LocationResult]
  locationCleared: []
}>()

const searchQuery = ref('')
const searchResults = ref<LocationResult[]>([])
const selectedLocation = ref<LocationResult | null>(null)
const loading = ref(false)
const latitude = ref('')
const longitude = ref('')

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout>

const handleSearch = (value: string) => {
  clearTimeout(searchTimeout)
  
  if (value.length < 3) {
    searchResults.value = []
    return
  }

  searchTimeout = setTimeout(() => {
    searchLocations(value)
  }, 500)
}

const searchLocations = async (query: string) => {
  loading.value = true
  try {
    // Using Nominatim API (OpenStreetMap) for geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
    )
    
    if (!response.ok) throw new Error('Search failed')
    
    const data = await response.json()
    searchResults.value = data
  } catch (error) {
    console.error('Location search error:', error)
    searchResults.value = []
  } finally {
    loading.value = false
  }
}

const selectLocation = (location: LocationResult) => {
  selectedLocation.value = location
  latitude.value = location.lat
  longitude.value = location.lon
  searchResults.value = []
  searchQuery.value = location.display_name
  
  emit('locationSelected', location)
}

const clearSelection = () => {
  selectedLocation.value = null
  latitude.value = ''
  longitude.value = ''
  searchQuery.value = ''
  searchResults.value = []
  
  emit('locationCleared')
}

// Watch for coordinate changes to update parent form
watch([latitude, longitude], () => {
  if (selectedLocation.value) {
    // Update parent form data with coordinates
    const event = new CustomEvent('location-coordinates', {
      detail: {
        latitude: latitude.value,
        longitude: longitude.value,
        location: selectedLocation.value
      }
    })
    window.dispatchEvent(event)
  }
})
</script>

<style scoped>
.location-search {
  position: relative;
}

.search-results {
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
}

.search-result-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--va-background-border);
  transition: background-color 0.2s;
}

.search-result-item:hover {
  background: var(--va-background-primary);
}

.search-result-item:last-child {
  border-bottom: none;
}

.result-name {
  font-weight: 600;
  color: var(--va-text-primary);
  margin-bottom: 4px;
}

.result-details {
  font-size: 0.875rem;
  color: var(--va-text-secondary);
}

.selected-location {
  margin-top: 16px;
  padding: 16px;
  background: var(--va-background-primary);
  border: 1px solid var(--va-primary);
  border-radius: 8px;
}

.selected-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.selected-title {
  font-weight: 600;
  color: var(--va-text-primary);
}

.location-name {
  color: var(--va-text-primary);
  margin-bottom: 4px;
}

.location-coords {
  font-size: 0.875rem;
  color: var(--va-text-secondary);
  margin-bottom: 8px;
}

.clear-btn {
  color: var(--va-primary) !important;
}
</style>
