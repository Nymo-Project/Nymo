import { ChatApp } from './app/ChatApp.js';
import { mountAppShell } from './ui/init/mount-app-shell.js';
import {
  getAuthSession,
  isAuthSessionValid,
  redirectToAuthPage,
  syncLegacyUserProfile
} from './shared/auth/auth-session.js';
import { getApiBaseUrl } from './shared/api/api-url.js';
import { translateUiText } from './shared/i18n/ui-localization.js';
import {
  bindNymoPwaLifecycleEvents,
  registerNymoServiceWorker
} from './shared/pwa/service-worker-lifecycle.js';

syncLegacyOrionGlobals();

function syncLegacyOrionGlobals() {
  const pairs = [
    ['__NYMO_PENDING_NOTIFICATION_OPEN', '__ORION_PENDING_NOTIFICATION_OPEN'],
    ['__NYMO_SW_MESSAGE_BOUND', '__ORION_SW_MESSAGE_BOUND'],
    ['__NYMO_PWA_DEFERRED_PROMPT', '__ORION_PWA_DEFERRED_PROMPT'],
    ['__NYMO_PWA_UPDATE_REGISTRATION', '__ORION_PWA_UPDATE_REGISTRATION'],
    ['__NYMO_PWA_LIFECYCLE_BOUND', '__ORION_PWA_LIFECYCLE_BOUND'],
    ['__NYMO_NETWORK_RESILIENCE_INSTALLED', '__ORION_NETWORK_RESILIENCE_INSTALLED'],
    ['__NYMO_FETCH_WRAPPED', '__ORION_FETCH_WRAPPED'],
    ['__NYMO_APP_BOOTSTRAPPED', '__ORION_APP_BOOTSTRAPPED']
  ];
  pairs.forEach(([nymoKey, orionKey]) => {
    if (window[nymoKey] == null && window[orionKey] != null) {
      window[nymoKey] = window[orionKey];
    }
    if (window[orionKey] == null && window[nymoKey] != null) {
      window[orionKey] = window[nymoKey];
    }
  });
}

function queueNymoNotificationOpenRequest(payload = {}) {
  const nextPayload = {
    chatServerId: String(payload.chatServerId || '').trim(),
    localChatId: payload.localChatId != null ? String(payload.localChatId).trim() : '',
    url: String(payload.url || '').trim()
  };
  window.__NYMO_PENDING_NOTIFICATION_OPEN = nextPayload;
  window.__ORION_PENDING_NOTIFICATION_OPEN = nextPayload;
}

function consumeNymoNotificationOpenRequest() {
  const pending = window.__NYMO_PENDING_NOTIFICATION_OPEN || window.__ORION_PENDING_NOTIFICATION_OPEN;
  if (!pending || typeof pending !== 'object') return false;
  const app = window.app;
  if (!app || !Array.isArray(app.chats)) return false;

  const chatServerId = String(pending.chatServerId || '').trim();
  const localChatId = String(pending.localChatId || '').trim();
  const targetChat = app.chats.find((chat) => {
    if (!chat) return false;
    if (chatServerId && typeof app.resolveChatServerId === 'function' && app.resolveChatServerId(chat) === chatServerId) {
      return true;
    }
    return localChatId && String(chat.id || '').trim() === localChatId;
  }) || null;

  if (!targetChat) return false;

  const navChats = document.getElementById('navChats');
  if (navChats && typeof app.setActiveNavButton === 'function') {
    app.setActiveNavButton(navChats);
  }
  if (typeof app.selectChat === 'function') {
    app.selectChat(targetChat.id);
  }
  delete window.__NYMO_PENDING_NOTIFICATION_OPEN;
  delete window.__ORION_PENDING_NOTIFICATION_OPEN;
  return true;
}

function bindServiceWorkerNotificationRouting() {
  if (!('serviceWorker' in navigator)) return;
  if (window.__NYMO_SW_MESSAGE_BOUND || window.__ORION_SW_MESSAGE_BOUND) return;
  window.__NYMO_SW_MESSAGE_BOUND = true;
  window.__ORION_SW_MESSAGE_BOUND = true;

  navigator.serviceWorker.addEventListener('message', (event) => {
    const data = event?.data;
    if (!data || typeof data !== 'object') return;
    if (data.type !== 'nymo-open-chat' && data.type !== 'orion-open-chat') return;
    queueNymoNotificationOpenRequest(data);
    consumeNymoNotificationOpenRequest();
  });
}

function getNetworkQualitySnapshot() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
  const effectiveType = String(connection?.effectiveType || '').trim().toLowerCase();
  const downlink = Number(connection?.downlink || 0);
  const rtt = Number(connection?.rtt || 0);
  const isPoor = Boolean(
    effectiveType === 'slow-2g'
    || effectiveType === '2g'
    || (Number.isFinite(downlink) && downlink > 0 && downlink < 1)
    || (Number.isFinite(rtt) && rtt >= 450)
  );
  return {
    isOnline: navigator.onLine !== false,
    isPoor
  };
}

function ensureOrionNetworkStatusUi() {
  if (!document.body) return null;
  let root = document.getElementById('orionNetworkStatus');
  if (root) return root;

  const t = (value) => translateUiText(value);
  root = document.createElement('div');
  root.id = 'orionNetworkStatus';
  root.className = 'orion-network-status-layer';
  root.setAttribute('aria-live', 'polite');
  root.innerHTML = `
    <div class="orion-network-loading-pill" id="orionNetworkLoadingPill" role="status" aria-hidden="true">
      <span class="orion-network-spinner" aria-hidden="true"></span>
      <span class="orion-network-loading-text">${t("Очікування з'єднання...")}</span>
    </div>
    <div class="orion-network-warning-banner" id="orionNetworkWarningBanner" role="status" aria-hidden="true"></div>
  `;
  document.body.appendChild(root);
  return root;
}

function installOrionNetworkResilience() {
  if (window.__ORION_NETWORK_RESILIENCE_INSTALLED) return;
  window.__ORION_NETWORK_RESILIENCE_INSTALLED = true;

  const apiOrigin = (() => {
    try {
      return new URL(getApiBaseUrl()).origin;
    } catch {
      return '';
    }
  })();
  const t = (value) => translateUiText(value);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ensureOrionNetworkStatusUi(), { once: true });
  } else {
    ensureOrionNetworkStatusUi();
  }

  const getLoadingPill = () => document.getElementById('orionNetworkLoadingPill');
  const getWarningBanner = () => document.getElementById('orionNetworkWarningBanner');

  let activeApiRequests = 0;
  let loadingPillTimer = null;
  let slowConnectionTimer = null;
  let slowWarningVisible = false;
  let warningAutoHideTimer = null;
  let wasOffline = navigator.onLine === false;

  const hideLoadingPill = () => {
    const loadingPill = getLoadingPill();
    if (!loadingPill) return;
    loadingPill.classList.remove('is-visible');
    loadingPill.setAttribute('aria-hidden', 'true');
  };

  const showLoadingPill = () => {
    const loadingPill = getLoadingPill();
    if (!loadingPill) return;
    loadingPill.classList.add('is-visible');
    loadingPill.setAttribute('aria-hidden', 'false');
  };

  const showWarning = (message = '', { variant = 'warning', autoHideMs = 0 } = {}) => {
    const warningBanner = getWarningBanner();
    if (!warningBanner) return;
    if (warningAutoHideTimer) {
      clearTimeout(warningAutoHideTimer);
      warningAutoHideTimer = null;
    }
    warningBanner.textContent = String(message || '').trim();
    warningBanner.classList.toggle('is-success', variant === 'success');
    warningBanner.classList.add('is-visible');
    warningBanner.setAttribute('aria-hidden', 'false');
    if (autoHideMs > 0) {
      warningAutoHideTimer = window.setTimeout(() => {
        warningAutoHideTimer = null;
        refreshConnectionWarning();
      }, autoHideMs);
    }
  };

  const hideWarning = () => {
    const warningBanner = getWarningBanner();
    if (!warningBanner) return;
    if (warningAutoHideTimer) {
      clearTimeout(warningAutoHideTimer);
      warningAutoHideTimer = null;
    }
    warningBanner.classList.remove('is-success');
    warningBanner.classList.remove('is-visible');
    warningBanner.setAttribute('aria-hidden', 'true');
  };

  const refreshConnectionWarning = () => {
    const snapshot = getNetworkQualitySnapshot();
    if (!snapshot.isOnline) {
      wasOffline = true;
      showWarning(t('Немає інтернету. Працюємо офлайн, дані синхронізуються після відновлення.'));
      return;
    }
    if (snapshot.isPoor) {
      showWarning(t('Погане зʼєднання. Оновлення даних може тривати довше.'));
      return;
    }
    if (activeApiRequests === 0 && !slowWarningVisible) {
      hideWarning();
    }
  };

  const startApiRequest = () => {
    activeApiRequests += 1;
    if (loadingPillTimer) {
      clearTimeout(loadingPillTimer);
      loadingPillTimer = null;
    }
    if (activeApiRequests === 1) {
      loadingPillTimer = window.setTimeout(() => {
        loadingPillTimer = null;
        if (activeApiRequests > 0) showLoadingPill();
      }, 150);
    }
    if (!slowConnectionTimer) {
      slowConnectionTimer = window.setTimeout(() => {
        slowConnectionTimer = null;
        if (activeApiRequests > 0 && navigator.onLine !== false) {
          slowWarningVisible = true;
          showWarning(t('Сервер відповідає повільно. Чекаємо зʼєднання...'));
        }
      }, 4200);
    }
  };

  const finishApiRequest = () => {
    activeApiRequests = Math.max(0, activeApiRequests - 1);
    if (activeApiRequests > 0) return;

    if (loadingPillTimer) {
      clearTimeout(loadingPillTimer);
      loadingPillTimer = null;
    }
    if (slowConnectionTimer) {
      clearTimeout(slowConnectionTimer);
      slowConnectionTimer = null;
    }

    hideLoadingPill();
    slowWarningVisible = false;
    refreshConnectionWarning();
  };

  const isTrackedApiRequest = (input) => {
    if (!apiOrigin) return false;
    try {
      const rawUrl = typeof input === 'string' ? input : input?.url;
      if (!rawUrl) return false;
      const resolvedUrl = new URL(rawUrl, window.location.href);
      return resolvedUrl.origin === apiOrigin;
    } catch {
      return false;
    }
  };

  if (!window.__ORION_FETCH_WRAPPED && typeof window.fetch === 'function') {
    const nativeFetch = window.fetch.bind(window);
    window.__ORION_FETCH_WRAPPED = true;

    window.fetch = async (...args) => {
      const trackedRequest = isTrackedApiRequest(args[0]);
      if (trackedRequest) startApiRequest();
      try {
        const response = await nativeFetch(...args);
        if (trackedRequest && !response.ok && response.status >= 500) {
          showWarning(t('Сервер тимчасово недоступний. Спробуйте ще раз.'));
        }
        return response;
      } catch (error) {
        if (trackedRequest) {
          if (navigator.onLine === false) {
            showWarning(t('Немає інтернету. Працюємо офлайн, дані синхронізуються після відновлення.'));
          } else {
            showWarning(t('Погане зʼєднання з сервером. Очікуємо відновлення...'));
          }
        }
        throw error;
      } finally {
        if (trackedRequest) finishApiRequest();
      }
    };
  }

  window.addEventListener('online', () => {
    const snapshot = getNetworkQualitySnapshot();
    if (wasOffline && snapshot.isOnline && !snapshot.isPoor) {
      wasOffline = false;
      showWarning(t('Зʼєднання відновлено. Синхронізуємо дані…'), {
        variant: 'success',
        autoHideMs: 2600
      });
      return;
    }
    wasOffline = false;
    refreshConnectionWarning();
  });
  window.addEventListener('offline', () => {
    wasOffline = true;
    refreshConnectionWarning();
  });
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
  connection?.addEventListener?.('change', refreshConnectionWarning);
  refreshConnectionWarning();
}

function bootNymoApp() {
  if (window.__NYMO_APP_BOOTSTRAPPED || window.__ORION_APP_BOOTSTRAPPED) return;
  window.__NYMO_APP_BOOTSTRAPPED = true;
  window.__ORION_APP_BOOTSTRAPPED = true;

  const session = getAuthSession();
  if (!isAuthSessionValid(session)) {
    redirectToAuthPage();
    return;
  }

  syncLegacyUserProfile(session?.user || {});
  mountAppShell();
  if (window.app && typeof window.app.realtimeSocket?.disconnect === 'function') {
    try {
      window.app.realtimeSocket.removeAllListeners?.();
      window.app.realtimeSocket.disconnect();
    } catch {
      // Ignore stale socket shutdown errors.
    }
  }
  window.app = new ChatApp();
  consumeNymoNotificationOpenRequest();
}

bindServiceWorkerNotificationRouting();
bindNymoPwaLifecycleEvents();
installOrionNetworkResilience();
window.addEventListener('load', () => {
  registerNymoServiceWorker().catch(() => {});
}, { once: true });

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootNymoApp, { once: true });
} else {
  bootNymoApp();
}
