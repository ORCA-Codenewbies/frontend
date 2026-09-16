export type ScreenType =
  | 'AUTH'
  | 'LOCATION_SETUP'
  | 'DASHBOARD'
  | 'CHAT'
  | 'PROFILE'
  | 'SETTINGS'
  | 'HISTORY'
  | 'SAVED'
  | 'HELP_SUPPORT'
  | 'ABOUT';

export interface NavigationState {
  currentScreen: ScreenType;
  history: ScreenType[];
  isDrawerOpen: boolean;
}
