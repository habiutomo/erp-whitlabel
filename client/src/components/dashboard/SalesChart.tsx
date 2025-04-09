import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useCompanySettings } from "@/hooks/use-company-settings";

interface SalesChartProps {
  title?: string;
}

const SalesChart = ({ title = "Sales Overview" }: SalesChartProps) => {
  const [period, setPeriod] = useState("30days");
  const { companySettings } = useCompanySettings();
  const primaryColor = companySettings?.primaryColor || "#0078D4";
  
  const { data: salesData, isLoading } = useQuery({
    queryKey: [`/api/metrics/sales?period=${period}`],
  });

  const handleExport = () => {
    // In a real app, this would export the chart data to CSV/Excel
    if (!salesData) return;
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Sales\n" 
      + salesData.map((item: any) => `${item.date},${item.value}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_${period}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="shadow-sm border border-neutral-300">
      <CardHeader className="pb-0">
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          <div className="flex space-x-2">
            <Select value={period} onValueChange={setPeriod}>
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
              onClick={handleExport}
              disabled={isLoading || !salesData}
            >
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full mt-4">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-neutral-100 rounded-lg">
              <p className="text-muted-foreground">Loading sales data...</p>
            </div>
          ) : !salesData ? (
            <div className="w-full h-full flex items-center justify-center bg-neutral-100 rounded-lg">
              <p className="text-muted-foreground">No sales data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
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
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={primaryColor}
                  fill={`${primaryColor}20`}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesChart;
