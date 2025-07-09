import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonitorPlay, ShieldCheck, Apple, ArrowRight } from 'lucide-react';
import type { EducationTopic } from '@/lib/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PatientEducationCardProps {
  topics: EducationTopic[];
  className?: string;
}

const iconMap: Record<EducationTopic['icon'], React.ReactNode> = {
    Video: <MonitorPlay className="h-5 w-5 text-purple-600" />,
    ShieldCheck: <ShieldCheck className="h-5 w-5 text-blue-600" />,
    Apple: <Apple className="h-5 w-5 text-red-600" />,
};

const iconBg: Record<EducationTopic['icon'], string> = {
    Video: 'bg-purple-100',
    ShieldCheck: 'bg-blue-100',
    Apple: 'bg-red-100',
};


export default function PatientEducationCard({ topics, className }: PatientEducationCardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <div className="bg-indigo-100 rounded-full p-1.5">
                <MonitorPlay className="h-4 w-4 text-indigo-500" />
            </div>
          <span>Patient Education Center</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {topics.map((topic) => (
            <li key={topic.id}>
                <Link href="#" className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50 border bg-white">
                    <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-full", iconBg[topic.icon])}>
                            {iconMap[topic.icon]}
                        </div>
                        <div>
                            <p className="font-semibold text-sm">{topic.title}</p>
                            <p className="text-xs text-muted-foreground">{topic.description}</p>
                        </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
