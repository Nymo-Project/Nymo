import { getAppBasePath } from '../auth/auth-session.js';

function dispatchNymoPwaEvent(name, detail = {}) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

function isServiceWorkerEnabledByEnv() {
  const rawFlag = String(import.meta.env?.VITE_ENABLE_SW || '').trim().toLowerCase();
  if (rawFlag === '1' || rawFlag === 'true' || rawFlag === 'yes' || rawFlag === 'on') {
    return true;
  }
  if (rawFlag === '0' || rawFlag === 'false' || rawFlag === 'no' || rawFlag === 'off') {
    return false;
  }
  return import.meta.env?.DEV !== true;
}

export function bindNymoPwaLifecycleEvents() {
  if (window.__NYMO_PWA_LIFECYCLE_BOUND || window.__ORION_PWA_LIFECYCLE_BOUND) return;
  window.__NYMO_PWA_LIFECYCLE_BOUND = true;
  window.__ORION_PWA_LIFECYCLE_BOUND = true;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    setPendingPwaInstallPrompt(event);
  });

  window.addEventListener('appinstalled', () => {
    setPendingPwaInstallPrompt(null);
    dispatchNymoPwaEvent('nymo:pwa-installed', { installed: true });
    dispatchNymoPwaEvent('orion:pwa-installed', { installed: true });
  });
}

export function setPendingPwaInstallPrompt(promptEvent = null) {
  window.__NYMO_PWA_DEFERRED_PROMPT = promptEvent || null;
  window.__ORION_PWA_DEFERRED_PROMPT = window.__NYMO_PWA_DEFERRED_PROMPT;
  dispatchNymoPwaEvent('nymo:pwa-installable-change', {
    canInstall: Boolean(promptEvent)
  });
  dispatchNymoPwaEvent('orion:pwa-installable-change', {
    canInstall: Boolean(promptEvent)
  });
}

function setPendingPwaUpdateRegistration(registration = null) {
  window.__NYMO_PWA_UPDATE_REGISTRATION = registration || null;
  window.__ORION_PWA_UPDATE_REGISTRATION = window.__NYMO_PWA_UPDATE_REGISTRATION;
  dispatchNymoPwaEvent('nymo:pwa-update-change', {
    hasUpdate: Boolean(registration?.waiting)
  });
  dispatchNymoPwaEvent('orion:pwa-update-change', {
    hasUpdate: Boolean(registration?.waiting)
  });
}

function watchPwaRegistrationForUpdates(registration) {
  if (!registration) return;

  if (registration.waiting) {
    setPendingPwaUpdateRegistration(registration);
  }

  registration.addEventListener('updatefound', () => {
    const installingWorker = registration.installing;
    if (!installingWorker) return;

    installingWorker.addEventListener('statechange', () => {
      if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
        setPendingPwaUpdateRegistration(registration);
      }
    });
  });
}

export async function pruneStaleServiceWorkerRegistrations() {
  if (!('serviceWorker' in navigator)) return;

  const expectedScope = new URL(getAppBasePath(), window.location.origin).href;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations.map(async (registration) => {
      const scope = new URL(registration.scope).href;
      if (scope !== expectedScope) {
        await registration.unregister();
      }
    })
  );
}

export async function disableNymoServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  } catch (_) {
    // Ignore service worker cleanup failures.
  }

  if (!('caches' in window)) return;
  try {
    const cacheKeys = await caches.keys();
    await Promise.all(
      cacheKeys
        .filter((key) => {
          const normalized = String(key || '');
          return normalized.startsWith('nymo-') || normalized.startsWith('orion-');
        })
        .map((key) => caches.delete(key))
    );
  } catch (_) {
    // Ignore cache cleanup failures.
  }
}

export function getServiceWorkerRegistrationUrl() {
  return new URL(`${getAppBasePath()}sw.js`, window.location.origin).href;
}

export async function registerNymoServiceWorker() {
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return null;

  if (!isServiceWorkerEnabledByEnv()) {
    await disableNymoServiceWorker();
    setPendingPwaUpdateRegistration(null);
    return null;
  }

  try {
    await pruneStaleServiceWorkerRegistrations();
    const registration = await navigator.serviceWorker.register(getServiceWorkerRegistrationUrl(), {
      scope: getAppBasePath()
    });
    watchPwaRegistrationForUpdates(registration);
    return registration;
  } catch (error) {
    console.warn('Nymo service worker registration failed.', error);
    return null;
  }
}
