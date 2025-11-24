// Simplified chart component to avoid recharts complexity
import * as React from "react";
import { cn } from "../../lib/utils";

export interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Chart = React.forwardRef<HTMLDivElement, ChartProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("w-full h-64 bg-muted rounded-md flex items-center justify-center", className)}
        {...props}
      >
        <p className="text-muted-foreground">Chart placeholder</p>
      </div>
    );
  }
);

Chart.displayName = "Chart";

export const ChartContainer = Chart;
export const ChartTooltip = ({ children }: any) => <div>{children}</div>;
export const ChartTooltipContent = ({ children }: any) => <div>{children}</div>;
export const ChartLegend = ({ children }: any) => <div>{children}</div>;
export const ChartLegendContent = ({ children }: any) => <div>{children}</div>;