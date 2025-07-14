
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { allPatientData } from '@/data/mock-data';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { format, parseISO } from 'date-fns';

const ChecklistItem = ({ id, label }: { id: string, label: string }) => (
    <div className="flex items-center space-x-3 py-2">
        <Checkbox id={id} />
        <Label htmlFor={id} className="text-sm font-normal leading-snug">{label}</Label>
    </div>
);

const SubList = ({ items }: { items: string[] }) => (
    <ul className="list-disc list-inside pl-4 space-y-1 mt-1">
        {items.map((item, index) => <li key={index} className="text-sm">{item}</li>)}
    </ul>
);

const MetricItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="font-semibold">{value || 'N/A'}</p>
    </div>
);

const FlagItem = ({ label, isFlagged, children }: { label: string, isFlagged: boolean, children: React.ReactNode }) => (
    <div>
        <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
        <Badge variant={isFlagged ? 'destructive' : 'secondary'} className={!isFlagged ? 'bg-green-100 text-green-800 border-green-200' : ''}>
            {children}
        </Badge>
    </div>
);


export default function NurseChecklistPage() {
    const patient = allPatientData[0]; // Using first patient for demonstration

    const latestKtV = patient.pdAdequacy.length > 0 ? patient.pdAdequacy.sort((a,b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime())[0].totalKtV : undefined;
    const latestAlbumin = patient.labResults.filter(lr => lr.testName === 'Albumin').sort((a,b) => new Date(b.resultDateTime).getTime() - new Date(a.resultDateTime).getTime())[0]?.resultValue;
    const latestHgb = patient.labResults.filter(lr => lr.testName === 'Hemoglobin').sort((a,b) => new Date(b.resultDateTime).getTime() - new Date(a.resultDateTime).getTime())[0]?.resultValue;
    const peritonitisCount = patient.peritonitisEpisodes.length;

    const fullAddress = [patient.addressLine1, patient.city, patient.postalCode].filter(Boolean).join(', ');

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
            <div className="max-w-5xl mx-auto space-y-8">
                <header className="text-center space-y-2">
                    <h1 className="text-4xl font-bold text-primary">Nurse Checklist for PD Patient Success</h1>
                    <p className="text-lg text-muted-foreground">
                        A guide for the first 90 days on PD therapy, accompanied by a patient reference sheet.
                    </p>
                </header>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Patient Reference Sheet</CardTitle>
                        <CardDescription>Key data and risk factors for {patient.firstName} {patient.lastName}. Last updated: {patient.lastUpdated ? format(parseISO(patient.lastUpdated), 'PPP') : 'N/A'}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                           <MetricItem label="Patient Name" value={`${patient.firstName} ${patient.lastName}`} />
                           <MetricItem label="Date of Birth" value={format(parseISO(patient.dateOfBirth), 'PPP')} />
                           <MetricItem label="Patient Number" value={patient.nephroId} />
                           <MetricItem label="Telephone" value={patient.contactPhone} />
                           <MetricItem label="Address" value={fullAddress} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                            <MetricItem label="PD Training Start" value={patient.pdStartDate ? format(parseISO(patient.pdStartDate), 'PPP') : 'N/A'} />
                            <MetricItem label="PD Training End" value={patient.pdTrainingEndDate ? format(parseISO(patient.pdTrainingEndDate), 'PPP') : 'N/A'} />
                            <MetricItem label="Last Home Visit" value={patient.lastHomeVisitDate ? format(parseISO(patient.lastHomeVisitDate), 'PPP') : 'N/A'} />
                            <MetricItem label="Last PET Test" value={patient.pdAdequacy.length > 0 ? format(parseISO(patient.pdAdequacy[0].testDate), 'PPP') : 'N/A'} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm items-start">
                           <MetricItem label="Transport Type" value={patient.membraneTransportType} />
                           <FlagItem label="Kt/V < 1.72" isFlagged={!!latestKtV && latestKtV < 1.72}>
                                {latestKtV ? `Value: ${latestKtV.toFixed(2)}` : 'No Data'}
                           </FlagItem>
                           <FlagItem label="Albumin < 4.0 g/dL" isFlagged={!!latestAlbumin && latestAlbumin < 4.0}>
                                {latestAlbumin ? `Value: ${latestAlbumin.toFixed(1)}` : 'No Data'}
                           </FlagItem>
                            <FlagItem label="Hgb < 10 g/dL" isFlagged={!!latestHgb && latestHgb < 10.0}>
                                {latestHgb ? `Value: ${latestHgb.toFixed(1)}` : 'No Data'}
                           </FlagItem>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                            <MetricItem label="Catheter Dysfunction" value={patient.catheterDysfunction ? 'Yes' : 'No'} />
                            <MetricItem label="Exit Site Infections" value={patient.esiCount} />
                            <MetricItem label="Peritonitis Episodes" value={peritonitisCount} />
                            <MetricItem label="Hospitalizations" value={patient.hospitalizationsCount} />
                        </div>
                         <div>
                             <Label className="font-semibold">Additional Notes</Label>
                             <Textarea readOnly defaultValue={patient.additionalNotes || 'No additional notes.'} className="mt-1 bg-slate-50 font-sans" rows={3}/>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Best Demonstrated Practices</CardTitle>
                        <CardDescription>Use this checklist to avoid the main causes of PD dropout: Infection, Catheter Issues, Inadequate Dialysis, and Psychosocial Barriers.</CardDescription>
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
                                     <ChecklistItem id="c13" label="Instruct patient on their daily exit site and catheter care routine, including the use of Mupirocin or Gentamicin Cream." />
                                     <ChecklistItem id="c14" label="Perform low volume PD exchanges to 'break in' the catheter and ensure proper function." />
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="month1-week1">
                                <AccordionTrigger className="text-lg font-semibold">Month 1: Week 1</AccordionTrigger>
                                <AccordionContent className="pl-2 space-y-2">
                                    <ChecklistItem id="w1-1" label="Evaluate patient's preferred learning style to individualize training: auditory, visual, or kinesthetic." />
                                    <ChecklistItem id="w1-2" label="Discuss individual training needs (days/time) based on work/life schedule." />
                                    <ChecklistItem id="w1-3" label="Educate patient on potential concerns: Constipation, Pericatheter leaks, Flow dysfunction, Suspected contamination." />
                                    <ChecklistItem id="w1-4" label="Review hand hygiene and aseptic technique." />
                                    <ChecklistItem id="w1-5" label="Instruct patient on keeping the PD environment clean." />
                                    <ChecklistItem id="w1-6" label="Provide continued exit site care instructions." />
                                    <ChecklistItem id="w1-7" label="Design an individualized PD prescription." />
                                    <ChecklistItem id="w1-8" label="Ensure patient is added to MyBaxter Customer Service Portal." />
                                    <ChecklistItem id="w1-9" label="Arrange for 24-hour urine collection and baseline bloodwork." />
                                    <ChecklistItem id="w1-10" label="Discuss integrating home life to PD routine (clinic review, supplies, home visits)." />
                                    <ChecklistItem id="w1-11" label="Order PD supplies for home delivery." />
                                    <ChecklistItem id="w1-12" label="Schedule next week’s appointments for dressing change/flush." />
                                    <ChecklistItem id="w1-13" label="Assess patient treatments using remote patient management if on an enabled APD device." />
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="month1-week2">
                                <AccordionTrigger className="text-lg font-semibold">Month 1: Week 2</AccordionTrigger>
                                <AccordionContent className="pl-2 space-y-2">
                                    <ChecklistItem id="w2-1" label="Proactively contact patient to provide support and evaluation." />
                                    <ChecklistItem id="w2-2" label="Assess individual support needed (work, home, school, family/lifestyle)." />
                                    <ChecklistItem id="w2-3" label="Identify where your patient is on the grief cycle." />
                                    <ChecklistItem id="w2-4" label="Explain the importance of waste-disposal." />
                                    <ChecklistItem id="w2-5" label="Review how to assess effluent for cloudiness." />
                                    <ChecklistItem id="w2-6" label="Assess exit site and tunnel for trauma, s/s infection." />
                                    <ChecklistItem id="w2-7" label="Review peritonitis and antibiotic protocol, including how to manage after hours." />
                                    <ChecklistItem id="w2-8" label="Review clinic’s after-hours policy regarding possible contamination and on-call contact info." />
                                    <ChecklistItem id="w2-9" label="Assess any barriers (modality related: peritonitis, catheter, exit site and tunnel infections)." />
                                    <ChecklistItem id="w2-10" label="Schedule next week’s appointments." />
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="month1-week3">
                                <AccordionTrigger className="text-lg font-semibold">Month 1: Week 3</AccordionTrigger>
                                <AccordionContent className="pl-2 space-y-2">
                                    <ChecklistItem id="w3-1" label="Proactively contact patient to provide support and evaluation and congratulate them on their PD journey." />
                                    <ChecklistItem id="w3-2" label="Schedule next week’s appointments and schedule a PET test between 4-8 weeks." />
                                    <ChecklistItem id="w3-3" label="Have patient take inventory of home supplies." />
                                    <div>
                                        <ChecklistItem id="w3-4" label="Review the importance of retraining including:" />
                                        <SubList items={[
                                            "Dialysis exchange procedures",
                                            "Hand-washing techniques",
                                            "Recognition of signs and symptoms of peritonitis",
                                            "Recognition of contamination and the appropriate response to it",
                                            "Exit site care"
                                        ]} />
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="month1-week4">
                                <AccordionTrigger className="text-lg font-semibold">Month 1: Week 4</AccordionTrigger>
                                <AccordionContent className="pl-2 space-y-2">
                                    <ChecklistItem id="w4-1" label="Proactively contact patient to provide support and evaluation." />
                                    <ChecklistItem id="w4-2" label="Discuss patient’s sleep patterns and getting a good night’s sleep on PD." />
                                    <ChecklistItem id="w4-3" label="Discuss patient’s exercise schedule and its importance to wellness." />
                                    <ChecklistItem id="w4-4" label="Discuss any individual support needs: Work/Home/Family/School/Lifestyle." />
                                    <ChecklistItem id="w4-5" label="Schedule next week’s appointments." />
                                    <ChecklistItem id="w4-6" label="Remind patient of upcoming specimen collection procedure." />
                                    <ChecklistItem id="w4-7" label="Review mobile ordering with patient and order supplies as needed." />
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="month2-week5">
                                <AccordionTrigger className="text-lg font-semibold">Month 2: Week 5 (Monthly Evaluation)</AccordionTrigger>
                                <AccordionContent className="pl-2 space-y-2">
                                    <div>
                                        <ChecklistItem id="m2w5-1" label="Conduct monthly evaluation of the patient, including:" />
                                        <SubList items={[
                                            "Bloodwork to assess for appropriateness of the PD prescription including dwell time and dialysate tonicity",
                                            "Review of fluid balance: BP, Temp, Weight, Vital signs",
                                            "Assess any changes in Residual Kidney Function (RKF)",
                                            "Assessment of nutritional status; estimation of dietary protein intake",
                                            "Review of hand hygiene and aseptic technique and reminders of proper exit site care",
                                            "Ensure catheter is secure",
                                            "Compliance with treatment plan",
                                            "Retraining needs",
                                        ]} />
                                    </div>
                                    <ChecklistItem id="m2w5-2" label="Perform PET evaluation for baseline peritoneal membrane transport characteristics." />
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="month2-week6">
                                <AccordionTrigger className="text-lg font-semibold">Month 2: Week 6</AccordionTrigger>
                                <AccordionContent className="pl-2 space-y-2">
                                    <ChecklistItem id="m2w6-1" label="Assess how is the patient coping and if additional support is needed (Social Worker to conduct a formal 'coping evaluation')." />
                                    <ChecklistItem id="m2w6-2" label="Introduce patient to a peer mentor." />
                                    <ChecklistItem id="m2w6-3" label="Review PET results and determine if it needs to be repeated." />
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="month2-week7">
                                <AccordionTrigger className="text-lg font-semibold">Month 2: Week 7</AccordionTrigger>
                                <AccordionContent className="pl-2 space-y-2">
                                     <ChecklistItem id="m2w7-1" label="Proactively contact patient to provide support, evaluation, and congratulations." />
                                     <ChecklistItem id="m2w7-2" label="Review patient’s support system and provide online support/resource tools." />
                                     <ChecklistItem id="m2w7-3" label="Identify and document where patient is on the grief cycle; assess for depression and anxiety." />
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="month2-week8">
                                <AccordionTrigger className="text-lg font-semibold">Month 2: Week 8</AccordionTrigger>
                                <AccordionContent className="pl-2 space-y-2">
                                     <ChecklistItem id="m2w8-1" label="Proactively contact patient to provide support and evaluation." />
                                     <ChecklistItem id="m2w8-2" label="Discuss employment and traveling while on PD." />
                                     <ChecklistItem id="m2w8-3" label="Readdress any system-related barriers (e.g., education, training)." />
                                     <ChecklistItem id="m2w8-4" label="Discuss any individual support needs: Work/Home/Family/School/Lifestyle." />
                                </AccordionContent>
                            </AccordionItem>
                              <AccordionItem value="month3-week9">
                                <AccordionTrigger className="text-lg font-semibold">Month 3: Week 9 (Monthly Evaluation)</AccordionTrigger>
                                <AccordionContent className="pl-2 space-y-2">
                                     <div>
                                        <ChecklistItem id="m3w9-1" label="Conduct monthly evaluation of the patient, including:" />
                                        <SubList items={[
                                            "Bloodwork to assess for appropriateness of the PD prescription",
                                            "Review of fluid balance: BP, Temp, Weight, Vital signs",
                                            "Assess any changes in Residual Kidney Function (RKF)",
                                            "Assessment of nutritional status; estimation of dietary protein intake",
                                            "Review of hand hygiene, aseptic technique, and exit site care",
                                            "Ensure catheter is secure",
                                            "Compliance with treatment plan and retraining needs",
                                            "Check PD supplies"
                                        ]} />
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="month3-week10">
                                <AccordionTrigger className="text-lg font-semibold">Month 3: Week 10</AccordionTrigger>
                                <AccordionContent className="pl-2 space-y-2">
                                    <ChecklistItem id="m3w10-1" label="Complete a home visit in the first 90 days of PD therapy or by completion of patient training." />
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="month3-week11">
                                <AccordionTrigger className="text-lg font-semibold">Month 3: Week 11</AccordionTrigger>
                                <AccordionContent className="pl-2 space-y-2">
                                    <ChecklistItem id="m3w11-1" label="Proactively contact patient to provide support, evaluation, and congratulations." />
                                    <ChecklistItem id="m3w11-2" label="Discuss having intimate relationships while on PD." />
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="month3-week12">
                                <AccordionTrigger className="text-lg font-semibold">Month 3: Week 12</AccordionTrigger>
                                <AccordionContent className="pl-2 space-y-2">
                                    <ChecklistItem id="m3w12-1" label="Set up a 'refresher' training session for the patient." />
                                    <div>
                                        <ChecklistItem id="m3w12-2" label="Review the importance of retraining including:" />
                                        <SubList items={[
                                            "Dialysis exchange procedures",
                                            "Hand-washing techniques",
                                            "Recognition of signs and symptoms of peritonitis",
                                            "Recognition of contamination and the appropriate response to it",
                                            "Exit site care"
                                        ]} />
                                    </div>
                                     <ChecklistItem id="m3w12-3" label="Discuss any individual support needs: Work/Home/Family/School/Lifestyle." />
                                     <ChecklistItem id="m3w12-4" label="Readdress any patient-related barriers (burnout, distance, nutrition, Kt/V)." />
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="month3-week13">
                                <AccordionTrigger className="text-lg font-semibold">Month 3: Week 13</AccordionTrigger>
                                <AccordionContent className="pl-2 space-y-2">
                                    <ChecklistItem id="m3w13-1" label="Proactively contact patient and congratulate them on completing the first 90 days. Assure them that you will continue to provide guidance and support." />
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="item-adequacy">
                                <AccordionTrigger className="text-lg font-semibold">PD Adequacy Best Practices</AccordionTrigger>
                                <AccordionContent className="pl-2 space-y-2">
                                    <ChecklistItem id="adeq-1" label="Work with Nephrologist to utilize non-dextrose, isoosmolar solutions to improve UF in long dwells for high-average transporters." />
                                    <ChecklistItem id="adeq-2" label="For APD, avoid cycler nighttime dwells less than 120 minutes for average transporters to ensure sodium removal." />
                                    <ChecklistItem id="adeq-3" label="Initiate or increase diuretics for patients with a Residual Kidney Function (RKF) > 100 ml/day." />
                                    <ChecklistItem id="adeq-4" label="Ensure no dry day or night without adequate RKF to assure middle molecule clearance." />
                                    <div>
                                        <ChecklistItem id="adeq-5" label="Administer or repeat a Peritoneal Equilibration Test (PET) when clinically indicated, such as:" />
                                        <SubList items={[
                                            "Presence of unexplained volume overload",
                                            "Decreasing drain volume (DV) on overnight (CAPD) or daytime (APD) dwells",
                                            "Increasing clinical need for Hypertonic Dialysate dwells",
                                            "Worsening hypertension",
                                            "Change in measured Peritoneal Solute Removal (Kt/V Urea)",
                                            "Unexplained signs or symptoms of Uremia"
                                        ]} />
                                    </div>
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
