'use strict';
/* Warung Senja — the order board.
   One job: tickets. Spawning them on a quickening clock, counting each
   one's patience down, matching a finished plate against them, and
   reporting which ones expired so the game can cost a heart. */

var WS = WS || {};

WS.orders = (function () {
  var cfg = WS.config;
  var tickets = [];
  var nextId = 1;
  var spawnTimer = 2;
  var lastRecipeIds = [];

  function patienceFor(shiftElapsed) {
    var t = shiftElapsed / cfg.shiftSeconds;
    return cfg.ticketSeconds + (cfg.ticketSecondsLate - cfg.ticketSeconds) * t;
  }

  function spawnEvery(shiftElapsed) {
    var t = shiftElapsed / cfg.shiftSeconds;
    return cfg.spawnEverySeconds + (cfg.spawnEverySecondsLate - cfg.spawnEverySeconds) * t;
  }

  function pickRecipe() {
    var pool = cfg.recipes.filter(function (r) {
      return lastRecipeIds.indexOf(r.id) === -1;
    });
    if (pool.length === 0) pool = cfg.recipes;
    var recipe = WS.random.pick(pool);
    lastRecipeIds.push(recipe.id);
    if (lastRecipeIds.length > 2) lastRecipeIds.shift();
    return recipe;
  }

  // Spawn one ticket. `recipeId` and `leftSeconds` are only for
  // screenshots, which want a fixed board; the game itself omits them.
  function spawn(recipeId, leftSeconds, shiftElapsed) {
    var recipe = recipeId
      ? WS.config.recipeById(recipeId)
      : pickRecipe();
    if (!recipe) recipe = pickRecipe();
    var patience = leftSeconds != null
      ? leftSeconds
      : patienceFor(shiftElapsed || 0);
    var ticket = {
      id: nextId++,
      recipe: recipe,
      left: patience,
      total: patience,
      bornAt: 0
    };
    tickets.push(ticket);
    return ticket;
  }

  // Advance the board by dt seconds. Returns the tickets that just expired.
  function tick(dt, shiftElapsed) {
    var expired = [];
    spawnTimer -= dt;
    if (tickets.length < cfg.maxTickets && spawnTimer <= 0) {
      spawn(null, null, shiftElapsed);
      spawnTimer = spawnEvery(shiftElapsed);
    }
    for (var i = tickets.length - 1; i >= 0; i--) {
      tickets[i].left -= dt;
      if (tickets[i].left <= 0) {
        expired.push(tickets[i]);
        tickets.splice(i, 1);
      }
    }
    return expired;
  }

  function sameSet(a, b) {
    if (a.length !== b.length) return false;
    var sa = a.slice().sort();
    var sb = b.slice().sort();
    for (var i = 0; i < sa.length; i++) {
      if (sa[i] !== sb[i]) return false;
    }
    return true;
  }

  // The open ticket whose recipe exactly matches the plate, oldest first.
  function match(plateIds) {
    for (var i = 0; i < tickets.length; i++) {
      if (sameSet(tickets[i].recipe.needs, plateIds)) return tickets[i];
    }
    return null;
  }

  // How many of the plate's items already belong to this ticket.
  function plateHits(ticket, plateIds) {
    var hits = 0;
    var needs = ticket.recipe.needs.slice();
    for (var i = 0; i < plateIds.length; i++) {
      var at = needs.indexOf(plateIds[i]);
      if (at !== -1) {
        hits++;
        needs.splice(at, 1);
      }
    }
    return hits;
  }

  function serve(ticket) {
    for (var i = 0; i < tickets.length; i++) {
      if (tickets[i].id === ticket.id) {
        tickets.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  function reset() {
    tickets = [];
    nextId = 1;
    spawnTimer = 2;
    lastRecipeIds = [];
    spawn(null, null, 0);
    spawn(null, null, 0);
  }

  function clear() {
    tickets = [];
    nextId = 1;
    spawnTimer = 9999;
    lastRecipeIds = [];
  }

  return {
    tickets: function () { return tickets; },
    spawn: spawn,
    tick: tick,
    match: match,
    plateHits: plateHits,
    serve: serve,
    reset: reset,
    clear: clear
  };
})();
