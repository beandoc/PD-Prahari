
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History } from 'lucide-react';

export default function LogHistoryPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            Log History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is where a history of your past daily logs will be displayed. This feature is coming soon!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
