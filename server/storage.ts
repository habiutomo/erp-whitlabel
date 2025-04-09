import { 
  User, InsertUser, 
  CompanySettings, InsertCompanySettings, 
  Product, InsertProduct, 
  Order, InsertOrder, 
  OrderItem, InsertOrderItem,
  Metric, InsertMetric
} from "@shared/schema";
import { format, subDays, subMonths } from "date-fns";

// Custom types for inventory alerts
type InventoryAlert = {
  id: number;
  type: 'low_stock' | 'expiration' | 'reorder';
  productId: number;
  productName: string;
  message: string;
  quantity?: number;
  expiryDate?: Date;
};

// Dashboard metrics type
type DashboardMetrics = {
  totalSales: { value: string; change: string; trend: 'up' | 'down' };
  orders: { value: number; change: string; trend: 'up' | 'down' };
  inventory: { value: number; change: string; trend: 'up' | 'down' };
  users: { value: number; change: string; trend: 'up' | 'down' };
};

// Sales metrics data point
type SalesDataPoint = {
  date: string;
  value: number;
};

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: InsertUser): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Company settings
  getCompanySettings(): Promise<CompanySettings>;
  updateCompanySettings(settings: InsertCompanySettings): Promise<CompanySettings>;
  
  // Product/Inventory operations
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: InsertProduct): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  getInventoryAlerts(): Promise<InventoryAlert[]>;
  
  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  getOrderWithItems(id: number): Promise<{ order: Order; items: OrderItem[] } | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<{ order: Order; items: OrderItem[] }>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  
  // Metrics operations
  getDashboardMetrics(): Promise<DashboardMetrics>;
  getSalesMetrics(period: string): Promise<SalesDataPoint[]>;
  
  // Import/Export operations
  importProducts(products: InsertProduct[]): Promise<Product[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private companySettings: CompanySettings;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem[]>;
  private metrics: Map<string, Metric>;
  
  private userCurrentId: number;
  private productCurrentId: number;
  private orderCurrentId: number;
  private orderItemCurrentId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.metrics = new Map();
    
    this.userCurrentId = 1;
    this.productCurrentId = 1;
    this.orderCurrentId = 1;
    this.orderItemCurrentId = 1;
    
    // Initialize with default company settings
    this.companySettings = {
      id: 1,
      name: "Acme Corporation",
      logo: "",
      primaryColor: "#0078D4",
      secondaryColor: "#106EBE",
      modules: ["dashboard", "inventory", "sales", "reports", "users", "settings"]
    };
    
    // Add demo admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      fullName: "Administrator",
      email: "admin@example.com",
      role: "admin",
      active: true
    });
    
    // Add demo staff user
    this.createUser({
      username: "staff",
      password: "staff123",
      fullName: "Staff User",
      email: "staff@example.com",
      role: "staff",
      active: true
    });
    
    // Add some demo products
    this.initDemoProducts();
    
    // Add some demo orders
    this.initDemoOrders();
    
    // Initialize metrics
    this.initDemoMetrics();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const created = new Date();
    const user: User = { ...insertUser, id, created };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: InsertUser): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  // Company settings operations
  async getCompanySettings(): Promise<CompanySettings> {
    return this.companySettings;
  }
  
  async updateCompanySettings(settings: InsertCompanySettings): Promise<CompanySettings> {
    this.companySettings = { ...this.companySettings, ...settings };
    return this.companySettings;
  }
  
  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productCurrentId++;
    const created = new Date();
    const product: Product = { ...insertProduct, id, created };
    this.products.set(id, product);
    return product;
  }
  
  async updateProduct(id: number, productData: InsertProduct): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return undefined;
    
    const updatedProduct = { ...existingProduct, ...productData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getInventoryAlerts(): Promise<InventoryAlert[]> {
    const alerts: InventoryAlert[] = [];
    let alertId = 1;
    
    // Check for low stock
    const lowStockProducts = Array.from(this.products.values())
      .filter(product => product.quantity <= 5);
    
    lowStockProducts.forEach(product => {
      alerts.push({
        id: alertId++,
        type: 'low_stock',
        productId: product.id,
        productName: product.name,
        message: `Low Stock Alert: ${product.name} has only ${product.quantity} units remaining`,
        quantity: product.quantity
      });
    });
    
    // Check for expiring products
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    const expiringProducts = Array.from(this.products.values())
      .filter(product => product.expiryDate && product.expiryDate <= thirtyDaysFromNow);
    
    expiringProducts.forEach(product => {
      if (product.expiryDate) {
        alerts.push({
          id: alertId++,
          type: 'expiration',
          productId: product.id,
          productName: product.name,
          message: `Expiration Alert: ${product.quantity} units of ${product.name} will expire soon`,
          quantity: product.quantity,
          expiryDate: product.expiryDate
        });
      }
    });
    
    // Check for reorder level
    const reorderProducts = Array.from(this.products.values())
      .filter(product => product.quantity <= product.reorderLevel && product.quantity > 5);
    
    reorderProducts.forEach(product => {
      alerts.push({
        id: alertId++,
        type: 'reorder',
        productId: product.id,
        productName: product.name,
        message: `Reorder Reminder: ${product.name} is at reorder level`,
        quantity: product.quantity
      });
    });
    
    return alerts;
  }
  
  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getOrderWithItems(id: number): Promise<{ order: Order; items: OrderItem[] } | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const items = this.orderItems.get(id) || [];
    return { order, items };
  }
  
  async createOrder(orderData: InsertOrder, itemsData: InsertOrderItem[]): Promise<{ order: Order; items: OrderItem[] }> {
    const id = this.orderCurrentId++;
    const created = new Date();
    const order: Order = { ...orderData, id, created };
    
    this.orders.set(id, order);
    
    const items: OrderItem[] = itemsData.map(item => {
      const itemId = this.orderItemCurrentId++;
      return { ...item, id: itemId, orderId: id };
    });
    
    this.orderItems.set(id, items);
    
    // Update product quantities
    for (const item of items) {
      const product = this.products.get(item.productId);
      if (product) {
        product.quantity -= item.quantity;
        this.products.set(product.id, product);
      }
    }
    
    return { order, items };
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    order.status = status;
    this.orders.set(id, order);
    return order;
  }
  
  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }
  
  // Metrics operations
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    return {
      totalSales: { value: "$24,780", change: "12%", trend: "up" },
      orders: { value: 156, change: "8%", trend: "up" },
      inventory: { value: this.products.size, change: "3%", trend: "down" },
      users: { value: this.users.size, change: "4%", trend: "up" },
    };
  }
  
  async getSalesMetrics(period: string): Promise<SalesDataPoint[]> {
    const result: SalesDataPoint[] = [];
    const today = new Date();
    let days = 30;
    
    switch (period) {
      case "7days":
        days = 7;
        break;
      case "30days":
        days = 30;
        break;
      case "90days":
        days = 90;
        break;
      case "12months":
        // For months, we'll generate monthly data points for the past year
        for (let i = 0; i < 12; i++) {
          const date = subMonths(today, i);
          const monthYear = format(date, "MMM yyyy");
          result.unshift({
            date: monthYear,
            value: Math.floor(Math.random() * 10000) + 5000
          });
        }
        return result;
    }
    
    // Generate daily data for the specified period
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, "MMM dd");
      result.push({
        date: dateStr,
        value: Math.floor(Math.random() * 1000) + 500
      });
    }
    
    return result;
  }
  
  // Import/Export
  async importProducts(products: InsertProduct[]): Promise<Product[]> {
    const importedProducts: Product[] = [];
    
    for (const product of products) {
      const newProduct = await this.createProduct(product);
      importedProducts.push(newProduct);
    }
    
    return importedProducts;
  }
  
  // Helper methods to initialize demo data
  private initDemoProducts() {
    const demoProducts: InsertProduct[] = [
      {
        sku: "XYZ-123",
        name: "Premium Widget",
        description: "High-quality widget for industrial use",
        category: "Widgets",
        price: "29.99",
        cost: "15.50",
        quantity: 5,
        reorderLevel: 10,
      },
      {
        sku: "ABC-456",
        name: "Standard Gadget",
        description: "Reliable gadget for everyday use",
        category: "Gadgets",
        price: "19.99",
        cost: "10.25",
        quantity: 30,
        reorderLevel: 15,
        expiryDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      },
      {
        sku: "DEF-789",
        name: "Basic Tool",
        description: "Essential tool for all purposes",
        category: "Tools",
        price: "14.50",
        cost: "7.80",
        quantity: 12,
        reorderLevel: 15,
      },
      {
        sku: "GHI-101",
        name: "Advanced Component",
        description: "High-performance component",
        category: "Components",
        price: "45.00",
        cost: "28.50",
        quantity: 25,
        reorderLevel: 10,
      },
      {
        sku: "JKL-202",
        name: "Premium Accessory",
        description: "Luxury accessory item",
        category: "Accessories",
        price: "34.99",
        cost: "18.20",
        quantity: 18,
        reorderLevel: 8,
      }
    ];
    
    demoProducts.forEach(product => this.createProduct(product));
  }
  
  private initDemoOrders() {
    const today = new Date();
    
    const demoOrders: InsertOrder[] = [
      {
        orderNumber: "OR-1234",
        customerName: "Ryan Johnson",
        status: "completed",
        total: "1250.00",
        notes: "Priority delivery requested",
      },
      {
        orderNumber: "OR-1233",
        customerName: "Maria Rodriguez",
        status: "processing",
        total: "850.50",
        notes: "",
      },
      {
        orderNumber: "OR-1232",
        customerName: "David Chen",
        status: "pending",
        total: "2100.00",
        notes: "Include gift wrapping",
      },
      {
        orderNumber: "OR-1231",
        customerName: "Sarah Thompson",
        status: "completed",
        total: "475.25",
        notes: "",
      }
    ];
    
    const createDemoOrderItems = (orderId: number, productIds: number[]) => {
      return productIds.map(productId => {
        const product = this.products.get(productId);
        if (!product) throw new Error(`Product ${productId} not found`);
        
        const quantity = Math.floor(Math.random() * 5) + 1;
        const price = product.price;
        const subtotal = (parseFloat(price) * quantity).toString();
        
        return {
          orderId,
          productId,
          quantity,
          price,
          subtotal,
        } as InsertOrderItem;
      });
    };
    
    // Create demo orders with items
    demoOrders.forEach((orderData, index) => {
      const order = {
        ...orderData,
        id: this.orderCurrentId++,
        created: new Date(today.getTime() - (index * 24 * 60 * 60 * 1000)) // Each order one day apart
      };
      
      this.orders.set(order.id, order);
      
      // Get random products for this order
      const availableProductIds = Array.from(this.products.keys());
      const selectedProductIds = availableProductIds.slice(0, Math.min(index + 1, availableProductIds.length));
      
      const items = createDemoOrderItems(order.id, selectedProductIds);
      
      const orderItems = items.map(item => ({
        ...item,
        id: this.orderItemCurrentId++
      }));
      
      this.orderItems.set(order.id, orderItems);
    });
  }
  
  private initDemoMetrics() {
    // This would normally track real metrics, but for demo we're using static values
    // that are returned in getDashboardMetrics() and getSalesMetrics()
  }
}

export const storage = new MemStorage();
