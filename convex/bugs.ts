import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
    handler: async (ctx) => {
        return await ctx.db.query("bugs").collect();
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
        title: v.string(),
        description: v.optional(v.string()),
        status: v.id("status"),
        priority: v.id("priority"),
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
