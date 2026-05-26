Implement Location-Aware Marketplace & Dynamic Pricing
"I want to transform the apps/bookings user experience into a location-first marketplace similar to Zomato/Swiggy. Please guide me through implementing the following features:

Phase 1: Geospatial Infrastructure

Schema Update: Ensure the Equipment and Partner models in packages/db support efficient geospatial queries (e.g., storing location as Point and serviceRadius in kilometers).

API Optimization: In @repo/api, create a new procedure equipment.getNearby that accepts (lat, lng). It must:

Filter Equipment where the user's (lat, lng) is within the partner's serviceRadius.

Aggregate pricing for the same MasterCatalog items across multiple partners to return a price range (min/max) instead of a single price.

Ensure this logic is performant and doesn't over-fetch.

Phase 2: "Trendy" Location Header & State

Location Store: Use Zustand to create a useLocationStore that holds the user's current (lat, lng) and formattedAddress. Default to the user's current GPS location on load.

Location UI: Build a mobile-first LocationHeader component that:

Displays the current address.

Features a 'Change' button that opens a vaul drawer with a search bar (using Google Maps Autocomplete API) to set a new manual location.

Persistence: Ensure the Booking flow persists the selected location so that the final order is tied to the correct service area.

Phase 3: Dynamic Range Pricing UI

Fleet Grid: Replace the current flat list with a modern 'Bento Box' grid or card layout.

Range Display: Update the equipment cards to show a dynamic price badge: '₹X - ₹Y / hr' based on the aggregated partner rates for that specific location.

Interactive Updates: Ensure the fleet grid automatically re-fetches and animates (using framer-motion) when the location state in useLocationStore changes.

Phase 4: Booking & My Bookings Integration

Booking Flow: When a user clicks 'Book', pass the selected partnerId and finalPrice (the specific rate they chose) into the booking creation logic.

Dashboard Sync: Ensure the My Bookings page in the bookings app fetches and displays the correct status for these location-specific trips, pulling the real-time Trip status from the backend.

Technical Constraints:

Use the existing DictionaryProvider for all labels.

Keep components mobile-responsive and high-fidelity.

Maintain the monorepo architecture (use shared @repo/ui shells).

Prioritize clean, performant API calls and avoid redundant DB queries."

Pro-Tips for this Implementation:
Google Maps Autocomplete: Since you are already using @react-google-maps/api, use the usePlacesWidget hook for the location search bar in the drawer. It’s the industry standard for that "Swiggy-like" search experience.

Performance: Don't run a heavy database query every time a user types in the search bar. Debounce the location state update.

Visual Hook: For the "range" price (e.g., 50-60), highlight it in the Crux Orange color to make it the clear focal point of the card, while keeping the equipment name in Crux Blue. This creates a hierarchy that tells the user, "This is the machine, and here is how much you can save."
