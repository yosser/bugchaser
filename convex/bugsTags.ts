
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
    handler: async (ctx) => {
        return await ctx.db.query("bugsTags").collect();
    },
});

export const getByBug = query({
    args: { bugId: v.id("bugs") },
    handler: async (ctx, args) => {
        return await ctx.db.query("bugsTags").filter((q) => q.eq(q.field("bug"), args.bugId)).collect();
    },
});

export const getByTag = query({
    args: { tagId: v.id("tags") },
    handler: async (ctx, args) => {
        return await ctx.db.query("bugsTags").filter((q) => q.eq(q.field("tag"), args.tagId)).collect();
    },
});

export const create = mutation({
    args: {
        bugId: v.id("bugs"),
        tagId: v.id("tags"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("bugsTags", {
            bug: args.bugId,
            tag: args.tagId,
        });
    },
});

export const remove = mutation({
    args: {
        id: v.id("bugsTags"),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});