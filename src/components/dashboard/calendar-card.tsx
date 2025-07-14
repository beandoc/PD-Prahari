
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { useState, useEffect } from 'react';

export default function CalendarCard() {
  // 1. Initialize the date state to undefined.
  //    This ensures the server and the initial client render are the same.
  const [date, setDate] = useState<Date | undefined>(undefined);

  // 2. After the component mounts on the client, set the date.
  //    This runs *after* hydration, preventing the mismatch.
  useEffect(() => {
    setDate(new Date());
  }, []); // The empty array ensures this runs only once on mount.

  // 3. The Calendar will now render with no date selected on the server
  //    and on the initial client render, matching perfectly.
  //    It will then re-render with today's date selected once the
  //    useEffect hook runs.
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
