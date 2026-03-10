import { defineStore } from "pinia";
import { statsAPI } from "@/services/api";

export const useDashboardStore = defineStore("dashboard", {
    state: () => ({
        stats: null as any,
        loading: false,
        error: null as string | null,
    }),

    getters: {
        summary: (state) => state.stats?.summary || {},
        financial: (state) => state.stats?.financial || {},
        billing: (state) => state.stats?.billing || {},
        tenancyStatus: (state) => state.stats?.tenancy_status || {},
        recentActivity: (state) => state.stats?.recent_activity || { recent_payments: [], recent_tenancies: [] },
        metadata: (state) => state.stats?.metadata || {},
    },

    actions: {
        async fetchStats(params = {}) {
            this.loading = true;
            this.error = null;
            try {
                const response = await statsAPI.get(params);
                this.stats = response.data;
            } catch (err: any) {
                this.error = err.message || "Failed to fetch dashboard stats";
            } finally {
                this.loading = false;
            }
        },
    },
});
