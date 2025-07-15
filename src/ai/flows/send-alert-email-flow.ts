
'use server';
/**
 * @fileOverview A flow to send an email alert for critical patient events.
 *
 * - sendCloudyFluidAlert - Sends an email notification about a patient reporting cloudy PD fluid.
 * - CloudyFluidAlertInput - The input type for the sendCloudyFluidAlert function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Resend } from 'resend';

// Input schema for the alert flow
const CloudyFluidAlertInputSchema = z.object({
  patientName: z.string().describe('The full name of the patient.'),
  patientId: z.string().describe('The unique identifier for the patient.'),
  reportedAt: z.string().describe('The date and time the cloudy fluid was reported.'),
  physician: z.string().describe('The name of the attending physician.'),
  clinicPhoneNumber: z.string().optional().describe("The clinic's WhatsApp enabled phone number."),
});
export type CloudyFluidAlertInput = z.infer<typeof CloudyFluidAlertInputSchema>;

// Initialize Resend with the API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);
const clinicEmail = "nirogyam93@gmail.com";

// Tool for sending the email
const sendEmailTool = ai.defineTool(
  {
    name: 'sendEmail',
    description: 'Sends an email to the clinic staff.',
    inputSchema: z.object({
      to: z.string(),
      subject: z.string(),
      html: z.string(),
    }),
    outputSchema: z.void(),
  },
  async (input) => {
    try {
      await resend.emails.send({
        from: 'PD Prahari Alert <onboarding@resend.dev>',
        to: input.to,
        subject: input.subject,
        html: input.html,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      // It's important to handle errors, but for the flow, we might not want to stop everything.
      // Depending on requirements, you might throw an error here.
    }
  }
);

// Placeholder tool for sending a WhatsApp message
const sendWhatsAppMessageTool = ai.defineTool(
  {
    name: 'sendWhatsAppMessage',
    description: 'Sends a WhatsApp message to the clinic phone number.',
    inputSchema: z.object({
      to: z.string().describe('The destination WhatsApp number.'),
      body: z.string().describe('The content of the message.'),
    }),
    outputSchema: z.void(),
  },
  async (input) => {
    // This is a placeholder. In a real application, you would integrate
    // with a WhatsApp API provider like Twilio here.
    console.log(`--- SIMULATING WHATSAPP MESSAGE ---`);
    console.log(`To: ${input.to}`);
    console.log(`Body: ${input.body}`);
    console.log(`---------------------------------`);
    // Example with Twilio (requires 'twilio' package and credentials):
    // const twilio = require('twilio');
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({
    //   from: 'whatsapp:+14155238886', // Twilio's sandbox number
    //   body: input.body,
    //   to: `whatsapp:${input.to}`
    // });
  }
);


const prompt = ai.definePrompt({
    name: 'cloudyFluidAlertPrompt',
    input: { schema: CloudyFluidAlertInputSchema },
    tools: [sendEmailTool, sendWhatsAppMessageTool],
    prompt: `
        A critical alert has been reported for a patient.
        Patient Name: {{{patientName}}}
        Patient ID: {{{patientId}}}
        Attending Physician: {{{physician}}}
        Reported At: {{{reportedAt}}}
        Issue: Patient reported cloudy peritoneal dialysis fluid.
        This is a potential sign of peritonitis and requires immediate attention.
        
        1. Use the sendEmail tool to notify the clinic at ${clinicEmail}.
        2. Use the sendWhatsAppMessage tool to send an alert to the clinic's number: {{{clinicPhoneNumber}}}. The message body should be a concise alert summarizing the critical issue.
    `,
});

// The main flow function
const sendCloudyFluidAlertFlow = ai.defineFlow(
  {
    name: 'sendCloudyFluidAlertFlow',
    inputSchema: CloudyFluidAlertInputSchema,
    outputSchema: z.object({ status: z.string() }),
  },
  async (input) => {
    
    // Generate the email content using the prompt and instruct the model to use the tool
    const llmResponse = await prompt(input);
    
    // You can optionally check the LLM response or tool output here
    console.log("LLM response after tool call:", llmResponse.text);

    return { status: 'Alert email and WhatsApp process initiated.' };
  }
);


// Exported wrapper function
export async function sendCloudyFluidAlert(input: CloudyFluidAlertInput): Promise<{ status: string }> {
  return sendCloudyFluidAlertFlow(input);
}
