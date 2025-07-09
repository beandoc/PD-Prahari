'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Lightbulb, Loader2 } from 'lucide-react';
import type { PatientData } from '@/lib/types';
import { getSuggestionsAction } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AIMedicationToolProps {
  patientData: PatientData;
}

interface Suggestion {
  medicationName: string;
  suggestedChange: string;
  reasoning: string;
}

export default function AIMedicationTool({
  patientData,
}: AIMedicationToolProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);

  const handleGetSuggestions = async () => {
    setLoading(true);
    setError(null);
    setSuggestions(null);

    const result = await getSuggestionsAction(patientData);

    if (result.success && result.suggestions) {
      setSuggestions(result.suggestions);
    } else {
      setError(result.error || 'An unknown error occurred.');
    }
    setLoading(false);
  };

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-background to-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-primary" />
          AI Medication Analysis
        </CardTitle>
        <CardDescription>
          Use AI to analyze patient data and receive potential medication
          adjustment suggestions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleGetSuggestions}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Data...
            </>
          ) : (
            'Get AI Suggestions'
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {suggestions && (
          <div className="space-y-4">
            <h4 className="font-medium">Suggestions</h4>
            {suggestions.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {suggestions.map((suggestion, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-accent" />
                        <span>{suggestion.medicationName}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 pl-2">
                      <p>
                        <strong>Suggested Change:</strong>{' '}
                        {suggestion.suggestedChange}
                      </p>
                      <p>
                        <strong>Reasoning:</strong> {suggestion.reasoning}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
               <Alert>
                  <AlertTitle>No Immediate Adjustments Needed</AlertTitle>
                  <AlertDescription>
                    The AI analysis did not identify any immediate medication adjustments based on the provided data.
                  </AlertDescription>
                </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
