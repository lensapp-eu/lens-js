# Lens (JS client)

Send debug payloads from your JavaScript or Node.js app to the **Lens desktop app** and
**Lens Cloud**. Instead of littering your code with `console.log`, use `lens(...)` to send neatly
rendered data to a separate window, with labels, colors and the line it came from.

```js
const lens = require('@lensapp-eu/lens-js');

lens('hello');
lens(user).green().label('Signed-in user');
lens({ order, total });
```

## Install

```bash
npm install @lensapp-eu/lens-js
# or
yarn add @lensapp-eu/lens-js
# or
pnpm add @lensapp-eu/lens-js
```

## Usage

```js
// A single value
lens('checkpoint reached');

// Multiple values at once
lens(req.body, user, total);

// Chaining: label and color
lens(order).label('New order').green();

// Clear the screen
lens.clear();
```

Available color shortcuts: `.red()`, `.green()`, `.blue()`, `.orange()`, `.purple()`, `.gray()`.

## Lens Cloud (optional)

To send events straight to [Lens Cloud](https://app.lensapp.eu), no desktop app required, set one
environment variable:

```bash
LENS_PROJECT_KEY=your-project-key-from-lens-cloud
```

With a key set, events go to Lens Cloud at `https://app.lensapp.eu` by default. Set `LENS_CLOUD_URL`
only to point at a self-hosted or local cloud (e.g. `http://localhost:3000`).

In the browser, where environment variables are not available, configure it in code:

```js
lens.setKey('your-project-key');
lens.setCloudUrl('https://app.lensapp.eu'); // optional override
```

## Channels

Lens sends to two channels, independently toggleable (default on):

```bash
LENS_LOCAL=false   # disable the desktop app -> cloud only
LENS_CLOUD=false   # disable the cloud -> desktop app only
```

Or in code: `lens.setLocal(false)` / `lens.setCloud(false)`.

## Configuration

```js
// Point at a different desktop app host/port (defaults to 127.0.0.1:23600)
lens.configure('127.0.0.1', 23600);
```

Each event also carries context (runtime, OS, hostname and detected framework) which shows up as
tags in Lens Cloud.

## License

MIT
