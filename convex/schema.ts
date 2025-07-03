import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.id("role"),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    dueDate: v.optional(v.number()),
    isDeleted: v.optional(v.boolean()),
  }),

  tags: defineTable({
    name: v.string(),
    isDeleted: v.optional(v.boolean()),
    color: v.optional(v.string()),
  }),

  ticketsTags: defineTable({
    ticket: v.id("tickets"),
    tag: v.id("tags"),
  }).index("by_ticket", ["ticket"]).index("by_tag", ["tag"]),

  ticketType: defineTable({
    name: v.string(),
    value: v.number(),
    description: v.optional(v.string()),
    isDeleted: v.optional(v.boolean()),
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

  logs: defineTable({
    action: v.string(),
    user: v.optional(v.id("users")),
    ticket: v.optional(v.id("tickets")),
    comment: v.optional(v.id("comments")),
    createdAt: v.optional(v.number()),
  }).index("by_ticket", ["ticket"]).index("by_comment", ["comment"]).index("by_user", ["user"]),

  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    isDeleted: v.optional(v.boolean()),
  }),

  projectsUsers: defineTable({
    project: v.id("projects"),
    user: v.id("users"),
  }).index("by_project", ["project"]).index("by_user", ["user"]),

  tickets: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    project: v.optional(v.id("projects")),
    status: v.id("status"),
    priority: v.id("priority"),
    reporter: v.optional(v.id("users")),
    type: v.id("ticketType"),
    assignedTo: v.optional(v.id("users")),
    dueDate: v.optional(v.number()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    isDeleted: v.optional(v.boolean()),
  }),

  comments: defineTable({
    text: v.string(),
    ticket: v.optional(v.id("tickets")),
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

