import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Menu } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

const Micronutrients = () => {
  return (
    <div className="min-h-screen bg-background max-w-full overflow-x-hidden">
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <SidebarTrigger>
            <Menu className="h-6 w-6" />
          </SidebarTrigger>
          <h1 className="text-2xl font-bold text-foreground">Micronutrient Tracker</h1>
        </div>

        <Card className="border-primary/20">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-primary">Coming Soon</CardTitle>
            <CardDescription>
              Track your vitamins and minerals intake
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This feature is under development. You'll be able to track vitamins, minerals,
              and other micronutrients here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Micronutrients;
