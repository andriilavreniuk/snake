# Snake

Classic Snake on a canvas. Watch a short ad, then play.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:8080](http://localhost:8080).

Ads often fail on plain HTTP. For HTTPS, drop `localhost.pem` and `localhost-key.pem` in `.certs/` (gitignored) and run:

```bash
npm run dev:https
```

Then [https://localhost:8443](https://localhost:8443).

`npm run watch` rebuilds `dist/` as you edit. `index.html` loads that bundle, so build at least once.

## Play

Arrow keys move. On menus: arrows pick, Enter confirms, Backspace is no.

The game unlocks only after a completed ad. Leave goes to Gmail.

## GitHub Pages

Push `main`. Then **Settings → Pages → Source: GitHub Actions**.

Site: https://andriilavreniuk.github.io/snake/
