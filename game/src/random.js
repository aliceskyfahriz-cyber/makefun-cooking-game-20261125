'use strict';
/* Warung Senja — seeded randomness.
   One job: every random choice in the game, so a screenshot seed
   reproduces the same orders and the same layout every time. */

var WS = WS || {};

WS.random = (function () {
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var rng = mulberry32(1);

  return {
    seed: function (s) {
      rng = mulberry32((s >>> 0) || 1);
    },
    next: function () {
      return rng();
    },
    int: function (min, max) {
      return min + Math.floor(rng() * (max - min + 1));
    },
    pick: function (arr) {
      return arr[Math.floor(rng() * arr.length)];
    },
    shuffle: function (arr) {
      var out = arr.slice();
      for (var i = out.length - 1; i > 0; i--) {
        var j = Math.floor(rng() * (i + 1));
        var tmp = out[i];
        out[i] = out[j];
        out[j] = tmp;
      }
      return out;
    }
  };
})();
