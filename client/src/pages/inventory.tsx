import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useCompanySettings } from "@/hooks/use-company-settings";
import { Plus, FileUp, FileDown, Search, AlertTriangle } from "lucide-react";
import { insertProductSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InventoryAlert from "@/components/dashboard/InventoryAlert";

const Inventory = () => {
  const { toast } = useToast();
  const { companySettings } = useCompanySettings();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Fetch products
  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  // Fetch inventory alerts
  const { data: inventoryAlerts } = useQuery({
    queryKey: ["/api/inventory/alerts"],
  });
  
  // Type assertions to help TypeScript
  const typedProducts = products as any[] || [];
  const typedAlerts = inventoryAlerts as any[] || [];

  // Product form schema
  const productFormSchema = insertProductSchema.extend({
    price: z.string().min(1, "Price is required"),
    cost: z.string().min(1, "Cost is required"),
    quantity: z.number().min(0, "Quantity must be at least 0"),
    reorderLevel: z.number().min(1, "Reorder level must be at least 1"),
  });

  // Form for new product
  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      sku: "",
      name: "",
      description: "",
      category: "",
      price: "",
      cost: "",
      quantity: 0,
      reorderLevel: 10,
    },
  });

  // Add product mutation
  const addProductMutation = useMutation({
    mutationFn: (data: z.infer<typeof productFormSchema>) => {
      return apiRequest("POST", "/api/products", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics/dashboard"] });
      setShowAddDialog(false);
      form.reset();
      toast({
        title: "Product Added",
        description: "The product has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add product: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: z.infer<typeof productFormSchema>) => {
    addProductMutation.mutate(data);
  };

  // Filter products based on search term
  const filteredProducts = typedProducts.filter((product: any) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Inventory status badge
  const getInventoryStatusBadge = (quantity: number, reorderLevel: number) => {
    if (quantity <= 0) {
      return <span className="px-2 py-1 text-xs rounded-full bg-destructive bg-opacity-10 text-destructive">Out of stock</span>;
    } else if (quantity <= 5) {
      return <span className="px-2 py-1 text-xs rounded-full bg-destructive bg-opacity-10 text-destructive">Low stock</span>;
    } else if (quantity <= reorderLevel) {
      return <span className="px-2 py-1 text-xs rounded-full bg-warning bg-opacity-10 text-warning">Reorder</span>;
    } else {
      return <span className="px-2 py-1 text-xs rounded-full bg-success bg-opacity-10 text-success">In stock</span>;
    }
  };

  // Import & Export functions - these would be implemented with file input handling in a real app
  const handleImport = () => {
    toast({
      title: "Import Products",
      description: "Product import functionality would be implemented here.",
    });
  };

  const handleExport = () => {
    toast({
      title: "Export Products",
      description: "Product export functionality would be implemented here.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Inventory Management</h1>
        <div className="flex gap-2">
          <Button onClick={handleImport} variant="outline" size="sm">
            <FileUp className="h-4 w-4 mr-2" /> Import
          </Button>
          <Button onClick={handleExport} variant="outline" size="sm">
            <FileDown className="h-4 w-4 mr-2" /> Export
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new product.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU</Label>
                      <Input 
                        id="sku" 
                        {...form.register("sku")} 
                        error={form.formState.errors.sku?.message}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name</Label>
                      <Input 
                        id="name" 
                        {...form.register("name")} 
                        error={form.formState.errors.name?.message}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...form.register("description")}
                      error={form.formState.errors.description?.message}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input 
                        id="category" 
                        {...form.register("category")} 
                        error={form.formState.errors.category?.message}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input 
                        id="quantity" 
                        type="number" 
                        {...form.register("quantity", { valueAsNumber: true })} 
                        error={form.formState.errors.quantity?.message}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price ($)</Label>
                      <Input 
                        id="price" 
                        {...form.register("price")} 
                        error={form.formState.errors.price?.message}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cost">Cost ($)</Label>
                      <Input 
                        id="cost" 
                        {...form.register("cost")} 
                        error={form.formState.errors.cost?.message}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reorderLevel">Reorder Level</Label>
                      <Input 
                        id="reorderLevel" 
                        type="number" 
                        {...form.register("reorderLevel", { valueAsNumber: true })} 
                        error={form.formState.errors.reorderLevel?.message}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={addProductMutation.isPending}
                  >
                    {addProductMutation.isPending ? "Adding..." : "Add Product"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Alerts Section */}
      {typedAlerts.length > 0 && (
        <Card className="shadow-sm border border-neutral-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-warning" />
              Inventory Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {typedAlerts.slice(0, 3).map((alert: any) => (
                <InventoryAlert
                  key={alert.id}
                  type={alert.type}
                  title={alert.type === 'low_stock' 
                    ? 'Low Stock Alert' 
                    : alert.type === 'expiration' 
                      ? 'Expiration Alert' 
                      : 'Reorder Reminder'
                  }
                  message={alert.message}
                  actionLabel={
                    alert.type === 'low_stock' 
                      ? 'Order' 
                      : alert.type === 'expiration' 
                        ? 'Details' 
                        : 'Reorder'
                  }
                  onAction={() => {}}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Table */}
      <Card className="shadow-sm border border-neutral-300">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Products</CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product: any) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.sku}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category || "-"}</TableCell>
                      <TableCell className="text-right">${parseFloat(product.price).toFixed(2)}</TableCell>
                      <TableCell className="text-right">${parseFloat(product.cost).toFixed(2)}</TableCell>
                      <TableCell className="text-right">{product.quantity}</TableCell>
                      <TableCell>{getInventoryStatusBadge(product.quantity, product.reorderLevel)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;
