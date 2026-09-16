export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  avatarUrl?: string;
  boatName: string;
  boatRegistration: string;
  engineHp: string;
  vesselType: string;
  baseLocation: string; // Base / home harbor
  currentFishingLocation: string; // Current operational location
  fishingType: string;
  preferredLanguage: string;
}

export interface MarineLocation {
  id: string;
  name: string;
  state: string;
  type: 'marine' | 'inland';
  coordinates: {
    lat: number;
    lng: number;
  };
  hasActiveAlert?: boolean;
  alertSeverity?: 'caution' | 'danger';
  alertHeadline?: string;
  alertAction?: string;
}
