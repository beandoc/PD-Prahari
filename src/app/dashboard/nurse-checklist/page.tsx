
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const ChecklistItem = ({ id, label }: { id: string, label: string }) => (
    <div className="flex items-center space-x-3 py-2">
        <Checkbox id={id} />
        <Label htmlFor={id} className="text-sm font-normal leading-snug">{label}</Label>
    </div>
);


export default function NurseChecklistPage() {
    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
            <div className="max-w-5xl mx-auto space-y-8">
                <header className="text-center space-y-2">
                    <h1 className="text-4xl font-bold text-primary">Nurse Checklist for PD Patient Success</h1>
                    <p className="text-lg text-muted-foreground">
                        A guide for the first 90 days on PD therapy. Items can be checked off here or in the 7-day views in the calendar.
                    </p>
                </header>

                <Card>
                    <CardHeader>
                        <CardTitle>Best Demonstrated Practices</CardTitle>
                        <CardDescription>Use this checklist to avoid the 4 main causes of PD dropout: INFECTION & CATHETER issues.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="multiple" defaultValue={['item-1']} className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger className="text-lg font-semibold">Pre-Start Patient Education</AccordionTrigger>
                                <AccordionContent className="pl-2 space-y-2">
                                    <ChecklistItem id="c1" label="Describe high quality, goal directed care and the concept of “Shared Decision Making”." />
                                    <ChecklistItem id="c2" label="Discuss how PD daily removes fluid & waste from the body." />
                                    <ChecklistItem id="c3" label="Explain the difference between CAPD & APD." />
                                    <ChecklistItem id="c4" label="Discuss the steps involved in PD therapy: Drain, Fill, Dwell." />
                                    <ChecklistItem id="c5" label="Evaluate patient understanding and expectations of therapy." />
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="item-2">
                                <AccordionTrigger className="text-lg font-semibold">Catheter Placement & Procedure</AccordionTrigger>
                                <AccordionContent className="pl-2 space-y-2">
                                    <ChecklistItem id="c6" label="Explain the PD catheter and how it is placed." />
                                    <ChecklistItem id="c7" label="Select the right exit site location with the patient." />
                                    <ChecklistItem id="c8" label="Provide clear pre-procedure instructions to the patient." />
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="item-3">
                                <AccordionTrigger className="text-lg font-semibold">Post-Procedure & Catheter Care</AccordionTrigger>
                                <AccordionContent className="pl-2 space-y-2">
                                     <ChecklistItem id="c9" label="Explain post-procedure care and the expected healing time of the catheter." />
                                     <ChecklistItem id="c10" label="Post-procedure instructions reviewed, and written instructions given to patient." />
                                     <ChecklistItem id="c11" label="Perform post-procedure dressing change at Day 5-10 unless there is obvious signs of bleeding or infection." />
                                     <ChecklistItem id="c12" label="Assess exit site and tunnel for trauma, swelling, or signs of infection." />
                                     <ChecklistItem id="c13" label="Instruct patient on their daily exit site and catheter care routine." />
                                     <ChecklistItem id="c14" label="Perform low volume PD exchanges to 'break in' the catheter and ensure proper function." />
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="item-4">
                                <AccordionTrigger className="text-lg font-semibold">Ongoing Support & Resources</AccordionTrigger>
                                <AccordionContent className="pl-2 space-y-2">
                                    <ChecklistItem id="c15" label="Review the list of RN contacts and other resources for ongoing patient support." />
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
