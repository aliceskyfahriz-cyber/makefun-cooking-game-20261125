'use strict';
/* Warung Senja — keyboard and mouse.
   One job: turn clicks and keys into game actions. It knows the fixed
   layout (from config) so it can hit-test every button, bin, prep slot
   and burner, and it hands each hit to the handlers main.js binds. */

var WS = WS || {};

WS.input = (function () {
  var cfg = WS.config;
  var L = cfg.layout;
  var handlers = {};
  var hover = { x: -1, y: -1 };
  var canvas = null;

  function toCanvas(e) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (cfg.width / rect.width),
      y: (e.clientY - rect.top) * (cfg.height / rect.height)
    };
  }

  function inside(p, r) {
    return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
  }

  function binRect(i) {
    return {
      x: L.bins.x + i * (L.bins.w + L.bins.gap),
      y: L.bins.y, w: L.bins.w, h: L.bins.h
    };
  }

  function prepRect(i) {
    return {
      x: L.prep.x + i * (L.prep.w + L.prep.gap),
      y: L.prep.y, w: L.prep.w, h: L.prep.h
    };
  }

  function stoveRect(i) {
    return {
      x: L.stove.x + i * (L.stove.w + L.stove.gap),
      y: L.stove.y, w: L.stove.w, h: L.stove.h
    };
  }

  function onMouseMove(e) {
    hover = toCanvas(e);
  }

  function onClick(e) {
    var p = toCanvas(e);
    if (handlers.click) handlers.click(p);
  }

  function onKey(e) {
    var k = e.key;
    if (k === ' ' || k === 'Spacebar') {
      e.preventDefault();
      if (handlers.serve) handlers.serve();
      return;
    }
    if (k >= '1' && k <= '6') {
      var idx = parseInt(k, 10) - 1;
      if (idx < cfg.ingredients.length && handlers.bin) {
        handlers.bin(cfg.ingredients[idx].id);
      }
      return;
    }
    if (k === 'Backspace' || k === 'Delete') {
      e.preventDefault();
      if (handlers.clearPlate) handlers.clearPlate();
      return;
    }
    if (k === 'p' || k === 'P') {
      if (handlers.pause) handlers.pause();
      return;
    }
    if (k === 'm' || k === 'M') {
      if (handlers.mute) handlers.mute();
      return;
    }
    if (k === 'Enter') {
      if (handlers.confirm) handlers.confirm();
      return;
    }
    if (k === 'r' || k === 'R') {
      if (handlers.restart) handlers.restart();
      return;
    }
    if (k === 'Escape') {
      if (handlers.escape) handlers.escape();
    }
  }

  function bind(canvasEl, h) {
    canvas = canvasEl;
    handlers = h || {};
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('click', onClick);
    window.addEventListener('keydown', onKey);
  }

  return {
    bind: bind,
    hover: function () { return hover; },
    inside: inside,
    binRect: binRect,
    prepRect: prepRect,
    stoveRect: stoveRect
  };
})();
