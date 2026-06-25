export interface LensInstance {
  /** Add a label shown next to the entry. */
  label(label: string): LensInstance;
  /** Set a color by name (red, green, blue, orange, purple, gray). */
  color(color: string): LensInstance;
  red(): LensInstance;
  green(): LensInstance;
  blue(): LensInstance;
  orange(): LensInstance;
  purple(): LensInstance;
  gray(): LensInstance;
  /** Replace the entry's values. */
  values(...values: unknown[]): LensInstance;
}

declare function lens(...args: unknown[]): LensInstance;

declare namespace lens {
  /** Clear the Lens screen. */
  function clear(): void;
  /** Point the client at a different desktop app host/port. */
  function configure(host: string, port: number): void;
  /** Send straight to Lens Cloud (useful in the browser where env vars are absent). */
  function setCloudUrl(url: string | null): void;
  /** Set the Lens Cloud project key. */
  function setKey(key: string | null): void;
  /** Toggle sending to the local desktop app (null = env/default on). */
  function setLocal(on: boolean | null): void;
  /** Toggle sending to Lens Cloud (null = env/default on). */
  function setCloud(on: boolean | null): void;
}

export = lens;
