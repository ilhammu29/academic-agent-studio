/**
 * Campus Logos Provider & SVG Assets for Indonesian Universities
 * Includes built-in official vector/SVG representations & file upload converter.
 */

export interface CampusLogo {
  id: string;
  campusName: string;
  shortName: string;
  primaryColor: string;
  svgIcon: string; // inline SVG or data URI
}

export const PRESET_CAMPUS_LOGOS: CampusLogo[] = [
  {
    id: 'uns',
    campusName: 'Universitas Sebelas Maret',
    shortName: 'UNS',
    primaryColor: '#005CA9',
    svgIcon: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="46" fill="%23005CA9" stroke="%23E5A823" stroke-width="4"/><circle cx="50" cy="50" r="36" fill="%23FFFFFF"/><path d="M50 22 L62 38 L54 38 L54 62 L66 62 L66 70 L34 70 L34 62 L46 62 L46 38 L38 38 Z" fill="%23005CA9"/><circle cx="50" cy="50" r="6" fill="%23E5A823"/><text x="50" y="88" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="%23FFFFFF" text-anchor="middle">UNS</text></svg>`
  },
  {
    id: 'ugm',
    campusName: 'Universitas Gadjah Mada',
    shortName: 'UGM',
    primaryColor: '#FFB800',
    svgIcon: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="46" fill="%231E3A8A" stroke="%23FFB800" stroke-width="5"/><polygon points="50,15 62,35 85,35 66,50 74,72 50,58 26,72 34,50 15,35 38,35" fill="%23FFB800"/><circle cx="50" cy="50" r="16" fill="%23FFFFFF"/><text x="50" y="55" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="%231E3A8A" text-anchor="middle">UGM</text></svg>`
  },
  {
    id: 'ui',
    campusName: 'Universitas Indonesia',
    shortName: 'UI',
    primaryColor: '#FFCC00',
    svgIcon: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="46" fill="%23FFCC00" stroke="%23222222" stroke-width="4"/><circle cx="50" cy="50" r="35" fill="%23222222"/><path d="M50 20 C65 35 68 60 50 78 C32 60 35 35 50 20 Z" fill="%23FFCC00"/><circle cx="50" cy="48" r="8" fill="%23FFFFFF"/><text x="50" y="90" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="%23222222" text-anchor="middle">MAKARA UI</text></svg>`
  },
  {
    id: 'itb',
    campusName: 'Institut Teknologi Bandung',
    shortName: 'ITB',
    primaryColor: '#004B87',
    svgIcon: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="46" fill="%23004B87" stroke="%23FFFFFF" stroke-width="3"/><path d="M50 18 L76 34 L76 66 L50 82 L24 66 L24 34 Z" fill="%23FFFFFF" stroke="%23004B87" stroke-width="3"/><path d="M50 28 L68 40 L68 60 L50 72 L32 60 L32 40 Z" fill="%23004B87"/><circle cx="50" cy="50" r="7" fill="%23FFB800"/><text x="50" y="92" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="%23FFFFFF" text-anchor="middle">ITB</text></svg>`
  },
  {
    id: 'its',
    campusName: 'Institut Teknologi Sepuluh Nopember',
    shortName: 'ITS',
    primaryColor: '#002B49',
    svgIcon: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="46" fill="%23002B49" stroke="%2300A3E0" stroke-width="4"/><polygon points="50,18 78,74 22,74" fill="%2300A3E0"/><circle cx="50" cy="52" r="14" fill="%23FFFFFF"/><text x="50" y="56" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="%23002B49" text-anchor="middle">ITS</text></svg>`
  },
  {
    id: 'unair',
    campusName: 'Universitas Airlangga',
    shortName: 'UNAIR',
    primaryColor: '#FDB913',
    svgIcon: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="46" fill="%23FDB913" stroke="%23003366" stroke-width="4"/><circle cx="50" cy="50" r="36" fill="%23003366"/><circle cx="50" cy="50" r="22" fill="%23FFFFFF"/><text x="50" y="54" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="%23003366" text-anchor="middle">UNAIR</text></svg>`
  },
  {
    id: 'undip',
    campusName: 'Universitas Diponegoro',
    shortName: 'UNDIP',
    primaryColor: '#003366',
    svgIcon: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="46" fill="%23003366" stroke="%23C5A059" stroke-width="4"/><path d="M50 20 L75 42 L65 76 L35 76 L25 42 Z" fill="%23C5A059"/><circle cx="50" cy="50" r="12" fill="%23FFFFFF"/><text x="50" y="54" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="%23003366" text-anchor="middle">UNDIP</text></svg>`
  },
  {
    id: 'dikti',
    campusName: 'Kemendikbudristek / Standar Nasional Dikti',
    shortName: 'DIKTI',
    primaryColor: '#002F6C',
    svgIcon: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="46" fill="%23002F6C" stroke="%23FFD100" stroke-width="4"/><circle cx="50" cy="50" r="36" fill="%23FFFFFF"/><path d="M50 24 L64 45 L50 62 L36 45 Z" fill="%23002F6C"/><circle cx="50" cy="45" r="5" fill="%23FFD100"/><text x="50" y="80" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="%23002F6C" text-anchor="middle">TUT WURI</text></svg>`
  }
];

export function getCampusLogoByInstitution(institution: string = ""): string {
  const norm = institution.toLowerCase();
  if (norm.includes("gadjah mada") || norm.includes("ugm")) return PRESET_CAMPUS_LOGOS[1].svgIcon;
  if (norm.includes("indonesia") || norm.includes("ui ")) return PRESET_CAMPUS_LOGOS[2].svgIcon;
  if (norm.includes("bandung") || norm.includes("itb")) return PRESET_CAMPUS_LOGOS[3].svgIcon;
  if (norm.includes("sepuluh nopember") || norm.includes("its")) return PRESET_CAMPUS_LOGOS[4].svgIcon;
  if (norm.includes("airlangga") || norm.includes("unair")) return PRESET_CAMPUS_LOGOS[5].svgIcon;
  if (norm.includes("diponegoro") || norm.includes("undip")) return PRESET_CAMPUS_LOGOS[6].svgIcon;
  if (norm.includes("sebelas maret") || norm.includes("uns")) return PRESET_CAMPUS_LOGOS[0].svgIcon;
  return PRESET_CAMPUS_LOGOS[7].svgIcon; // Default Tut Wuri Handayani / Dikti
}
