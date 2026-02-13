# NexaProperty Frontend

A comprehensive Real Estate Management System built with Vue 3, Vite, and Vuestic UI.

## Features

- **Authentication**: JWT-based login/logout system
- **Dashboard**: Overview of key metrics and recent activity
- **Owners Management**: Manage property owners (individuals and companies)
- **Locations**: Geographic location management
- **Properties**: Property management with filtering and search
- **Units**: Unit management with status tracking (vacant, occupied, maintenance)
- **Tenants**: Tenant information management
- **Tenancies**: Move-in and move-out workflows
- **Billing**: Bill generation and management
- **Payments**: Payment recording and tracking
- **Notifications**: Notification management system

## Tech Stack

- **Vue 3**: Progressive JavaScript framework
- **Vite**: Next generation frontend tooling
- **Vuestic UI**: Vue 3 UI component library
- **Vue Router**: Official router for Vue.js
- **Pinia**: State management for Vue
- **Axios**: HTTP client for API requests

## Project Setup

### Prerequisites

- Node.js (^20.19.0 || >=22.12.0)
- Backend API running on `http://localhost:8000`

### Installation

```sh
npm install
```

### Development

Start the development server:

```sh
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in the terminal).

### Production Build

```sh
npm run build
```

### Preview Production Build

```sh
npm run preview
```

## API Configuration

The application is configured to connect to the backend API at:
- Base URL: `http://localhost:8000/api/v1/`
- API Documentation: `http://localhost:8000/api/docs/`

Make sure your backend server is running before starting the frontend.

## Project Structure

```
src/
├── assets/          # Static assets
├── components/     # Reusable Vue components
├── layouts/        # Layout components (MainLayout)
├── router/         # Vue Router configuration
├── services/       # API service layer
├── stores/         # Pinia stores (auth)
├── views/          # Page components
│   ├── Dashboard.vue
│   ├── Login.vue
│   ├── Owners.vue
│   ├── Locations.vue
│   ├── Properties.vue
│   ├── Units.vue
│   ├── Tenants.vue
│   ├── Tenancies.vue
│   ├── Bills.vue
│   ├── Payments.vue
│   └── Notifications.vue
├── App.vue         # Root component
└── main.js         # Application entry point
```

## Usage

1. **Login**: Use your backend credentials to log in
2. **Navigate**: Use the sidebar to navigate between modules
3. **Manage Data**: Use the "Add" buttons to create new records
4. **Edit/Delete**: Use the action buttons in data tables to edit or delete records

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Documentation

- [Main Project Idea](./docs/main-idea.md)
- [API Documentation](./docs/api,.md)
