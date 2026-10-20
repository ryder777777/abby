import { inject, ref, readonly, onUnmounted, type App, type InjectionKey, type Ref } from "vue";
import { createAbby as createCoreAbby, type AbbyConfig, type DefineAbby } from "@tryabby/core";

export const ABBY_INJECTION_KEY: InjectionKey<ReturnType<typeof createAbby>> = Symbol("abby");

export function createAbby<T extends DefineAbby>(config: AbbyConfig<T>) {
  const core = createCoreAbby(config);

  const useAbby = () => core;

  const useFeatureFlag = <Flag extends keyof T["flags"] & string>(flagKey: Flag): Readonly<Ref<boolean>> => {
    const value = ref<boolean>(Boolean(core.getFeatureFlag(flagKey)));
    const unsubscribe = core.__internal.subscribe(() => {
      value.value = Boolean(core.getFeatureFlag(flagKey));
    });
    onUnmounted(() => {
      if (typeof unsubscribe === "function") unsubscribe();
    });
    return readonly(value);
  };

  const useRemoteConfig = <Key extends keyof T["remoteConfig"] & string>(
    configKey: Key
  ): Readonly<Ref<T["remoteConfig"][Key]>> => {
    const value = ref(core.getRemoteConfig(configKey)) as Ref<T["remoteConfig"][Key]>;
    const unsubscribe = core.__internal.subscribe(() => {
      value.value = core.getRemoteConfig(configKey);
    });
    onUnmounted(() => {
      if (typeof unsubscribe === "function") unsubscribe();
    });
    return readonly(value);
  };

  const useAbTest = <TestName extends keyof T["tests"] & string>(testName: TestName) => {
    const variant = ref<T["tests"][TestName]["variants"][number]>(core.getVariant(testName));
    const unsubscribe = core.__internal.subscribe(() => {
      variant.value = core.getVariant(testName);
    });
    onUnmounted(() => {
      if (typeof unsubscribe === "function") unsubscribe();
    });
    return {
      variant: readonly(variant),
      onAct: () => core.onAct(testName),
    };
  };

  const plugin = {
    install(app: App) {
      app.provide(ABBY_INJECTION_KEY, api);
      app.config.globalProperties.$abby = core;
    },
  };

  const api = {
    abby: core,
    plugin,
    useAbby,
    useFeatureFlag,
    useRemoteConfig,
    useAbTest,
  };

  return api;
}

export function useInjectedAbby() {
  const instance = inject(ABBY_INJECTION_KEY);
  if (!instance) {
    throw new Error("Abby plugin is not installed. Call app.use(abby.plugin) first.");
  }
  return instance;
}
