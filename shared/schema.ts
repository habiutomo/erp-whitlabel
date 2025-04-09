import { pgTable, text, serial, integer, boolean, timestamp, varchar, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("staff"),
  active: boolean("active").notNull().default(true),
  created: timestamp("created").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  role: true,
  active: true,
});

// Company Settings
export const companySettings = pgTable("company_settings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logo: text("logo"),
  primaryColor: text("primary_color").notNull().default("#0078D4"),
  secondaryColor: text("secondary_color").notNull().default("#106EBE"),
  modules: jsonb("modules").notNull().default([
    "dashboard",
    "inventory",
    "sales",
    "reports",
    "users",
    "settings"
  ]),
});

export const insertCompanySettingsSchema = createInsertSchema(companySettings).pick({
  name: true,
  logo: true,
  primaryColor: true,
  secondaryColor: true,
  modules: true,
});

// Products
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  sku: varchar("sku", { length: 50 }).notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  price: numeric("price").notNull(),
  cost: numeric("cost").notNull(),
  quantity: integer("quantity").notNull().default(0),
  reorderLevel: integer("reorder_level").notNull().default(10),
  expiryDate: timestamp("expiry_date"),
  created: timestamp("created").notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).pick({
  sku: true,
  name: true,
  description: true,
  category: true,
  price: true,
  cost: true,
  quantity: true,
  reorderLevel: true,
  expiryDate: true,
});

// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  customerId: integer("customer_id"),
  customerName: text("customer_name").notNull(),
  status: text("status").notNull().default("pending"),
  total: numeric("total").notNull(),
  notes: text("notes"),
  created: timestamp("created").notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  orderNumber: true,
  customerId: true,
  customerName: true,
  status: true,
  total: true,
  notes: true,
});

// Order Items
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: numeric("price").notNull(),
  subtotal: numeric("subtotal").notNull(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).pick({
  orderId: true,
  productId: true,
  quantity: true,
  price: true,
  subtotal: true,
});

// Metrics & Reports
export const metrics = pgTable("metrics", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull().defaultNow(),
  totalSales: numeric("total_sales").notNull().default("0"),
  totalOrders: integer("total_orders").notNull().default(0),
  inventoryItems: integer("inventory_items").notNull().default(0),
  activeUsers: integer("active_users").notNull().default(0),
});

export const insertMetricsSchema = createInsertSchema(metrics).pick({
  date: true,
  totalSales: true,
  totalOrders: true,
  inventoryItems: true,
  activeUsers: true,
});

// Type Exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type CompanySettings = typeof companySettings.$inferSelect;
export type InsertCompanySettings = z.infer<typeof insertCompanySettingsSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type Metric = typeof metrics.$inferSelect;
export type InsertMetric = z.infer<typeof insertMetricsSchema>;
