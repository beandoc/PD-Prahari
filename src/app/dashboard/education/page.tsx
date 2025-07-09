
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Apple, ShieldCheck, Soup, Video } from 'lucide-react';

export default function PatientEducationPage() {
  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-primary">Patient Education Center</h1>
          <p className="text-xl text-muted-foreground">
            Knowledge is power. Empower yourself with the right information for your care.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Video className="text-purple-600" /> Correct PD Exchange Methodology</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription>
              Following the correct procedure for every exchange is the most important step in preventing infections. Watch this video to refresh your memory.
            </CardDescription>
            <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
              {/* Placeholder for video player */}
              <p className="text-white">Video Player Placeholder</p>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Always wash your hands thoroughly.</li>
              <li>Wear a mask covering your nose and mouth.</li>
              <li>Ensure your exchange area is clean and free of drafts.</li>
              <li>Inspect the dialysate bag for leaks or particles before use.</li>
            </ul>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8 items-start">
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ShieldCheck className="text-blue-600" /> Exit Site Care</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                       Proper exit site care is vital to prevent infections like Peritonitis.
                    </p>
                    <div>
                        <h4 className="font-semibold text-green-600">Healthy Exit Site</h4>
                        <Image
                            src="https://placehold.co/400x300.png"
                            alt="A healthy PD catheter exit site"
                            width={400}
                            height={300}
                            data-ai-hint="healthy skin"
                            className="rounded-md border mt-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Looks clean, dry, and free of redness or swelling.</p>
                    </div>
                     <div>
                        <h4 className="font-semibold text-red-600">Signs of Infection</h4>
                        <Image
                            src="https://placehold.co/400x300.png"
                            alt="An infected PD catheter exit site"
                            width={400}
                            height={300}
                            data-ai-hint="skin infection"
                            className="rounded-md border mt-2"
                        />
                         <p className="text-xs text-muted-foreground mt-1">Redness, swelling, pain, or pus are warning signs. Contact your care team immediately.</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Apple className="text-red-600" /> Nutrition for PD Patients</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                        <h4 className="font-semibold text-blue-800 flex items-center gap-2"><Soup/> Protein is Key</h4>
                        <p className="text-sm text-blue-700 mt-1">PD removes protein from your body, so you need to eat more of it. Good sources include meat, fish, poultry, and eggs.</p>
                    </div>
                    <div className="p-3 bg-orange-50 border-l-4 border-orange-400 rounded-r-lg">
                        <h4 className="font-semibold text-orange-800">Limit Phosphorus & Potassium</h4>
                        <p className="text-sm text-orange-700 mt-1">Your dietician will guide you on limiting foods like dairy, nuts, beans, and certain fruits and vegetables.</p>
                    </div>
                    <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                        <h4 className="font-semibold text-red-800">Watch Your Sodium & Fluids</h4>
                        <p className="text-sm text-red-700 mt-1">Limiting salt and fluid intake helps control blood pressure and prevents fluid overload.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
