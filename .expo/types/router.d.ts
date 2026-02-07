/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/` | `/(tabs)/ai-lab` | `/(tabs)/folders` | `/(tabs)/profile` | `/(tabs)/wordlists` | `/_sitemap` | `/ai-lab` | `/folders` | `/profile` | `/wordlists` | `/wordlists/learn` | `/wordlists/test`;
      DynamicRoutes: `/wordlists/${Router.SingleRoutePart<T>}`;
      DynamicRouteTemplate: `/wordlists/[id]`;
    }
  }
}
