# Styles Architecture

Огляд CSS-шару Nymo. JavaScript і розмітка — у [`../scripts/ARCHITECTURE.md`](../scripts/ARCHITECTURE.md). Кореневий README — у [`../../README.md`](../../README.md).

## Entry points

| Файл | Підключається з | Призначення |
|------|-----------------|-------------|
| [`main.css`](main.css) | `index.html` | Увесь UI месенджера після входу |
| [`auth-main.css`](auth-main.css) | `auth/index.html` | Лише auth: base + [`pages/auth.css`](pages/auth.css) |

Не змінюй порядок `@import` у entry-файлах без перевірки каскаду — пізніші шари перебивають ранні.

## Import order (`main.css`)

```
base/fonts.css, fonts-logo.css, variables.css
  → layout/layout.css, sidebar.css
  → features/chat.css, messages.css
  → ui/components.css, modal.css, settings.css, network-status.css
  → layout/responsive.css
```

У корені `src/styles/` є файли на кшталт `theme-modern-messenger.css`, `mobile/mobile-modern.css`, `base/performance-pause.css` — зараз **не** імпортуються з `main.css`; перед використанням додай `@import` у відповідний entry або об’єднай з існуючим шаром.

## Base layer (`base/`)

| Файл | Вміст |
|------|--------|
| `fonts.css` | Inter, SN Pro (основний UI) |
| `fonts-logo.css` | Шрифт логотипу |
| `variables.css` | CSS-змінні, токени теми (`dark-theme` на `<html>`) |

**Нові токени** — тільки в `variables.css`, не розкидати hex по feature-файлах.

## Layout layer (`layout/`)

| Файл | Вміст |
|------|--------|
| `layout.css` | Root shell, header, panels → `layout-parts/*` |
| `sidebar.css` | Бічна навігація, список чатів → `sidebar-parts/*` |
| `responsive.css` | Breakpoints → `responsive-parts/*` |

Ключові part-файли: `layout-root-shell`, `layout-header-panels`, `layout-welcome-screen`, `sidebar-nav-rail-expand`, `sidebar-chat-list`, `sidebar-mobile-secondary-menu`.

## Feature layer (`features/`)

| Файл | Вміст |
|------|--------|
| `chat.css` | Область чату, composer, structural chat UI |
| `messages.css` | Бульбашки, meta, media → `messages-parts/*` |

`messages-parts/`: `messages-core`, `messages-media`, `messages-typing`, `messages-state-edited`.

## UI layer (`ui/`)

| Файл | Вміст |
|------|--------|
| `components.css` | Кнопки, inputs, спільні компоненти |
| `modal.css` | Модалки, меню, overlay → `modal-parts/*` |
| `settings.css` | Settings / profile / shop / games → `settings-parts/*` |
| `network-status.css` | Банер і pill з `bootstrap.js` (`#orionNetworkStatus`) |

`modal-parts/`: new-chat, group, contact profile, image viewer, mobile sheets, …  
`settings-parts/`: profile hero, shop cards, mini-games (drift, runners), wallet, …

## Pages (`pages/`)

| Файл | Вміст |
|------|--------|
| `auth.css` | Повна сторінка `/auth/` (aurora, wizard, phone combo) |

Ізольовані маршрути — окремий CSS entry (`auth-main.css`), не `@import` у `main.css`.

## Відповідність розмітці (JS)

| UI в JS | CSS |
|---------|-----|
| `mount-app-shell.js` — `.nymo-app`, `.app-header`, `.chat-container`, модалки | `layout/*`, `features/*`, `ui/modal*` |
| `settings-templates.js` — `.settings-*`, shop, games | `ui/settings-parts/*` |
| `auth/index.html` — `.auth-*` | `pages/auth.css` |
| Динамічні `.message`, `.chat-item` | `features/messages*`, `layout/sidebar-parts/sidebar-chat-list` |

Legacy-префікси `orion-*` у класах збережені поруч з `nymo-*` для сумісності.

## Правила розширення

1. **Новий глобальний токен** → `base/variables.css`.
2. **Новий екран / секція settings** → `ui/settings-parts/` + import у `ui/settings.css` (зберегти порядок part-ів).
3. **Нова модалка** → `ui/modal-parts/` + import у `ui/modal.css`.
4. **Поведінка чату / повідомлень** → `features/`, не в `ui/components`.
5. **Тільки auth** → `pages/auth.css`, не роздувати `main.css`.
6. **Медіа-запити** → `layout/responsive.css` або відповідний `*-parts` файл, якщо локально до компонента.

## Збірка

Vite з `cssCodeSplit: true` — окремі CSS-чанки per entry (`main`, `auth`). Після змін у `@import` перевір обидва маршрути: `/` і `/auth/`.
