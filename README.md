# Spellbook

A mobile-friendly web app for tracking a game of Magic: The Gathering Commander (EDH). Supports 2–4 players with life totals, commander damage, a turn phase tracker, a guided combat resolver, and utility tools (dice roller, randomizer, glossary, card anatomy guide, new game setup).

Built with React 18, TypeScript, Vite, and CSS Modules.

## Running the app

Dependencies and the dev server both run inside Docker — nothing needs to be installed on your host machine.

**First time setup** (or after changing `package.json`):

```bash
docker compose run --rm app npm install
```

**Start the dev server:**

```bash
docker compose up
```

Then open [http://localhost:5173](http://localhost:5173).

The project directory is bind-mounted into the container, so edits to source files trigger Vite's hot module replacement instantly without restarting the container.

## Project structure

```
src/
  types.ts                    # Shared TypeScript interfaces
  data/                       # Static game data (phases, glossary, mana, combat steps)
  hooks/
    useGameState.ts            # localStorage persistence
  components/
    shared/                   # ManaPip, Stepper, Chip, Modal
    combat/
      resolveCombat.ts         # Pure combat damage function (no React dependency)
      CombatModal.tsx
    PlayerPanel/
    PhaseTracker/
    modals/                   # CardAnatomy, Glossary, Dice, Randomizer, NewGame
  styles/
    tokens.css                 # CSS custom properties (colours, fonts)
    global.css                 # Resets, shared components, animations
```

Each component that has unique styles keeps them in a co-located `.module.css` file.

## Running tests

Unit tests use [Vitest](https://vitest.dev/) and run inside Docker:

```bash
docker compose run --rm test
```

The first run installs dependencies into the shared `node_modules` volume before executing the suite. Subsequent runs skip straight to the tests.

## Other commands

Run these via `docker compose run --rm app <command>`:

| Command | Purpose |
|---|---|
| `npm run build` | Production build (outputs to `dist/`) |
| `npm run preview` | Preview the production build locally |
| `npx tsc -b` | TypeScript type check (no emit) |
