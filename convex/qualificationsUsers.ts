import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

export const get = query({
    args: {
        user: v.optional(v.id("users")),
        qualification: v.optional(v.id("qualifications")),
    },
    handler: async (ctx, args) => {
        if (args?.user) {
            return await ctx.db.query("qualificationsUsers").withIndex("by_user", (q) => q.eq("user", args?.user as Id<"users">)).collect();
        } else if (args?.qualification) {
            return await ctx.db.query("qualificationsUsers").withIndex("by_qualification", (q) => q.eq("qualification", args?.qualification as Id<"qualifications">)).collect();
        } else {
            return await ctx.db.query("qualificationsUsers").collect();
        }
    },
});

export const create = mutation({
    args: {
        qualification: v.id("qualifications"),
        user: v.id("users"),
        expirationDate: v.optional(v.number()),
        addedDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("qualificationsUsers", {
            ...args,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("qualificationsUsers"),
        qualification: v.optional(v.id("qualifications")),
        user: v.optional(v.id("users")),
        expirationDate: v.optional(v.number()),
        addedDate: v.optional(v.number()),
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
        id: v.id("qualificationsUsers"),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});