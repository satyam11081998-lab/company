import { redirect } from 'next/navigation';

export default function CasesRedirect() {
  redirect('/practice?tab=cases');
}
