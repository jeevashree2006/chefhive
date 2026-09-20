/*
 * Front-end settings. Prices, cities, menus and food rules come from the API (MySQL);
 * only these presentation details live here.
 */
export const config = {
  brand: 'ChefHive',
  phoneDisplay: '+91 00000 00000', // TODO: real number, as people should read it
  phoneLink: '',                   // TODO: e.g. '+919876543210' (empty hides call links)
  whatsappNumber: '',              // TODO: digits with country code, e.g. '919876543210'
  email: 'hello@chefhive.in',
};

export const whatsappLink = (text) =>
  (config.whatsappNumber ? `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(text)}` : '');
