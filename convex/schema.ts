import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
  }),
  users: defineTable({
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.id("role"),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }),
  status: defineTable({
    name: v.string(),
    value: v.number(),
  }),
  priority: defineTable({
    name: v.string(),
    value: v.number(),
  }),
  role: defineTable({
    name: v.string(),
    value: v.number(),
  }),
  priorityDescription: defineTable({
    name: v.string(),
    description: v.string(),
  }),
  bugs: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.id("status"),
    priority: v.id("priority"),
    reporter: v.optional(v.id("users")),
    assignedTo: v.optional(v.id("users")),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }),
  comments: defineTable({
    text: v.string(),
    bug: v.optional(v.id("bugs")),
    user: v.optional(v.id("users")),
    parentComment: v.optional(v.id("comments")),
    isDeleted: v.optional(v.boolean()),
    isEdited: v.optional(v.boolean()),
    isReply: v.optional(v.boolean()),
    isResolved: v.optional(v.boolean()),
    isResolvedBy: v.optional(v.id("users")),
    isResolvedAt: v.optional(v.number()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }),
});

