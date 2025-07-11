import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
    handler: async (ctx) => {
        return await ctx.db.query("logs").collect();
    },
});

export const getFiltered = query({
    args: { ticketId: v.optional(v.id("tickets")), userId: v.optional(v.id("users")), commentId: v.optional(v.id("comments")) },
    handler: async (ctx, args) => {
        return await ctx.db.query("logs")
            .filter((q) => args.ticketId ? q.eq(q.field("ticket"), args.ticketId) : true)
            .filter((q) => args.userId ? q.eq(q.field("user"), args.userId) : true)
            .filter((q) => args.commentId ? q.eq(q.field("comment"), args.commentId) : true)
            .collect();
    },
});


export const getByTicket = query({
    args: { ticketId: v.optional(v.id("tickets")) },
    handler: async (ctx, args) => {
        return await ctx.db.query("logs").filter((q) => q.eq(q.field("ticket"), args.ticketId)).collect();
    },
});

export const getByUser = query({
    args: { userId: v.optional(v.id("users")) },
    handler: async (ctx, args) => {
        return await ctx.db.query("logs").filter((q) => q.eq(q.field("user"), args.userId)).collect();
    },
});

export const getByComment = query({
    args: { commentId: v.optional(v.id("comments")) },
    handler: async (ctx, args) => {
        return await ctx.db.query("logs").filter((q) => q.eq(q.field("comment"), args.commentId)).collect();
    },
});


export const create = mutation({
    args: {
        action: v.string(),
        user: v.optional(v.id("users")),
        ticket: v.optional(v.id("tickets")),
        comment: v.optional(v.id("comments")),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        return await ctx.db.insert("logs", {
            ...args,
            createdAt: now,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("logs"),
        action: v.string(),
        user: v.optional(v.id("users")),
        ticket: v.optional(v.id("tickets")),
        comment: v.optional(v.id("comments")),
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
        id: v.id("logs"),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
