'use strict';
/* Warung Senja — the kitchen floor: bins, prep counter, stove, plate.
   One job: where every ingredient is and what happens when the player
   moves it. Bins fill the prep counter; raw telur and ayam must visit
   the stove before they can join the plate; the plate holds one dish
   at a time and serving it is the game's only score. */

var WS = WS || {};

WS.kitchen = (function () {
  var cfg = WS.config;
  var prep = [];    // { uid, ing } waiting on the prep counter
  var stove = [];   // { uid, ing, progress, done } one per burner
  var plate = [];   // ingredient ids on the plate being assembled
  var uid = 1;
  var stats = { served: 0, expired: 0, trashed: 0, mistakes: 0 };

  function freeBurner() {
    for (var i = 0; i < cfg.stoveSlots; i++) {
      if (!stove[i]) return i;
    }
    return -1;
  }

  function addPrep(ingId) {
    if (prep.length >= cfg.maxPrep) return null;
    var item = { uid: uid++, ing: ingId };
    prep.push(item);
    return item;
  }

  function findPrep(prepUid) {
    for (var i = 0; i < prep.length; i++) {
      if (prep[i].uid === prepUid) return i;
    }
    return -1;
  }

  // Click a prep item: cooks go to a free burner, the rest go to the plate.
  // Returns 'stove', 'plate', or null when nothing could move.
  function sendFromPrep(prepUid) {
    var at = findPrep(prepUid);
    if (at === -1) return null;
    var item = prep[at];
    var ing = WS.config.ingredientById(item.ing);
    if (ing && ing.cooks) {
      var burner = freeBurner();
      if (burner === -1) return null;
      prep.splice(at, 1);
      stove[burner] = { uid: item.uid, ing: item.ing, progress: 0, done: false };
      return 'stove';
    }
    if (plate.length >= cfg.maxPlate) return null;
    prep.splice(at, 1);
    plate.push(item.ing);
    return 'plate';
  }

  // A cooked item on the stove, clicked once it is done, moves to the plate.
  function takeFromStove(slot) {
    var item = stove[slot];
    if (!item || !item.done) return null;
    if (plate.length >= cfg.maxPlate) return null;
    stove[slot] = null;
    plate.push(item.ing);
    return item.ing;
  }

  // Advance the stove by dt seconds. Returns the items that just finished.
  function tick(dt) {
    var finished = [];
    for (var i = 0; i < stove.length; i++) {
      var item = stove[i];
      if (!item || item.done) continue;
      item.progress += dt / cfg.cookSeconds;
      if (item.progress >= 1) {
        item.progress = 1;
        item.done = true;
        finished.push(item);
      }
    }
    return finished;
  }

  // Try to serve the plate. Returns the ticket served, or null.
  function serve() {
    var ticket = WS.orders.match(plate);
    if (!ticket) {
      stats.mistakes++;
      return null;
    }
    WS.orders.serve(ticket);
    plate = [];
    stats.served++;
    return ticket;
  }

  function clearPlate() {
    if (plate.length === 0) return false;
    plate = [];
    stats.trashed++;
    return true;
  }

  // Staging helpers for screenshots and tests: put a cooked-or-cooking
  // item on a burner, or set the plate's contents outright.
  function placeOnStove(slot, ingId, progress, done) {
    stove[slot] = { uid: uid++, ing: ingId, progress: progress || 0, done: !!done };
  }

  function setPlate(ids) {
    plate = ids.slice(0, cfg.maxPlate);
  }

  function reset() {
    prep = [];
    stove = [];
    plate = [];
    uid = 1;
    stats = { served: 0, expired: 0, trashed: 0, mistakes: 0 };
  }

  return {
    prep: function () { return prep; },
    stove: function () { return stove; },
    plate: function () { return plate; },
    stats: function () { return stats; },
    addPrep: addPrep,
    sendFromPrep: sendFromPrep,
    takeFromStove: takeFromStove,
    placeOnStove: placeOnStove,
    setPlate: setPlate,
    tick: tick,
    serve: serve,
    clearPlate: clearPlate,
    reset: reset
  };
})();
