import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
    handler: async (ctx) => {
        return await ctx.db.query("tickets").collect();
    },
});

export const getById = query({
    args: { id: v.id("tickets") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const getByProject = query({
    args: { projectId: v.optional(v.id("projects")) },
    handler: async (ctx, args) => {
        if (!args.projectId) {
            return [];
        }
        return await ctx.db.query("tickets").filter(q => q.eq(q.field("project"), args.projectId)).collect();
    },
});

export const create = mutation({
    args: {
        title: v.string(),
        description: v.optional(v.string()),
        status: v.id("status"),
        priority: v.id("priority"),
        type: v.id("ticketType"),
        reporter: v.optional(v.id("users")),
        assignedTo: v.optional(v.id("users")),
        dueDate: v.optional(v.number()),
        project: v.id("projects"),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        return await ctx.db.insert("tickets", {
            ...args,
            createdAt: now,
            updatedAt: now,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("tickets"),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        status: v.optional(v.id("status")),
        priority: v.optional(v.id("priority")),
        type: v.optional(v.id("ticketType")),
        reporter: v.optional(v.id("users")),
        assignedTo: v.optional(v.id("users")),
        dueDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { id, ...data } = args;
        return await ctx.db.patch(id, {
            ...data,
            updatedAt: Date.now(),
        });
    },
});

export const remove = mutation({
    args: {
        id: v.id("tickets"),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
