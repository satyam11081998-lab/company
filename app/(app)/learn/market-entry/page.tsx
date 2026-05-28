import MarketEntryFramework from '@/components/MarketEntryFramework';

export default function MarketEntryPage() {
  return (
    <div className="container max-w-5xl py-10 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Market Entry Framework</h1>
        <p className="mt-1 text-muted-foreground">
          Interactive slide deck for mastering the Market Entry consulting framework.
        </p>
      </div>
      
      <MarketEntryFramework />
    </div>
  );
}
