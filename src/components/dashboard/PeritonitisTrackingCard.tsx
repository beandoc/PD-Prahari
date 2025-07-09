
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Sparkles, CheckCircle2 } from 'lucide-react';
import type { PeritonitisEpisode } from '@/lib/types';
import { format } from 'date-fns';

interface PeritonitisHistoryCardProps {
  episodes: PeritonitisEpisode[];
}

export default function PeritonitisHistoryCard({ episodes }: PeritonitisHistoryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base font-semibold">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 rounded-full p-1.5">
              <Sparkles className="h-4 w-4 text-blue-500" />
            </div>
            <span>Peritonitis History</span>
          </div>
          <Info className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {episodes.length > 0 ? (
          <ul className="space-y-3">
            {episodes.map((episode) => (
              <li key={episode.episodeId} className="rounded-lg bg-blue-50/50 p-3 border border-blue-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-sm">Diagnosis: {format(new Date(episode.diagnosisDate), 'MMMM dd, yyyy')}</p>
                    <p className="text-xs text-muted-foreground mt-1">Organism: {episode.organismIsolated}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-green-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{episode.outcome}</span>
                  </div>
                </div>
                <p className="text-xs mt-2">Treatment: {episode.treatmentRegimen}</p>
                 {episode.resolutionDate && <p className="text-xs mt-1 text-muted-foreground">Resolved on: {format(new Date(episode.resolutionDate), 'MMMM dd, yyyy')}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4 rounded-lg bg-green-50 border border-green-200">
            <CheckCircle2 className="h-8 w-8 text-green-600 mb-2" />
            <p className="font-semibold">No Peritonitis Episodes</p>
            <p className="text-sm text-muted-foreground">This patient has a clean record.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
