import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Salad, Info, Heart, Droplet } from 'lucide-react';
import type { NutritionLifestyleData } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NutritionLifestyleCardProps {
  data: NutritionLifestyleData;
}

const getTrendVariant = (trend?: 'Stable' | 'Improving' | 'Worsening' | 'High' | 'Low') => {
    switch (trend) {
        case 'Improving':
        case 'Stable':
            return 'secondary';
        case 'Worsening':
        case 'High':
        case 'Low':
            return 'destructive';
        default:
            return 'outline';
    }
};
const getTrendColor = (trend?: 'Stable' | 'Improving' | 'Worsening' | 'High' | 'Low') => {
    switch (trend) {
        case 'Improving':
            return 'text-green-600 bg-green-100 border-green-200';
         case 'Stable':
            return 'text-blue-600 bg-blue-100 border-blue-200';
        case 'Worsening':
        case 'High':
        case 'Low':
            return 'text-red-600 bg-red-100 border-red-200';
        default:
            return 'text-gray-600 bg-gray-100 border-gray-200';
    }
}


export default function NutritionLifestyleCard({ data }: NutritionLifestyleCardProps) {
    const proteinProgress = (data.dailyProtein.current / data.dailyProtein.target) * 100;
    const fluidProgress = (data.fluidRestriction.current / data.fluidRestriction.limit) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base font-semibold">
          <div className="flex items-center gap-2">
            <div className="bg-orange-100 rounded-full p-1.5">
                <Salad className="h-4 w-4 text-orange-500" />
            </div>
            <span>Nutrition & Lifestyle</span>
          </div>
          <Info className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-orange-50/60 p-3 border border-orange-200 space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Daily Protein</p>
                <p className="text-base font-bold">{data.dailyProtein.current}g / {data.dailyProtein.target}g</p>
                <Progress value={proteinProgress} className="h-1.5 [&>div]:bg-orange-500" />
            </div>
            <div className="rounded-lg bg-green-50 p-3 border border-green-200 space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Fluid Restriction</p>
                <p className="text-base font-bold">{data.fluidRestriction.current.toFixed(1)}L / {data.fluidRestriction.limit.toFixed(1)}L</p>
                <Progress value={fluidProgress} className="h-1.5 [&>div]:bg-green-500" />
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
             {data.homeBP && (
                 <div className="rounded-lg bg-red-50 p-3 border border-red-200 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><Heart className="h-3 w-3" /> Home BP (Avg 7d)</p>
                    <p className="text-base font-bold">{data.homeBP.averageSystolic}/{data.homeBP.averageDiastolic} mmHg</p>
                    <Badge variant={getTrendVariant(data.homeBP.trend)} className={cn('text-xs', getTrendColor(data.homeBP.trend))}>{data.homeBP.trend}</Badge>
                </div>
            )}
             {data.bloodSugar && (
                <div className="rounded-lg bg-blue-50 p-3 border border-blue-200 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><Droplet className="h-3 w-3" /> Blood Sugar (Last)</p>
                    <p className="text-base font-bold">{data.bloodSugar.lastReading} {data.bloodSugar.unit}</p>
                    <Badge variant={getTrendVariant(data.bloodSugar.trend)} className={cn('text-xs', getTrendColor(data.bloodSugar.trend))}>{data.bloodSugar.trend}</Badge>
                </div>
            )}
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-center">
            <div className="rounded-lg bg-gray-100 p-2">
                <p className="text-xs text-muted-foreground">Calories Today</p>
                <p className="text-xl font-bold">{data.caloriesToday.current.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Target: {data.caloriesToday.target.toLocaleString()}</p>
            </div>
            <div className="rounded-lg bg-gray-100 p-2">
                <p className="text-xs text-muted-foreground">Handgrip Strength</p>
                <p className="text-xl font-bold">{data.handgripStrength.value} kg</p>
                <p className="text-xs text-green-600 font-semibold">{data.handgripStrength.status}</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
