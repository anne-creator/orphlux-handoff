# Final website

Live: [https://orphlux-editorial-anne.qubemc-7529.chatgpt.site](https://orphlux-editorial-anne.qubemc-7529.chatgpt.site/)

The existing comparison default is fixed for handoff. Branding, content, layout, imagery and animation remain unchanged. The comparison panel is omitted from the final page.

## Run

```sh
python3 -m http.server 8080 --directory dist
```

Open http://localhost:8080/. Serve over HTTP, not file URLs. Runtime files are editable HTML, CSS and JavaScript. No Node installation is needed to serve them.

## Build and check

```sh
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python build.py
.venv/bin/python verify.py
.venv/bin/python verify_m12.py
```

The last verifier uses Node for JavaScript syntax checks. The supplied dist folder is the deployment artifact. Keep it when cloning: builds reuse its maintained runtime assets.

Edit `m1-2/homepage.html` for the homepage; `dist/*.css` and `dist/*.js` for runtime presentation; `source-content/` and Python modules for retained detail pages. `build_delivery.py` produces final and comparison entry pages. `dist/final-default.js` locks the chosen variants.

## Fixed defaults

Font B (IBM Plex Mono), Hero reference-dot, original motion, sand footer, reference Physical AI, cinematic GenAI, stories Research, loop Evaluation, pixel dataset cards.

## Deploy elsewhere

Upload the contents of `dist/` to a static host at the domain root. All local asset paths start with `/`. No credentials or personal hosting ownership are transferred. The current site remains on its existing host; DNS is unchanged.

The page retains the comparison presentation's single-page navigation. Detail pages remain available by direct URL. Contact opens an email draft, not a submission backend. See [handoff limits](../DEPENDENCIES-AND-LIMITS.md).
