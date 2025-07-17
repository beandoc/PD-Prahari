
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { useState, useEffect } from 'react';

export default function CalendarCard() {
  const [date, setDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    setDate(new Date());
  }, []);

  return (
    <Card>
      <CardContent className="p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="w-full"
        />
      </CardContent>
    </Card>
  );
}
