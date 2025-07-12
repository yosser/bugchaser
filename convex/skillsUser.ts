import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
    args: {
        user: v.optional(v.id("users")),
        skill: v.optional(v.id("skills")),
    },
    handler: async (ctx, args) => {
        if (args?.user) {
            return await ctx.db.query("skillsUsers").withIndex("by_user", (q) => q.eq("user", args?.user as Id<"users">)).collect();
        } else if (args?.skill) {
            return await ctx.db.query("skillsUsers").withIndex("by_skill", (q) => q.eq("skill", args?.skill as Id<"skills">)).collect();
        } else {
            return await ctx.db.query("skillsUsers").collect();
        }
    },
});

export const create = mutation({
    args: {
        skill: v.id("skills"),
        user: v.id("users"),
        level: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("skillsUsers", {
            ...args,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("skillsUsers"),
        skill: v.optional(v.id("skills")),
        user: v.optional(v.id("users")),
        level: v.optional(v.number()),
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
        id: v.id("skillsUsers"),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});