import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
    handler: async (ctx) => {
        return await ctx.db.query("tags").collect();
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        color: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("tags", {
            ...args,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("tags"),
        name: v.string(),
        color: v.optional(v.string()),
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
    args: {
        id: v.id("tags"),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
