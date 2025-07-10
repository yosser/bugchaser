import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
    handler: async (ctx) => {
        return await ctx.db.query("tickets").collect();
    },
});

export const getById = query({
    args: { id: v.id("tickets") },
    handler: async (ctx, args) => {
        const ticket = await ctx.db.get(args.id);
        return ticket;
    },
});

export const getByProjectEpic = query({
    args: { projectId: v.optional(v.id("projects")), epicId: v.optional(v.id("epics")) },
    handler: async (ctx, args) => {
        if (!args.projectId) {
            return await ctx.db.query("tickets")
                .withIndex("by_epic", q => q.eq("epic", args.epicId))
                .collect();
        } else if (!args.epicId) {
            return await ctx.db.query("tickets")
                .withIndex("by_project", q => q.eq("project", args.projectId))
                .collect();
        } else {
            return await ctx.db.query("tickets")
                .withIndex("by_project_epic", q => q.eq("project", args.projectId).eq("epic", args.epicId))
                .collect();
        }
    },
});

export const create = mutation({
    args: {
        title: v.string(),
        description: v.optional(v.string()),
        status: v.id("status"),
        priority: v.id("priority"),
        type: v.id("ticketType"),
        reporter: v.optional(v.id("users")),
        assignedTo: v.optional(v.id("users")),
        dueDate: v.optional(v.number()),
        epic: v.optional(v.id("epics")),
        project: v.id("projects"),
        estimatedTimeHours: v.optional(v.int64()),
        actualTimeHours: v.optional(v.int64()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        return await ctx.db.insert("tickets", {
            ...args,
            estimatedTimeHours: args?.estimatedTimeHours ? BigInt(args.estimatedTimeHours) : undefined,
            actualTimeHours: args?.actualTimeHours ? BigInt(args.actualTimeHours) : undefined,
            createdAt: now,
            updatedAt: now,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("tickets"),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        status: v.optional(v.id("status")),
        priority: v.optional(v.id("priority")),
        type: v.optional(v.id("ticketType")),
        reporter: v.optional(v.id("users")),
        epic: v.optional(v.id("epics")),
        assignedTo: v.optional(v.id("users")),
        dueDate: v.optional(v.number()),
        estimatedTimeHours: v.optional(v.int64()),
        actualTimeHours: v.optional(v.int64()),
    },
    handler: async (ctx, args) => {
        const { id, ...data } = args;
        return await ctx.db.patch(id, {
            ...data,
            estimatedTimeHours: args?.estimatedTimeHours ? BigInt(args.estimatedTimeHours) : undefined,
            actualTimeHours: args?.actualTimeHours ? BigInt(args.actualTimeHours) : undefined,

            updatedAt: Date.now(),
        });
    },
});

export const remove = mutation({
    args: {
        id: v.id("tickets"),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
