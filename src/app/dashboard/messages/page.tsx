
'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Send, MessageSquare, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getLiveAllPatientData } from '@/app/actions';
import type { PatientData } from '@/lib/types';

const messages = {
    '1': [
        { from: 'other', text: 'Hi Rohan, your latest lab results are in. Everything looks stable.', time: '10:40 AM' },
        { from: 'me', text: 'That\'s great news!', time: '10:41 AM' },
        { from: 'other', text: 'Keep up the good work with your logs.', time: '10:41 AM' },
        { from: 'me', text: 'Okay, thank you, doctor.', time: '10:42 AM' },
    ],
    '2': [
        { from: 'other', text: 'Please check the latest checklist for Priya D.', time: '9:15 AM' },
    ],
    '3': [
         { from: 'other', text: 'The fluid bag looks cloudy, what should I do?', time: 'Yesterday' },
    ]
};


export default function MessagesPage() {
    const [allPatientData, setAllPatientData] = useState<PatientData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<any>(null);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const data = await getLiveAllPatientData();
            setAllPatientData(data);
            
            if (data.length > 0) {
                const generatedConversations = [
                    { id: 1, name: `${data[0].firstName} ${data[0].lastName}`, role: 'Patient', lastMessage: 'Okay, thank you, doctor.', time: '10:42 AM', unread: 0, avatar: '/patient-avatar-1.png' },
                    { id: 2, name: 'PD Nurse Team', role: 'Nurse', lastMessage: 'Please check the latest checklist for Priya D.', time: '9:15 AM', unread: 2, avatar: '/nurse-avatar.png' },
                ];
                if (data.length > 2) {
                    generatedConversations.push(
                        { id: 3, name: `${data[2].firstName} ${data[2].lastName}`, role: 'Patient', lastMessage: 'The fluid bag looks cloudy, what should I do?', time: 'Yesterday', unread: 1, avatar: '/patient-avatar-2.png' }
                    );
                }
                setConversations(generatedConversations);
                setSelectedConversation(generatedConversations[0]);
            }
            setIsLoading(false);
        }
        fetchData();
    }, []);
    
    const handleSendMessage = () => {
        if (newMessage.trim() && selectedConversation) {
            // In a real app, this would send the message to a backend
            console.log(`Sending message to ${selectedConversation.name}: ${newMessage}`);
            setNewMessage('');
        }
    };

    if (isLoading) {
        return (
             <Card className="h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             </Card>
        )
    }

    if (!selectedConversation) {
         return (
             <Card className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">No conversations to display.</p>
             </Card>
        )
    }

    return (
        <div className="h-[calc(100vh-100px)]">
            <Card className="h-full flex">
                {/* Sidebar with conversations */}
                <div className="w-1/3 border-r flex flex-col">
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-bold flex items-center gap-2"><MessageSquare /> Messages</h2>
                        <div className="relative mt-2">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search messages..." className="pl-8" />
                        </div>
                    </div>
                    <ScrollArea className="flex-1">
                        {conversations.map(convo => (
                            <div key={convo.id}
                                 className={cn(
                                     "p-4 cursor-pointer border-b flex items-start gap-3 hover:bg-muted/50",
                                     selectedConversation.id === convo.id && 'bg-muted'
                                 )}
                                 onClick={() => setSelectedConversation(convo)}>
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={convo.avatar} alt={convo.name} />
                                    <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold truncate">{convo.name}</h3>
                                        <p className="text-xs text-muted-foreground">{convo.time}</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                                        {convo.unread > 0 && (
                                            <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                                {convo.unread}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </ScrollArea>
                </div>
                {/* Main chat window */}
                <div className="w-2/3 flex flex-col">
                    <div className="p-4 border-b flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.name} />
                            <AvatarFallback>{selectedConversation.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-semibold">{selectedConversation.name}</h3>
                            <p className="text-sm text-muted-foreground">{selectedConversation.role}</p>
                        </div>
                    </div>
                    <ScrollArea className="flex-1 bg-slate-50 p-4">
                        <div className="space-y-4">
                            {(messages[selectedConversation.id] || []).map((msg, index) => (
                                <div key={index} className={cn(
                                    "flex items-end gap-2",
                                    msg.from === 'me' ? 'justify-end' : 'justify-start'
                                )}>
                                    <div className={cn(
                                        "p-3 rounded-lg max-w-sm",
                                        msg.from === 'me' ? 'bg-primary text-primary-foreground' : 'bg-white border'
                                    )}>
                                        <p>{msg.text}</p>
                                        <p className={cn(
                                            "text-xs mt-1",
                                            msg.from === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                        )}>{msg.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                    <div className="p-4 border-t bg-white">
                        <div className="relative">
                            <Input 
                                placeholder="Type a message..." 
                                className="pr-16"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <Button 
                                size="icon" 
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-10"
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim()}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
