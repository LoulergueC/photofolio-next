import { text, blob, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),

  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

export const usersRelations = relations(users, ({ many }) => ({
  credentials: many(credentials),
}));

export const credentials: any = sqliteTable("credentials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("userId").references(() => users.id),
  externalId: blob("externalId", { mode: "buffer" }).unique().notNull(),
  publicKey: blob("publicKey", { mode: "buffer" }).unique().notNull(),
  signCount: integer("signCount").notNull().default(0),

  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

export const credentialsRelations = relations(credentials, ({ one }) => ({
  user: one(users, {
    fields: [credentials.userId],
    references: [users.id],
  }),
}));
