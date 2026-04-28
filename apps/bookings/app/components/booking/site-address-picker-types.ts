export interface SiteAddressPickerProps {
  readonly address: string;
  readonly onAddressChange: (address: string) => void;
  readonly onLocationChange?: (coords: { lat: number; lng: number }) => void;
  readonly onPincodeChange?: (pincode: string) => void;
  readonly placeholder?: string;
}
