/**
 * Global state store (Zustand).
 * Manages: buildings, active filter, selected building, user/projects, fabrication mode.
 */

import { create } from "zustand";
import axios from "axios";

const API = "https://masiv-dashboard-production.up.railway.app/api";

export const useStore = create((set, get) => ({
  // ── Data ──────────────────────────────────────────────────────────────────
  buildings: [],
  loadingBuildings: false,
  buildingError: null,

  fetchBuildings: async () => {
    set({ loadingBuildings: true, buildingError: null });
    try {
      const { data } = await axios.get(`${API}/buildings/`);
      set({ buildings: data.buildings, loadingBuildings: false });
    } catch (e) {
      set({ buildingError: e.message, loadingBuildings: false });
    }
  },

  // ── Selection ─────────────────────────────────────────────────────────────
  selectedBuilding: null,
  setSelectedBuilding: (b) => set({ selectedBuilding: b }),

  // ── LLM Filter ───────────────────────────────────────────────────────────
  activeFilter: null,          // { height_min, height_max, use_types, ... }
  filterDescription: "",
  llmLoading: false,
  llmError: null,
  lastQuery: "",

  runLLMQuery: async (queryText) => {
    set({ llmLoading: true, llmError: null, lastQuery: queryText });
    try {
      const { data } = await axios.post(`${API}/llm/query`, { query: queryText });
      set({
        activeFilter: data.filter,
        filterDescription: data.filter.description || queryText,
        llmLoading: false,
      });
    } catch (e) {
      set({
        llmError: e.response?.data?.error || e.message,
        llmLoading: false,
      });
    }
  },

  clearFilter: () => set({ activeFilter: null, filterDescription: "", lastQuery: "" }),

  // ── User / Projects ───────────────────────────────────────────────────────
  user: null,         // { id, username }
  projects: [],

  login: async (username) => {
    const { data } = await axios.post(`${API}/projects/user`, { username });
    set({ user: data });
    get().fetchProjects(data.id);
  },

  fetchProjects: async (userId) => {
    const { data } = await axios.get(`${API}/projects/${userId}`);
    set({ projects: data.projects });
  },

  saveProject: async (name) => {
    const { user, lastQuery, activeFilter, fetchProjects } = get();
    if (!user) return;
    await axios.post(`${API}/projects/${user.id}`, {
      name,
      query_text: lastQuery,
      filter: activeFilter || {},
    });
    fetchProjects(user.id);
  },

  loadProject: (project) => {
    set({
      activeFilter: project.filter,
      filterDescription: project.query_text || project.name,
      lastQuery: project.query_text || "",
    });
  },

  deleteProject: async (projectId) => {
    const { user, fetchProjects } = get();
    if (!user) return;
    await axios.delete(`${API}/projects/${user.id}/${projectId}`);
    fetchProjects(user.id);
  },

  // ── Fabrication Mode ──────────────────────────────────────────────────────
  fabricationMode: false,
  fabricationBuildings: [],   // list of building ids to trace
  fabricationStep: 0,         // current point index in active toolpath

  toggleFabricationMode: () => {
    const { fabricationMode, buildings, activeFilter } = get();
    if (!fabricationMode) {
      // Use filtered buildings or all
      const filtered = applyFilter(buildings, activeFilter);
      set({
        fabricationMode: true,
        fabricationBuildings: filtered.slice(0, 20).map((b) => b.id),
        fabricationStep: 0,
      });
    } else {
      set({ fabricationMode: false, fabricationBuildings: [], fabricationStep: 0 });
    }
  },

  advanceFabricationStep: () => {
    set((s) => ({ fabricationStep: s.fabricationStep + 1 }));
  },
}));

// ── Filter helper (also used by Scene) ────────────────────────────────────────
export function applyFilter(buildings, filter) {
  if (!filter) return buildings;
  return buildings.filter((b) => {
    if (filter.height_min != null && b.height_m < filter.height_min) return false;
    if (filter.height_max != null && b.height_m > filter.height_max) return false;
    if (filter.value_min  != null && b.assessed_value < filter.value_min)  return false;
    if (filter.value_max  != null && b.assessed_value > filter.value_max)  return false;
    if (filter.levels_min != null && b.levels < filter.levels_min) return false;
    if (filter.levels_max != null && b.levels > filter.levels_max) return false;
    if (filter.use_types?.length && !filter.use_types.includes(b.use_type)) return false;
    if (filter.zonings?.length    && !filter.zonings.includes(b.zoning))    return false;
    if (filter.year_min != null) {
      const yr = parseInt(b.year_built);
      if (!isNaN(yr) && yr < filter.year_min) return false;
    }
    if (filter.year_max != null) {
      const yr = parseInt(b.year_built);
      if (!isNaN(yr) && yr > filter.year_max) return false;
    }
    if (filter.name_contains) {
      const needle = filter.name_contains.toLowerCase();
      if (!b.name.toLowerCase().includes(needle) && !b.address.toLowerCase().includes(needle))
        return false;
    }
    return true;
  });
}
