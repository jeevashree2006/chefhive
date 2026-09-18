/*
 * ChefHive site settings: the only file most people need to edit before launch.
 * Loaded before every other script on every page.
 */
window.CH_CONFIG = {
  brand: 'ChefHive',
  siteUrl: 'https://chefhive.in',

  // Contact details shown in the header, footer and confirmation screen.
  phoneDisplay: '+91 00000 00000', // TODO: real number, as people should read it
  phoneLink: '',                   // TODO: e.g. '+919876543210' (leave '' to hide call links)
  whatsappNumber: '',              // TODO: digits only with country code, e.g. '919876543210'
  email: 'hello@chefhive.in',

  // Where form submissions go. Leave '' to run in demo mode (saved only in this browser).
  // Works with a Google Apps Script web app URL; see README.md for the 5-minute setup.
  bookingEndpoint: '',
  partnerEndpoint: '',

  // Shows "sample data" notices. Set to false once cooks, menus and prices are real.
  demoMode: true,

  cities: ['Bengaluru', 'Chennai', 'Hyderabad', 'Kochi', 'Coimbatore', 'Mumbai', 'Pune', 'Delhi NCR'],

  minNoticeDays: 2,     // earliest bookable date = today + this
  maxAdvanceDays: 120,  // latest bookable date = today + this
  advancePercent: 10,   // paid to confirm a booking
};
