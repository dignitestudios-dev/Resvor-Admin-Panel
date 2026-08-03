'use client';

import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Bell className="h-6 w-6" /> Notifications Management
        </h1>
        <p className="text-muted-foreground">
          Send platform-wide notifications to users, managers, and bartenders
        </p>
      </div>

      <div className="rounded-xl border border-dashed p-12 flex flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full bg-muted p-5">
          <Bell className="h-10 w-10 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-1">Coming Soon</h2>
          <p className="text-muted-foreground max-w-md">
            The Notifications Management API is under development. This section will allow you to create and send push/email notifications to all users, lounge managers, bartenders, or selected accounts.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2 text-sm text-muted-foreground">
          {['All Users', 'Lounge Managers', 'Bartenders', 'Selected'].map((t) => (
            <div key={t} className="rounded-lg border px-3 py-2 bg-muted/40">
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
