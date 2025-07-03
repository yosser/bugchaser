
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
    handler: async (ctx) => {
        return await ctx.db.query("ticketsTags").collect();
    },
});

export const getByTicket = query({
    args: { ticketId: v.id("tickets") },
    handler: async (ctx, args) => {
        return await ctx.db.query("ticketsTags").filter((q) => q.eq(q.field("ticket"), args.ticketId)).collect();
    },
});

export const getByTag = query({
    args: { tagId: v.id("tags") },
    handler: async (ctx, args) => {
        return await ctx.db.query("ticketsTags").filter((q) => q.eq(q.field("tag"), args.tagId)).collect();
    },
});

export const create = mutation({
    args: {
        ticketId: v.id("tickets"),
        tagId: v.id("tags"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("ticketsTags", {
            ticket: args.ticketId,
            tag: args.tagId,
        });
    },
});

export const remove = mutation({
    args: {
        id: v.id("ticketsTags"),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});