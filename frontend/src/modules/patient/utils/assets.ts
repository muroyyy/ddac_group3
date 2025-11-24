// Asset path utilities for patient module
export const ASSETS = {
  LOGO: '/src/assets/bloodline_logo.jpg',
  REACT_LOGO: '/src/assets/react.svg',
} as const;

// Helper function to get asset path
export const getAssetPath = (assetName: keyof typeof ASSETS): string => {
  return ASSETS[assetName];
};

// For use in components that need the logo
export const useBloodlineLogo = () => getAssetPath('LOGO');