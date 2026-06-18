import BroadcastComposer from '../broadcast-composer';

export const dynamic = 'force-dynamic';

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
