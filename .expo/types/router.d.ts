/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/` | `/(tabs)/ai-lab` | `/(tabs)/flashcards` | `/(tabs)/folders` | `/(tabs)/profile` | `/(tabs)/search` | `/(tabs)/wordlists` | `/_sitemap` | `/ai-lab` | `/flashcards` | `/folders` | `/profile` | `/search` | `/wordlists` | `/wordlists/learn` | `/wordlists/test`;
      DynamicRoutes: `/wordlists/${Router.SingleRoutePart<T>}`;
      DynamicRouteTemplate: `/wordlists/[id]`;
    }
  }
}
