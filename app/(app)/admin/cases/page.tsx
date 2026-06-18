import { CaseEditor } from '../case-editor';

export const dynamic = 'force-dynamic';

export default function AdminCasesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Cases</h1>
        <p className="text-muted-foreground mt-1">Author and edit cases &amp; guesstimates.</p>
      </div>
      <CaseEditor />
    </div>
  );
}
