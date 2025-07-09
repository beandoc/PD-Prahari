
'use server';
/**
 * @fileOverview Provides medication adjustment suggestions based on patient data.
 *
 * - getMedicationAdjustmentSuggestions - A function that analyzes patient data and suggests potential medication adjustments.
 * - MedicationAdjustmentInput - The input type for the getMedicationAdjustmentSuggestions function.
 * - MedicationAdjustmentOutput - The return type for the getMedicationAdjustmentSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MedicationAdjustmentInputSchema = z.object({
  patientId: z.string().describe('The unique identifier for the patient.'),
  nephroId: z.string().describe('The nephrology-specific patient identifier.'),
  pdExchangeType: z.enum(['Assisted', 'Self']).describe('Whether the patient performs PD exchanges themselves or with assistance.'),
  vitals: z.array(
    z.object({
      MeasurementDateTime: z.string().describe('Date and Time of vital sign measurement'),
      SystolicBP: z.number().optional().describe('Systolic blood pressure (mmHg)'),
      DiastolicBP: z.number().optional().describe('Diastolic blood pressure (mmHg)'),
      HeartRateBPM: z.number().optional().describe('Heart rate (beats per minute)'),
      TemperatureCelsius: z.number().optional().describe('Temperature (Celsius)'),
      WeightKG: z.number().optional().describe('Weight (kilograms)'),
      RespiratoryRateBPM: z.number().optional().describe('Respiratory rate (breaths per minute)'),
      FluidStatusNotes: z.string().optional().describe('Notes on fluid status (e.g., edema)'),
    })
  ).describe('A list of the patient vital signs.'),
  labResults: z.array(
    z.object({
      ResultDateTime: z.string().describe('Date and Time lab was drawn/resulted'),
      TestName: z.string().describe('Name of the lab test (e.g., Creatinine, Urea, Potassium)'),
      ResultValue: z.number().describe('Numeric value of the lab result'),
      Units: z.string().describe('Units of the lab result (e.g., mg/dL, mmol/L)'),
      ReferenceRangeLow: z.number().optional().describe('Lower bound of the reference range'),
      ReferenceRangeHigh: z.number().optional().describe('Upper bound of the reference range'),
    })
  ).describe('A list of the patient lab results.'),
  pdEvents: z.array(
    z.object({
      ExchangeDateTime: z.string().describe('Date and Time of the PD exchange'),
      DialysateType: z.string().describe('Type of dialysate used (e.g., Dextrose 1.5%)'),
      FillVolumeML: z.number().describe('Volume of dialysate infused (mL)'),
      DwellTimeHours: z.number().describe('Duration the dialysate remained in the peritoneum (hours)'),
      DrainVolumeML: z.number().describe('Volume of fluid drained (mL)'),
      UltrafiltrationML: z.number().describe('Calculated ultrafiltration volume (mL)'),
      InflowTimeMinutes: z.number().optional().describe('Duration of dialysate inflow in minutes'),
      OutflowTimeMinutes: z.number().optional().describe('Duration of dialysate outflow in minutes'),
      isEffluentCloudy: z.boolean().optional().describe('Whether the drained fluid was cloudy.'),
      Complications: z.string().optional().describe('Complications during the exchange (e.g., Pain, Leakage)'),
      Notes: z.string().optional().describe('Additional notes on the exchange'),
    })
  ).describe('A list of the patient PD exchange events.'),
  medications: z.array(
    z.object({
      MedicationName: z.string().describe('Name of the medication'),
      Dosage: z.string().describe('Dosage of the medication (e.g., 10 mg)'),
      Frequency: z.string().describe('Frequency of the medication (e.g., Once daily, BID)'),
      StartDate: z.string().describe('Date the medication was started'),
      EndDate: z.string().nullable().describe('Date the medication was stopped (nullable if ongoing)'),
      PrescribingDoctor: z.string().optional().describe('The name of the prescribing doctor.'),
    })
  ).describe('A list of the patient medications.'),
  peritonitisEpisodes: z.array(
      z.object({
        DiagnosisDate: z.string().describe('Date of peritonitis diagnosis.'),
        OrganismIsolated: z.string().describe('The organism isolated from the culture.'),
        TreatmentRegimen: z.string().describe('The treatment regimen for the episode.'),
        Outcome: z.string().describe('The outcome of the episode.'),
        ResolutionDate: z.string().optional().describe('The date the episode was resolved.'),
      })
  ).describe('A list of the patient peritonitis episodes.'),
  urineOutputLogs: z.array(
    z.object({
      logDate: z.string().describe('The date of the urine output measurement.'),
      volumeML: z.number().describe('The total urine volume in mL for that day.'),
    })
  ).describe('A list of the patient daily urine output logs.'),
  pdAdequacy: z.array(
    z.object({
      testDate: z.string().describe('The date of the PD adequacy test.'),
      totalKtV: z.number().optional().describe('The total Kt/V value.'),
      peritonealKtV: z.number().optional().describe('The peritoneal Kt/V value.'),
    })
  ).describe('A list of the patient PD adequacy test results.'),
  patientReportedOutcomes: z.array(
    z.object({
        surveyDate: z.string().describe('The date the survey was completed.'),
        surveyTool: z.string().describe('The name of the survey tool used (e.g., KDQOL-36).'),
        score: z.number().describe('The overall score from the survey.'),
        summary: z.string().optional().describe('A brief summary of the survey results.'),
    })
  ).describe('A list of patient-reported outcome survey results.'),
}).describe('The data needed to generate medication adjustment suggestions.');

export type MedicationAdjustmentInput = z.infer<typeof MedicationAdjustmentInputSchema>;

const MedicationAdjustmentOutputSchema = z.object({
  suggestions: z.array(
    z.object({
      medicationName: z.string().describe('Name of the medication to adjust.'),
      suggestedChange: z.string().describe('Suggested change to the medication (e.g., increase dosage, decrease frequency, discontinue).'),
      reasoning: z.string().describe('Reasoning behind the suggested change, based on the patient data.'),
    })
  ).describe('A list of medication adjustment suggestions with reasoning.'),
}).describe('The medication adjustment suggestions.');

export type MedicationAdjustmentOutput = z.infer<typeof MedicationAdjustmentOutputSchema>;

export async function getMedicationAdjustmentSuggestions(input: MedicationAdjustmentInput): Promise<MedicationAdjustmentOutput> {
  return medicationAdjustmentSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'medicationAdjustmentSuggestionsPrompt',
  input: {schema: MedicationAdjustmentInputSchema},
  output: {schema: MedicationAdjustmentOutputSchema},
  prompt: `You are an experienced clinician specializing in peritoneal dialysis. Your task is to analyze the provided patient data and suggest potential medication adjustments to optimize their treatment plan. Provide reasoning for each suggestion based on the provided clinical history.

Patient ID: {{{patientId}}}
Nephro ID: {{{nephroId}}}
PD Exchange Type: {{{pdExchangeType}}}

Vitals:
{{#each vitals}}
  - MeasurementDateTime: {{{MeasurementDateTime}}}, SystolicBP: {{{SystolicBP}}}, DiastolicBP: {{{DiastolicBP}}}, HeartRateBPM: {{{HeartRateBPM}}}, TemperatureCelsius: {{{TemperatureCelsius}}}, WeightKG: {{{WeightKG}}}, RespiratoryRateBPM: {{{RespiratoryRateBPM}}}, FluidStatusNotes: {{{FluidStatusNotes}}}
{{/each}}

Lab Results:
{{#each labResults}}
  - ResultDateTime: {{{ResultDateTime}}}, TestName: {{{TestName}}}, ResultValue: {{{ResultValue}}}, Units: {{{Units}}}, ReferenceRangeLow: {{{ReferenceRangeLow}}}, ReferenceRangeHigh: {{{ReferenceRangeHigh}}}
{{/each}}

PD Exchange Data:
{{#each pdEvents}}
  - ExchangeDateTime: {{{ExchangeDateTime}}}, DialysateType: {{{DialysateType}}}, FillVolumeML: {{{FillVolumeML}}}, DwellTimeHours: {{{DwellTimeHours}}}, DrainVolumeML: {{{DrainVolumeML}}}, UltrafiltrationML: {{{UltrafiltrationML}}}, Cloudy Fluid: {{#if isEffluentCloudy}}Yes{{else}}No{{/if}}, Complications: {{{Complications}}}, Notes: {{{Notes}}}
{{/each}}

Peritonitis History:
{{#if peritonitisEpisodes}}
{{#each peritonitisEpisodes}}
  - Diagnosis: {{{DiagnosisDate}}}, Organism: {{{OrganismIsolated}}}, Outcome: {{{Outcome}}}, Treatment: {{{TreatmentRegimen}}}
{{/each}}
{{else}}
  - No history of peritonitis.
{{/if}}

Medications:
{{#each medications}}
  - MedicationName: {{{MedicationName}}}, Dosage: {{{Dosage}}}, Frequency: {{{Frequency}}}, StartDate: {{{StartDate}}}, EndDate: {{{EndDate}}}, Prescribed by: {{{PrescribingDoctor}}}
{{/each}}

Urine Output (Recent):
{{#each urineOutputLogs}}
 - Date: {{{logDate}}}, Volume: {{{volumeML}}} mL
{{/each}}

PD Adequacy (Kt/V):
{{#each pdAdequacy}}
 - Date: {{{testDate}}}, Total Kt/V: {{{totalKtV}}}, Peritoneal Kt/V: {{{peritonealKtV}}}
{{/each}}

Patient Reported Outcomes:
{{#each patientReportedOutcomes}}
 - Date: {{{surveyDate}}}, Tool: {{{surveyTool}}}, Score: {{{score}}}, Summary: {{{summary}}}
{{/each}}

Based on this information, provide medication adjustment suggestions with reasoning.`,
});

const medicationAdjustmentSuggestionsFlow = ai.defineFlow(
  {
    name: 'medicationAdjustmentSuggestionsFlow',
    inputSchema: MedicationAdjustmentInputSchema,
    outputSchema: MedicationAdjustmentOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
