
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { History } from 'lucide-react';

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
            This is where a history of your past daily logs will be displayed, allowing you to track your progress over time. This feature is currently under development.
           </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Soon you will be able to see charts and tables of your historical data right here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
