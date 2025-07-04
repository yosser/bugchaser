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
    epic: v.optional(v.id("epics")),
    dueDate: v.optional(v.number()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    isDeleted: v.optional(v.boolean()),
  }).index("by_project", ["project"]).index("by_epic", ["epic"]).index("by_project_epic", ["project", "epic"]),

  epics: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
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

  skills: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    isDeleted: v.optional(v.boolean()),
  }),

  skillsUsers: defineTable({
    skill: v.id("skills"),
    user: v.id("users"),
    level: v.optional(v.number()),
  }).index("by_skill", ["skill"]).index("by_user", ["user"]),

  qualifications: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    isDeleted: v.optional(v.boolean()),
  }),

  qualificationsUsers: defineTable({
    qualification: v.id("qualifications"),
    user: v.id("users"),
    expirationDate: v.optional(v.number()),
    addedDate: v.optional(v.number()),
  }).index("by_qualification", ["qualification"]).index("by_user", ["user"]),

  certifications: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    isDeleted: v.optional(v.boolean()),
  }),

  certificationsUsers: defineTable({
    certification: v.id("certifications"),
    user: v.id("users"),
    expirationDate: v.optional(v.number()),
    addedDate: v.optional(v.number()),
  }).index("by_certification", ["certification"]).index("by_user", ["user"]),

  locations: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    isDeleted: v.optional(v.boolean()),
  }),

  locationsUsers: defineTable({
    location: v.id("locations"),
    user: v.id("users"),

  }).index("by_location", ["location"]).index("by_user", ["user"]),

});
