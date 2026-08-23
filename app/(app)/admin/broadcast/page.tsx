import BroadcastComposer from '../broadcast-composer';

export const dynamic = 'force-dynamic';

// Bulk email over free Gmail/Workspace SMTP sends sequentially, so a
// few-hundred-recipient broadcast can run well past the default serverless
// timeout. Give server actions invoked from this route the maximum budget
// (Vercel caps this to the plan's limit, so it is safe to request 300).
export const maxDuration = 300;

export default function AdminBroadcastPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Broadcast</h1>
        <p className="text-muted-foreground mt-1">Compose and send an email broadcast.</p>
      </div>
      <BroadcastComposer />
    </div>
  );
}
