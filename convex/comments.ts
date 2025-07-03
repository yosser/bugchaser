import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
    handler: async (ctx) => {
        return await ctx.db.query("comments").collect();
    },
});

export const getByTicket = query({
    args: { ticketId: v.optional(v.id("tickets")) },
    handler: async (ctx, args) => {
        return await ctx.db.query("comments").filter((q) => q.eq(q.field("ticket"), args.ticketId)).collect();
    },
});
export const getByUser = query({
    args: { userId: v.optional(v.id("users")) },
    handler: async (ctx, args) => {
        return await ctx.db.query("comments").filter((q) => q.eq(q.field("user"), args.userId)).collect();
    },
});
export const getByParentComment = query({
    args: { parentCommentId: v.optional(v.id("comments")) },
    handler: async (ctx, args) => {
        return await ctx.db.query("comments").filter((q) => q.eq(q.field("parentComment"), args.parentCommentId)).collect();
    },
});


export const create = mutation({
    args: {
        text: v.string(),
        ticket: v.optional(v.id("tickets")),
        user: v.optional(v.id("users")),
        parentComment: v.optional(v.id("comments")),
        isDeleted: v.optional(v.boolean()),
        isEdited: v.optional(v.boolean()),
        isReply: v.optional(v.boolean()),
        isResolved: v.optional(v.boolean()),
        isResolvedBy: v.optional(v.id("users")),
        isResolvedAt: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        return await ctx.db.insert("comments", {
            ...args,
            createdAt: now,
            updatedAt: now,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("comments"),
        text: v.string(),
        ticket: v.optional(v.id("tickets")),
        user: v.optional(v.id("users")),
        parentComment: v.optional(v.id("comments")),
        isDeleted: v.optional(v.boolean()),
        isEdited: v.optional(v.boolean()),
        isReply: v.optional(v.boolean()),
        isResolved: v.optional(v.boolean()),
        isResolvedBy: v.optional(v.id("users")),
        isResolvedAt: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { id, ...data } = args;
        return await ctx.db.patch(id, {
            ...data,
            updatedAt: Date.now(),
        });
    },
});

export const remove = mutation({
    args: {
        id: v.id("comments"),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
