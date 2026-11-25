'use strict';
/* Warung Senja — the game itself: loop, screens and wiring.
   One job: own the state (score, hearts, shift clock, screens), advance
   it every frame, and connect input to the kitchen and the order board.
   Rendering lives in render.js; the rules live in orders.js/kitchen.js. */

var WS = WS || {};

WS.game = (function () {
  var cfg = WS.config;
  var L = cfg.layout;

  var canvas = null;
  var ctx = null;
  var screen = 'menu'; // menu | playing | paused | over
  var score = 0;
  var coins = 0;
  var combo = 0;
  var bestCombo = 0;
  var best = 0;
  var hearts = cfg.maxHearts;
  var shiftLeft = cfg.shiftSeconds;
  var servedCount = 0;
  var showRecipes = false;
  var results = null;
  var frozen = false; // screenshot mode: render, never tick
  var startTime = 0;
  var lastTs = 0;

  function elapsed() {
    return cfg.shiftSeconds - shiftLeft;
  }

  function resetAll() {
    WS.kitchen.reset();
    WS.orders.clear();
    score = 0;
    coins = 0;
    combo = 0;
    bestCombo = 0;
    hearts = cfg.maxHearts;
    shiftLeft = cfg.shiftSeconds;
    servedCount = 0;
    showRecipes = false;
    results = null;
    screen = 'menu';
  }

  function startShift() {
    resetAll();
    WS.orders.reset();
    screen = 'playing';
    WS.audio.start();
  }

  function endShift(won, reason) {
    screen = 'over';
    if (score > best) best = score;
    results = {
      won: won,
      reason: reason,
      score: score,
      served: servedCount,
      expired: WS.kitchen.stats().expired,
      bestCombo: bestCombo
    };
  }

  function serve() {
    if (screen !== 'playing') return;
    var ticket = WS.kitchen.serve();
    if (!ticket) {
      WS.audio.error();
      return;
    }
    var timeBonus = Math.round(ticket.left) * 2;
    var mult = 1 + (combo >= 4 ? 1 : combo >= 2 ? 0.5 : 0);
    var gained = Math.round((ticket.recipe.price + timeBonus) * mult);
    score += gained;
    coins += 5 + combo;
    combo++;
    if (combo > bestCombo) bestCombo = combo;
    servedCount++;
    shiftLeft = Math.min(cfg.shiftSeconds, shiftLeft + cfg.serveTimeBonusSeconds);
    WS.audio.serve();
  }

  function tick(dt) {
    shiftLeft -= dt;
    var finished = WS.kitchen.tick(dt);
    if (finished.length > 0) WS.audio.cookDone();
    var expired = WS.orders.tick(dt, elapsed());
    if (expired.length > 0) {
      hearts -= expired.length;
      WS.kitchen.stats().expired += expired.length;
      combo = 0;
      WS.audio.expire();
      if (hearts <= 0) {
        endShift(false, 'Tiga pesanan hangus — dapur kewalahan.');
        return;
      }
    }
    if (shiftLeft <= 0) {
      shiftLeft = 0;
      var won = servedCount >= cfg.targetDishes;
      endShift(
        won,
        won
          ? 'Target ' + cfg.targetDishes + ' hidangan tercapai. Kerja bagus, chef!'
          : 'Shift habis — ' + servedCount + ' dari ' + cfg.targetDishes + ' hidangan target.'
      );
    }
  }

  function matchTicket() {
    var plate = WS.kitchen.plate();
    if (plate.length === 0) return null;
    return WS.orders.match(plate);
  }

  function state() {
    var match = screen === 'playing' ? matchTicket() : null;
    return {
      screen: screen,
      score: score,
      coins: coins,
      combo: combo,
      hearts: hearts,
      shiftLeft: shiftLeft,
      servedCount: servedCount,
      best: best,
      muted: WS.audio.isMuted(),
      showRecipes: showRecipes,
      results: results,
      time: (performance.now() - startTime) / 1000,
      tickets: WS.orders.tickets(),
      prep: WS.kitchen.prep(),
      stove: WS.kitchen.stove(),
      plate: WS.kitchen.plate(),
      matchTicketId: match ? match.id : null,
      hover: WS.input.hover()
    };
  }

  function loop(ts) {
    if (!lastTs) lastTs = ts;
    var dt = Math.min(0.05, (ts - lastTs) / 1000);
    lastTs = ts;
    if (!frozen && screen === 'playing') tick(dt);
    WS.render.draw(ctx, state());
    requestAnimationFrame(loop);
  }

  function onBin(ingId) {
    if (screen !== 'playing' || showRecipes) return;
    WS.audio.unlock();
    var item = WS.kitchen.addPrep(ingId);
    if (item) WS.audio.pick();
    else WS.audio.error();
  }

  function onPrepClick(p) {
    var prep = WS.kitchen.prep();
    for (var i = 0; i < prep.length; i++) {
      var r = WS.input.prepRect(i);
      if (WS.input.inside(p, r)) {
        var moved = WS.kitchen.sendFromPrep(prep[i].uid);
        if (moved === 'stove') WS.audio.toStove();
        else if (moved === 'plate') WS.audio.pick();
        else WS.audio.error();
        return true;
      }
    }
    return false;
  }

  function onStoveClick(p) {
    var stove = WS.kitchen.stove();
    for (var i = 0; i < stove.length; i++) {
      var r = WS.input.stoveRect(i);
      if (WS.input.inside(p, r)) {
        if (stove[i] && stove[i].done) {
          var ing = WS.kitchen.takeFromStove(i);
          if (ing) WS.audio.pick();
          else WS.audio.error();
        } else if (stove[i]) {
          WS.audio.click();
        }
        return true;
      }
    }
    return false;
  }

  function onClick(p) {
    WS.audio.unlock();
    if (showRecipes) {
      showRecipes = false;
      return;
    }
    var IN = WS.input;
    if (IN.inside(p, L.muteButton)) {
      WS.audio.toggleMute();
      return;
    }
    if (IN.inside(p, L.pauseButton)) {
      togglePause();
      return;
    }
    if (screen === 'menu') {
      var bx = cfg.width / 2 - 160;
      if (IN.inside(p, { x: bx, y: 280, w: 320, h: 72 })) startShift();
      return;
    }
    if (screen === 'over') {
      var rx = cfg.width / 2 - 160;
      if (IN.inside(p, { x: rx, y: 440, w: 320, h: 72 })) startShift();
      return;
    }
    if (screen === 'paused') return;
    // playing
    for (var b = 0; b < cfg.ingredients.length; b++) {
      if (IN.inside(p, IN.binRect(b))) {
        onBin(cfg.ingredients[b].id);
        return;
      }
    }
    if (onPrepClick(p)) return;
    if (onStoveClick(p)) return;
    if (IN.inside(p, L.serveButton)) {
      serve();
      return;
    }
    if (IN.inside(p, L.trashButton)) {
      if (WS.kitchen.clearPlate()) WS.audio.click();
      return;
    }
    if (IN.inside(p, L.hintButton)) {
      showRecipes = true;
      WS.audio.click();
    }
  }

  function togglePause() {
    if (screen === 'playing') {
      screen = 'paused';
    } else if (screen === 'paused') {
      screen = 'playing';
      lastTs = 0;
    }
  }

  function init() {
    canvas = document.getElementById('game');
    ctx = canvas.getContext('2d');
    WS.input.bind(canvas, {
      click: onClick,
      bin: onBin,
      serve: serve,
      clearPlate: function () {
        if (screen === 'playing' && WS.kitchen.clearPlate()) WS.audio.click();
      },
      pause: togglePause,
      mute: function () { WS.audio.toggleMute(); },
      confirm: function () {
        if (screen === 'menu' || screen === 'over') startShift();
      },
      restart: function () {
        if (screen === 'over') startShift();
      },
      escape: function () { showRecipes = false; }
    });
    var params = new URLSearchParams(window.location.search);
    var shot = params.get('shot');
    if (shot) {
      frozen = true;
      WS.shots.apply(api, shot, parseInt(params.get('seed') || '7', 10));
    }
    startTime = performance.now();
    requestAnimationFrame(loop);
  }

  // Public API: used by shots.js, and by the play-test hook below.
  var api = {
    init: init,
    resetAll: resetAll,
    startShift: startShift,
    setScreen: function (s) { screen = s; },
    setScore: function (n) { score = n; },
    setCoins: function (n) { coins = n; },
    setCombo: function (n) { combo = n; bestCombo = Math.max(bestCombo, n); },
    setShiftLeft: function (s) { shiftLeft = s; },
    setHearts: function (n) { hearts = n; },
    setServed: function (n) { servedCount = n; },
    setBest: function (n) { best = n; },
    setResults: function (r) { results = r; },
    addTicket: function (recipeId, left) {
      WS.orders.spawn(recipeId, left, 0);
    },
    addPrep: function (ingId) {
      return WS.kitchen.addPrep(ingId);
    },
    setStove: function (slot, ingId, progress, done) {
      WS.kitchen.placeOnStove(slot, ingId, progress, done);
    },
    setPlate: function (ids) {
      WS.kitchen.setPlate(ids);
    },
    getState: state,
    serve: serve
  };

  // Test hook: the play-test drives the game through this handle.
  window.__warung = {
    api: api,
    state: state
  };

  return api;
})();

document.addEventListener('DOMContentLoaded', function () {
  WS.game.init();
});
