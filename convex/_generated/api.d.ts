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
import type * as comments from "../comments.js";
import type * as logs from "../logs.js";
import type * as priority from "../priority.js";
import type * as projects from "../projects.js";
import type * as projectsUsers from "../projectsUsers.js";
import type * as roles from "../roles.js";
import type * as status from "../status.js";
import type * as tags from "../tags.js";
import type * as ticketType from "../ticketType.js";
import type * as tickets from "../tickets.js";
import type * as ticketsTags from "../ticketsTags.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  comments: typeof comments;
  logs: typeof logs;
  priority: typeof priority;
  projects: typeof projects;
  projectsUsers: typeof projectsUsers;
  roles: typeof roles;
  status: typeof status;
  tags: typeof tags;
  ticketType: typeof ticketType;
  tickets: typeof tickets;
  ticketsTags: typeof ticketsTags;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
