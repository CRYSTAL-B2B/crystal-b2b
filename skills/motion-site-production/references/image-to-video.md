# Image-to-Video Pipeline

## Условия запуска

Генерируй видео только после явного пользовательского подтверждения:

- утверждённой сцены и её функции;
- master-кадра или пары start/end frame;
- модели, aspect ratio, длительности и бюджета;
- места сохранения candidate output;
- того, что результат требует ревью до подключения к сайту.

Не публикуй секреты. Читай ключ из локального env-файла или секрет-хранилища; не выводи его, не записывай в prompt/manifest и не коммить `.env`.

## Структура ассетов

Разделяй источник, кандидаты и delivery:

```text
assets/generated/
  first-frames/masters/<scene>.png
  video-prompts/<provider>/<scene>.txt
  video/<provider>/<scene>/candidate-001.mp4
  video/<provider>/<scene>/review.json
public/media/
  first-frames/<scene>.webp
  video/<scene>.webm
```

Не удаляй утверждённый master при смене кандидата. Добавляй версию, дату, источник и статус (`draft`, `candidate`, `approved`, `integrated`, `rejected`) в manifest или review-файл.

## Карточка промпта

Составляй промпт как производственную спецификацию, а не как набор прилагательных:

```md
Scene: 01-hero
Purpose: Сформировать ощущение точного, направленного запуска.
Input: approved master frame 01-hero-16x9.png
Duration / aspect: 6 s / 16:9

Motion:
- Начать с точной композиции master-кадра.
- Дать мягкое физически правдоподобное движение только указанным слоям.
- Сохранить focal point и свободную область под копирайт.
- Завершить композицией, пригодной для петли или перехода.

Camera: locked or explicitly defined subtle move; no sudden reframing.
Look: materials, contrast, palette from master; no style drift.
Avoid: generated text, logos, UI, people unless approved, warping, flicker, strobe, hard cuts, new objects, camera whip.
Acceptance: first frame matches master; semantic change supports the scene contract.
```

Для пары start/end frame укажи, что первый и последний кадры принадлежат одному ролику. Не описывай их как два независимых клипа.

## Preflight и генерация

1. Проверь существование и aspect ratio masters, prompt и output directory.
2. Запусти dry run, который печатает только безопасные параметры: scene ID, модель, размеры, путь output.
3. Проверь, что output не перезапишет утверждённый файл.
4. Отправь одну candidate-генерацию на подтверждённый вариант.
5. Сохрани ответ провайдера и технические метаданные без секрета.
6. Не запускай следующую платную генерацию без согласованного направления, если пользователь поставил её на паузу.

## Ревью кандидата

Оцени до интеграции:

| Критерий | Вопрос |
| --- | --- |
| Continuity | Совпадает ли первый кадр с master и нужен ли end frame? |
| Narrative | Показывает ли движение изменение из контракта сцены? |
| Composition | Сохраняются ли safe area и focal point для сайта? |
| Motion | Нет ли морфинга, мерцания, нелогичной физики, резких срезов? |
| Brand | Сохранены ли палитра, материалы, контраст и арт-дирекция? |
| Technical | Верны ли длительность, aspect ratio, fps, кодек и размер? |
| Web fallback | Хорошо ли выглядит poster и поведение без autoplay? |

Снимай превью первого, среднего и последнего кадра. Помечай кандидата `approved` только после пользовательского утверждения; затем кодируй/оптимизируй delivery-версию и подключай её к сцене.

## Интеграция

- Применяй poster сразу, чтобы layout и первый кадр были стабильны.
- Добавляй корректный MIME type, размеры media и fallback на случай ошибки.
- Не заставляй основное повествование зависеть от autoplay или сетевой скорости.
- Измеряй вес ассета и эффект на LCP/первый paint; применяй preload только к действительно критичному media.
- Обновляй manifest, current-state документ и runbook после выбора финального видео.
