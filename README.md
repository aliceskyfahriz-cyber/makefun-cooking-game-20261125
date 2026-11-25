[![Make the best cooking game](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![Rank](https://make.fun/badge/best-cooking-game-20261125-0137/aliceskyfahriz-cyber/makefun-cooking-game-20261125/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![Reward](https://make.fun/badge/best-cooking-game-20261125-0137/aliceskyfahriz-cyber/makefun-cooking-game-20261125/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

# Warung Senja — Make the best cooking game

A small Indonesian warung kitchen, played in a desktop browser from static files — no build step, no network request.

You are the chef of a tiny twilight warung. Orders come in on the board: Nasi Goreng, Mie Goreng, Soto Ayam, Ayam Geprek, Gado-Gado. Grab ingredients from the bins, cook the raw ones (telur and ayam) on the stove, assemble each dish on the plate, and serve it before the ticket burns. Three expired orders close the kitchen; a 3-minute shift with a target of 10 dishes.

## How to play

- **Click a bin (or press 1–6)** to take an ingredient to the prep counter.
- **Click a raw ingredient on the prep counter** (telur, ayam) to send it to the stove. It cooks for a few seconds — click it again once it says SIAP to move it to the plate.
- **Click a ready ingredient on the prep counter** to put it straight on the plate.
- When the plate matches an open ticket, **ANTAR (Space)** serves it: points, coins, and a few seconds back on the shift clock.
- **BUANG (Backspace)** clears the plate. **P** pauses, **M** mutes, **RESEP** shows today's recipes.

## Play it

Serve `game/` with any static HTTP server and open `game/index.html` in desktop Chrome:

```sh
cd game && python3 -m http.server 8080
```

## Layout

- `game/index.html` — the page and canvas
- `game/src/config.js` — every tunable number, recipe and colour
- `game/src/random.js` — seeded randomness (screenshots are reproducible)
- `game/src/audio.js` — synthesised WebAudio sounds, no audio files
- `game/src/orders.js` — the order board: tickets, patience, matching
- `game/src/kitchen.js` — bins, prep counter, stove, plate, serving
- `game/src/render.js` — all canvas drawing, no image files
- `game/src/input.js` — keyboard and mouse
- `game/src/shots.js` — staged states for the screenshots
- `game/src/main.js` — loop, screens, scoring
- `main.ts` — the hand-in program (Node 22, stdlib only)
- `screenshots/` — 4 real renders of the game's own code

## Screenshots

Taken with `?shot=play|start|serve|end&seed=7` (see `shots.json`): the menu, a busy mid-shift with a dish mid-assembly, a plate ready to serve, and the end of a shift.

## License

MIT — see `LICENSE`.
