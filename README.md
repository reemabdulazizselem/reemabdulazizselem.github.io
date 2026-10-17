# Reem Ashraf — portfolio

A static portfolio with four artwork/sketch comparisons and a Behar book mockup. No build tools or installation required. Open `index.html` in your browser to preview.

## Publish on GitHub Pages

1. Create a GitHub account (or use an existing one).
2. Create a public repository named `USERNAME.github.io`, replacing USERNAME with the account username.
3. Upload the **contents** of this `portfolio` folder into the repository. `index.html` must be at the repository root, next to `styles.css`, `app.js`, and the `assets` folder.
4. In the repository, open **Settings → Pages**. Select **Deploy from a branch**, branch **main**, folder **/(root)**, and save.
5. GitHub will display the published address when deployment finishes: `https://USERNAME.github.io`.

You can instead use a repository named `portfolio`; its address will be `https://USERNAME.github.io/portfolio/`. All asset paths are relative and support either option.

Official guide: https://docs.github.com/en/pages/quickstart

## How the comparison works

Click an artwork to open it. Moving the pointer reveals the original sketch through a soft, rippling reveal with a fading trail. The sketch and finished artwork occupy the same image bounds. Touch visitors can drag on the image. The controls also support showing the entire sketch, adjusting the ripple size, and moving the lens with arrow keys while the image is focused. Escape closes the viewer.

## Scroll effects

The hero artwork moves in layers as visitors scroll. Gallery pieces rise and settle into view, the text ribbon moves horizontally with page scrolling, and the about-section star rotates gently. The sticky header shows reading progress and highlights the current section. Scrolling remains native on desktop and mobile. Visitors who prefer reduced motion receive a still layout, and content remains visible if JavaScript is disabled.

## Edit the content

- Text, about paragraph, project titles and gallery: `index.html`.
- Viewer titles and artwork mappings: `app.js`.
- Colors, layout and responsive styles: `styles.css`.
- Optimized web images: `assets/`.

The supplied original PNGs are unchanged in the parent folders. The two background titles are descriptive working titles and can be renamed. The name Reem Ashraf comes from the supplied filenames. No contact details, social links or animation clips were supplied, so these are not included. Fonts load from Google Fonts, with local font fallbacks if unavailable.

