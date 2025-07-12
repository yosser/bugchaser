import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
    args: {},
    handler: async (ctx) => {
        const priorities = await ctx.db.query("priority").collect();
        return priorities.sort((a, b) => a.value - b.value);
    },
});

export const getById = query({
    args: { id: v.id("priority") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        value: v.number(),
        colour: v.optional(v.string()),
        textColour: v.optional(v.string()),
        description: v.string(),
        isDeleted: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("priority", {
            ...args,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("priority"),
        name: v.optional(v.string()),
        value: v.optional(v.number()),
        colour: v.optional(v.string()),
        textColour: v.optional(v.string()),
        description: v.optional(v.string()),
        isDeleted: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { id, ...data } = args;
        return await ctx.db.patch(id, {
            ...data,
        });
    },
});

export const remove = mutation({
    args: { id: v.id("priority") },
    handler: async (ctx, args) => {
        return await ctx.db.delete(args.id);
    },
});