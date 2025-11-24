import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Droplet, Calendar, Heart, Newspaper } from "lucide-react";

export default function Dashboard() {
  const userName = "Sharveen Kaur";

  const stats = [
    {
      title: "Pending Blood Requests",
      value: "2",
      icon: Droplet,
      description: "Active requests awaiting approval",
    },
    {
      title: "Upcoming Appointments",
      value: "1",
      icon: Calendar,
      description: "Scheduled transfusion sessions",
    },
    {
      title: "Completed Transfusions",
      value: "8",
      icon: Heart,
      description: "Total successful transfusions",
    },
  ];

  const newsItems = [
    {
      title: "Post-Transfusion Care Tips",
      excerpt: "Learn how to take care of yourself after receiving blood transfusion...",
      date: "March 15, 2025",
    },
    {
      title: "New Blood Donation Campaign",
      excerpt: "Our hospital is launching a new blood donation drive this month...",
      date: "March 12, 2025",
    },
    {
      title: "Understanding Blood Types",
      excerpt: "A comprehensive guide to blood types and compatibility...",
      date: "March 10, 2025",
    },
    {
      title: "Wellness Tips for Patients",
      excerpt: "Maintaining good health while managing your condition...",
      date: "March 8, 2025",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {userName}!
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your blood transfusion journey
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Patient News Section */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            <CardTitle>Patient News</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {newsItems.map((item, index) => (
              <div
                key={index}
                className="rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md"
              >
                <h3 className="mb-2 font-semibold text-card-foreground">
                  {item.title}
                </h3>
                <p className="mb-2 text-sm text-muted-foreground">{item.excerpt}</p>
                <p className="text-xs text-muted-foreground">{item.date}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
