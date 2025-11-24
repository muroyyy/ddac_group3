import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Activity, Clock, Building2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const monthlyData = [
  { month: "Jan", requests: 2 },
  { month: "Feb", requests: 3 },
  { month: "Mar", requests: 2 },
  { month: "Apr", requests: 1 },
  { month: "May", requests: 0 },
  { month: "Jun", requests: 0 },
];

export default function Insights() {
  const stats = [
    {
      title: "Total Units Received",
      value: "24",
      icon: Activity,
      description: "Lifetime blood units",
    },
    {
      title: "Average Approval Time",
      value: "2.5 days",
      icon: Clock,
      description: "From request to approval",
    },
    {
      title: "Most Frequent Hospital",
      value: "City General",
      icon: Building2,
      description: "Primary care facility",
    },
    {
      title: "Success Rate",
      value: "92%",
      icon: TrendingUp,
      description: "Request approval rate",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Insights</h1>
        <p className="text-muted-foreground">
          Your personal transfusion statistics and trends
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly Request Pattern */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Monthly Request Pattern</CardTitle>
          <p className="text-sm text-muted-foreground">
            Your blood request activity over the past 6 months
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="requests" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Additional Insights */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Hospital Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "City General Hospital", percentage: 45 },
                { name: "Mercy Medical Center", percentage: 30 },
                { name: "Saint Mary's Hospital", percentage: 15 },
                { name: "Central Hospital", percentage: 10 },
              ].map((hospital) => (
                <div key={hospital.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{hospital.name}</span>
                    <span className="font-medium">{hospital.percentage}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${hospital.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Recent Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: "8 Successful Transfusions",
                  date: "March 2025",
                  description: "Completed your 8th transfusion",
                },
                {
                  title: "Quick Approval Record",
                  date: "February 2025",
                  description: "Request approved in 24 hours",
                },
                {
                  title: "Profile Completed",
                  date: "January 2025",
                  description: "Added all health information",
                },
              ].map((milestone, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-border bg-card p-3"
                >
                  <h4 className="font-semibold text-card-foreground">
                    {milestone.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {milestone.description}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {milestone.date}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
