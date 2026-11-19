# obsidi.xyz interface system

## Direction

A quiet, terminal-literate notebook host: near-black canvas, generous monospace typography, thin structural rules, bracketed navigation, and restrained white actions. No copied OpenCode mark, model-provider artwork, invented customer statistics, or decorative gradients.

The approved, detailed analysis of **all three supplied screenshots** remains the reference evidence in [design section 2](../openspec/changes/build-obsidi-saas/design.md#2-screenshot-evidence-and-adaptation). It describes the landing gallery, documentation reader, and console layout separately and maps their patterns to shadcn components. Keep that evidence in one place; this document tracks the implemented system.

## Font and tokens

The actual files under `public/fonts/` come from [JetBrains Mono v2.304](https://github.com/JetBrains/JetBrainsMono/releases/tag/v2.304), not a font CDN. Regular, Medium, and Bold are self-hosted with the original `OFL.txt`. Inspected Regular metadata reports `Version 2.304; ttfautohint (v1.8.4.7-5d5b)`. `tests/ui-system.test.ts` pins SHA-256 checksums to the downloaded official files.

`src/styles/global.css` is the implemented token source. Core tones:

| Role                | Token     |
| ------------------- | --------- |
| Canvas              | `#0b0b0b` |
| Primary text/action | `#f4f4f2` |
| Quiet panel         | `#141414` |
| Menu/dialog         | `#1b1b1b` |
| Secondary text      | `#a3a3a3` |
| Keyboard focus      | `#b8cbf5` |

Controls use a stronger input boundary than decorative separators. All font roles use JetBrains Mono, with disabled coding ligatures in UI text. Body line-height is 1.7; articles are capped at 72ch. Only the regular font is preloaded. Secondary weights load on demand.

Measured token-pair contrast: primary text 17.87:1, secondary text 7.80:1, secondary text on panels 7.30:1, primary-action text 17.15:1, control boundary 3.69:1, focus ring 12.09:1. Browser axe checks also test the rendered screens; decorative separators are not control boundaries.

## Live component inventory

Generated from the official shadcn **radix-nova** registry with one consistent Radix component family. No alternate UI library or Geist font is substituted. Used source lives in `src/components/ui/`.

The small registry state aliases are vendored in `src/styles/shadcn-variants.css`; they map Radix state attributes to the generated Tailwind classes without adding the entire CLI to application dependencies. The shadcn MIT license is retained with the generated component source.

| Component type  | Reachable use and importing file                                                                            |
| --------------- | ----------------------------------------------------------------------------------------------------------- |
| Sidebar         | Bracketed site navigation; `src/components/SiteNavigation.tsx`                                              |
| Sheet           | Mobile site navigation and note tree; `sidebar.tsx`, `SampleReader.tsx`                                     |
| Navigation Menu | Header Reader/Docs navigation; `HeaderNavigation.tsx`                                                       |
| Button          | Real sample/docs links and search/tree triggers; landing page and reader                                    |
| Badge           | Development/sample/billing status; `SiteNavigation.tsx`, `ProductPreviews.tsx`, `SampleReader.tsx`, pricing |
| Card            | Three real reader/workflow previews; `ProductPreviews.tsx`                                                  |
| Aspect Ratio    | Stable preview sizing; `ProductPreviews.tsx`                                                                |
| Separator       | Site footer grouping and publication boundary preview                                                       |
| Breadcrumb      | Reader location; `SampleReader.tsx`                                                                         |
| Collapsible     | Expand/collapse sample note folder; `SampleReader.tsx`                                                      |
| Scroll Area     | Bounded note tree; `SampleReader.tsx`                                                                       |
| Dialog          | Search overlay; `SampleReader.tsx`                                                                          |
| Command         | Filter and keyboard-select sample notes; `SampleReader.tsx`                                                 |
| Kbd             | Visible search shortcut; `SampleReader.tsx`                                                                 |
| Empty           | Search with no matching notes; `SampleReader.tsx`                                                           |
| Tabs            | Read the note or its original Markdown; `SampleReader.tsx`                                                  |
| Tooltip         | Public sample explanation, keyboard-focusable; `SampleReader.tsx`                                           |
| Input Group     | Search input and icon composition; generated `command.tsx`                                                  |

This is 18 used types, not 18 completed SaaS features. The sample is explicitly not customer account data. Generated transitive primitives such as Skeleton, Input, and Textarea are not counted unless their UI is actually rendered; future dashboard usage must update this inventory.

## States and responsiveness

- `/`, `/docs`, and `/pricing`: persistent desktop rail, accessible mobile Sheet, genuine links, no fake signup/payment forms.
- `/sample`: three-column reader on wide screens, two columns at intermediate widths, single article plus a note-tree Sheet on phones.
- Search: `⌘K` or `Ctrl+K`, title filtering, no-result Empty state, arrow-key selection, Escape, restored trigger focus.
- Tabs and collapsible folders retain standard keyboard interactions.
- Markup is server-rendered; React hydrates interaction boundaries. No private data is present in these public screens.
- `Dashboard.astro` sets private non-cacheable headers but is not itself an authentication boundary; task 3 supplies identity checks before dashboard routes exist.

The landing CTA currently points to the real sample reader, not an unimplemented registration flow. Task 3 introduces signup and updates the acquisition CTA.

## Verification

```bash
npm test -- tests/ui-system.test.ts
npm run test:e2e -- navigation.spec.ts
npm run build
```

Browser checks cover 360/768/1440px overflow, reduced motion, font delivery, search/selection, tab switching, mobile dismissal/focus, and automated WCAG checks including color contrast. Screenshots are saved beneath ignored `test-results/` for visual review.

Automated accessibility checks do not constitute a complete manual accessibility audit. Customer dashboard, authenticated server islands, live notebook hosting, billing, keys, and MCP remain tracked implementation work.
