'use server';

/** MECE account actions on a CRM contact (MECE admins only; re-checked in lib/crm/server/account.ts). */
import { requireCrm } from '@/lib/crm/server/context';
import { run, str } from '@/lib/crm/server/action-util';
import { accountDetail, setDemo, setMarket, signOutAll } from '@/lib/crm/server/account';

export async function acctDetail(recordId: string) {
  return run(async () => JSON.parse(JSON.stringify(await accountDetail(await requireCrm(), str(recordId, 40)))));
}
export async function acctSetDemo(recordId: string, isDemo: boolean) {
  return run(async () => setDemo(await requireCrm(), str(recordId, 40), isDemo === true));
}
export async function acctSignOutAll(recordId: string) {
  return run(async () => signOutAll(await requireCrm(), str(recordId, 40)));
}
export async function acctSetMarket(recordId: string, market: string) {
  return run(async () => setMarket(await requireCrm(), str(recordId, 40), str(market, 4)));
}
