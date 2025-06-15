import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
    handler: async (ctx) => {
        return await ctx.db.query("bugs").collect();
    },
});

export const getById = query({
    args: { id: v.id("bugs") },
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
        return await ctx.db.query("bugs").filter(q => q.eq(q.field("project"), args.projectId)).collect();
    },
});

export const create = mutation({
    args: {
        title: v.string(),
        description: v.optional(v.string()),
        status: v.id("status"),
        priority: v.id("priority"),
        reporter: v.optional(v.id("users")),
        assignedTo: v.optional(v.id("users")),
        project: v.id("projects"),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        return await ctx.db.insert("bugs", {
            ...args,
            createdAt: now,
            updatedAt: now,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("bugs"),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        status: v.optional(v.id("status")),
        priority: v.optional(v.id("priority")),
        reporter: v.optional(v.id("users")),
        assignedTo: v.optional(v.id("users")),
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
        id: v.id("bugs"),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
