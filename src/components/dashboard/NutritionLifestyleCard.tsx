import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Salad, Info } from 'lucide-react';
import type { NutritionLifestyleData } from '@/lib/types';

interface NutritionLifestyleCardProps {
  data: NutritionLifestyleData;
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
        <div className="rounded-lg bg-orange-50/60 p-3 border border-orange-200 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Daily Protein</p>
            <p className="text-base font-bold">{data.dailyProtein.current}g / {data.dailyProtein.target}g target</p>
            <Progress value={proteinProgress} className="h-1.5 [&>div]:bg-orange-500" />
            <p className="text-xs text-orange-600">Need {data.dailyProtein.target - data.dailyProtein.current}g more protein</p>
        </div>
        <div className="rounded-lg bg-green-50 p-3 border border-green-200 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Fluid Restriction</p>
            <p className="text-base font-bold">{data.fluidRestriction.current.toFixed(1)}L / {data.fluidRestriction.limit.toFixed(1)}L limit</p>
            <Progress value={fluidProgress} className="h-1.5 [&>div]:bg-green-500" />
            <p className="text-xs text-green-600">Good compliance</p>
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
