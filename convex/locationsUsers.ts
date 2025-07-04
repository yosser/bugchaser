import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
    args: {
        user: v.optional(v.id("users")),
        location: v.optional(v.id("locations")),
    },
    handler: async (ctx, args) => {
        if (args?.user) {
            return await ctx.db.query("locationsUsers").withIndex("by_user", (q) => q.eq("user", args?.user as Id<"users">)).collect();
        } else if (args?.location) {
            return await ctx.db.query("locationsUsers").withIndex("by_location", (q) => q.eq("location", args?.location as Id<"locations">)).collect();
        } else {
            return await ctx.db.query("locationsUsers").collect();
        }
    },
});

export const create = mutation({
    args: {
        location: v.id("locations"),
        user: v.id("users"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("locationsUsers", {
            ...args,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("locationsUsers"),
        location: v.optional(v.id("locations")),
        user: v.optional(v.id("users")),
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
        id: v.id("locationsUsers"),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});