# Reem Ashraf — portfolio

A static, multi-page portfolio hosted on GitHub Pages. No build tools or dependencies are required.

- `index.html`: Home, featured artwork, and Behind the work introduction.
- `work.html`: Filterable collection.
- `about.html`: About Reem; expand with verified courses, education and competition results when supplied.
- `contact.html`: Email contact.
- `project-ouroboros.html`, `project-behar.html`, `project-studio.html`, `project-room.html`: Individual artwork pages. Clicking the artwork opens the original comparison pop-up.

## Interactions

The pop-up retains the watery sketch reveal, touch dragging, keyboard arrow controls, ripple size, full-sketch toggle and Escape to close. The featured home artwork retains its entrance and hover wave. Native scrolling drives the logo contour movement and home ribbon; reduced-motion preferences are respected. The system pointer stays native, with an Explore badge on artwork.

The six-eye dedication challenge uses stable header, About and footer eye identities across pages. Each must be clicked exactly once within 30 seconds of the first click. Repeating any eye invalidates that window. Progress is saved only in sessionStorage, updated on clicks, and expires without a background timer. If storage is unavailable, the complete challenge remains possible on Home or About, each containing all six eyes. The hidden note is created only on success. Its text is readable in the public JavaScript source.

## Editing and publishing

Edit the HTML pages directly; shared behavior is in `app.js`, styling in `styles.css`, and optimized images in `assets/`. Upload the website files at the repository root and keep Pages configured for `main` / root. Contact: reemabdulaziz999@gmail.com. No social profiles or animation clips have been supplied.

## Rollback

The original single-page site is preserved by Git tag `single-page-checkpoint-2026-10-24`, commit `21d3dbfa4cd2fb35baa9b00e7768a7f01ae3a933`. Restore that tag’s files in a new commit to return to the previous version.


Four more backgrounds: garden house, cat market (with sketches), little shop and traveling home (artwork only). New project pages: project-manor.html, project-market.html, project-shop.html, project-journey.html. Artwork-only popups omit sketch assets and animation.

Project pages now show the interactive sketch reveal inline, without a second click or popup. Artwork-only projects remain static.

Privacy: privacy.html describes GitHub Pages hosting, Google Fonts, session storage and email contact. Copyright and a privacy link appear on every page. Update the notice when adding analytics, forms, or other data processing. HTTPS enforcement verified 25 October 2026. GitHub account 2FA still needs owner setup.

Multi-image projects (October 2026): project-amira.html (10 images), project-bakery.html (3), project-coffee.html (10), and project-ehkeely.html (18). Their supplied descriptions are included; Behar uses its supplied concept text. gallery.js provides swipe/drag, arrows, keyboard navigation, and thumbnail selection, including the existing maximized viewer. No autoplay or background animation loop. Each image has a full WebP capped at 2000px, a 960px version, and a 240px thumbnail. Ehkeely07 precedes Ehkeely007; both are distinct images. Source artwork remains in graphic/. Metadata is embedded as gallery-data JSON on each page.

October 30 update: added El Sheikh El Shareeb (7 images), Falash (13), and TRAX (23), using source descriptions. Existing market/shop/journey pages now use Bolaq El-Qatqout, Sobhy El Farrargi, and Marsa Qatqout; identical source files were not added again. Work-page frames now share a 4:3 ratio with consistent spacing. Gallery wheel navigation applies only inside the open maximized dialog, with a threshold and cooldown; horizontal thumbnail scrolling and browser zoom remain available.
