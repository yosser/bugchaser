import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
    args: {},
    handler: async (ctx) => {
        const statuses = await ctx.db.query("status").collect();
        return statuses.sort((a, b) => a.value - b.value);
    },
});



export const create = mutation({
    args: {
        name: v.string(),
        value: v.number(),
        description: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("status", {
            ...args,
        });
    },
});