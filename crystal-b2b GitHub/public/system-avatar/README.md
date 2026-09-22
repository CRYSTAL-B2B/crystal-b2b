# B2B-System System Avatar Assets v1

Готовая папка ассетов для интеграции в `public/system-avatar/`.

## Содержимое

- `source/avatar-master.png` — утверждённый исходный квадратный аватар.
- `states/*.png` — 10 рабочих состояний.
- `atlas/avatar-atlas.png` — 5×2 sprite atlas.
- `atlas/avatar-atlas.json` — координаты кадров.
- `eye/*.png` — отдельные runtime-маски глаза.
- `avatar-manifest.json` — production manifest.
- `frame/frame-reference.png` — reference frame.
- `reference/avatar-state-board.png` — визуальный референс состояний.

## Порядок состояний

1. idle
2. track-left
3. track-right
4. alert
5. lock
6. charge
7. scan
8. confirm
9. cooldown
10. sleep

## Важно

Луч, glow, reticle animation и contact FX не должны запекаться в портрет.
Они рендерятся поверх ассетов через WebGL/CSS.

`anchors.eye` в manifest — стартовая калибровка. После вставки в реальный layout
проверить центр киберглаза и при необходимости скорректировать на несколько пикселей.
