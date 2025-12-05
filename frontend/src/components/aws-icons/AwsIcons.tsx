import React from 'react';

export const EC2Icon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect x="2" y="4" width="20" height="16" rx="2" fill="#FF9900" fillOpacity="0.1" stroke="#FF9900" strokeWidth="1.5"/>
    <rect x="4" y="6" width="4" height="3" rx="0.5" fill="#FF9900"/>
    <rect x="4" y="10" width="4" height="3" rx="0.5" fill="#FF9900"/>
    <rect x="4" y="14" width="4" height="3" rx="0.5" fill="#FF9900"/>
    <rect x="10" y="6" width="4" height="3" rx="0.5" fill="#FF9900"/>
    <rect x="10" y="10" width="4" height="3" rx="0.5" fill="#FF9900"/>
    <rect x="10" y="14" width="4" height="3" rx="0.5" fill="#FF9900"/>
    <rect x="16" y="6" width="4" height="3" rx="0.5" fill="#FF9900"/>
    <rect x="16" y="10" width="4" height="3" rx="0.5" fill="#FF9900"/>
    <rect x="16" y="14" width="4" height="3" rx="0.5" fill="#FF9900"/>
  </svg>
);

export const RDSIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <ellipse cx="12" cy="6" rx="8" ry="2" fill="#3F48CC" fillOpacity="0.1" stroke="#3F48CC" strokeWidth="1.5"/>
    <path d="M4 6v12c0 1.1 3.6 2 8 2s8-0.9 8-2V6" stroke="#3F48CC" strokeWidth="1.5" fill="none"/>
    <ellipse cx="12" cy="12" rx="8" ry="2" fill="#3F48CC" fillOpacity="0.1" stroke="#3F48CC" strokeWidth="1.5"/>
    <ellipse cx="12" cy="18" rx="8" ry="2" fill="#3F48CC" fillOpacity="0.1" stroke="#3F48CC" strokeWidth="1.5"/>
  </svg>
);

export const S3Icon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M3 7l9-4 9 4-9 4-9-4z" fill="#569A31" fillOpacity="0.1" stroke="#569A31" strokeWidth="1.5"/>
    <path d="M3 12l9 4 9-4" stroke="#569A31" strokeWidth="1.5" fill="none"/>
    <path d="M3 17l9 4 9-4" stroke="#569A31" strokeWidth="1.5" fill="none"/>
    <path d="M3 7v10l9 4V11L3 7z" fill="#569A31" fillOpacity="0.05"/>
  </svg>
);

export const CloudFrontIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="#FF9900" fillOpacity="0.1" stroke="#FF9900" strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="6" fill="#FF9900" fillOpacity="0.1" stroke="#FF9900" strokeWidth="1"/>
    <circle cx="12" cy="12" r="2" fill="#FF9900"/>
    <path d="M12 2v4M12 18v4M22 12h-4M6 12H2" stroke="#FF9900" strokeWidth="1.5"/>
    <path d="M19.07 4.93l-2.83 2.83M7.76 16.24l-2.83 2.83M19.07 19.07l-2.83-2.83M7.76 7.76L4.93 4.93" stroke="#FF9900" strokeWidth="1"/>
  </svg>
);

export const Route53Icon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="#FF9900" fillOpacity="0.1" stroke="#FF9900" strokeWidth="1.5"/>
    <path d="M8 8h8v8H8z" fill="#FF9900" fillOpacity="0.1" stroke="#FF9900" strokeWidth="1"/>
    <circle cx="10" cy="10" r="1" fill="#FF9900"/>
    <circle cx="14" cy="10" r="1" fill="#FF9900"/>
    <circle cx="10" cy="14" r="1" fill="#FF9900"/>
    <circle cx="14" cy="14" r="1" fill="#FF9900"/>
    <path d="M10 10L14 14M14 10L10 14" stroke="#FF9900" strokeWidth="1"/>
  </svg>
);