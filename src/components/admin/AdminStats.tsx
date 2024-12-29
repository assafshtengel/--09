import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AdminStatsProps {
  totalUsers: number;
  usageStats: any[];
}

export const AdminStats = ({ totalUsers, usageStats }: AdminStatsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>סטטיסטיקות משתמשים</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">{totalUsers}</p>
          <p className="text-muted-foreground">סה״כ משתמשים</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>פעילות לאורך זמן</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usageStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="matches" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};