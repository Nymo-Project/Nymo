# Scripts Architecture

Огляд JavaScript-шару Nymo. Стилі — у [`../styles/ARCHITECTURE.md`](../styles/ARCHITECTURE.md). Кореневий README — у [`../../README.md`](../../README.md).

## Entry points

| Файл | Маршрут | Роль |
|------|---------|------|
| [`bootstrap.js`](bootstrap.js) | `/` (через `index.html`) | Сесія, PWA/SW, мережевий UI, `mountAppShell()`, `window.app` |
| [`auth/auth-page.js`](auth/auth-page.js) | `/auth/` | Логін/реєстрація, wizard, API auth |
| [`auth/auth-phone-countries.js`](auth/auth-phone-countries.js) | — | Дані країн для phone combo на auth |

### `bootstrap.js` (не лише mount)

- `registerOrionServiceWorker()` / `disableOrionServiceWorker()` — SW увімкнений у production (`VITE_ENABLE_SW`), у dev вимкнений.
- `bindServiceWorkerNotificationRouting()` — `postMessage` типу `nymo-open-chat` → відкриття чату.
- `bindPwaLifecycleEvents()` — `beforeinstallprompt`, оновлення SW.
- `installOrionNetworkResilience()` — обгортка `fetch` до API, банери офлайн/повільного з’єднання.
- Синхронізація legacy globals `__ORION_*` ↔ `__NYMO_*`.

## App layer

- [`app/ChatApp.js`](app/ChatApp.js) — кореневий клас: стан (`chats`, `currentChat`, `settings`, …) + підключення mixin-прототипів через `attachMethods`.
- [`app/mixins/index.js`](app/mixins/index.js) — barrel export усіх mixin-класів.

### Mixins (відповідальність)

| Mixin | Файл(и) | Домен |
|-------|---------|--------|
| `ChatAppCoreMethods` | `core-methods.js` | Тема, `localStorage`, чати, профіль, монети/tap, загальний стан |
| `ChatAppInteractionMethods` | `interaction-methods.js` + `interaction-methods-parts/*` | Навігація, список чатів, composer UI, профіль чату, групи |
| `ChatAppMessagingMethods` | `messaging-methods.js` + `messaging-methods-parts/*` | API, realtime (Socket.IO), рендер повідомлень, медіа, нотифікації |
| `ChatAppFeaturesMethods` | `features-methods.js` + `features-methods-parts/*`, `features-parts/*` | Settings, wallet, shop, FAQ, Nymo Drive (Three.js), audio |
| `ChatAppProfileMethods` | `profile-methods.js` | Профіль користувача |
| `ChatAppShopMethods` | `shop-methods.js` | Магазин (доповнює features) |
| `ChatAppGamesMethods` | `games-methods.js` | Міні-ігри (оркестрація) |
| `ChatAppChatRenderMethods` | `chat-render-methods.js` | Рендер чату |
| `ChatAppComposerMethods` | `composer-methods.js` | Поле вводу / відправка |

Підпапки `*-parts/` — розбиття великих mixin-файлів за фічами (не окремі класи в runtime, а модулі, зібрані в один export class).

### Mini-games (`app/mixins/mini-games-parts/`)

Окремі runtime-модулі: `grid2048-runtime`, `flappy-runtime`, `drift-runtime`, `tapper-auto-mining-runtime`, `mini-games-view-controller`, тощо. Підключаються з `games-methods` / `features-mini-games-methods`.

## UI layer (розмітка)

| Файл | Що генерує |
|------|------------|
| [`ui/init/mount-app-shell.js`](ui/init/mount-app-shell.js) | Статичний HTML shell месенджера (~900 рядків template string → `#app`) |
| [`ui/templates/settings-templates.js`](ui/templates/settings-templates.js) | HTML секцій settings / profile / shop / games |

Динамічна розмітка (елементи списку, бульбашки повідомлень) — у відповідних mixin через `innerHTML` / `createElement`, не в окремих `.html`.

Після mount: `localizeUiMarkup()` з [`shared/i18n/ui-localization.js`](shared/i18n/ui-localization.js).

## Shared layer

| Шлях | Призначення |
|------|-------------|
| [`shared/auth/auth-session.js`](shared/auth/auth-session.js) | Сесія в `localStorage`, redirect на `/auth/`, sync legacy profile |
| [`shared/api/api-url.js`](shared/api/api-url.js) | `getApiBaseUrl()` з `VITE_API_BASE_URL` |
| [`shared/i18n/ui-localization.js`](shared/i18n/ui-localization.js) | `translateUiText`, `localizeUiMarkup` |
| [`shared/helpers/ui-helpers.js`](shared/helpers/ui-helpers.js) | Alert, confirm, escape, форматування |
| [`shared/helpers/theme-branding.js`](shared/helpers/theme-branding.js) | Логотип / брендинг за темою |
| [`shared/helpers/page-visibility.js`](shared/helpers/page-visibility.js) | Page Visibility API |
| [`shared/gestures/swipe-handlers.js`](shared/gestures/swipe-handlers.js) | Swipe на мобільному |

## Зовнішні залежності в runtime

- **Socket.IO** — підключається з CDN у `index.html`, використовується в messaging/realtime mixins.
- **Three.js** — import map у `index.html` + `nymo-drive-gltf-loader` та пов’язані features.
- **qrcode** — npm, wallet/QR сценарії.

## Правила розширення

1. Бізнес-логіка і стан — у `app/mixins` (новий метод у відповідному `*-parts` або mixin-файлі).
2. Статична розмітка екрана / модалки — `ui/init` або `ui/templates`.
3. Утиліти без DOM-стану додатка — `shared/*`.
4. Не дублювати великі шаблони в кількох mixins — винести в `ui/templates` або helper з параметрами.
5. Імпорт mixin-класів у `ChatApp` — лише через `app/mixins/index.js`.

## Зв’язок зі стилями

Класи в HTML (`nymo-app`, `orion-app`, `modal`, `settings-*`) мають відповідники в `src/styles/`. Новий UI-блок: розмітка тут → CSS у [`../styles/ARCHITECTURE.md`](../styles/ARCHITECTURE.md) (layout / features / ui).
