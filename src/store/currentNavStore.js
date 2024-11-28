// src/useStore.js
import { create } from 'zustand';

export const useCurrentNavStore = create((set) => ({
    currentNav: null,
    currentApp: null,
    setNavigation: (nav) => set({ currentNav: nav }),
    setCurrentApp: (app) => set({ currentApp: app }),
}));
