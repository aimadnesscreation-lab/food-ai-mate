import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Menu, Trash2 } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface WeightLog {
  id: string;
  weight: number;
  logged_at: string;
}

const WeightTracker = () => {
  const [weight, setWeight] = useState("");
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const { toast } = useToast();

  const fetchWeightLogs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("weight_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch weight logs",
        variant: "destructive",
      });
    } else if (data) {
      setWeightLogs(data);
    }
  };

  useEffect(() => {
    fetchWeightLogs();
  }, []);

  const handleAddWeight = async () => {
    if (!weight) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("weight_logs").insert({
      user_id: user.id,
      weight: parseFloat(weight),
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add weight log",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Weight logged successfully",
      });
      setWeight("");
      fetchWeightLogs();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("weight_logs").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete weight log",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Weight log deleted",
      });
      fetchWeightLogs();
    }
  };

  const chartData = weightLogs.map((log) => ({
    date: new Date(log.logged_at).toLocaleDateString(),
    weight: log.weight,
  }));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <SidebarTrigger>
            <Menu className="h-6 w-6" />
          </SidebarTrigger>
          <h1 className="text-2xl font-bold">Weight Tracker</h1>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Log Your Weight</CardTitle>
              <CardDescription>Track your weight progress over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="70"
                  />
                </div>
                <Button onClick={handleAddWeight} className="self-end">
                  Add Weight
                </Button>
              </div>
            </CardContent>
          </Card>

          {weightLogs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Weight Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Weight History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {weightLogs.length === 0 ? (
                  <p className="text-muted-foreground">No weight logs yet</p>
                ) : (
                  weightLogs
                    .slice()
                    .reverse()
                    .map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-3 bg-accent rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{log.weight} kg</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(log.logged_at).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(log.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WeightTracker;
