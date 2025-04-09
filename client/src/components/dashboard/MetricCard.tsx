import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ArrowDown, ArrowUp, LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
  icon: LucideIcon;
  iconColor?: string;
}

const MetricCard = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  iconColor = "#0078D4"
}: MetricCardProps) => {
  return (
    <Card className="p-6 border border-neutral-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
        </div>
        <div 
          className="p-3 rounded-full bg-opacity-10 flex items-center justify-center"
          style={{ 
            backgroundColor: `${iconColor}20`,
            color: iconColor
          }}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="flex items-center mt-4">
        <span className={cn(
          "text-sm flex items-center",
          trend === "up" ? "text-success" : "text-destructive"
        )}>
          {trend === "up" ? (
            <ArrowUp className="h-4 w-4 mr-1" />
          ) : (
            <ArrowDown className="h-4 w-4 mr-1" />
          )}
          <span>{change}</span>
        </span>
        <span className="text-xs text-muted-foreground ml-2">vs. last month</span>
      </div>
    </Card>
  );
};

export default MetricCard;
