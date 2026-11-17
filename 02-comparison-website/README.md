# Latest comparison website

Live: [https://orphlux-editorial-anne.qubemc-7529.chatgpt.site/compare/](https://orphlux-editorial-anne.qubemc-7529.chatgpt.site/compare/)

This is the latest existing multi-version presentation, including the compact comparison panel, component variants and Onda overall comparison. It is separately runnable and includes all runtime source files. These alternatives are not additional final designs.

```sh
python3 -m http.server 8081 --directory dist
```

Open http://localhost:8081/. Use the bottom-right settings button to compare variants. `dist/meeting-r1-02-typography.js` controls comparison defaults; `dist/m1-2-variants.js` registers variants. Onda is at `/onda/index.htm`. Shared editable template and build source are in [01-final-website](../01-final-website/); the comparison HTML is generated there at `dist/compare/index.html`. To refresh this independent copy after editing the shared source, copy the generated dist tree, then use `dist/compare/index.html` as this folder's `dist/index.html` and `dist/homepage.html`.

No redesign was made during handoff.
