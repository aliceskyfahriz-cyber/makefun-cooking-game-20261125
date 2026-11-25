'use strict';
/* Warung Senja — staged states for screenshots.
   One job: build the four moments the screenshots show, using only the
   game's own functions, so every screenshot is a real render of the
   game's code: the menu, a busy mid-shift, a plate ready to serve, and
   the end of a shift. The URL query ?shot=<name>&seed=<n> picks one. */

var WS = WS || {};

WS.shots = (function () {
  function apply(game, name, seed) {
    WS.random.seed(seed || 7);
    game.resetAll();
    if (name === 'start') {
      game.setScreen('menu');
      game.addTicket('nasi-goreng', 42);
      game.addTicket('mie-goreng', 35);
      game.setScore(0);
      game.setCoins(0);
      game.setShiftLeft(180);
    } else if (name === 'play') {
      game.setScreen('playing');
      game.setScore(340);
      game.setCoins(42);
      game.setCombo(2);
      game.setShiftLeft(96);
      game.addTicket('nasi-goreng', 28);
      game.addTicket('mie-goreng', 41);
      game.addTicket('soto-ayam', 18);
      game.addPrep('telur');
      game.addPrep('sayur');
      game.setStove(0, 'ayam', 0.6, false);
      game.setPlate(['nasi', 'telur']);
    } else if (name === 'serve') {
      game.setScreen('playing');
      game.setScore(520);
      game.setCoins(65);
      game.setCombo(3);
      game.setShiftLeft(74);
      game.addTicket('nasi-goreng', 32);
      game.addTicket('ayam-geprek', 44);
      game.addTicket('gado-gado', 21);
      game.setPlate(['nasi', 'telur', 'sambal']);
    } else if (name === 'end') {
      game.setScreen('over');
      game.setScore(1240);
      game.setServed(9);
      game.setShiftLeft(0);
      game.setResults({
        won: true,
        reason: 'Shift selesai — dapur tutup dengan rapi.',
        score: 1240,
        served: 9,
        expired: 2,
        bestCombo: 4
      });
    }
  }

  return { apply: apply };
})();
