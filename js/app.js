(function () {
  'use strict';
  const config = window.SMARTLIB_CONFIG;
  if (!config || !config.schoolId || !config.schoolName) throw new Error('SMARTLib configuration is required.');
  window.smartlibBackendFetch = async function (url, options) {
    if (config.mode === 'demo') {
      if (typeof window.smartlibDemoFetch !== 'function') throw new Error('Demo adapter is unavailable.');
      return window.smartlibDemoFetch(url, options);
    }
    if (config.mode !== 'school' || !/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(config.backendUrl) || config.backendUrl.includes('XXXXX')) {
      return new Response(JSON.stringify({ok:false,error:'Master scaffold: backend sekolah belum dikonfigurasi.'}), {headers:{'Content-Type':'application/json'}});
    }
    const target = new URL(url);
    const backend = new URL(config.backendUrl);
    if (target.origin !== backend.origin || target.pathname !== backend.pathname) throw new Error('Backend tidak sepadan dengan config sekolah.');
    return window.fetch(target.href, options);
  };
})();
