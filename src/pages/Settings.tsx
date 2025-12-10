import { Settings as SettingsIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Settings() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your application settings</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <SettingsIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle>Demo Mode</CardTitle>
              <CardDescription>
                This is a demo application with simulated responses
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This application is currently running in demo mode. All data is stored in memory and
            will be reset when you refresh the page. Chat responses are simulated.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            To connect to a real backend, you'll need to integrate with your Haystack Python
            server and update the API endpoints.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
