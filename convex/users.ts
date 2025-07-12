import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("users").collect();
    },
});

export const getById = query({
    args: {
        id: v.id("users"),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.id);
        const qualifications = await ctx.db.query("qualificationsUsers").withIndex("by_user", (q) => q.eq("user", args.id)).collect();
        const skills = await ctx.db.query("skillsUsers").withIndex("by_user", (q) => q.eq("user", args.id)).collect();
        const locations = await ctx.db.query("locationsUsers").withIndex("by_user", (q) => q.eq("user", args.id)).collect();

        return {
            ...user,
            qualifications,
            skills,
            locations,
        };
    },
});

export const update = mutation({
    args: {
        id: v.id("users"),
        name: v.string(),
        email: v.string(),
        role: v.id("role"),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, {
            ...updates,
            updatedAt: Date.now(),
        });
        return await ctx.db.get(id);
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        password: v.string(),
        role: v.id("role"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("users", {
            ...args,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
    },
});

export const remove = mutation({
    args: {
        id: v.id("users"),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.id);
        if (!user) {
            throw new Error("User not found");
        }

        const role = await ctx.db.get(user.role);
        if (role?.name === "admin") {
            throw new Error("Cannot delete admin users");
        }

        await ctx.db.delete(args.id);
        return { success: true };
    },
});

