import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
    handler: async (ctx) => {
        return await ctx.db
            .query("projects")
            .filter((q) => q.eq(q.field("isDeleted"), false))
            .collect();
    },
});

export const getById = query({
    args: { id: v.id("projects") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const projectId = await ctx.db.insert("projects", {
            name: args.name,
            description: args.description,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isDeleted: false,
        });
        return projectId;
    },
});

export const update = mutation({
    args: {
        id: v.id("projects"),
        name: v.string(),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, {
            ...updates,
            updatedAt: Date.now(),
        });
    },
});

export const removeProject = mutation({
    args: { id: v.id("projects") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            isDeleted: true,
            updatedAt: Date.now(),
        });
    },
}); 