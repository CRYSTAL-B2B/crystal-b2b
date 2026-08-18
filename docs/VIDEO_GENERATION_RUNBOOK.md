# Video-generation runbook

This package prepares five original image-to-video motion plates for CRYSTAL
CUBE. They amplify the five scene acts; all Russian copy, metrics, controls and
CTA remain live HTML. Reference media in the production pack are not submitted
as source footage or shipped to the website.

## Current source of truth

- Scene requirements: `b2b_marketing_site_production_pack_v1/docs/scenes/`.
- Approved inputs: `assets/generated/first-frames/masters/` (PNG) and
  `public/media/first-frames/` (production WebP).
- Request manifest: `assets/generated/video-prompts/manifest.json`.
- Prompts: `assets/generated/video-prompts/seedance-2.5/*.txt`.
- Runner: `scripts/generate-seedance.mjs`.
- Operational state: [`CURRENT_STATE.md`](CURRENT_STATE.md).

Scene `02-processes` must use only
`02-processes-system-cross-v2.{png,webp}`. The old organic-cell frame is an
archive and is not a permitted generation input. It is currently **on hold**:
the runner excludes it from `--all` and rejects direct submission until this
status is deliberately removed.

## Current generation and delivery status

| Scene | Website state | Provider state | Next permitted action |
| --- | --- | --- | --- |
| 01 Hero | Existing 4:3 H.264 delivery MP4 is live | A separate 16:9 review render, 1280×720 / 6.04 s, was generated from `01-hero-16x9.png` | Wait for explicit user approval before replacing the website MP4 |
| 02 Processes | Static WebP/HTML | Hold | Do not submit or remove the runner guard |
| 03 Control Flow | Approved H.264 delivery MP4 is live | Approved | Do not regenerate without a new request |
| 04 Connected System | Approved H.264 delivery MP4 is live | Approved | Do not regenerate without a new request |
| 05 Lighthouse | Static start/end posters and HTML | Not generated | Do not submit until a new explicit decision |

The reviewed 16:9 Hero render and its job metadata are in the gitignored
`assets/generated/video/2026-08-17T16-49-05-861Z/` directory. It is a review
master, not a deployed asset. The active prompt manifest deliberately points to
the non-destructive `01-hero-16x9.{png,webp}` source; the live Hero MP4 stays
unchanged until sign-off.

## Seedance 2.5 preparation

The active prompt set is `seedance-2.5/`. Each prompt specifies a six-second
beat sheet, camera lock, material identity and failure modes particular to its
scene. The input masters are the reproducible default. After any master update,
first export the matching public WebP source: the runner refuses a paid request
when the WebP is older than its PNG master. This prevents a new prompt from
animating a stale first frame.

EmpirioLabs currently exposes Seedance 2.5 as `seedance-2-5`. It supports
`i2v_first` with `image` and `i2v_both` with `image` plus `image_end`; use
`adaptive` aspect ratio because I2V follows the first input frame. Its current
output ceiling is 720p.

The original Hero master `01-hero.png` remains intact at 4:3. Its separate
1440×810 centre crop `01-hero-16x9.png` is the approved generation input for
the completed review job; do not stretch either asset. Lighthouse A and B are
the start/end frames of one `i2v_both` clip. Use `05-lighthouse_a.png` and
`05-lighthouse_b-16x9.png` with their matching `05-lighthouse.webp` and
`05-lighthouse_end.webp` posters. Export a fresh WebP after every change to a
PNG master before any paid submission.

## Preflight

No key or paid request is needed for preflight:

```bash
npm run generate:video -- --preflight --verify-sources --prompt-profile seedance-2.5
npm run generate:video -- --scene 01-hero --dry-run --prompt-profile seedance-2.5
```

Preflight verifies every prompt, PNG master and WebP poster. `--verify-sources`
also checks that each public first-frame URL is reachable as an image.

Create a local secret only after preflight is clean:

```bash
cp .env.example .env.local
# Open .env.local and put the provider key after the equals sign:
# EMPIRIOLABS_API_KEY=your_real_key_here
# Never commit this file or paste the key into a client-side environment variable.
```

For a provider account that confirms a Seedance 2.5 image-to-video model, add
its exact identifier in the same local-only file:

```dotenv
SEEDANCE_PROMPT_PROFILE=seedance-2.5
SEEDANCE_MODEL=seedance-2-5
SEEDANCE_RESOLUTION=720p
SEEDANCE_DURATION=6
SEEDANCE_ASPECT_RATIO=adaptive
```

## Future generation order

There is no paid job authorised at the moment. Do not rerun the approved clips,
do not submit Processes, and do not start Lighthouse until the user explicitly
requests it. Once authorised, generate one 720p draft at a time, review it,
then move on. Never run an unreviewed multi-scene paid batch.

```bash
# Example only after an explicit scene-specific approval:
npm run generate:video -- --scene 05-lighthouse --prompt-profile seedance-2.5
```

Only after a draft is selected, generate its selected 720p master. The current
Seedance 2.5 API does not offer 1080p output; use a reviewed post-production
upscale only if the web performance budget permits it:

```bash
SEEDANCE_MODEL=seedance-2-5 SEEDANCE_RESOLUTION=720p \
  npm run generate:video -- --scene 01-hero --prompt-profile seedance-2.5
```

The runner saves request, submission, job response and MP4 in a new timestamped
directory under `assets/generated/video/`; it never overwrites a
render. This directory is Git-ignored. Preserve selected masters in managed
storage before any provider URL expires.

## Editorial approval per clip

Approve a draft only if all checks pass:

- first frame, composition, negative copy-space and material silhouette hold;
- motion communicates the intended scene verb (assemble, signal, controlled
  turn, connect, stabilise) without a camera ride;
- no generated text, logo, watermark, UI, people or reference-footage look;
- no flicker, frame warping, topology drift, extra objects, unwanted particles
  or aggressive motion blur;
- the 6-second end frame is near enough to the start for an unobtrusive loop;
- Russian HTML copy remains legible over the candidate at desktop and mobile.

Reject and regenerate if the scene loses its semantic role:

| Scene | Must retain |
| --- | --- |
| Hero | one engineered marketing artifact and calm copy space |
| Processes | rigid cross-module system with a connected signal |
| Flow | same input taking one controlled turn, not a wider flow |
| Connected | a readable rigid six-layer architecture |
| Lighthouse | one perfectly stable beacon through controlled turbulence |

## Website handoff

Generation does not automatically publish a video. For each selected clip:

1. record provider/model/settings and reviewer decision next to the render;
2. create web delivery encodes only after visual approval;
3. keep the matching WebP poster and a deliberate reduced-motion static state;
4. lazy-load and pause the video outside the viewport; do not autoplay it as
   the LCP asset;
5. run desktop, mobile, reduced-motion, network/performance and visual QA
   before production release.
