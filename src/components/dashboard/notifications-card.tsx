
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bell, MessageSquare, Plus, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const notifications = [
    {
        icon: <MessageSquare className="h-5 w-5 text-blue-500" />,
        title: "You have 3 new messages",
        time: "1h ago",
        isNew: true,
    },
    {
        icon: <Plus className="h-5 w-5 text-green-500" />,
        title: "New treatment plan available",
        description: "For patient: John Smith",
        time: "3h ago",
        isNew: true,
    },
    {
        icon: <UserPlus className="h-5 w-5 text-purple-500" />,
        title: "New appointment request",
        description: "From patient: Sarah White",
        time: "1d ago",
        isNew: false,
    }
];

export default function NotificationsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <span>Notifications</span>
        </CardTitle>
        <CardDescription>Recent activity in your clinic.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {notifications.map((notification, index) => (
            <li key={index} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="mt-1">{notification.icon}</div>
              <div className="flex-1">
                <p className="font-medium text-sm">{notification.title}</p>
                {notification.description && <p className="text-xs text-muted-foreground">{notification.description}</p>}
                <p className="text-xs text-muted-foreground mt-0.5">{notification.time}</p>
              </div>
              {notification.isNew && <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>}
            </li>
          ))}
        </ul>
         <Button variant="outline" className="w-full">View All Notifications</Button>
      </CardContent>
    </Card>
  );
}
