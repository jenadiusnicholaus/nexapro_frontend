import { createPinia } from "pinia";

const pinia = createPinia();
export default pinia;
export { useAuthStore } from "./auth";
export { useGlobalStore } from "./global-store";
export { useLocationsStore } from "./locations";
export { useOwnersStore } from "./owners";
export { usePropertiesStore } from "./properties";
export { useUnitsStore } from "./units";
export { useTenantsStore } from "./tenants";
export { useTenanciesStore } from "./tenancies";
export { useBillsStore } from "./bills";
export { usePaymentsStore } from "./payments";
export { useNotificationsStore } from "./notifications";
export { useProfilesStore } from "./profiles";
export { useSubscriptionsStore } from "./subscriptions";
