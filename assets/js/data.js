/*
 * Business data: occasions, cook levels, pricing, add-ons and occasion packages.
 * All prices are in rupees and are SAMPLE values until CH_CONFIG.demoMode is false.
 * Dishes live in menus.js.
 */
window.CH_DATA = {
  occasions: [
    { id: 'pooja', name: 'Pooja & homam', icon: 'diya', desc: 'Satvik, no onion-garlic menus and naivedyam made the traditional way.' },
    { id: 'griha-pravesh', name: 'Griha pravesh', icon: 'home', desc: 'Housewarming lunch for family and priests, served in the right order.' },
    { id: 'festival', name: 'Festival feast', icon: 'sparkles', desc: 'Onam, Pongal, Ugadi, Ganesh Chaturthi, Durga Puja, Diwali, Eid, Christmas.' },
    { id: 'naming', name: 'Naming & baby ceremonies', icon: 'baby', desc: 'Namakaran, annaprashan, seemantham, godh bharai.' },
    { id: 'birthday', name: 'Birthday & anniversary', icon: 'cake', desc: 'A family-style feast at home instead of another restaurant order.' },
    { id: 'gathering', name: 'Family get-together', icon: 'users', desc: 'Relatives visiting? Cook the dishes everyone grew up with.' },
    { id: 'remembrance', name: 'Remembrance rituals', icon: 'lotus', desc: 'Shraddh, tithi and annual ceremonies with the prescribed food.' },
    { id: 'other', name: 'Something else', icon: 'dots', desc: 'Tell us about it and we will find the right cook.' },
  ],

  festivals: ['Onam', 'Pongal / Sankranti', 'Ugadi / Gudi Padwa', 'Vishu', 'Ganesh Chaturthi', 'Navratri / Durga Puja',
    'Diwali', 'Eid', 'Christmas', 'Holi', 'Raksha Bandhan', 'Other'],

  foodStyles: [
    { id: 'veg', name: 'Vegetarian' },
    { id: 'nonveg', name: 'Non-vegetarian' },
    { id: 'satvik', name: 'Satvik (no onion, no garlic)' },
    { id: 'jain', name: 'Jain (no root vegetables)' },
  ],

  spiceLevels: [
    { id: 'mild', name: 'Mild' },
    { id: 'medium', name: 'Medium' },
    { id: 'hot', name: 'Traditional heat' },
  ],

  meals: [
    { id: 'breakfast', name: 'Breakfast', from: '07:00', to: '10:30' },
    { id: 'lunch', name: 'Lunch', from: '11:30', to: '15:00' },
    { id: 'snacks', name: 'Evening snacks', from: '16:00', to: '18:30' },
    { id: 'dinner', name: 'Dinner', from: '19:00', to: '22:00' },
  ],

  kitchens: [
    { id: 'basic', name: 'Basic', desc: '2 burners, small counter', comfortableDishes: 6 },
    { id: 'standard', name: 'Standard', desc: '3–4 burners, mixer, fridge', comfortableDishes: 12 },
    { id: 'large', name: 'Large', desc: 'Big vessels, lots of counter space', comfortableDishes: 24 },
  ],

  // Cook fee = base + extra guests x perGuest + extra dishes x perDish.
  levels: [
    {
      id: 'home', name: 'Home Cook', tagline: 'Homestyle food for small family meals',
      base: 1499, includedGuests: 6, includedDishes: 5, perGuest: 60, perDish: 150, maxGuests: 15, maxDishes: 8,
      points: ['Everyday dishes from one region', 'Up to 15 guests', 'Cleans the cooking area after'],
    },
    {
      id: 'specialist', name: 'Tradition Specialist', tagline: 'Grew up cooking your cuisine for festivals and poojas',
      base: 2999, includedGuests: 12, includedDishes: 8, perGuest: 70, perDish: 200, maxGuests: 40, maxDishes: 16, popular: true,
      points: ['Knows ritual rules: satvik, Jain, naivedyam', 'Serves in the traditional order', 'Up to 40 guests'],
    },
    {
      id: 'master', name: 'Master Cook', tagline: 'Runs full feasts and large functions with a team',
      base: 5999, includedGuests: 30, includedDishes: 12, perGuest: 60, perDish: 250, maxGuests: 150, maxDishes: 28,
      points: ['15+ years of wedding and temple-style feasts', 'Plans quantities for big crowds', 'Up to 150 guests'],
    },
  ],

  addons: [
    { id: 'helper', name: 'Kitchen helper', desc: 'Chopping, grinding and washing up while the cook cooks.', price: 799, unit: 'per helper', max: 4 },
    { id: 'server', name: 'Serving staff', desc: 'Serves your guests, leaf or thali style, in the traditional order.', price: 999, unit: 'per person', max: 6 },
    { id: 'shopping', name: 'We buy the ingredients', desc: 'We shop fresh that morning. Ingredients billed at actual cost.', price: 499, unit: 'flat fee' },
    { id: 'leaves', name: 'Banana leaves / leaf plates', desc: 'Banana leaves or patravali for traditional serving.', perGuest: 20, unit: 'per guest' },
    { id: 'cleaning', name: 'After-meal cleaning', desc: 'Dishes and dining area cleaned after your guests leave.', price: 699, unit: 'flat fee' },
  ],

  // One helper per this many guests is suggested on the "Cook & extras" step.
  guestsPerHelper: 20,

  packages: [
    {
      id: 'onam-sadhya', name: 'Onam Sadhya', tradition: 'kerala', occasion: 'festival', festival: 'Onam', style: 'veg', level: 'master', minGuests: 15,
      image: 'photo-1788619378696-c77352c43a88', blurb: 'The full leaf: 20 dishes served on banana leaf in the traditional order, ending with two payasams.',
      dishes: ['kl-upperi', 'kl-sharkara', 'kl-pappadam', 'kl-mangapickle', 'kl-injipuli', 'kl-pachadi', 'kl-kichadi', 'kl-thoran', 'kl-avial', 'kl-olan',
        'kl-kalan', 'kl-erissery', 'kl-kootu', 'kl-sambar', 'kl-pulissery', 'kl-rasam', 'kl-moru', 'kl-matta', 'kl-adapradhaman', 'kl-palada'],
    },
    {
      id: 'pooja-satvik', name: 'Pooja Satvik Lunch', tradition: 'tamil', occasion: 'pooja', style: 'satvik', level: 'specialist', minGuests: 10,
      image: 'photo-1642240231842-65462fedb8de', blurb: 'No onion, no garlic. Vadai, sambar, rasam, kootu and sakkarai pongal, fit for naivedyam.',
      dishes: ['tn-medhuvadai', 'tn-sambar', 'tn-rasam', 'tn-poriyal', 'tn-kootu', 'tn-morkuzhambu', 'tn-rice', 'tn-puliyodarai', 'tn-curdrice',
        'tn-appalam', 'tn-pachadi', 'tn-sakkaraipongal', 'tn-payasam'],
    },
    {
      id: 'griha-pravesh-udupi', name: 'Griha Pravesh Lunch', tradition: 'udupi', occasion: 'griha-pravesh', style: 'satvik', level: 'specialist', minGuests: 12,
      image: 'photo-1742281258189-3b933879867a', blurb: 'Udupi temple-style meal for the housewarming: kosambari, gojju, saaru and holige.',
      dishes: ['ud-kosambari', 'ud-happala', 'ud-palya', 'ud-gojju', 'ud-sambar', 'ud-saaru', 'ud-majjigehuli', 'ud-rice', 'ud-chitranna',
        'ud-payasa', 'ud-holige', 'ud-majjige'],
    },
    {
      id: 'ganesh-naivedya', name: 'Ganesh Chaturthi Naivedya', tradition: 'maharashtrian', occasion: 'festival', festival: 'Ganesh Chaturthi', style: 'satvik', level: 'specialist', minGuests: 10,
      image: 'photo-1631743527335-f15e4a4fa196', blurb: 'Ukadiche modak, puran poli and varan bhaat, the way Ganeshotsav is served at home.',
      dishes: ['mh-modak', 'mh-puranpoli', 'mh-varan', 'mh-rice', 'mh-masalebhaat', 'mh-batatabhaji', 'mh-bharlivangi', 'mh-amti', 'mh-koshimbir',
        'mh-kothimbir', 'mh-poli', 'mh-papad'],
    },
    {
      id: 'eid-dawat', name: 'Eid Dawat', tradition: 'hyderabadi', occasion: 'festival', festival: 'Eid', style: 'nonveg', level: 'specialist', minGuests: 15,
      image: 'photo-1633945274405-b6c8069047b0', blurb: 'Mutton dum biryani, mirchi ka salan, shikampuri kebabs and sheer khurma.',
      dishes: ['hy-shikampuri', 'hy-muttonbiryani', 'hy-mirchisalan', 'hy-bagarabaingan', 'hy-korma', 'hy-raita', 'hy-sheermal', 'hy-salad',
        'hy-doublekameetha', 'hy-sheerkhurma'],
    },
    {
      id: 'rajasthani-thali', name: 'Rajasthani Festive Thali', tradition: 'rajasthani', occasion: 'gathering', style: 'veg', level: 'specialist', minGuests: 12,
      image: 'photo-1589778655375-3e622a9fc91c', blurb: 'Dal baati churma, gatte, ker sangri and bajra roti, cooked in real ghee.',
      dishes: ['rj-dalkachori', 'rj-dal', 'rj-baati', 'rj-churma', 'rj-gatte', 'rj-kersangri', 'rj-kadhi', 'rj-bajraroti', 'rj-lehsunchutney',
        'rj-raita', 'rj-moongdalhalwa'],
    },
    {
      id: 'diwali-feast', name: 'Diwali Family Feast', tradition: 'punjabi', occasion: 'festival', festival: 'Diwali', style: 'veg', level: 'specialist', minGuests: 12,
      image: 'photo-1695568181363-af5c78f4d059', blurb: 'Paneer tikka, dal makhani, chole and lachha paratha, with gulab jamun and kheer.',
      dishes: ['pb-paneertikka', 'pb-dalmakhani', 'pb-shahipaneer', 'pb-chole', 'pb-lachha', 'pb-jeera', 'pb-raita', 'pb-salad', 'pb-gulabjamun', 'pb-kheer'],
    },
    {
      id: 'chettinad-feast', name: 'Chettinad Sunday Feast', tradition: 'chettinad', occasion: 'gathering', style: 'nonveg', level: 'specialist', minGuests: 10,
      image: 'photo-1596797038530-2c107229654b', blurb: 'Pepper chicken, mutton kuzhambu and Chettinad biryani, with paal paniyaram to finish.',
      dishes: ['ch-pepperchicken', 'ch-muttonkuzhambu', 'ch-biryani', 'ch-karakuzhambu', 'ch-ennaikathirikai', 'ch-rice', 'ch-rasam', 'ch-appalam',
        'ch-thayir', 'ch-paalpaniyaram'],
    },
    {
      id: 'gujarati-thali', name: 'Gujarati Thali & Farsan', tradition: 'gujarati', occasion: 'naming', style: 'veg', level: 'specialist', minGuests: 12,
      image: 'photo-1714799263291-272975db795a', blurb: 'Dhokla and khandvi to start, undhiyu and kadhi at the centre, shrikhand to end.',
      dishes: ['gj-dhokla', 'gj-khandvi', 'gj-undhiyu', 'gj-kadhi', 'gj-dal', 'gj-sevtameta', 'gj-rotli', 'gj-puri', 'gj-rice', 'gj-chhundo', 'gj-papad', 'gj-shrikhand'],
    },
  ],

  // Unsplash photo IDs (free licence). Replace with your own photos before launch.
  images: {
    hero: 'photo-1625398407796-82650a8c135f',
    heroSide1: 'photo-1680359873864-43e89bf248ac',
    heroSide2: 'photo-1667670651830-2d5bcd0e4f8f',
    usp: 'photo-1728910156510-77488f19b152',
    partner: 'photo-1742281257707-0c7f7e5ca9c6',
  },
};
