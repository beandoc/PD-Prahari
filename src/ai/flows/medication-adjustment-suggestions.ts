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
    })
  ).describe('A list of the patient medications.'),
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
  prompt: `You are an experienced clinician specializing in peritoneal dialysis. Your task is to analyze the provided patient data and suggest potential medication adjustments to optimize their treatment plan.  Provide reasoning for each suggestion based on the provided clinical history.

Patient ID: {{{patientId}}}

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
  - ExchangeDateTime: {{{ExchangeDateTime}}}, DialysateType: {{{DialysateType}}}, FillVolumeML: {{{FillVolumeML}}}, DwellTimeHours: {{{DwellTimeHours}}}, DrainVolumeML: {{{DrainVolumeML}}}, UltrafiltrationML: {{{UltrafiltrationML}}}, Complications: {{{Complications}}}, Notes: {{{Notes}}}
{{/each}}

Medications:
{{#each medications}}
  - MedicationName: {{{MedicationName}}}, Dosage: {{{Dosage}}}, Frequency: {{{Frequency}}}, StartDate: {{{StartDate}}}, EndDate: {{{EndDate}}}
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
