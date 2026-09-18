/*
 * Food traditions and their dishes.
 * Dish format: [id, name, course, flags]
 *   course: S starters & snacks | M curries & mains | R rice & breads | A sides | D sweets
 *   flags:  n = non-veg | o = onion/garlic is essential (hidden for satvik & Jain) | r = root vegetable (hidden for Jain)
 * Package dish ids in data.js must exist here.
 */
(function () {
  const traditions = [
    {
      id: 'kerala', name: 'Kerala', region: 'Kerala · Malabar', accent: '#2F6B3A', signature: 'Sadhya · Avial · Ada pradhaman',
      blurb: 'Sadhya on banana leaf, coconut-rich curries and Syrian Christian and Malabar specialities.',
      dishes: [
        ['kl-upperi', 'Banana chips (upperi)', 'S'], ['kl-sharkara', 'Sharkara varatti', 'S'], ['kl-pazhampori', 'Pazham pori', 'S'],
        ['kl-parippuvada', 'Parippu vada', 'S', 'o'], ['kl-chickenfry', 'Kerala chicken fry', 'S', 'n'],
        ['kl-sambar', 'Sambar', 'M'], ['kl-avial', 'Avial', 'M', 'r'], ['kl-olan', 'Olan', 'M'], ['kl-kalan', 'Kalan', 'M', 'r'],
        ['kl-erissery', 'Erissery', 'M'], ['kl-thoran', 'Cabbage thoran', 'M'], ['kl-kootu', 'Kootu curry', 'M', 'r'],
        ['kl-pulissery', 'Pulissery', 'M'], ['kl-pachadi', 'Beetroot pachadi', 'A', 'r'], ['kl-kichadi', 'Cucumber kichadi', 'A'],
        ['kl-meencurry', 'Kerala fish curry', 'M', 'n'], ['kl-stew', 'Chicken stew', 'M', 'n'], ['kl-duckroast', 'Duck roast', 'M', 'n'],
        ['kl-karimeen', 'Karimeen pollichathu', 'M', 'n'],
        ['kl-matta', 'Kerala matta rice', 'R'], ['kl-appam', 'Appam', 'R'], ['kl-idiyappam', 'Idiyappam', 'R'], ['kl-parotta', 'Malabar parotta', 'R'],
        ['kl-rasam', 'Rasam', 'A'], ['kl-injipuli', 'Inji puli', 'A'], ['kl-mangapickle', 'Mango pickle', 'A'], ['kl-pappadam', 'Pappadam', 'A'],
        ['kl-moru', 'Sambharam (spiced buttermilk)', 'A'],
        ['kl-adapradhaman', 'Ada pradhaman', 'D'], ['kl-palada', 'Palada payasam', 'D'], ['kl-parippupayasam', 'Parippu payasam', 'D'],
      ],
    },
    {
      id: 'chettinad', name: 'Chettinad', region: 'Tamil Nadu', accent: '#9A3412', signature: 'Pepper chicken · Kara kuzhambu · Paniyaram',
      blurb: 'Bold, freshly ground spice blends from Karaikudi, and some of Tamil Nadu\'s best vegetarian gravies.',
      dishes: [
        ['ch-pepperchicken', 'Pepper chicken (milagu varuval)', 'S', 'n'], ['ch-muttonchukka', 'Mutton chukka', 'S', 'n'],
        ['ch-kuzhipaniyaram', 'Kara kuzhi paniyaram', 'S'], ['ch-vazhakkai', 'Raw banana fry', 'S'],
        ['ch-chickencurry', 'Chettinad chicken curry', 'M', 'n'], ['ch-muttonkuzhambu', 'Mutton kuzhambu', 'M', 'n'],
        ['ch-nandu', 'Nandu (crab) masala', 'M', 'n'], ['ch-karakuzhambu', 'Kara kuzhambu', 'M', 'o'], ['ch-vendakkai', 'Vendakkai mandi', 'M'],
        ['ch-ennaikathirikai', 'Ennai kathirikai', 'M'], ['ch-kurma', 'Vegetable kurma', 'M', 'r'],
        ['ch-biryani', 'Chettinad chicken biryani', 'R', 'n'], ['ch-vegbiryani', 'Seeraga samba veg biryani', 'R', 'or'],
        ['ch-rice', 'Steamed rice', 'R'], ['ch-idiyappam', 'Idiyappam', 'R'], ['ch-kaldosai', 'Kal dosai', 'R'],
        ['ch-rasam', 'Milagu rasam', 'A'], ['ch-appalam', 'Appalam', 'A'], ['ch-kosumalli', 'Kosumalli', 'A'], ['ch-thayir', 'Thayir pachadi', 'A'],
        ['ch-paalpaniyaram', 'Paal paniyaram', 'D'], ['ch-kavuni', 'Kavuni arisi', 'D'], ['ch-adhirasam', 'Adhirasam', 'D'],
      ],
    },
    {
      id: 'tamil', name: 'Tamil Traditional', region: 'Tamil Nadu', accent: '#B45309', signature: 'Sambar · Poriyal · Sakkarai pongal',
      blurb: 'Festival and temple-style vegetarian cooking: the full elai saapadu with vadai and payasam.',
      dishes: [
        ['tn-medhuvadai', 'Medu vadai', 'S'], ['tn-masalavadai', 'Masala vadai', 'S', 'o'], ['tn-sundal', 'Kondakadalai sundal', 'S'],
        ['tn-bajji', 'Vazhakkai bajji', 'S'],
        ['tn-sambar', 'Sambar', 'M'], ['tn-morkuzhambu', 'Mor kuzhambu', 'M'], ['tn-vathakuzhambu', 'Vatha kuzhambu', 'M'],
        ['tn-poriyal', 'Beans poriyal', 'M'], ['tn-kootu', 'Pooshanikai kootu', 'M'], ['tn-avial', 'Avial', 'M', 'r'],
        ['tn-usili', 'Paruppu usili', 'M'], ['tn-urulai', 'Urulai roast', 'M', 'r'],
        ['tn-rice', 'Rice with paruppu & ghee', 'R'], ['tn-puliyodarai', 'Puliyodarai', 'R'], ['tn-lemonrice', 'Lemon rice', 'R'],
        ['tn-curdrice', 'Curd rice', 'R'], ['tn-venpongal', 'Ven pongal', 'R'],
        ['tn-rasam', 'Rasam', 'A'], ['tn-appalam', 'Appalam', 'A'], ['tn-pachadi', 'Manga pachadi', 'A'], ['tn-pickle', 'Narthangai pickle', 'A'],
        ['tn-sakkaraipongal', 'Sakkarai pongal', 'D'], ['tn-payasam', 'Semiya payasam', 'D'], ['tn-kesari', 'Rava kesari', 'D'],
        ['tn-paruppupayasam', 'Paruppu payasam', 'D'],
      ],
    },
    {
      id: 'udupi', name: 'Udupi & Mangalorean', region: 'Coastal Karnataka', accent: '#0F766E', signature: 'Saaru · Gojju · Neer dosa · Ghee roast',
      blurb: 'Temple-town vegetarian cooking from Udupi, plus Mangalore\'s coconut curries and ghee roasts.',
      dishes: [
        ['ud-golibaje', 'Goli baje', 'S'], ['ud-buns', 'Mangalore buns', 'S'], ['ud-gheeroast', 'Chicken ghee roast', 'S', 'n'],
        ['ud-fishfry', 'Rava fish fry', 'S', 'n'],
        ['ud-sambar', 'Udupi sambar', 'M'], ['ud-saaru', 'Tomato saaru', 'M'], ['ud-majjigehuli', 'Majjige huli', 'M'],
        ['ud-gojju', 'Pineapple gojju', 'M'], ['ud-palya', 'Beans palya', 'M'], ['ud-manoli', 'Kadale manoli', 'M'],
        ['ud-korigassi', 'Kori gassi', 'M', 'n'], ['ud-meengassi', 'Meen gassi', 'M', 'n'],
        ['ud-neerdosa', 'Neer dosa', 'R'], ['ud-chitranna', 'Chitranna', 'R'], ['ud-bisibele', 'Bisi bele bath', 'R', 'r'],
        ['ud-rice', 'Steamed rice', 'R'], ['ud-kottekadubu', 'Kotte kadubu', 'R'], ['ud-korirotti', 'Kori rotti', 'R'],
        ['ud-kosambari', 'Kosambari', 'A'], ['ud-happala', 'Happala', 'A'], ['ud-chutney', 'Coconut chutney', 'A'],
        ['ud-majjige', 'Neer majjige', 'A'],
        ['ud-payasa', 'Godhi payasa', 'D'], ['ud-holige', 'Holige', 'D'], ['ud-kesaribath', 'Kesari bath', 'D'], ['ud-mysorepak', 'Mysore pak', 'D'],
      ],
    },
    {
      id: 'andhra', name: 'Andhra & Telangana', region: 'Andhra Pradesh · Telangana', accent: '#B91C1C', signature: 'Gongura · Gutti vankaya · Pulihora',
      blurb: 'Fiery pickles, tangy pulusus and the festive Ugadi and Sankranti spreads.',
      dishes: [
        ['an-punugulu', 'Punugulu', 'S'], ['an-mirchibajji', 'Mirchi bajji', 'S'], ['an-kodivepudu', 'Kodi vepudu', 'S', 'n'],
        ['an-royyala', 'Royyala vepudu', 'S', 'n'],
        ['an-guttivankaya', 'Gutti vankaya', 'M'], ['an-tomatopappu', 'Tomato pappu', 'M'], ['an-palakurapappu', 'Palakura pappu', 'M'],
        ['an-pulusu', 'Mukkala pulusu', 'M', 'r'], ['an-majjigapulusu', 'Majjiga pulusu', 'M'], ['an-bendakaya', 'Bendakaya fry', 'M'],
        ['an-gonguramutton', 'Gongura mutton', 'M', 'n'], ['an-natukodi', 'Natu kodi kura', 'M', 'n'], ['an-chepala', 'Chepala pulusu', 'M', 'n'],
        ['an-pulihora', 'Pulihora', 'R'], ['an-rice', 'Steamed rice with ghee', 'R'], ['an-jonnarotte', 'Jonna rotte', 'R'],
        ['an-pesarattu', 'Pesarattu', 'R'],
        ['an-charu', 'Charu', 'A'], ['an-gongurapachadi', 'Gongura pachadi', 'A'], ['an-avakaya', 'Avakaya', 'A'], ['an-appadam', 'Appadam', 'A'],
        ['an-bobbatlu', 'Bobbatlu', 'D'], ['an-ariselu', 'Ariselu', 'D'], ['an-semiya', 'Semiya payasam', 'D'], ['an-sunnundalu', 'Sunnundalu', 'D'],
      ],
    },
    {
      id: 'hyderabadi', name: 'Hyderabadi', region: 'Telangana', accent: '#6D28D9', signature: 'Dum biryani · Mirchi ka salan · Double ka meetha',
      blurb: 'Deccani dawat cooking: slow dum biryani, rich salans and Eid sweets.',
      dishes: [
        ['hy-shikampuri', 'Shikampuri kebab', 'S', 'n'], ['hy-lukhmi', 'Lukhmi', 'S', 'n'], ['hy-patharkagosht', 'Pathar ka gosht', 'S', 'n'],
        ['hy-pakoda', 'Onion pakoda', 'S', 'or'],
        ['hy-mirchisalan', 'Mirchi ka salan', 'M', 'o'], ['hy-bagarabaingan', 'Bagara baingan', 'M', 'o'], ['hy-khattidal', 'Khatti dal', 'M'],
        ['hy-tamatarkut', 'Tamatar ka kut', 'M'], ['hy-dalcha', 'Mutton dalcha', 'M', 'n'], ['hy-haleem', 'Haleem', 'M', 'n'],
        ['hy-korma', 'Mutton korma', 'M', 'n'],
        ['hy-muttonbiryani', 'Mutton dum biryani', 'R', 'n'], ['hy-chickenbiryani', 'Chicken dum biryani', 'R', 'n'],
        ['hy-vegbiryani', 'Veg dum biryani', 'R', 'or'], ['hy-bagararice', 'Bagara rice', 'R', 'o'], ['hy-sheermal', 'Sheermal', 'R'],
        ['hy-rumali', 'Rumali roti', 'R'],
        ['hy-raita', 'Dahi ki chutney', 'A'], ['hy-burani', 'Burani raita', 'A', 'o'], ['hy-salad', 'Onion-cucumber salad', 'A', 'or'],
        ['hy-doublekameetha', 'Double ka meetha', 'D'], ['hy-qubani', 'Qubani ka meetha', 'D'], ['hy-sheerkhurma', 'Sheer khurma', 'D'],
        ['hy-phirni', 'Phirni', 'D'],
      ],
    },
    {
      id: 'bengali', name: 'Bengali', region: 'West Bengal', accent: '#BE123C', signature: 'Bhoger khichuri · Shorshe ilish · Payesh',
      blurb: 'Puja bhog, mustard-laced fish and the patient art of Bengali sweets.',
      dishes: [
        ['bn-beguni', 'Beguni', 'S'], ['bn-fishfry', 'Kolkata fish fry', 'S', 'n'], ['bn-mochar', 'Mochar chop', 'S', 'r'],
        ['bn-begunbhaja', 'Begun bhaja', 'S'],
        ['bn-shukto', 'Shukto', 'M', 'r'], ['bn-labra', 'Labra', 'M', 'r'], ['bn-cholardal', 'Cholar dal', 'M'], ['bn-alooposto', 'Aloo posto', 'M', 'r'],
        ['bn-dhoka', 'Dhokar dalna', 'M', 'r'], ['bn-chhana', 'Chhanar dalna', 'M', 'r'], ['bn-potol', 'Potoler dorma', 'M'],
        ['bn-ilish', 'Shorshe ilish', 'M', 'n'], ['bn-chingri', 'Chingri malai curry', 'M', 'n'], ['bn-kosha', 'Kosha mangsho', 'M', 'n'],
        ['bn-khichuri', 'Bhoger khichuri', 'R'], ['bn-basanti', 'Basanti pulao', 'R'], ['bn-luchi', 'Luchi', 'R'], ['bn-rice', 'Gobindobhog rice', 'R'],
        ['bn-chutney', 'Tomato-khejur chutney', 'A'], ['bn-papad', 'Papad', 'A'],
        ['bn-payesh', 'Payesh', 'D'], ['bn-rosogolla', 'Rosogolla', 'D'], ['bn-sandesh', 'Sandesh', 'D'], ['bn-mishtidoi', 'Mishti doi', 'D'],
        ['bn-malpua', 'Malpua', 'D'],
      ],
    },
    {
      id: 'gujarati', name: 'Gujarati', region: 'Gujarat', accent: '#CA8A04', signature: 'Dhokla · Undhiyu · Shrikhand',
      blurb: 'The sweet-sour-spicy balance, farsan platters and the full Kathiyawadi thali.',
      dishes: [
        ['gj-dhokla', 'Khaman dhokla', 'S'], ['gj-khandvi', 'Khandvi', 'S'], ['gj-patra', 'Patra', 'S'], ['gj-handvo', 'Handvo', 'S'],
        ['gj-muthiya', 'Methi muthiya', 'S'],
        ['gj-undhiyu', 'Undhiyu', 'M', 'r'], ['gj-kadhi', 'Gujarati kadhi', 'M'], ['gj-dal', 'Gujarati dal', 'M'], ['gj-sevtameta', 'Sev tameta nu shaak', 'M'],
        ['gj-ringan', 'Ringan no olo', 'M'], ['gj-bhinda', 'Bhinda nu shaak', 'M'], ['gj-batata', 'Batata nu shaak', 'M', 'r'],
        ['gj-rotli', 'Phulka rotli', 'R'], ['gj-puri', 'Puri', 'R'], ['gj-thepla', 'Methi thepla', 'R'], ['gj-khichdi', 'Vaghareli khichdi', 'R'],
        ['gj-rice', 'Jeera rice', 'R'], ['gj-rotla', 'Bajra rotla', 'R'],
        ['gj-chhundo', 'Chhundo', 'A'], ['gj-kachumber', 'Kachumber', 'A', 'o'], ['gj-papad', 'Papad', 'A'], ['gj-chaas', 'Chaas', 'A'],
        ['gj-shrikhand', 'Shrikhand', 'D'], ['gj-basundi', 'Basundi', 'D'], ['gj-mohanthal', 'Mohanthal', 'D'], ['gj-sukhdi', 'Sukhdi', 'D'],
        ['gj-aamras', 'Aamras (seasonal)', 'D'],
      ],
    },
    {
      id: 'rajasthani', name: 'Rajasthani & Marwari', region: 'Rajasthan', accent: '#C2410C', signature: 'Dal baati churma · Gatte · Ker sangri',
      blurb: 'Desert-kitchen cooking built on ghee, gram flour and sun-dried beans, made for big family feasts.',
      dishes: [
        ['rj-pyazkachori', 'Pyaaz kachori', 'S', 'or'], ['rj-mirchivada', 'Mirchi vada', 'S', 'r'], ['rj-dalkachori', 'Dal kachori', 'S'],
        ['rj-dal', 'Panchmel dal', 'M'], ['rj-gatte', 'Gatte ki sabzi', 'M'], ['rj-kersangri', 'Ker sangri', 'M'], ['rj-papadsabzi', 'Papad ki sabzi', 'M'],
        ['rj-kadhi', 'Rajasthani kadhi', 'M'], ['rj-laalmaas', 'Laal maas', 'M', 'n'], ['rj-safedmaas', 'Safed maas', 'M', 'n'],
        ['rj-baati', 'Baati', 'R'], ['rj-bajraroti', 'Bajra roti', 'R'], ['rj-missiroti', 'Missi roti', 'R'], ['rj-puri', 'Puri', 'R'],
        ['rj-khichdi', 'Bajra khichdi', 'R'],
        ['rj-lehsunchutney', 'Lehsun ki chutney', 'A', 'o'], ['rj-raita', 'Boondi raita', 'A'], ['rj-papad', 'Roasted papad', 'A'],
        ['rj-churma', 'Churma', 'D'], ['rj-ghevar', 'Ghevar', 'D'], ['rj-moongdalhalwa', 'Moong dal halwa', 'D'], ['rj-malpua', 'Malpua', 'D'],
        ['rj-mawakachori', 'Mawa kachori', 'D'],
      ],
    },
    {
      id: 'maharashtrian', name: 'Maharashtrian', region: 'Maharashtra', accent: '#A16207', signature: 'Puran poli · Modak · Varan bhaat',
      blurb: 'Ganeshotsav naivedya, Konkan coconut curries and Kolhapuri heat.',
      dishes: [
        ['mh-kothimbir', 'Kothimbir vadi', 'S'], ['mh-sabudana', 'Sabudana vada', 'S', 'r'], ['mh-batatavada', 'Batata vada', 'S', 'r'],
        ['mh-surmai', 'Surmai fry', 'S', 'n'],
        ['mh-varan', 'Varan (dal with ghee)', 'M'], ['mh-amti', 'Katachi amti', 'M'], ['mh-bharlivangi', 'Bharli vangi', 'M'],
        ['mh-usal', 'Matki usal', 'M'], ['mh-pitla', 'Pitla', 'M'], ['mh-batatabhaji', 'Batatyachi bhaji', 'M', 'r'],
        ['mh-tambda', 'Kolhapuri tambda rassa', 'M', 'n'], ['mh-kolhapurichicken', 'Kolhapuri chicken', 'M', 'n'],
        ['mh-malvanifish', 'Malvani fish curry', 'M', 'n'],
        ['mh-masalebhaat', 'Masale bhaat', 'R'], ['mh-rice', 'Steamed rice', 'R'], ['mh-poli', 'Poli (chapati)', 'R'], ['mh-bhakri', 'Jowar bhakri', 'R'],
        ['mh-puri', 'Puri', 'R'],
        ['mh-koshimbir', 'Koshimbir', 'A'], ['mh-thecha', 'Hirvi mirchi thecha', 'A', 'o'], ['mh-papad', 'Papad', 'A'], ['mh-solkadhi', 'Solkadhi', 'A'],
        ['mh-modak', 'Ukadiche modak', 'D'], ['mh-puranpoli', 'Puran poli', 'D'], ['mh-shrikhand', 'Shrikhand', 'D'], ['mh-basundi', 'Basundi', 'D'],
        ['mh-sheera', 'Sheera', 'D'],
      ],
    },
    {
      id: 'punjabi', name: 'Punjabi', region: 'Punjab', accent: '#15803D', signature: 'Sarson da saag · Dal makhani · Chole',
      blurb: 'Generous, ghee-rich home cooking, from Lohri saag to Diwali dinners.',
      dishes: [
        ['pb-paneertikka', 'Paneer tikka', 'S'], ['pb-amritsarifish', 'Amritsari fish', 'S', 'n'], ['pb-chickentikka', 'Chicken tikka', 'S', 'n'],
        ['pb-samosa', 'Samosa', 'S', 'r'], ['pb-pakode', 'Mix pakode', 'S', 'or'],
        ['pb-saag', 'Sarson da saag', 'M'], ['pb-dalmakhani', 'Dal makhani', 'M'], ['pb-chole', 'Pindi chole', 'M'], ['pb-rajma', 'Rajma', 'M'],
        ['pb-kadhi', 'Kadhi pakora', 'M'], ['pb-shahipaneer', 'Shahi paneer', 'M'], ['pb-aloogobi', 'Aloo gobi', 'M', 'r'],
        ['pb-butterchicken', 'Butter chicken', 'M', 'n'], ['pb-mutton', 'Punjabi mutton curry', 'M', 'n'],
        ['pb-makki', 'Makki di roti', 'R'], ['pb-lachha', 'Lachha paratha', 'R'], ['pb-bhature', 'Bhature', 'R'], ['pb-jeera', 'Jeera rice', 'R'],
        ['pb-pulao', 'Matar pulao', 'R'],
        ['pb-raita', 'Boondi raita', 'A'], ['pb-salad', 'Onion-cucumber salad', 'A', 'or'], ['pb-achaar', 'Achaar', 'A'], ['pb-lassi', 'Lassi', 'A'],
        ['pb-gajarhalwa', 'Gajar ka halwa', 'D', 'r'], ['pb-kheer', 'Kheer', 'D'], ['pb-pinni', 'Pinni', 'D'], ['pb-gulabjamun', 'Gulab jamun', 'D'],
        ['pb-phirni', 'Phirni', 'D'],
      ],
    },
    {
      id: 'kashmiri', name: 'Kashmiri', region: 'Kashmir', accent: '#9F1239', signature: 'Rogan josh · Nadru yakhni · Kahwa',
      blurb: 'Wazwan courses and Kashmiri Pandit kitchens: fennel, dry ginger and slow-cooked yoghurt gravies.',
      dishes: [
        ['ks-tabakmaaz', 'Tabak maaz', 'S', 'n'], ['ks-nadrumonje', 'Nadru monje', 'S', 'r'], ['ks-seekh', 'Kashmiri seekh kebab', 'S', 'n'],
        ['ks-roganjosh', 'Rogan josh', 'M', 'n'], ['ks-yakhni', 'Mutton yakhni', 'M', 'n'], ['ks-gushtaba', 'Gushtaba', 'M', 'n'],
        ['ks-rista', 'Rista', 'M', 'n'], ['ks-dumaloo', 'Kashmiri dum aloo', 'M', 'r'], ['ks-nadruyakhni', 'Nadru yakhni', 'M', 'r'],
        ['ks-haak', 'Haak', 'M'], ['ks-rajma', 'Kashmiri rajma', 'M'], ['ks-chaman', 'Chaman kaliya', 'M'],
        ['ks-rice', 'Steamed rice', 'R'], ['ks-modur', 'Modur pulav', 'R'], ['ks-pulao', 'Kashmiri pulao', 'R'],
        ['ks-walnut', 'Walnut chutney', 'A'], ['ks-mooli', 'Radish chutney', 'A', 'r'],
        ['ks-phirni', 'Phirni', 'D'], ['ks-shufta', 'Shufta', 'D'], ['ks-kahwa', 'Kahwa (saffron tea)', 'D'],
      ],
    },
  ];

  const courses = [
    { id: 'S', name: 'Starters & snacks' },
    { id: 'M', name: 'Curries & mains' },
    { id: 'R', name: 'Rice & breads' },
    { id: 'A', name: 'Sides & accompaniments' },
    { id: 'D', name: 'Sweets' },
  ];

  const dishIndex = {};
  traditions.forEach((t) => {
    t.dishes = t.dishes.map(([id, name, course, flags = '']) => {
      const dish = { id, name, course, tradition: t.id, nonveg: flags.includes('n'), onionGarlic: flags.includes('o'), root: flags.includes('r') };
      dishIndex[id] = dish;
      return dish;
    });
  });

  window.CH_MENUS = { traditions, courses, dishIndex };
})();
