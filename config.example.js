// Public browser configuration. Example only: fill this in for the school's own deployment.
window.SMARTLIB_CONFIG = {
  environment: "customer",
  schoolId: "SCHOOL001",
  schoolName: "Nama Sekolah",
  resourceCentreName: "Pusat Sumber Sekolah",
  appName: "SMARTLib",
  fullAppName: "Smart Management Automated Resources Tracking Library System",
  tagline: "Sistem Pengurusan Pusat Sumber Sekolah",
  version: "1.0.0",
  backendUrl: "https://script.google.com/macros/s/XXXXX/exec",
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
