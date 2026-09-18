# Open source

GrooveScribe Remix is built on the following open source projects. Versions are the ranges declared in [`package.json`](package.json). Transitive dependencies from the lockfile are not listed.

## Runtime

| Package     | Version        | Role                             | Link                                                                         |
| ----------- | -------------- | -------------------------------- | ---------------------------------------------------------------------------- |
| dayjs       | `^1.11.21`     | Date and time helpers            | [github.com/iamkun/dayjs](https://github.com/iamkun/dayjs)                   |
| idb         | `^8.0.3`       | Promise wrapper around IndexedDB | [github.com/jakearchibald/idb](https://github.com/jakearchibald/idb)         |
| vaul-svelte | `1.0.0-next.7` | Drawer / bottom-sheet primitives | [github.com/huntabyte/vaul-svelte](https://github.com/huntabyte/vaul-svelte) |

## Development, tooling, and UI

| Package                               | Version    | Role                                              | Link                                                                                                                  |
| ------------------------------------- | ---------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| @changesets/changelog-github          | `^1.0.0`   | GitHub-linked changelog entries                   | [github.com/changesets/changesets](https://github.com/changesets/changesets/tree/main/packages/changelog-github)      |
| @changesets/cli                       | `^3.0.0`   | Version bump and changelog CLI                    | [github.com/changesets/changesets](https://github.com/changesets/changesets)                                          |
| @eslint/js                            | `^10.0.1`  | ESLint JavaScript recommended rules               | [github.com/eslint/eslint](https://github.com/eslint/eslint)                                                          |
| @fontsource-variable/figtree          | `^5.3.0`   | Figtree variable font                             | [fontsource.org/fonts/figtree](https://fontsource.org/fonts/figtree)                                                  |
| @fontsource-variable/inter            | `^5.3.0`   | Inter variable font                               | [fontsource.org/fonts/inter](https://fontsource.org/fonts/inter)                                                      |
| @fontsource-variable/jetbrains-mono   | `^5.3.0`   | JetBrains Mono variable font                      | [fontsource.org/fonts/jetbrains-mono](https://fontsource.org/fonts/jetbrains-mono)                                    |
| @fontsource-variable/montserrat       | `^5.3.0`   | Montserrat variable font                          | [fontsource.org/fonts/montserrat](https://fontsource.org/fonts/montserrat)                                            |
| @fontsource-variable/noto-sans        | `^5.3.0`   | Noto Sans variable font                           | [fontsource.org/fonts/noto-sans](https://fontsource.org/fonts/noto-sans)                                              |
| @fontsource-variable/playfair-display | `^5.3.0`   | Playfair Display variable font                    | [fontsource.org/fonts/playfair-display](https://fontsource.org/fonts/playfair-display)                                |
| @internationalized/date               | `^3.12.2`  | Locale-aware date primitives                      | [github.com/adobe/react-spectrum](https://github.com/adobe/react-spectrum/tree/main/packages/@internationalized/date) |
| @lucide/svelte                        | `^1.31.0`  | Lucide icons for Svelte                           | [github.com/lucide-icons/lucide](https://github.com/lucide-icons/lucide)                                              |
| @sveltejs/adapter-cloudflare          | `^7.2.9`   | SvelteKit adapter for Cloudflare                  | [github.com/sveltejs/kit](https://github.com/sveltejs/kit/tree/main/packages/adapter-cloudflare)                      |
| @sveltejs/kit                         | `^2.63.0`  | SvelteKit application framework                   | [github.com/sveltejs/kit](https://github.com/sveltejs/kit)                                                            |
| @sveltejs/vite-plugin-svelte          | `^7.1.2`   | Vite plugin for Svelte                            | [github.com/sveltejs/vite-plugin-svelte](https://github.com/sveltejs/vite-plugin-svelte)                              |
| @tabler/icons-svelte                  | `^3.46.0`  | Tabler icons for Svelte                           | [github.com/tabler/tabler-icons](https://github.com/tabler/tabler-icons)                                              |
| @tailwindcss/forms                    | `^0.5.11`  | Tailwind form style reset                         | [github.com/tailwindlabs/tailwindcss-forms](https://github.com/tailwindlabs/tailwindcss-forms)                        |
| @tailwindcss/typography               | `^0.5.19`  | Tailwind typography plugin                        | [github.com/tailwindlabs/tailwindcss-typography](https://github.com/tailwindlabs/tailwindcss-typography)              |
| @tailwindcss/vite                     | `^4.3.0`   | Tailwind Vite plugin                              | [github.com/tailwindlabs/tailwindcss](https://github.com/tailwindlabs/tailwindcss)                                    |
| @types/node                           | `^22`      | TypeScript types for Node.js                      | [github.com/DefinitelyTyped/DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped)                      |
| @vite-pwa/sveltekit                   | `^1.1.0`   | PWA integration for SvelteKit                     | [github.com/vite-pwa/sveltekit](https://github.com/vite-pwa/sveltekit)                                                |
| bits-ui                               | `^2.16.3`  | Headless Svelte UI primitives                     | [github.com/huntabyte/bits-ui](https://github.com/huntabyte/bits-ui)                                                  |
| clsx                                  | `^2.1.1`   | Conditional className helper                      | [github.com/lukeed/clsx](https://github.com/lukeed/clsx)                                                              |
| drizzle-kit                           | `^0.31.10` | Drizzle schema and migration CLI                  | [github.com/drizzle-team/drizzle-orm](https://github.com/drizzle-team/drizzle-orm)                                    |
| drizzle-orm                           | `^0.45.2`  | TypeScript ORM                                    | [github.com/drizzle-team/drizzle-orm](https://github.com/drizzle-team/drizzle-orm)                                    |
| eslint                                | `^10.4.1`  | JavaScript / TypeScript linter                    | [github.com/eslint/eslint](https://github.com/eslint/eslint)                                                          |
| eslint-config-prettier                | `^10.1.8`  | Turn off ESLint rules that conflict with Prettier | [github.com/prettier/eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)                      |
| eslint-plugin-simple-import-sort      | `^14.0.0`  | Import sort ESLint plugin                         | [github.com/lydell/eslint-plugin-simple-import-sort](https://github.com/lydell/eslint-plugin-simple-import-sort)      |
| eslint-plugin-svelte                  | `^3.19.0`  | ESLint plugin for Svelte                          | [github.com/sveltejs/eslint-plugin-svelte](https://github.com/sveltejs/eslint-plugin-svelte)                          |
| fake-indexeddb                        | `^6.2.5`   | In-memory IndexedDB for tests                     | [github.com/dumbmatter/fakeIndexedDB](https://github.com/dumbmatter/fakeIndexedDB)                                    |
| globals                               | `^17.6.0`  | Shared ESLint global identifiers                  | [github.com/sindresorhus/globals](https://github.com/sindresorhus/globals)                                            |
| mode-watcher                          | `^1.1.0`   | Light / dark mode for Svelte                      | [github.com/svecosystem/mode-watcher](https://github.com/svecosystem/mode-watcher)                                    |
| prettier                              | `^3.8.3`   | Code formatter                                    | [github.com/prettier/prettier](https://github.com/prettier/prettier)                                                  |
| prettier-plugin-svelte                | `^4.1.0`   | Prettier plugin for Svelte                        | [github.com/sveltejs/prettier-plugin-svelte](https://github.com/sveltejs/prettier-plugin-svelte)                      |
| prettier-plugin-tailwindcss           | `^0.8.0`   | Sort Tailwind classes in Prettier                 | [github.com/tailwindlabs/prettier-plugin-tailwindcss](https://github.com/tailwindlabs/prettier-plugin-tailwindcss)    |
| shadcn-svelte                         | `^1.5.0`   | Svelte port of shadcn/ui                          | [github.com/huntabyte/shadcn-svelte](https://github.com/huntabyte/shadcn-svelte)                                      |
| svelte                                | `^5.56.1`  | UI compiler and runtime                           | [github.com/sveltejs/svelte](https://github.com/sveltejs/svelte)                                                      |
| svelte-check                          | `^4.6.0`   | Svelte type and diagnostic checker                | [github.com/sveltejs/language-tools](https://github.com/sveltejs/language-tools)                                      |
| svelte-sonner                         | `^1.2.1`   | Toast notifications                               | [github.com/wobsoriano/svelte-sonner](https://github.com/wobsoriano/svelte-sonner)                                    |
| tailwind-merge                        | `^3.6.0`   | Merge conflicting Tailwind classes                | [github.com/dcastil/tailwind-merge](https://github.com/dcastil/tailwind-merge)                                        |
| tailwind-variants                     | `^3.3.1`   | Tailwind variant / slot helper                    | [github.com/heroui-inc/tailwind-variants](https://github.com/heroui-inc/tailwind-variants)                            |
| tailwindcss                           | `^4.3.0`   | Utility-first CSS                                 | [github.com/tailwindlabs/tailwindcss](https://github.com/tailwindlabs/tailwindcss)                                    |
| tw-animate-css                        | `^1.4.0`   | Tailwind animation utilities                      | [github.com/Wombosvideo/tw-animate-css](https://github.com/Wombosvideo/tw-animate-css)                                |
| typescript                            | `^6.0.3`   | TypeScript language                               | [github.com/microsoft/TypeScript](https://github.com/microsoft/TypeScript)                                            |
| typescript-eslint                     | `^8.60.1`  | TypeScript ESLint tooling                         | [github.com/typescript-eslint/typescript-eslint](https://github.com/typescript-eslint/typescript-eslint)              |
| vite                                  | `^8.0.16`  | Dev server and bundler                            | [github.com/vitejs/vite](https://github.com/vitejs/vite)                                                              |
| vite-plugin-pwa                       | `1.3.0`    | Vite PWA / Workbox plugin                         | [github.com/vite-pwa/vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa)                                    |
| vitest                                | `^4.1.10`  | Unit test runner                                  | [github.com/vitest-dev/vitest](https://github.com/vitest-dev/vitest)                                                  |
| workbox-window                        | `^7.4.1`   | Service worker window helpers                     | [github.com/GoogleChrome/workbox](https://github.com/GoogleChrome/workbox)                                            |
| wrangler                              | `4.118.0`  | Cloudflare Workers / Pages CLI                    | [github.com/cloudflare/workers-sdk](https://github.com/cloudflare/workers-sdk)                                        |

## Vendored and adapted

These are not installed from npm in this repo. License texts for the drum samples live next to the files.

| Project       | Version           | Role                                                                                                                                                                                                                                                                                                                                                                                                | Link                                                                         |
| ------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Groove Scribe | vendored (GPL v2) | Origin of drum and metronome samples in [`static/groove/audio/`](static/groove/audio/) (see [`ATTRIBUTION.txt`](static/groove/audio/ATTRIBUTION.txt)), ABC generation under [`src/lib/utils/abc/vendor/`](src/lib/utils/abc/vendor/), preset tab data in [`src/lib/utils/presets.ts`](src/lib/utils/presets.ts), and the typed port in [`src/lib/utils/music-math.ts`](src/lib/utils/music-math.ts) | [github.com/montulli/GrooveScribe](https://github.com/montulli/GrooveScribe) |
| abc2svg       | vendored          | Percussion staff engraving, loaded from [`static/groove/vendor/abc2svg-1.js`](static/groove/vendor/abc2svg-1.js) via [`src/app.html`](src/app.html)                                                                                                                                                                                                                                                 | [github.com/moinejf/abc2svg](https://github.com/moinejf/abc2svg)             |
