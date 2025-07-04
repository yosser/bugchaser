import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
    handler: async (ctx) => {
        return await ctx.db.query("skills").collect();
    },
});

export const getById = query({
    args: { id: v.id("skills") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id)
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
        createdAt: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        return await ctx.db.insert("skills", {
            ...args,
            createdAt: now,
            updatedAt: now,
            isDeleted: false,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("skills"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        isDeleted: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const { id, ...data } = args;
        return await ctx.db.patch(id, {
            ...data,
            updatedAt: now,
        });
    },
});

export const remove = mutation({
    args: {
        id: v.id("skills"),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
