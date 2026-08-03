'use client';

import { MessageCircle } from 'lucide-react';

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <MessageCircle className="h-6 w-6" /> Chat Monitoring
        </h1>
        <p className="text-muted-foreground">
          Monitor platform conversations and flagged messages
        </p>
      </div>

      <div className="rounded-xl border border-dashed p-12 flex flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full bg-muted p-5">
          <MessageCircle className="h-10 w-10 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-1">Coming Soon</h2>
          <p className="text-muted-foreground max-w-md">
            The Chat Monitoring API is under development. This section will provide full conversation monitoring, message search, flagged chat reports, and user blocking capabilities.
          </p>
        </div>
      </div>
    </div>
  );
}
