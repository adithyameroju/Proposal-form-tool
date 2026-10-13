# Coverline Ops prototype

Clickable prototype of the policy-ingestion console. Plain HTML, CSS and JavaScript, no dependencies and no build step.

- **V1** is the current flow: upload, parse, groups, variables, review.
- **V2** is the full journey: Document, Groups (with left-over terms), Templates, Plans, then Packages, PF revisions, partner variables and an activity log.

Switch with the **Version** dropdown in the header. It opens on V2. All data is sample data and resets on reload.

## Run it

You need Node 18 or newer (`node -v` to check).

```bash
cd coverline-ops-prototype
node server.mjs          # or: npm start
```

Open **http://localhost:5173**. If that port is busy the server moves to the next free one and prints the address.

No Node? Either of these works too:

```bash
python3 -m http.server 5173     # then open http://localhost:5173
```

or double-click `index.html` (it runs straight from the folder, no server needed).

### If localhost does not load

1. Is the terminal still open and showing "Coverline Ops prototype is running"? Closing it stops the server.
2. Use the exact address it prints. Try `http://127.0.0.1:5173` instead of `localhost`.
3. "command not found: node" means Node is not installed. Use the Python command above or double-click `index.html`.
4. Port already in use: the server picks the next free port and prints it.
5. On Replit or a similar online IDE, press **Run**. It serves on port 5173 and shows the preview.

## Project layout

```
index.html                    page shell and the list of files to load
server.mjs                    tiny dev server, no dependencies
src/styles/                   CSS, loaded in file-name order
  00-tokens-and-base.css        colours, fonts, reset (light and dark tokens)
  01-shell-and-stepper.css      sidebar, header, stepper
  02-common.css                 buttons, pills, cards, alerts
  03-pages-v1.css               overview, forms, parsing, groups, variables
  04-bars-overlays-tour.css     bottom bar, modals, toasts, guided tour
  05-responsive.css             breakpoints for V1
  06-v2.css                     V2 screens
  07-recent-additions.css       latest layout changes
src/js/                       JavaScript, loaded in file-name order
  01 to 07                      V1: data, shell, pages, actions, tour
  10 to 17                      V2: model, seeds, views, intake, engine, actions, feedback
  99-events-and-boot.js         global events and first render
```

The scripts are classic scripts that share one global scope, so **keep the load order in `index.html`**. A new file goes into `index.html` as another `<script src="...">` line, after the files it depends on and before `99-events-and-boot.js`.

How it works in one paragraph: each page is a function that returns an HTML string; `render()` puts it in the page; every button carries `data-act="name"` and a single delegated click handler calls `ACT[name]`. State lives in two plain objects, `S` (V1) and `W` (V2). The VER variable picks the version.

## Push to a repo and host it

```bash
git init
git add .
git commit -m "Coverline Ops prototype"
git branch -M main
git remote add origin git@github.com:<you>/<repo>.git
git push -u origin main
```

- **GitHub Pages:** Settings, then Pages, set Source to **GitHub Actions**. The included workflow deploys on every push to `main`.
- **Netlify or Vercel:** import the repo. No build command, publish directory `.`.

## Not production code

No backend, nothing is saved, and the document "parser" is simulated with sample data.
