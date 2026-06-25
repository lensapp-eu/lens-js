# Lens (JS client)

Send debug payloads from your JavaScript or Node.js app to the **Lens desktop app** and
**Lens Cloud**. Instead of littering your code with `console.log`, use `lens(...)` to send neatly
rendered data to a separate window, with labels, colors and the line it came from.

```js
const lens = require('@lensapp-eu/lens');

lens('hello');
lens(user).green().label('Signed-in user');
lens({ order, total });
```

## Install

```bash
npm install @lensapp-eu/lens
# or
yarn add @lensapp-eu/lens
# or
pnpm add @lensapp-eu/lens
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

To send events straight to [Lens Cloud](https://app.lensapp.eu), no desktop app required, set
both in your environment:

```bash
LENS_PROJECT_KEY=your-project-key-from-lens-cloud
LENS_CLOUD_URL=https://app.lensapp.eu
```

The project key links events to the right project; the cloud URL is where they are sent. With both
set, every event goes to Lens Cloud (and to the desktop app too, if it is running).

In the browser, where environment variables are not available, configure it in code:

```js
lens.setKey('your-project-key');
lens.setCloudUrl('https://app.lensapp.eu');
```

## Configuration

```js
// Point at a different desktop app host/port (defaults to 127.0.0.1:23600)
lens.configure('127.0.0.1', 23600);
```

Each event also carries context (runtime, OS, hostname and detected framework) which shows up as
tags in Lens Cloud.

## License

MIT
