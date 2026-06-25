(function (root) {
  'use strict';

  const DEFAULT_CLOUD_URL = 'https://app.lensapp.eu';
  const CONFIG = { host: '127.0.0.1', port: 23600, cloudUrl: null, key: null, local: null, cloud: null };

  function envVar(name) {
    return typeof process !== 'undefined' && process.env ? process.env[name] : undefined;
  }
  function envBool(name, def) {
    const v = envVar(name);
    if (v === undefined || v === null || v === '') return def;
    return !['false', '0', 'no', 'off'].includes(String(v).toLowerCase());
  }
  function resolveKey() {
    return CONFIG.key || envVar('LENS_PROJECT_KEY') || null;
  }
  function resolveCloudUrl() {
    const u = CONFIG.cloudUrl || envVar('LENS_CLOUD_URL') || DEFAULT_CLOUD_URL;
    return u.replace(/\/$/, '');
  }
  function localEnabled() {
    return CONFIG.local != null ? CONFIG.local : envBool('LENS_LOCAL', true);
  }
  function cloudEnabled() {
    return CONFIG.cloud != null ? CONFIG.cloud : envBool('LENS_CLOUD', true);
  }

  function post(url, headers, body) {
    try {
      if (typeof fetch === 'function') {
        fetch(url, {
          method: 'POST',
          headers,
          body,
          keepalive: typeof window !== 'undefined',
        }).catch(() => {});
      } else {
        const lib = url.indexOf('https:') === 0 ? require('https') : require('http');
        const req = lib.request(url, { method: 'POST', headers });
        req.on('error', () => {});
        req.end(body);
      }
    } catch (_) {
      // Debugging must never break the app.
    }
  }

  function uuid() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  function resolveOrigin() {
    const stack = (new Error().stack || '').split('\n');
    for (const line of stack.slice(2)) {
      if (line.includes('lens.js')) continue;
      const m = line.match(/\(?([^()]+):(\d+):(\d+)\)?\s*$/);
      if (m) return { file: m[1], line: Number(m[2]) };
    }
    return { file: null, line: null };
  }

  function pkgVersion(name) {
    try {
      return require(name + '/package.json').version || null;
    } catch (_) {
      return null;
    }
  }

  // Best-effort framework detection; falls back to "Plain Node" / "Browser".
  function detectFramework() {
    try {
      if (typeof window !== 'undefined') {
        if (window.__NEXT_DATA__) return 'Next.js';
        if (window.__NUXT__) return 'Nuxt';
        if (window.Vue || window.__VUE__) return 'Vue';
        if (window.ng || window.getAllAngularRootElements) return 'Angular';
        if (window.React || (typeof document !== 'undefined' && document.querySelector('#__next, [data-reactroot]'))) {
          return 'React';
        }
        return 'Browser';
      }
      if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        if (envVar('NEXT_RUNTIME')) {
          const v = pkgVersion('next');
          return v ? 'Next.js ' + v : 'Next.js';
        }
        const checks = [
          ['next', 'Next.js'],
          ['@nestjs/core', 'NestJS'],
          ['@sveltejs/kit', 'SvelteKit'],
          ['express', 'Express'],
          ['koa', 'Koa'],
          ['fastify', 'Fastify'],
          ['@hapi/hapi', 'hapi'],
        ];
        for (const pair of checks) {
          const v = pkgVersion(pair[0]);
          if (v) return pair[1] + ' ' + v;
        }
        return 'Plain Node';
      }
    } catch (_) {
      // best-effort
    }
    return null;
  }

  function systemContext() {
    try {
      if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        const os = require('os');
        const ctx = {
          runtime: 'Node ' + process.version.replace(/^v/, ''),
          os: os.type() + ' ' + os.release(),
          hostname: os.hostname(),
        };
        const fw = detectFramework();
        if (fw) ctx.framework = fw;
        return ctx;
      }
      if (typeof navigator !== 'undefined') {
        const ctx = { runtime: 'Browser', userAgent: navigator.userAgent };
        if (navigator.platform) ctx.os = navigator.platform;
        const fw = detectFramework();
        if (fw) ctx.framework = fw;
        return ctx;
      }
    } catch (_) {
      // Context is best-effort; never break the app.
    }
    return {};
  }

  function transmit(payload) {
    payload.time = payload.time || Date.now();
    payload.meta = { client: 'js', version: '1.2.0' };

    // Cloud ingest key (env LENS_PROJECT_KEY or lens.setKey); links events to a project.
    const key = resolveKey();
    if (key) payload.key = key;

    const t = payload.type || 'log';
    if (t !== 'clear' && t !== 'pause') {
      const ctx = systemContext();
      if (ctx && Object.keys(ctx).length) payload.context = ctx;
    }

    const body = JSON.stringify(payload);

    // Channel 1: local Lens desktop app (env LENS_LOCAL, default on).
    if (localEnabled()) {
      post(`http://${CONFIG.host}:${CONFIG.port}`, { 'Content-Type': 'application/json' }, body);
    }

    // Channel 2: Lens Cloud (env LENS_CLOUD, default on; needs a project key).
    if (cloudEnabled() && key && t !== 'clear' && t !== 'pause') {
      post(resolveCloudUrl() + '/api/ingest', { 'Content-Type': 'application/json', 'x-lens-key': key }, body);
    }
  }

  class Lens {
    constructor(values) {
      this.id = uuid();
      this.values = values;
      this._label = null;
      this._color = null;
      this.origin = resolveOrigin();
      this._send();
    }

    label(label) {
      this._label = label;
      return this._send();
    }

    color(color) {
      this._color = color;
      return this._send();
    }

    red() { return this.color('red'); }
    green() { return this.color('green'); }
    blue() { return this.color('blue'); }
    orange() { return this.color('orange'); }
    purple() { return this.color('purple'); }
    gray() { return this.color('gray'); }

    values(...values) {
      this.values = values;
      return this._send();
    }

    _send() {
      transmit({
        id: this.id,
        type: 'log',
        label: this._label,
        color: this._color,
        origin: this.origin,
        values: this.values,
      });
      return this;
    }
  }

  function lens(...args) {
    return new Lens(args);
  }

  lens.clear = () => transmit({ id: uuid(), type: 'clear' });
  lens.configure = (host, port) => {
    CONFIG.host = host;
    CONFIG.port = port;
  };
  // Send straight to Lens Cloud (e.g. in the browser where env vars are absent).
  lens.setCloudUrl = (url) => {
    CONFIG.cloudUrl = url ? String(url).replace(/\/$/, '') : null;
  };
  lens.setKey = (key) => {
    CONFIG.key = key || null;
  };
  // Toggle the two channels independently (null = fall back to env / default on).
  lens.setLocal = (on) => {
    CONFIG.local = on == null ? null : !!on;
  };
  lens.setCloud = (on) => {
    CONFIG.cloud = on == null ? null : !!on;
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = lens;
    module.exports.lens = lens;
  }
  if (typeof root !== 'undefined') {
    root.lens = lens;
  }
})(typeof window !== 'undefined' ? window : globalThis);
