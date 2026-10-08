'use client';

export default function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="rounded-md bg-black px-3 py-1.5 text-sm text-white">
      Print / Save as PDF
    </button>
  );
}
