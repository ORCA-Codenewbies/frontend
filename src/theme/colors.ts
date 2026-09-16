export const colors = {
  // Primary ocean canvas
  background: '#EDF4FA', // Light ocean-blue
  backgroundSubtle: '#F4F8FC',
  
  // Surfaces
  surface: '#FFFFFF',
  surfaceAlt: '#F0F5FA',
  surfaceBorder: 'rgba(13, 35, 58, 0.08)',
  surfaceBorderStrong: 'rgba(13, 35, 58, 0.15)',
  
  // Typography
  textPrimary: '#0C2340', // Deep marine navy
  textSecondary: '#5A738E', // Slate marine
  textMuted: '#8CA0B3',
  textOnPrimary: '#FFFFFF',
  
  // Accents
  accentBlue: '#0284C7', // Vibrant ocean blue
  accentBlueDark: '#0369A1',
  accentBlueLight: '#E0F2FE',
  accentNavy: '#0A2540',
  accentTeal: '#0D9488',
  
  // Status Levels
  statusSafe: '#059669',
  statusSafeBg: '#ECFDF5',
  statusSafeBorder: '#A7F3D0',
  
  statusCaution: '#D97706',
  statusCautionBg: '#FFFBEB',
  statusCautionBorder: '#FDE68A',
  
  statusDanger: '#DC2626',
  statusDangerBg: '#FEF2F2',
  statusDangerBorder: '#FECACA',
  
  statusBipod: '#991B1B',
  statusBipodBg: '#FDF2F8',
  statusBipodBorder: '#FBCFE8',
  
  // Overlays
  overlayDim: 'rgba(10, 25, 45, 0.55)',
  
  // Shadows
  shadowColor: '#0F2642',
};

export const shadows = {
  sm: {
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
  },
};
