import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
    handler: async (ctx) => {
        return await ctx.db.query("comments").collect();
    },
});

export const create = mutation({
    args: {
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
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        return await ctx.db.insert("comments", {
            ...args,
            createdAt: now,
            updatedAt: now,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("comments"),
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
        id: v.id("comments"),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
