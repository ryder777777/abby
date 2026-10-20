# `@tryabby/vue`

Typed Vue 3 integration for [Abby](https://tryabby.dev) A/B testing, feature flags, and remote configuration.

## Usage

```ts
import { createAbby } from "@tryabby/vue";

export const { plugin, useAbTest, useFeatureFlag, useRemoteConfig } = createAbby({
  projectId: "YOUR_PROJECT_ID",
  currentEnvironment: "production",
  tests: {
    headerTest: { variants: ["A", "B"] },
  },
  flags: ["darkMode"],
  remoteConfig: {
    maxItems: "number",
  },
});
```
