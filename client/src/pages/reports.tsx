import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useCompanySettings } from "@/hooks/use-company-settings";
import { Download } from "lucide-react";

const Reports = () => {
  const { companySettings } = useCompanySettings();
  const primaryColor = companySettings?.primaryColor || "#0078D4";
  const [salesPeriod, setSalesPeriod] = useState("30days");
  
  // Fetch sales data
  const { data: salesData } = useQuery({
    queryKey: [`/api/metrics/sales?period=${salesPeriod}`],
  });

  // Mock inventory data - would come from API in a real app
  const inventoryData = [
    { name: "Widgets", value: 45 },
    { name: "Gadgets", value: 30 },
    { name: "Tools", value: 15 },
    { name: "Components", value: 8 },
    { name: "Accessories", value: 2 },
  ];

  // Mock order status data - would come from API in a real app
  const orderStatusData = [
    { name: "Completed", value: 65 },
    { name: "Processing", value: 20 },
    { name: "Pending", value: 10 },
    { name: "Cancelled", value: 5 },
  ];

  // Colors for pie charts
  const COLORS = [primaryColor, "#2B88D8", "#106EBE", "#8C8C8C", "#A80000"];

  // Handle export
  const handleExport = (reportType: string) => {
    // This would export the report data to CSV/Excel in a real app
    console.log(`Exporting ${reportType} report`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Reports</h1>
      
      <Tabs defaultValue="sales">
        <TabsList className="mb-4">
          <TabsTrigger value="sales">Sales Reports</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Reports</TabsTrigger>
          <TabsTrigger value="orders">Order Reports</TabsTrigger>
        </TabsList>
        
        {/* Sales Reports Tab */}
        <TabsContent value="sales">
          <Card className="shadow-sm border border-neutral-300">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Sales Over Time</CardTitle>
                <div className="flex space-x-2">
                  <Select value={salesPeriod} onValueChange={setSalesPeriod}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">Last 7 Days</SelectItem>
                      <SelectItem value="30days">Last 30 Days</SelectItem>
                      <SelectItem value="90days">Last 90 Days</SelectItem>
                      <SelectItem value="12months">Last 12 Months</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleExport('sales')}
                  >
                    <Download className="h-4 w-4 mr-2" /> Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                {!salesData ? (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-100 rounded-lg">
                    <p className="text-muted-foreground">Loading sales data...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={salesData}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => value >= 1000 ? `$${value / 1000}k` : `$${value}`}
                      />
                      <Tooltip 
                        formatter={(value) => [`$${value}`, 'Sales']} 
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        name="Sales" 
                        stroke={primaryColor} 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Inventory Reports Tab */}
        <TabsContent value="inventory">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm border border-neutral-300">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Inventory by Category</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleExport('inventory')}
                  >
                    <Download className="h-4 w-4 mr-2" /> Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={inventoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {inventoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} units`, 'Quantity']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border border-neutral-300">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Low Stock Items</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleExport('low-stock')}
                  >
                    <Download className="h-4 w-4 mr-2" /> Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "XYZ-123", quantity: 5, reorderLevel: 10 },
                        { name: "ABC-456", quantity: 8, reorderLevel: 15 },
                        { name: "DEF-789", quantity: 12, reorderLevel: 15 },
                        { name: "GHI-101", quantity: 7, reorderLevel: 10 },
                        { name: "JKL-202", quantity: 9, reorderLevel: 12 },
                      ]}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 20,
                        bottom: 60,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={60} 
                        tick={{ fontSize: 12 }} 
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="quantity" name="Current Quantity" fill={primaryColor} />
                      <Bar dataKey="reorderLevel" name="Reorder Level" fill="#A80000" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Order Reports Tab */}
        <TabsContent value="orders">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm border border-neutral-300">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Orders by Status</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleExport('order-status')}
                  >
                    <Download className="h-4 w-4 mr-2" /> Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border border-neutral-300">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Order Value Distribution</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleExport('order-value')}
                  >
                    <Download className="h-4 w-4 mr-2" /> Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { range: "< $100", count: 15 },
                        { range: "$100-$500", count: 30 },
                        { range: "$500-$1000", count: 25 },
                        { range: "$1000-$2000", count: 18 },
                        { range: "> $2000", count: 12 },
                      ]}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Number of Orders" fill={primaryColor} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
