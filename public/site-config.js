// Public, non-secret site settings. Edit these values — the page renders them automatically.
// Contact fields left empty are simply not shown (no invented details on the site).
// NOTE: the administrator's private booking inbox is NOT configured here; it lives only in
// the server environment variable BOAT_ADMIN_EMAIL.
window.BOAT_SITE = {
  appUrl: 'https://boat-frontend.vercel.app/?page=dashboard',
  region: 'Uganda',
  contact: {
    phone: '',     // e.g. '+256 7XX XXX XXX'
    whatsapp: '',  // e.g. '2567XXXXXXXX' (digits only, used for wa.me link)
    email: '',     // a PUBLIC enquiries address, e.g. 'hello@your-domain.com'
    address: '',   // e.g. 'Plot X, Street, Kampala'
    hours: '',     // e.g. 'Mon–Fri, 8:00–17:00 EAT'
  },
};
