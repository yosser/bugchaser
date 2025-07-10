import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
    handler: async (ctx) => {
        return await ctx.db.query("ticketType").collect();
    },
});

export const getById = query({
    args: { id: v.id("ticketType") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        value: v.number(),
        description: v.string(),
        colour: v.optional(v.string()),
        textColour: v.optional(v.string()),
        isDeleted: v.boolean(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("ticketType", {
            ...args,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("ticketType"),
        name: v.optional(v.string()),
        value: v.optional(v.number()),
        description: v.optional(v.string()),
        colour: v.optional(v.string()),
        textColour: v.optional(v.string()),
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
        id: v.id("ticketType"),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});