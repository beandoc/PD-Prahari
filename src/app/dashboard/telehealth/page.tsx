
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, ScreenShare } from 'lucide-react';
import { useState } from 'react';

export default function TelehealthPage() {
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Telehealth Session</h1>
          <p className="text-muted-foreground mt-1">Connect with your care team remotely.</p>
        </header>

        <div className="space-y-8">
          <Card className="overflow-hidden w-full">
              <div className="relative aspect-video bg-black rounded-t-lg flex items-center justify-center">
                  <p className="text-2xl text-gray-500">Doctor's Video Feed</p>

                  {/* Self view */}
                  <div className="absolute bottom-4 right-4 h-1/4 w-1/4 bg-gray-800 border-2 border-gray-600 rounded-md flex items-center justify-center">
                       { isVideoOff ? <VideoOff className="h-8 w-8 text-gray-400" /> : <p className="text-sm text-gray-400">You</p> }
                  </div>
              </div>
              <CardContent className="bg-gray-100 p-4 flex justify-center items-center gap-4">
                  <Button variant={isMuted ? 'destructive' : 'secondary'} size="icon" className="rounded-full w-14 h-14" onClick={() => setIsMuted(!isMuted)}>
                     { isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" /> }
                  </Button>
                  <Button variant={isVideoOff ? 'destructive' : 'secondary'} size="icon" className="rounded-full w-14 h-14" onClick={() => setIsVideoOff(!isVideoOff)}>
                     { isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" /> }
                  </Button>
                   <Button variant="secondary" size="icon" className="rounded-full w-14 h-14">
                     <ScreenShare className="h-6 w-6" />
                  </Button>
                   <Button variant="destructive" size="icon" className="rounded-full w-14 h-14">
                     <PhoneOff className="h-6 w-6" />
                  </Button>
              </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Session Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <p><strong>Topic:</strong> Routine Follow-up</p>
                    <p><strong>With:</strong> Dr. Sharma, Ajay</p>
                    <p><strong>Time:</strong> In Progress</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    <Button variant="outline">
                        <MessageSquare className="mr-2 h-4 w-4" /> Chat with Support
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                        If you are having technical difficulties, please contact our support line at 555-0199.
                    </p>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
