# Гайд по вёрстке секций — Радар Вульфа (тёмная fintech-тема)

Стек: **Gulp + Pug (bemto BEM) + SASS + Bootstrap 5**. Никакого React/Tailwind.
Каждая секция = папка `source/pug/blocks/<Block>/` с двумя файлами:
`_<Block>.pug` (определяет `mixin <Block>()`) и `_<Block>.scss` (BEM-стили блока).

## ОБЯЗАТЕЛЬНО прочитай перед работой
- `source/pug/blocks/sHero/_sHero.pug` и `_sHero.scss` — **эталон** разметки и стилей.
- `source/sass/_root.scss` — все CSS-токены (цвета, spacing).
- `source/sass/_base.scss` — `.section`, `.section-title`, `.eyebrow`, `.section-head`.
- `source/sass/_components.scss` — `.btn-primary`, `.btn-ghost`, `.mono-tag`, `.surface-card`, `.l-arrow-item`, `.stat-value`.
- `source/pug/blocks/mixin-wrap/mixin-wrap.pug` — миксины `+icon()`, `+section-head()`, `+defSlider()`, `+ddgroup`/`+ddGroup`, `+badge`.

## Дизайн-токены (использовать ТОЛЬКО их, не хардкодить цвета)
```
--accent #e79017   --bg-surface #15181b (основной тёмный фон)
--bg-surface-raised #23272c   --bg-inverse #1d2024   --bg-canvas #ecebe5 (светлые секции)
--text-strong #fff  --text-primary #dcdad4  --text-secondary #c7c5bf
--text-muted #8b9296  --text-faint #6b7176  --text-on-accent #1d2024
--border-default rgba(255,255,255,.1)  --border-strong rgba(255,255,255,.12)  --border-accent #d29a4566
--positive #5fae84  --radius-sm 2px  --radius-md 3px
spacing: var(--space-12 … --space-96)
```
### Акцент — ДВА токена (как в Figma variable mode)
- `--accent` — **контекстный**: на тёмных секциях `#e79017` (оранж), на светлых
  (`.section--canvas`) автоматически `#b07d22` (золото). Используй его для
  **линий/границ/номеров/мелких текст-акцентов** — он сам подстроится под фон.
- `--accent-solid` — **всегда `#e79017`** (оранж). Используй для **сплошных
  «пробивных» элементов**: кнопки CTA (`.btn-primary` уже на нём), залитые
  плашки/бейджи — чтобы они оставались оранжевыми и на светлых секциях.
- Не хардкодь золото `#b07d22` в блоках — оно приходит само через `.section--canvas`.

Шрифты: **Manrope** (`$font-family-sans-serif`, заголовки/текст) + **JetBrains Mono**
(`$font-family-code`, лейблы/теги/цифры-метки). Размеры через `rem(px)` (16px база).

## Скелет .pug секции
```pug
mixin sExample()
  +b.SECTION.sExample.section#sExample&attributes(attributes)
    .container
      +section-head('NN', 'TAGLINE СПРАВА')      // [ NN ] ........ TAG
      +b.section-title
        h2 Заголовок секции
      +e.body
        ...контент через +e.* (BEM-элементы)
```
- Светлая секция: добавь класс `.section--canvas` (тёмный текст на `--bg-canvas`).
- `+section-head('02', 'ПРОБЛЕМА')` рендерит `[ 02 ]` слева + тег справа (как в Hero).
- Главный заголовок: `.section-title > h2` (стиль h2 уже в `_base.scss`, **класс на h2 не вешать, margin не ставить**). Вторичный — `+b.section-title.section-title--inner`.
- Моно-надстрочник (eyebrow): `+e.SPAN.eyebrow.eyebrow--accent ТЕКСТ` или класс `.mono-tag`.
- Кнопка CTA: `+e.A.btn.btn.btn-primary(href="#sForm")` + текст + `+icon('arrow-right')`.

## SCSS блока
- Всё под `.sExample { ... }`, элементы `&__el`, модификаторы `&--mod`.
- Цвета/отступы — через `var(--token)`. Размеры — `rem()`.
- Адаптив через `@include media-breakpoint-down(lg|md|sm)`. Mobile-first ок.
- **Высоту карточек не фиксировать**: равная высота через `align-items: stretch` + `height:100%` на внутренней карточке; на свайпер-слайде `height:auto`.
- Сетки карточек: CSS grid или flex; на мобиле либо в колонку, либо паттерн `mobile-swiper--js` (см. ниже).

## Слайдер карточек на мобиле (если в ряду >2 карточек)
Контейнеру: `.sExample__cards.mobile-swiper--js.swiper`, внутри `.swiper-wrapper`, карточки `.swiper-slide`.
JS (`common.js → initMobileSwipers`) уже подключён. В scss:
```scss
&__cards { overflow: hidden; @include media-breakpoint-up(md){ overflow: visible; } }
.swiper-slide { height:auto; --maw: calc((100% - (N - 1) * GAPpx)/N); max-width: max(MINpx, var(--maw)); }
```

## Аккордеон (FAQ и т.п.)
Используй `+ddGroup` / `ddgroup` из mixin-wrap (см. `source/pug/blocks/mixin-wrap/components/ddgroup.pug`).
Открытый элемент — класс `active`. HTML в заголовке через `!=`.

## Ассеты
- Все картинки клади СРАЗУ в `public/img/wolfe/<block>/` (без оптимизации, не в source/img).
- Формат растровых картинок — **`.webp`** (PNG/JPG не оставляем). Положил PNG —
  прогони `node scripts/png-to-webp.js`: он конвертит `public/img/wolfe/**/*.png` в webp
  (quality 90), удаляет PNG и перевешивает ссылки `.png → .webp` в pug/scss. Флаги:
  `--dry-run` (только показать), `--keep-png` (не удалять оригиналы).
- В pug ссылайся как `img/wolfe/<block>/file.webp`.
- Скачивай ассеты из Figma по URL из `get_design_context` через `curl -s -o`.
- Простую векторную графику (графики, иконки-линии) лучше нарисовать inline `<svg>` в pug
  (как `wolfe-chart` в Hero) — чётче и без зависимостей. Монохромные иконки — через `+icon('name')`.

## ЗАПРЕЩЕНО
- Трогать `index.pug`, `main.scss`, `content.json`, `_root.scss`, `_base.scss`, `_vars*.scss`,
  `_components.scss`, файлы других блоков. Только свою папку блока + свои ассеты в public/img/wolfe/<block>/.
- Хардкодить hex-цвета вне токенов. Ставить фикс-высоту. Использовать Tailwind/React-классы.
- Глобальные селекторы в scss блока (только `.sExample ...`).

## Поучения / частые правки
- Компактные нумерованные сетки (чек-листы, пейн-пункты) на мобилке оставлять в 2 колонки, не схлопывать в 1.
- Кликабельные изображения открывать на весь экран через Fancybox — он уже забинжен в JSCCommon.js на `[data-fancybox]`; нужна только разметка `<a data-fancybox href>` вокруг img, без JS.
- Картинки проекта — в `.webp` (конвертация `./node_modules/.bin/cwebp`); фоновые/декоративные изображения делать через `object-fit: cover` в `overflow: hidden` контейнере, чтобы не было видно краёв; на мобилке декоративную картинку уводить ПОД текст с пониженной opacity, текст — выше по z-index.
- Текст в многоколоночной grid/flex-сетке режется по краю (`overflow:hidden`), если колонки/флекс-дети не сжимаются: колонкам — `grid-template-columns: repeat(N, minmax(0, 1fr))`, флекс-детям с текстом — `min-width: 0` (+ `overflow-wrap: break-word`). Причина: `1fr`=`minmax(auto,1fr)` и `min-width:auto` не дают переносить текст.
- `mobile-swiper--js`: формулу `--maw` для N равных колонок вешать ТОЛЬКО на `media-breakpoint-up(md)`. На мобилке `.swiper-slide` задавать ширину от вьюпорта (`max-width: 80vw` — карточка ~80% экрана, чтобы СЛЕДУЮЩИЙ слайд торчал и было видно, что это слайдер). Контейнеру `.swiper` обязательно `width:100%; min-width:0;` — иначе он растягивается под сумму слайдов (`slidesPerView:'auto'`) и прокрутка не работает (контейнер == ширине всех слайдов, скроллить нечего).
- **★ ГЛАВНОЕ ПРАВИЛО СЛАЙДЕРОВ: оверфлоу по ширине ЭКРАНА, а не контейнера.** Любой горизонтальный слайдер/широкая таблица должны скроллиться от края до края ЭКРАНА (вьюпорта), а не в пределах боковых паддингов `.container`. Для этого — миксин `bleed-x()` из `_mixin.scss`: он растягивает скролл-контейнер на `100vw` (`margin-left: calc(50% - 50vw)`) и возвращает внутренний контент обратно в границы контейнера паддингом (`calc(50vw - 50%)`). Итог: первый элемент выровнен по контенту страницы, дорожка скролла = ширина экрана, на десктопе контент НЕ растягивается шире контейнера. Сброс на брейкпоинте, где влезает — `bleed-x-reset()`. **Никогда не оставляй слайдер скроллящимся внутри контейнера.**
- **Стандарт CSS-слайдера** (без JS, без Swiper) — миксины `slider-x($gap, $bleed)` + `slider-slide($w)`. Не дублировать boilerplate `display:flex / overflow-x:auto / scroll-snap-type` руками. `$bleed:true` = включить `bleed-x()` (full-bleed до экрана). На `md+` ресетить: `@include bleed-x-reset()` + `flex-direction:column/grid`, слайд → `flex:0 0 auto; max-width:none`. Примеры: `sProblem__grid`, `sModules__charts`.
- **Широкая таблица не влезает в экран** — НЕ схлопывать колонки. Скролл-контейнеру `overflow-x:auto` + `@include bleed-x()`, ячейкам `min-width` (напр. `rem(248)`), строкам `flex-direction:row` — таблица тянется горизонтально целиком, дорожка до краёв экрана. Если у ячеек СВОИ бордеры (нет единой рамки) — `bleed-x()` вешается прямо на грид (фон у грида прозрачный, полосы не будет). Пример: `sModules__grid`.
  - **Рамка вокруг ВСЕЙ таблицы (gap-background) + скролл по экрану** — рамку и скролл-дорожку нельзя на одном элементе (рамка/radius уедут на края экрана, а паддинг bleed-x проявит полосу цвета границы). Поэтому **обёртка**: внешний `&__grid-scroll { @include bleed-x(); overflow-x:auto }` (скролл по экрану, без рамки), внутри `&__grid` — сама таблица с рамкой: `gap:1px; background:<border-color>; border; border-radius; overflow:hidden` + ячейки с непрозрачным `background: var(--bg-canvas)`. Чтобы таблица не сжималась и рамка обнимала её целиком — на мобилке фикс-колонки `grid-template-columns: repeat(N, rem(248)); width: max-content; min-width: 100%`, на `lg+` → `repeat(N, 1fr); width:auto`. Пример: `sOnChart__grid-scroll / __grid`.
  - **НЕ** рисовать рамку через `border` на ячейках + `margin:-1px` — этот трюк съедает ВНЕШНИЙ край (верх/лево уходят под `overflow:hidden`), внешней рамки нет.
- **Ряд однотипных карточек/примеров** на мобилке — горизонтальный scroll-snap слайдер `slider-x($bleed:true)` / `slider-slide(~85vw)` (следующий слайд торчит за краем ЭКРАНА). Превью-картинки внутри — в `<a data-fancybox href>` (клик → галерея на весь экран, Fancybox забинжен).
