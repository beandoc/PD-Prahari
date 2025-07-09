
'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function SharesourceInfoPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-primary">
            ShareSource
          </h1>
          <p className="text-xl text-muted-foreground">
            Offering a higher standard of care for patients on home dialysis
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Fewer Hospitalizations</CardTitle>
            <CardDescription>
              Patients using APD devices with Sharesource had trends indicating fewer hospitalizations than 
              patients using APD devices without Sharesource¹.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
              <Image
                src="https://placehold.co/800x300.png"
                alt="Graph showing fewer hospitalizations with Sharesource"
                width={800}
                height={300}
                data-ai-hint="hospitalization data chart"
                className="rounded-md border"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Ultrafiltration (UF) Complete Picture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Get a comprehensive look at your patient’s UF including initial drain UF and manual exchange UF. Methodically packaged to easily interpret results. This UF detail is also included in the corresponding Treatment Summary Report.
              </p>
              <Image
                src="https://placehold.co/600x450.png"
                alt="Ultrafiltration report example"
                width={600}
                height={450}
                data-ai-hint="medical report"
                className="rounded-md border"
              />
            </CardContent>
          </Card>
          <div className="space-y-8">
            <Card>
                <CardHeader>
                <CardTitle>Prescribed vs. Actual Smarter Reporting</CardTitle>
                <CardDescription>Wellness Clinic: Homechoice Claria Prescribed Versus Actual Report</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                    As a key tool to understanding your patient’s treatment, the Prescribed vs. Actual report has been enhanced to include night UF, total UF and pre-weight/blood pressure vitals. Also, reformatted to a shorter length, averaged per period and revised column titles for easier interpretation.
                </p>
                 <Image
                    src="https://placehold.co/600x200.png"
                    alt="Prescribed vs Actual report data with values like 450 ml, 1400 ml"
                    width={600}
                    height={200}
                    data-ai-hint="medical data"
                    className="rounded-md border"
                />
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                <CardTitle>Effortless Reporting</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                    Burden-free and efficient reporting with 1-click of a button. The Clinical and Patient Treatment History reports are organized and pre-formatted saving you time.
                </p>
                </CardContent>
            </Card>
          </div>
        </div>

        <footer className="text-center text-xs text-muted-foreground pt-8">
          <p>1. Firanek et. al. 2017; Disclaimer: This is an observational study of 189 patients using APD devices with Sharesource.</p>
        </footer>
      </div>
    </div>
  );
}
