import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByUser = query({
    args: { userId: v.optional(v.id("users")) },
    handler: async (ctx, args) => {
        if (!args.userId) {
            return [];
        }
        return await ctx.db
            .query("projectsUsers")
            .filter((q) => q.eq(q.field("user"), args.userId))
            .collect();
    },
});

export const getByProject = query({
    args: { projectId: v.optional(v.id("projects")) },
    handler: async (ctx, args) => {
        if (!args.projectId) {
            return [];
        }
        return await ctx.db
            .query("projectsUsers")
            .filter((q) => q.eq(q.field("project"), args.projectId))
            .collect();
    },
});

export const addUserToProject = mutation({
    args: {
        userId: v.id("users"),
        projectId: v.id("projects"),
    },
    handler: async (ctx, args) => {
        // Check if the user is already in the project
        const existing = await ctx.db
            .query("projectsUsers")
            .filter((q) =>
                q.and(
                    q.eq(q.field("user"), args.userId),
                    q.eq(q.field("project"), args.projectId)
                )
            )
            .first();

        if (!existing) {
            await ctx.db.insert("projectsUsers", {
                user: args.userId,
                project: args.projectId,
            });
        }
    },
});

export const removeUserFromProject = mutation({
    args: {
        userId: v.id("users"),
        projectId: v.id("projects"),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("projectsUsers")
            .filter((q) =>
                q.and(
                    q.eq(q.field("user"), args.userId),
                    q.eq(q.field("project"), args.projectId)
                )
            )
            .first();

        if (existing) {
            await ctx.db.delete(existing._id);
        }
    },
}); 