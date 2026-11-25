'use strict';
/* Warung Senja — everything the player sees.
   One job: draw the kitchen. Canvas only, no image files: every bowl,
   flame and ticket is vector art, so the game loads nothing at all. */

var WS = WS || {};

WS.render = (function () {
  var cfg = WS.config;
  var C = cfg.colors;
  var L = cfg.layout;

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function text(ctx, s, x, y, font, fill, align) {
    ctx.font = font;
    ctx.fillStyle = fill;
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(s, x, y);
  }

  function fmtTime(sec) {
    var s = Math.max(0, Math.ceil(sec));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  // --- ingredient icons (vector art, one per ingredient) -------------------
  function drawIngredientIcon(ctx, id, x, y, r) {
    ctx.save();
    ctx.translate(x, y);
    if (id === 'nasi') {
      ctx.fillStyle = '#e8e2d4';
      ctx.beginPath();
      ctx.arc(0, r * 0.25, r * 0.85, 0, Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#b8ab8d';
      ctx.lineWidth = r * 0.07;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-r * 0.35, -r * 0.1, r * 0.32, 0, Math.PI * 2);
      ctx.arc(0, -r * 0.28, r * 0.36, 0, Math.PI * 2);
      ctx.arc(r * 0.35, -r * 0.1, r * 0.32, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#5da24a';
      ctx.fillRect(-r * 0.12, -r * 0.55, r * 0.24, r * 0.14);
    } else if (id === 'mie') {
      ctx.fillStyle = '#d97b2f';
      ctx.beginPath();
      ctx.arc(0, r * 0.25, r * 0.85, 0, Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#f2c14e';
      ctx.lineWidth = r * 0.16;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-r * 0.55, -r * 0.15);
      ctx.quadraticCurveTo(-r * 0.2, -r * 0.5, r * 0.15, -r * 0.2);
      ctx.quadraticCurveTo(r * 0.45, -r * 0.45, r * 0.55, -r * 0.1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-r * 0.5, r * 0.1);
      ctx.quadraticCurveTo(0, -r * 0.2, r * 0.5, r * 0.05);
      ctx.stroke();
    } else if (id === 'telur') {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.9, r * 0.7, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f2a93b';
      ctx.beginPath();
      ctx.arc(r * 0.1, 0, r * 0.42, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd97a';
      ctx.beginPath();
      ctx.arc(r * 0.02, -r * 0.08, r * 0.16, 0, Math.PI * 2);
      ctx.fill();
    } else if (id === 'ayam') {
      ctx.strokeStyle = '#f6e7c8';
      ctx.lineWidth = r * 0.22;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(r * 0.35, r * 0.35);
      ctx.lineTo(r * 0.7, r * 0.7);
      ctx.stroke();
      ctx.fillStyle = '#f6e7c8';
      ctx.beginPath();
      ctx.arc(r * 0.72, r * 0.72, r * 0.2, 0, Math.PI * 2);
      ctx.arc(r * 0.55, r * 0.82, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e08a4e';
      ctx.beginPath();
      ctx.arc(-r * 0.1, -r * 0.1, r * 0.62, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#c96f33';
      ctx.beginPath();
      ctx.arc(-r * 0.25, -r * 0.25, r * 0.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (id === 'sayur') {
      ctx.fillStyle = '#5da24a';
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.1, r * 0.55, r * 0.8, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7cc46a';
      ctx.beginPath();
      ctx.ellipse(r * 0.15, r * 0.15, r * 0.5, r * 0.7, 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3d7a32';
      ctx.lineWidth = r * 0.1;
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.8);
      ctx.lineTo(0, r * 0.7);
      ctx.stroke();
    } else if (id === 'sambal') {
      ctx.fillStyle = '#b3371f';
      ctx.beginPath();
      ctx.arc(0, r * 0.25, r * 0.85, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#d94f30';
      ctx.beginPath();
      ctx.arc(0, -r * 0.1, r * 0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff7a59';
      ctx.beginPath();
      ctx.arc(-r * 0.2, -r * 0.25, r * 0.14, 0, Math.PI * 2);
      ctx.arc(r * 0.2, -r * 0.05, r * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#5da24a';
      ctx.lineWidth = r * 0.12;
      ctx.beginPath();
      ctx.moveTo(-r * 0.3, -r * 0.55);
      ctx.quadraticCurveTo(0, -r * 0.85, r * 0.3, -r * 0.5);
      ctx.stroke();
    }
    ctx.restore();
  }

  // --- frame pieces ---------------------------------------------------------
  function drawBackground(ctx, time) {
    ctx.fillStyle = C.wall;
    ctx.fillRect(0, 0, cfg.width, cfg.height);
    ctx.fillStyle = C.wallDark;
    ctx.fillRect(0, 0, cfg.width, 64);
    // warm lamps, hung below the top bar (cones only, no bulbs)
    for (var i = 0; i < 3; i++) {
      var lx = 320 + i * 320;
      var flick = 0.85 + 0.15 * Math.sin(time * 2 + i * 2.1);
      ctx.fillStyle = 'rgba(232,163,61,' + (0.16 * flick) + ')';
      ctx.beginPath();
      ctx.moveTo(lx - 90, 80);
      ctx.lineTo(lx + 90, 80);
      ctx.lineTo(lx + 150, 320);
      ctx.lineTo(lx - 150, 320);
      ctx.closePath();
      ctx.fill();
    }
    // floor
    ctx.fillStyle = C.floor;
    ctx.fillRect(0, 560, cfg.width, 160);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    for (var fx = 0; fx < cfg.width; fx += 128) {
      ctx.fillRect(fx, 560, 2, 160);
    }
    // wooden counter band behind the bins
    ctx.fillStyle = C.wood;
    rr(ctx, 12, 584, 692, 120, 12);
    ctx.fill();
    ctx.fillStyle = C.woodDark;
    ctx.fillRect(12, 584, 692, 10);
  }

  function drawTopBar(ctx, s) {
    text(ctx, 'WARUNG SENJA', 24, 42, '700 30px "Trebuchet MS", sans-serif', C.gold);
    // shift timer, left of centre so it never meets the score
    var frac = Math.max(0, s.shiftLeft / cfg.shiftSeconds);
    text(ctx, 'SHIFT  ' + fmtTime(s.shiftLeft), 300, 30, '700 20px "Trebuchet MS", sans-serif', frac > 0.25 ? C.cream : C.red);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    rr(ctx, 300, 40, 160, 10, 5);
    ctx.fill();
    ctx.fillStyle = frac > 0.25 ? C.teal : C.red;
    if (frac > 0) {
      rr(ctx, 300, 40, 160 * frac, 10, 5);
      ctx.fill();
    }
    if (s.combo >= 2) {
      text(ctx, 'KOMBO x' + s.combo, 480, 30, '700 18px "Trebuchet MS", sans-serif', C.gold);
    }
    var right = 1140;
    text(ctx, 'SKOR  ' + s.score, right - 340, 42, '700 22px "Trebuchet MS", sans-serif', C.cream, 'right');
    text(ctx, 'KOİN  ' + s.coins, right - 180, 42, '700 22px "Trebuchet MS", sans-serif', C.gold, 'right');
    // hearts
    for (var i = 0; i < cfg.maxHearts; i++) {
      var hx = right - 140 + i * 30;
      ctx.fillStyle = i < s.hearts ? C.red : 'rgba(255,255,255,0.18)';
      ctx.beginPath();
      ctx.arc(hx, 30, 9, 0, Math.PI * 2);
      ctx.arc(hx + 10, 30, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(hx - 8, 32);
      ctx.lineTo(hx + 18, 32);
      ctx.lineTo(hx + 5, 48);
      ctx.closePath();
      ctx.fill();
    }
    // mute / pause buttons
    drawSmallButton(ctx, L.muteButton, s.muted ? 'BISU' : 'SUARA', s.hover);
    drawSmallButton(ctx, L.pauseButton, s.screen === 'paused' ? 'LANJUT' : 'JEDA', s.hover);
  }

  function drawSmallButton(ctx, r, label, hover) {
    var over = hover && hover.x >= r.x && hover.x <= r.x + r.w && hover.y >= r.y && hover.y <= r.y + r.h;
    ctx.fillStyle = over ? '#3d5a52' : '#27443d';
    rr(ctx, r.x, r.y, r.w, r.h, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(246,231,200,0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();
    text(ctx, label, r.x + r.w / 2, r.y + 26, '700 13px "Trebuchet MS", sans-serif', C.cream, 'center');
  }

  function drawTickets(ctx, s) {
    text(ctx, 'PESANAN MASUK', L.tickets.x, L.tickets.y - 12, '700 15px "Trebuchet MS", sans-serif', C.muted);
    var list = s.tickets;
    for (var i = 0; i < cfg.maxTickets; i++) {
      var y = L.tickets.y + i * (L.tickets.h + L.tickets.gap);
      var t = list[i];
      if (!t) {
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        rr(ctx, L.tickets.x, y, L.tickets.w, L.tickets.h, 10);
        ctx.fill();
        text(ctx, 'menunggu pesanan…', L.tickets.x + L.tickets.w / 2, y + 58, '400 15px "Trebuchet MS", sans-serif', C.muted, 'center');
        continue;
      }
      var urgent = t.left <= 10;
      var pulse = urgent ? 0.5 + 0.5 * Math.sin(s.time * 8) : 0;
      var matching = s.matchTicketId === t.id;
      ctx.fillStyle = matching ? '#fff3d6' : C.ticket;
      rr(ctx, L.tickets.x, y, L.tickets.w, L.tickets.h, 10);
      ctx.fill();
      ctx.strokeStyle = matching ? C.gold : (urgent ? 'rgba(217,79,48,' + (0.5 + pulse * 0.5) + ')' : C.ticketEdge);
      ctx.lineWidth = matching ? 3 : 2;
      ctx.stroke();
      text(ctx, t.recipe.name.toUpperCase(), L.tickets.x + 14, y + 28, '700 18px "Trebuchet MS", sans-serif', C.ink);
      text(ctx, '$' + t.recipe.price, L.tickets.x + L.tickets.w - 14, y + 28, '700 16px "Trebuchet MS", sans-serif', C.red, 'right');
      for (var k = 0; k < t.recipe.needs.length; k++) {
        var ix = L.tickets.x + 34 + k * 52;
        var hit = s.plate.indexOf(t.recipe.needs[k]) !== -1;
        drawIngredientIcon(ctx, t.recipe.needs[k], ix, y + 58, 20);
        if (hit) {
          ctx.strokeStyle = C.green;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(ix, y + 58, 24, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      var bw = L.tickets.w - 28;
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      rr(ctx, L.tickets.x + 14, y + L.tickets.h - 18, bw, 8, 4);
      ctx.fill();
      var tf = Math.max(0, t.left / t.total);
      ctx.fillStyle = tf > 0.25 ? C.green : C.red;
      if (tf > 0) {
        rr(ctx, L.tickets.x + 14, y + L.tickets.h - 18, bw * tf, 8, 4);
        ctx.fill();
      }
      text(ctx, fmtTime(t.left), L.tickets.x + L.tickets.w - 14, y + L.tickets.h - 24, '700 14px "Trebuchet MS", sans-serif', urgent ? C.red : C.muted, 'right');
    }
    // stats card under the board
    var sc = L.statsCard;
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    rr(ctx, sc.x, sc.y, sc.w, sc.h, 10);
    ctx.fill();
    text(ctx, 'HIDANGAN TERANTAR', sc.x + 14, sc.y + 30, '700 14px "Trebuchet MS", sans-serif', C.muted);
    text(ctx, s.servedCount + ' / ' + cfg.targetDishes + ' target', sc.x + 14, sc.y + 62, '700 26px "Trebuchet MS", sans-serif', C.cream);
    text(ctx, 'Skor terbaik sesi ini: ' + s.best, sc.x + 14, sc.y + 92, '400 14px "Trebuchet MS", sans-serif', C.muted);
  }

  function drawPrep(ctx, s) {
    text(ctx, 'MEJA RACIK', L.prep.x, L.prep.labelY, '700 15px "Trebuchet MS", sans-serif', C.muted);
    ctx.fillStyle = C.woodLight;
    rr(ctx, L.prep.x - 12, L.prep.y - 12, 6 * L.prep.w + 5 * L.prep.gap + 24, L.prep.h + 24, 12);
    ctx.fill();
    for (var i = 0; i < cfg.maxPrep; i++) {
      var x = L.prep.x + i * (L.prep.w + L.prep.gap);
      var item = s.prep[i];
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      rr(ctx, x, L.prep.y, L.prep.w, L.prep.h, 10);
      ctx.fill();
      if (item) {
        var ing = WS.config.ingredientById(item.ing);
        drawIngredientIcon(ctx, item.ing, x + L.prep.w / 2, L.prep.y + 40, 30);
        text(ctx, ing.name.toUpperCase(), x + L.prep.w / 2, L.prep.y + 84, '700 13px "Trebuchet MS", sans-serif', C.cream, 'center');
      }
    }
  }

  function drawStove(ctx, s) {
    text(ctx, 'KOMPOR', L.stove.x, L.stove.labelY, '700 15px "Trebuchet MS", sans-serif', C.muted);
    for (var i = 0; i < cfg.stoveSlots; i++) {
      var x = L.stove.x + i * (L.stove.w + L.stove.gap);
      var y = L.stove.y;
      ctx.fillStyle = C.stove;
      rr(ctx, x, y, L.stove.w, L.stove.h, 12);
      ctx.fill();
      ctx.fillStyle = '#22262a';
      ctx.beginPath();
      ctx.arc(x + L.stove.w / 2, y + L.stove.h / 2, 42, 0, Math.PI * 2);
      ctx.fill();
      var item = s.stove[i];
      if (item) {
        if (!item.done) {
          var fl = 0.7 + 0.3 * Math.sin(s.time * 10 + i);
          ctx.fillStyle = 'rgba(232,163,61,' + fl + ')';
          ctx.beginPath();
          ctx.arc(x + L.stove.w / 2, y + L.stove.h / 2, 46, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#22262a';
          ctx.beginPath();
          ctx.arc(x + L.stove.w / 2, y + L.stove.h / 2, 38, 0, Math.PI * 2);
          ctx.fill();
        }
        drawIngredientIcon(ctx, item.ing, x + L.stove.w / 2, y + L.stove.h / 2, 26);
        // progress ring
        ctx.strokeStyle = item.done ? C.green : C.gold;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(x + L.stove.w / 2, y + L.stove.h / 2, 52, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * item.progress);
        ctx.stroke();
        if (item.done) {
          text(ctx, 'SIAP!', x + L.stove.w / 2, y + L.stove.h - 8, '700 14px "Trebuchet MS", sans-serif', C.green, 'center');
        }
      } else {
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.arc(x + L.stove.w / 2, y + L.stove.h / 2, 42, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }

  function drawPlate(ctx, s) {
    var p = L.plate;
    // plate shadow + plate
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(p.cx, p.cy + 14, p.r + 8, p.r * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.plate;
    ctx.beginPath();
    ctx.arc(p.cx, p.cy, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d8c49a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(p.cx, p.cy, p.r - 10, 0, Math.PI * 2);
    ctx.stroke();
    var items = s.plate;
    if (items.length === 0) {
      text(ctx, 'PIRING KOSONG', p.cx, p.cy - 4, '700 17px "Trebuchet MS", sans-serif', C.muted, 'center');
      text(ctx, 'rakit pesanan di sini', p.cx, p.cy + 20, '400 14px "Trebuchet MS", sans-serif', C.muted, 'center');
    } else {
      var spots = [[-34, -18], [34, -18], [0, 34]];
      for (var i = 0; i < items.length; i++) {
        // a soft disc behind each item so pale food reads on the white plate
        ctx.fillStyle = 'rgba(120,90,40,0.14)';
        ctx.beginPath();
        ctx.arc(p.cx + spots[i][0], p.cy + spots[i][1], 38, 0, Math.PI * 2);
        ctx.fill();
        drawIngredientIcon(ctx, items[i], p.cx + spots[i][0], p.cy + spots[i][1], 30);
      }
    }
    // serve + trash buttons
    var sb = L.serveButton;
    var canServe = !!s.matchTicketId;
    var glow = canServe ? 0.6 + 0.4 * Math.sin(s.time * 6) : 0;
    ctx.fillStyle = canServe ? C.gold : '#5a4632';
    rr(ctx, sb.x, sb.y, sb.w, sb.h, 14);
    ctx.fill();
    if (canServe) {
      ctx.strokeStyle = 'rgba(232,163,61,' + glow + ')';
      ctx.lineWidth = 4;
      rr(ctx, sb.x - 4, sb.y - 4, sb.w + 8, sb.h + 8, 18);
      ctx.stroke();
    }
    text(ctx, 'ANTAR  (Space)', sb.x + sb.w / 2, sb.y + 48, '700 26px "Trebuchet MS", sans-serif', canServe ? C.ink : C.muted, 'center');
    text(ctx, canServe ? 'pesanan cocok!' : 'belum ada yang cocok', sb.x + sb.w / 2, sb.y + 78, '400 15px "Trebuchet MS", sans-serif', canServe ? C.ink : C.muted, 'center');
    drawSmallButton(ctx, L.trashButton, 'BUANG', s.hover);
    drawSmallButton(ctx, L.hintButton, 'RESEP', s.hover);
    if (s.showRecipes) {
      ctx.fillStyle = 'rgba(20,16,10,0.92)';
      rr(ctx, 340, 180, 600, 330, 14);
      ctx.fill();
      ctx.strokeStyle = C.gold;
      ctx.lineWidth = 2;
      ctx.stroke();
      text(ctx, 'RESEP HARI INI', 640, 222, '700 22px "Trebuchet MS", sans-serif', C.gold, 'center');
      for (var r = 0; r < cfg.recipes.length; r++) {
        var ry = 262 + r * 44;
        var rec = cfg.recipes[r];
        text(ctx, rec.name, 380, ry, '700 18px "Trebuchet MS", sans-serif', C.cream);
        for (var k = 0; k < rec.needs.length; k++) {
          drawIngredientIcon(ctx, rec.needs[k], 640 + k * 56, ry - 6, 17);
        }
        text(ctx, '$' + rec.price, 900, ry, '700 16px "Trebuchet MS", sans-serif', C.gold, 'right');
      }
      text(ctx, 'klik di mana saja untuk menutup', 640, 492, '400 14px "Trebuchet MS", sans-serif', C.muted, 'center');
    }
  }

  function drawBins(ctx, s) {
    text(ctx, 'BAHAN  ·  klik atau tekan 1-6', L.bins.x, L.bins.y - 12, '700 15px "Trebuchet MS", sans-serif', C.muted);
    for (var i = 0; i < cfg.ingredients.length; i++) {
      var ing = cfg.ingredients[i];
      var x = L.bins.x + i * (L.bins.w + L.bins.gap);
      var y = L.bins.y;
      var disabled = s.prep.length >= cfg.maxPrep;
      ctx.fillStyle = disabled ? '#6b5a48' : C.woodLight;
      rr(ctx, x, y, L.bins.w, L.bins.h, 12);
      ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(x, y, L.bins.w, 8);
      drawIngredientIcon(ctx, ing.id, x + L.bins.w / 2, y + 38, 28);
      text(ctx, ing.name.toUpperCase(), x + L.bins.w / 2, y + 78, '700 14px "Trebuchet MS", sans-serif', C.cream, 'center');
      ctx.fillStyle = C.ink;
      ctx.beginPath();
      ctx.arc(x + L.bins.w - 16, y + 16, 11, 0, Math.PI * 2);
      ctx.fill();
      text(ctx, ing.key, x + L.bins.w - 16, y + 20, '700 13px "Trebuchet MS", sans-serif', C.gold, 'center');
      if (ing.cooks) {
        text(ctx, 'dimasak', x + L.bins.w / 2, y + 94, '400 11px "Trebuchet MS", sans-serif', C.gold, 'center');
      }
    }
    text(ctx, 'Ambil bahan dari bin, masak yang mentah di kompor,', L.hintText.x, L.hintText.y + 16, '400 15px "Trebuchet MS", sans-serif', C.muted);
    text(ctx, 'rakit di piring, lalu ANTAR sebelum pesanan hangus.', L.hintText.x, L.hintText.y + 38, '400 15px "Trebuchet MS", sans-serif', C.muted);
    text(ctx, 'Space antar · Backspace buang piring · P jeda · M bisu', L.hintText.x, L.hintText.y + 60, '400 14px "Trebuchet MS", sans-serif', C.muted);
  }

  function drawRush(ctx, s) {
    if (s.shiftLeft > 30 || s.screen !== 'playing') return;
    var a = 0.5 + 0.5 * Math.sin(s.time * 6);
    text(ctx, 'RUSH HOUR!', cfg.width / 2, 110, '700 34px "Trebuchet MS", sans-serif', 'rgba(217,79,48,' + (0.6 + a * 0.4) + ')', 'center');
  }

  function drawMenu(ctx, s) {
    ctx.fillStyle = 'rgba(10,18,16,0.86)';
    ctx.fillRect(0, 0, cfg.width, cfg.height);
    text(ctx, 'WARUNG SENJA', cfg.width / 2, 190, '700 72px "Trebuchet MS", sans-serif', C.gold, 'center');
    text(ctx, 'Dapur kecil, pesanan besar — masak, antar, jangan sampai hangus.', cfg.width / 2, 232, '400 22px "Trebuchet MS", sans-serif', C.cream, 'center');
    // start button
    var bx = cfg.width / 2 - 160;
    var by = 280;
    ctx.fillStyle = C.gold;
    rr(ctx, bx, by, 320, 72, 16);
    ctx.fill();
    text(ctx, 'MULAI MASAK  (Enter)', cfg.width / 2, by + 46, '700 26px "Trebuchet MS", sans-serif', C.ink, 'center');
    text(ctx, 'Cara main:', cfg.width / 2, 420, '700 18px "Trebuchet MS", sans-serif', C.cream, 'center');
    text(ctx, '1. Klik bin (atau 1-6) untuk ambil bahan ke meja racik.', cfg.width / 2, 452, '400 17px "Trebuchet MS", sans-serif', C.cream, 'center');
    text(ctx, '2. Telur & ayam mentah: klik di meja racik untuk dimasak di kompor.', cfg.width / 2, 480, '400 17px "Trebuchet MS", sans-serif', C.cream, 'center');
    text(ctx, '3. Rakit 3 bahan di piring sesuai tiket, lalu ANTAR (Space).', cfg.width / 2, 508, '400 17px "Trebuchet MS", sans-serif', C.cream, 'center');
    text(ctx, 'Pesanan hangus = 1 hati hilang. Shift 3 menit — target ' + cfg.targetDishes + ' hidangan.', cfg.width / 2, 536, '400 17px "Trebuchet MS", sans-serif', C.muted, 'center');
    if (s.best > 0) {
      text(ctx, 'Skor terbaik sesi ini: ' + s.best, cfg.width / 2, 580, '700 17px "Trebuchet MS", sans-serif', C.gold, 'center');
    }
  }

  function drawPaused(ctx) {
    ctx.fillStyle = 'rgba(10,18,16,0.66)';
    ctx.fillRect(0, 0, cfg.width, cfg.height);
    text(ctx, 'JEDA', cfg.width / 2, 340, '700 64px "Trebuchet MS", sans-serif', C.cream, 'center');
    text(ctx, 'tekan P atau klik LANJUT untuk main lagi', cfg.width / 2, 384, '400 19px "Trebuchet MS", sans-serif', C.muted, 'center');
  }

  function drawOver(ctx, s) {
    var r = s.results || {};
    ctx.fillStyle = 'rgba(10,18,16,0.88)';
    ctx.fillRect(0, 0, cfg.width, cfg.height);
    var title = r.won ? 'SHIFT SELESAI!' : 'DAPUR TUTUP!';
    text(ctx, title, cfg.width / 2, 200, '700 56px "Trebuchet MS", sans-serif', r.won ? C.gold : C.red, 'center');
    text(ctx, r.reason || '', cfg.width / 2, 242, '400 20px "Trebuchet MS", sans-serif', C.cream, 'center');
    text(ctx, 'SKOR  ' + (r.score || 0), cfg.width / 2, 310, '700 40px "Trebuchet MS", sans-serif', C.cream, 'center');
    text(ctx, 'Hidangan terantar: ' + (r.served || 0) + '   ·   Pesanan hangus: ' + (r.expired || 0) + '   ·   Kombo terbaik: x' + (r.bestCombo || 0), cfg.width / 2, 356, '400 18px "Trebuchet MS", sans-serif', C.muted, 'center');
    if ((r.score || 0) >= s.best && (r.score || 0) > 0) {
      text(ctx, 'Skor terbaik sesi ini!', cfg.width / 2, 392, '700 18px "Trebuchet MS", sans-serif', C.gold, 'center');
    }
    var bx = cfg.width / 2 - 160;
    var by = 440;
    ctx.fillStyle = C.gold;
    rr(ctx, bx, by, 320, 72, 16);
    ctx.fill();
    text(ctx, 'MASAK LAGI  (R)', cfg.width / 2, by + 46, '700 26px "Trebuchet MS", sans-serif', C.ink, 'center');
  }

  function draw(ctx, s) {
    drawBackground(ctx, s.time);
    drawTopBar(ctx, s);
    drawTickets(ctx, s);
    drawPrep(ctx, s);
    drawStove(ctx, s);
    drawPlate(ctx, s);
    drawBins(ctx, s);
    drawRush(ctx, s);
    if (s.screen === 'menu') drawMenu(ctx, s);
    else if (s.screen === 'paused') drawPaused(ctx);
    else if (s.screen === 'over') drawOver(ctx, s);
  }

  return {
    draw: draw,
    drawIngredientIcon: drawIngredientIcon,
    formatTime: fmtTime
  };
})();
