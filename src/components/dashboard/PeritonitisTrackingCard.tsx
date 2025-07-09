import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Sparkles, CheckCircle2 } from 'lucide-react';
import type { PeritonitisTrackingData } from '@/lib/types';

interface PeritonitisTrackingCardProps {
  data: PeritonitisTrackingData;
}

export default function PeritonitisTrackingCard({ data }: PeritonitisTrackingCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base font-semibold">
          <div className="flex items-center gap-2">
            <div className="bg-green-100 rounded-full p-1.5">
              <Sparkles className="h-4 w-4 text-green-500" />
            </div>
            <span>Peritonitis Tracking</span>
          </div>
          <Info className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-green-50 p-3 border border-green-200">
          <p className="text-xs text-muted-foreground">Last Episode</p>
          <p className="text-base font-semibold">{data.lastEpisode}</p>
          <div className="flex items-center gap-2 text-xs text-green-700 mt-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>{data.lastEpisodeNote}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs text-muted-foreground">Infection Rate</p>
            <p className="text-xl font-bold">{data.infectionRate.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">episodes/patient-year</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs text-muted-foreground">Risk Status</p>
            <p className="text-xl font-bold text-green-600">{data.riskStatus}</p>
            <p className="text-xs text-muted-foreground">Target: {data.riskTarget}</p>
          </div>
        </div>
        <div className="rounded-lg bg-blue-50/50 p-3 border border-blue-200">
            <h4 className="font-semibold mb-2 text-sm">Prevention Checklist</h4>
            <ul className="space-y-2">
                {data.preventionChecklist.map((item) => (
                    <li key={item.id} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600 fill-green-100" />
                        <span className="text-xs">{item.text}</span>
                    </li>
                ))}
            </ul>
        </div>
      </CardContent>
    </Card>
  );
}
