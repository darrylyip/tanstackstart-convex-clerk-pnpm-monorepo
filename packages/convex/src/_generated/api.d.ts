/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as lib_index from "../lib/index.js";
import type * as mutations_organizations from "../mutations/organizations.js";
import type * as queries_organizations from "../queries/organizations.js";
import type * as queries_schedules from "../queries/schedules.js";
import type * as queries_users from "../queries/users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "lib/index": typeof lib_index;
  "mutations/organizations": typeof mutations_organizations;
  "queries/organizations": typeof queries_organizations;
  "queries/schedules": typeof queries_schedules;
  "queries/users": typeof queries_users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
