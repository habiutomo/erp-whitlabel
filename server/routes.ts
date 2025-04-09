import { Router } from "express";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertCompanySettingsSchema, 
  insertProductSchema, 
  insertOrderSchema,
  insertOrderItemSchema,
  insertMetricsSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const router = Router();

  // Company Settings Routes
  router.get("/api/company", async (req, res) => {
    try {
      const settings = await storage.getCompanySettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch company settings" });
    }
  });

  router.post("/api/company", async (req, res) => {
    try {
      const data = insertCompanySettingsSchema.parse(req.body);
      const settings = await storage.updateCompanySettings(data);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid company settings data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update company settings" });
      }
    }
  });

  // User Management Routes
  router.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  router.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  router.post("/api/users", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const user = await storage.createUser(data);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid user data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create user" });
      }
    }
  });

  router.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertUserSchema.parse(req.body);
      const user = await storage.updateUser(id, data);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid user data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update user" });
      }
    }
  });

  // Products/Inventory Routes
  router.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  router.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  router.post("/api/products", async (req, res) => {
    try {
      const data = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(data);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid product data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create product" });
      }
    }
  });

  router.put("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertProductSchema.parse(req.body);
      const product = await storage.updateProduct(id, data);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid product data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update product" });
      }
    }
  });

  // Inventory Alerts
  router.get("/api/inventory/alerts", async (req, res) => {
    try {
      const alerts = await storage.getInventoryAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory alerts" });
    }
  });

  // Orders Routes
  router.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  router.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  router.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body.order);
      const itemsData = z.array(insertOrderItemSchema).parse(req.body.items);
      
      const result = await storage.createOrder(orderData, itemsData);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid order data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create order" });
      }
    }
  });

  router.put("/api/orders/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = z.object({ status: z.string() }).parse(req.body);
      const order = await storage.updateOrderStatus(id, status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid status data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update order status" });
      }
    }
  });

  // Dashboard Metrics
  router.get("/api/metrics/dashboard", async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  router.get("/api/metrics/sales", async (req, res) => {
    try {
      const { period } = req.query;
      const validPeriods = ["7days", "30days", "90days", "12months"];
      
      if (period && !validPeriods.includes(period as string)) {
        return res.status(400).json({ message: "Invalid period parameter" });
      }
      
      const salesData = await storage.getSalesMetrics(period as string || "30days");
      res.json(salesData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales metrics" });
    }
  });

  // Import/Export Routes
  router.post("/api/import/products", async (req, res) => {
    try {
      const products = z.array(insertProductSchema).parse(req.body);
      const result = await storage.importProducts(products);
      res.json({ message: "Products imported successfully", count: result.length });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid import data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to import products" });
      }
    }
  });

  router.get("/api/export/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to export products" });
    }
  });

  router.get("/api/export/orders", async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to export orders" });
    }
  });

  // Register routes
  app.use(router);

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
