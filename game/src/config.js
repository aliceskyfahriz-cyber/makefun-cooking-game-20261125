'use strict';
/* Warung Senja — every tunable number, name and colour lives here.
   One job: configuration only. The rest of the game reads these values
   instead of inventing its own, so balancing is a one-file edit. */

var WS = WS || {};

WS.config = {
  width: 1280,
  height: 720,

  shiftSeconds: 180,          // one shift lasts 3 minutes
  maxHearts: 3,               // expired orders cost a heart
  maxTickets: 3,              // orders on the board at once
  maxPrep: 6,                 // items waiting on the prep counter
  maxPlate: 3,                // items on the plate being assembled
  stoveSlots: 2,              // burners on the stove
  cookSeconds: 2.5,           // time to cook telur / ayam
  ticketSeconds: 50,          // order patience at shift start
  ticketSecondsLate: 35,      // order patience once the rush builds
  spawnEverySeconds: 10,      // new order interval at shift start
  spawnEverySecondsLate: 7,   // new order interval late in the shift
  serveTimeBonusSeconds: 4,   // shift time earned back per served order
  targetDishes: 10,           // dishes that make a "great shift"

  colors: {
    wall: '#16332f',
    wallDark: '#0f2623',
    floor: '#2a1f16',
    wood: '#8a5a33',
    woodLight: '#a9743f',
    woodDark: '#6b4423',
    cream: '#f6e7c8',
    ink: '#241a12',
    muted: '#b9a684',
    gold: '#e8a33d',
    red: '#d94f30',
    green: '#5da24a',
    teal: '#2ec4b6',
    ticket: '#fdf6e3',
    ticketEdge: '#d8c49a',
    stove: '#3a3f44',
    plate: '#f2ede2'
  },

  // Six ingredient bins. `cooks` means the item must visit the stove
  // (click it on the prep counter) before it can go on the plate.
  ingredients: [
    { id: 'nasi',   name: 'Nasi',   key: '1', cooks: false, color: '#f6e7c8' },
    { id: 'mie',    name: 'Mie',    key: '2', cooks: false, color: '#f2c14e' },
    { id: 'telur',  name: 'Telur',  key: '3', cooks: true,  color: '#fff3d6' },
    { id: 'ayam',   name: 'Ayam',   key: '4', cooks: true,  color: '#e08a4e' },
    { id: 'sayur',  name: 'Sayur',  key: '5', cooks: false, color: '#5da24a' },
    { id: 'sambal', name: 'Sambal', key: '6', cooks: false, color: '#d94f30' }
  ],

  // Five house dishes. Each needs exactly three ingredients; the ticket
  // shows the icons, so the player matches what they see.
  recipes: [
    { id: 'nasi-goreng', name: 'Nasi Goreng', needs: ['nasi', 'telur', 'sambal'], price: 100 },
    { id: 'mie-goreng',  name: 'Mie Goreng',  needs: ['mie', 'telur', 'sayur'],  price: 100 },
    { id: 'soto-ayam',   name: 'Soto Ayam',   needs: ['ayam', 'nasi', 'sayur'],  price: 120 },
    { id: 'ayam-geprek', name: 'Ayam Geprek', needs: ['ayam', 'sambal', 'nasi'], price: 120 },
    { id: 'gado-gado',   name: 'Gado-Gado',   needs: ['sayur', 'telur', 'sambal'], price: 110 }
  ],

  // Fixed geometry, shared by render (draws it) and input (hit-tests it).
  layout: {
    topBar: { x: 0, y: 0, w: 1280, h: 64 },
    tickets: { x: 24, y: 96, w: 264, h: 104, gap: 12 },
    statsCard: { x: 24, y: 448, w: 264, h: 108 },
    prep: { x: 312, y: 108, w: 96, h: 96, gap: 12, labelY: 92 },
    stove: { x: 1000, y: 108, w: 120, h: 120, gap: 8, labelY: 92 },
    plate: { cx: 640, cy: 392, r: 108 },
    serveButton: { x: 1000, y: 320, w: 248, h: 110 },
    trashButton: { x: 1000, y: 446, w: 120, h: 56 },
    hintButton: { x: 1128, y: 446, w: 120, h: 56 },
    bins: { x: 24, y: 596, w: 96, h: 96, gap: 12 },
    hintText: { x: 720, y: 612, w: 536, h: 80 },
    muteButton: { x: 1156, y: 12, w: 48, h: 40 },
    pauseButton: { x: 1208, y: 12, w: 48, h: 40 }
  }
};

WS.config.ingredientById = function (id) {
  var list = WS.config.ingredients;
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === id) return list[i];
  }
  return null;
};

WS.config.recipeById = function (id) {
  var list = WS.config.recipes;
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === id) return list[i];
  }
  return null;
};
