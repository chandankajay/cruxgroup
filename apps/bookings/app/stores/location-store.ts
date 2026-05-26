"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LocationState {
  lat: number | null;
  lng: number | null;
  formattedAddress: string;
  /** Whether the user has explicitly set a location (GPS or manual) */
  isResolved: boolean;
  /** Whether we're currently fetching GPS */
  isLocating: boolean;

  setLocation: (lat: number, lng: number, address: string) => void;
  setLocating: (locating: boolean) => void;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      lat: null,
      lng: null,
      formattedAddress: "",
      isResolved: false,
      isLocating: false,

      setLocation: (lat, lng, address) =>
        set({ lat, lng, formattedAddress: address, isResolved: true, isLocating: false }),

      setLocating: (locating) => set({ isLocating: locating }),

      clearLocation: () =>
        set({ lat: null, lng: null, formattedAddress: "", isResolved: false }),
    }),
    {
      name: "crux-user-location",
      partialize: (state) => ({
        lat: state.lat,
        lng: state.lng,
        formattedAddress: state.formattedAddress,
        isResolved: state.isResolved,
      }),
    }
  )
);
