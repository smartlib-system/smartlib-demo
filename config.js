// Public demo runtime only. Fictional identity; no external backend.
window.SMARTLIB_CONFIG = {
  environment: "demo",
  schoolId: "SMARTLIB-DEMO",
  schoolName: "SMARTLib Demo School",
  resourceCentreName: "Demo Resource Centre",
  appName: "SMARTLib Demo",
  fullAppName: "Smart Management Automated Resources Tracking Library System",
  tagline: "Sistem Pengurusan Pusat Sumber Sekolah",
  version: "1.0.0",
  backendUrl: "",
  assets: {
    schoolLogo: "assets/school-logo-placeholder.png",
    smartlibLogo: "assets/smartlib-logo-official.png",
    icon192: "assets/icon-192.png",
    icon512: "assets/icon-512.png",
    appleTouchIcon: "assets/apple-touch-icon.png"
  },
  features: {
    dashboard: true, acquisition: true, circulation: true, members: true,
    memberCards: true, opac: true, labels: true, disposal: true,
    booking: true, reports: true
  }
};
