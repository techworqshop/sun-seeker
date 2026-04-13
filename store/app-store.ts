import { create } from 'zustand';
import type { Cafe, HourlySunForecast } from '@/lib/sun/types';

interface AppState {
  cafes: Cafe[];
  selectedCafe: Cafe | null;
  selectedCafeForecast: HourlySunForecast[] | null;
  isLoadingForecast: boolean;
  viewState: {
    latitude: number;
    longitude: number;
    zoom: number;
  };
  setCafes: (cafes: Cafe[]) => void;
  setSelectedCafe: (cafe: Cafe | null) => void;
  setSelectedCafeForecast: (forecast: HourlySunForecast[] | null) => void;
  setIsLoadingForecast: (loading: boolean) => void;
  setViewState: (vs: { latitude: number; longitude: number; zoom: number }) => void;
}

export const useAppStore = create<AppState>((set) => ({
  cafes: [],
  selectedCafe: null,
  selectedCafeForecast: null,
  isLoadingForecast: false,
  viewState: {
    latitude: 52.52,
    longitude: 13.405,
    zoom: 13,
  },
  setCafes: (cafes) => set({ cafes }),
  setSelectedCafe: (cafe) => set({ selectedCafe: cafe, selectedCafeForecast: null }),
  setSelectedCafeForecast: (forecast) => set({ selectedCafeForecast: forecast }),
  setIsLoadingForecast: (loading) => set({ isLoadingForecast: loading }),
  setViewState: (viewState) => set({ viewState }),
}));
