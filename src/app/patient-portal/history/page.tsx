
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { History, BarChart } from 'lucide-react';

export default function LogHistoryPage() {
  return (
    <div className="space-y-4">
       <header>
          <h1 className="text-3xl font-bold text-gray-800">Log History</h1>
          <p className="text-muted-foreground mt-2">A record of all your previously submitted daily logs.</p>
        </header>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            Coming Soon!
          </CardTitle>
          <CardDescription>
            This feature is currently under development. Soon, you will be able to review all your past entries here.
           </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center p-8 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
            <BarChart className="h-12 w-12 mb-4" />
            <p className="font-semibold">Your historical data will be visualized here.</p>
            <p className="text-sm mt-1">Track your progress over time with charts and tables of your vitals, UF, and more.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
