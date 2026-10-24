# Reem Ashraf — portfolio

A static, multi-page portfolio hosted on GitHub Pages. No build tools or dependencies are required.

- `index.html`: Home and featured artwork.
- `work.html`: Filterable collection.
- `about.html`: About Reem.
- `contact.html`: Email contact.
- `project-ouroboros.html`, `project-behar.html`, `project-studio.html`, `project-room.html`: Individual artwork pages. Clicking the artwork opens the original comparison pop-up.

## Interactions

The pop-up retains the watery sketch reveal, touch dragging, keyboard arrow controls, ripple size, full-sketch toggle and Escape to close. The featured home artwork retains its entrance and hover wave. Native scrolling drives the logo contour movement and home ribbon; reduced-motion preferences are respected. The system pointer stays native, with an Explore badge on artwork.

The six-eye dedication challenge uses stable header, About and footer eye identities across pages. Each must be clicked exactly once within 30 seconds of the first click. Repeating any eye invalidates that window. Progress is saved only in sessionStorage, updated on clicks, and expires without a background timer. If storage is unavailable, the complete challenge remains possible on About, which contains all six eyes. The hidden note is created only on success. Its text is readable in the public JavaScript source.

## Editing and publishing

Edit the HTML pages directly; shared behavior is in `app.js`, styling in `styles.css`, and optimized images in `assets/`. Upload the website files at the repository root and keep Pages configured for `main` / root. Contact: reemabdulaziz999@gmail.com. No social profiles or animation clips have been supplied.

## Rollback

The original single-page site is preserved by Git tag `single-page-checkpoint-2026-10-24`, commit `21d3dbfa4cd2fb35baa9b00e7768a7f01ae3a933`. Restore that tag’s files in a new commit to return to the previous version.
