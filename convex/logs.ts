import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
    handler: async (ctx) => {
        return await ctx.db.query("logs").collect();
    },
});

export const create = mutation({
    args: {
        action: v.string(),
        user: v.optional(v.id("users")),
        bug: v.optional(v.id("bugs")),
        comment: v.optional(v.id("comments")),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        return await ctx.db.insert("logs", {
            ...args,
            createdAt: now,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("logs"),
        action: v.string(),
        user: v.optional(v.id("users")),
        bug: v.optional(v.id("bugs")),
        comment: v.optional(v.id("comments")),
    },
    handler: async (ctx, args) => {
        const { id, ...data } = args;
        return await ctx.db.patch(id, {
            ...data,
        });
    },
});

export const remove = mutation({
    args: {
        id: v.id("logs"),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
