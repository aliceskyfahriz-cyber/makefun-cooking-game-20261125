'use strict';
/* Warung Senja — sound, synthesised, no audio files.
   One job: every bleep the kitchen makes, built with the Web Audio API
   so the game stays a handful of files and loads nothing. The context
   is created lazily on the first gesture, so a headless screenshot run
   never throws. */

var WS = WS || {};

WS.audio = (function () {
  var ctx = null;
  var muted = false;

  function ensure() {
    if (ctx) {
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    } catch (e) {
      ctx = null;
    }
    return ctx;
  }

  function tone(freq, dur, type, vol, delay) {
    if (muted) return;
    var ac = ensure();
    if (!ac) return;
    try {
      var t0 = ac.currentTime + (delay || 0);
      var osc = ac.createOscillator();
      var gain = ac.createGain();
      osc.type = type || 'square';
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(vol || 0.12, t0 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
    } catch (e) { /* headless or blocked audio must never break the game */ }
  }

  function sizzle(dur) {
    if (muted) return;
    var ac = ensure();
    if (!ac) return;
    try {
      var len = Math.floor(ac.sampleRate * dur);
      var buf = ac.createBuffer(1, len, ac.sampleRate);
      var data = buf.getChannelData(0);
      for (var i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / len) * 0.25;
      }
      var src = ac.createBufferSource();
      src.buffer = buf;
      var filter = ac.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 3000;
      var gain = ac.createGain();
      gain.gain.value = 0.5;
      src.connect(filter);
      filter.connect(gain);
      gain.connect(ac.destination);
      src.start();
    } catch (e) { /* headless or blocked audio must never break the game */ }
  }

  return {
    unlock: ensure,
    toggleMute: function () {
      muted = !muted;
      return muted;
    },
    isMuted: function () {
      return muted;
    },
    click: function () {
      tone(660, 0.06, 'square', 0.06);
    },
    pick: function () {
      tone(520, 0.07, 'triangle', 0.12);
      tone(780, 0.08, 'triangle', 0.1, 0.05);
    },
    toStove: function () {
      sizzle(0.35);
    },
    cookDone: function () {
      tone(880, 0.09, 'sine', 0.14);
      tone(1174, 0.12, 'sine', 0.12, 0.09);
    },
    serve: function () {
      tone(523, 0.1, 'triangle', 0.14);
      tone(659, 0.1, 'triangle', 0.14, 0.09);
      tone(784, 0.16, 'triangle', 0.14, 0.18);
    },
    expire: function () {
      tone(220, 0.25, 'sawtooth', 0.1);
      tone(165, 0.3, 'sawtooth', 0.1, 0.12);
    },
    error: function () {
      tone(140, 0.12, 'square', 0.08);
    },
    start: function () {
      tone(392, 0.1, 'triangle', 0.12);
      tone(523, 0.1, 'triangle', 0.12, 0.1);
      tone(659, 0.18, 'triangle', 0.12, 0.2);
    }
  };
})();
