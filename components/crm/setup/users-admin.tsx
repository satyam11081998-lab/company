'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { setupAddUser, setupDeleteConfig, setupSaveRole, setupUpdateUser } from '@/app/(app)/crm/setup/actions';

interface Member { id: string; name: string; email: string; isAdmin: boolean; roleId: string | null; profileId: string | null; active: boolean }
interface Role { id: string; name: string; parentId: string | null; shareWithPeers: boolean }
interface Profile { id: string; name: string; description: string }

const sel = 'h-8 rounded-md border border-border bg-background px-2 text-sm';

export default function UsersAdmin({ me, members, roles, profiles }: { me: string; members: Member[]; roles: Role[]; profiles: Profile[] }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState(roles.find((r) => r.parentId)?.id ?? roles[0]?.id ?? '');
  const [profileId, setProfileId] = useState(profiles.find((p) => p.name !== 'Administrator')?.id ?? profiles[0]?.id ?? '');
  const [roleEdit, setRoleEdit] = useState<Role | null>(null);

  const add = async () => {
    const r = await setupAddUser(email, roleId, profileId);
    if (!r.ok) return toast.error(r.error);
    toast.success('Added to the CRM');
    setEmail('');
    router.refresh();
  };
  const upd = async (id: string, patch: { roleId?: string; profileId?: string; active?: boolean }) => {
    const r = await setupUpdateUser(id, patch);
    if (!r.ok) return toast.error(r.error);
    router.refresh();
  };

  // role tree rendering
  const kids = (pid: string | null) => roles.filter((r) => r.parentId === pid);
  const tree = (pid: string | null, depth: number): React.ReactNode[] => kids(pid).flatMap((r) => [
    <li key={r.id} className="flex items-center justify-between py-1" style={{ paddingLeft: depth * 18 }}>
      <span>{depth > 0 && <span className="mr-1 text-muted-foreground">└</span>}{r.name}{r.shareWithPeers && <span className="ml-2 text-xs text-muted-foreground">shares with peers</span>}
        <span className="ml-2 text-xs text-muted-foreground">({members.filter((m) => m.roleId === r.id).length})</span></span>
      <button type="button" onClick={() => setRoleEdit(r)} className="text-xs text-navy hover:underline">Edit</button>
    </li>,
    ...tree(r.id, depth + 1),
  ]);

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Users, roles and profiles</h1>

      <section className="rounded-lg border border-border bg-card">
        <h2 className="border-b border-border px-4 py-2 text-sm font-semibold">CRM users</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-left text-xs text-muted-foreground"><tr><th className="px-4 py-2">Person</th><th className="px-4 py-2">Role</th><th className="px-4 py-2">Profile</th><th className="px-4 py-2">Status</th></tr></thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-t border-border">
                  <td className="px-4 py-2"><p className="font-medium">{m.name}{m.id === me && ' (you)'}</p><p className="text-xs text-muted-foreground">{m.email}</p></td>
                  {m.isAdmin ? (
                    <td colSpan={3} className="px-4 py-2 text-xs text-muted-foreground">MECE admin — always a CRM Administrator (change in /admin/users)</td>
                  ) : (
                    <>
                      <td className="px-4 py-2"><select className={sel} value={m.roleId ?? ''} onChange={(e) => upd(m.id, { roleId: e.target.value })}>{roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></td>
                      <td className="px-4 py-2"><select className={sel} value={m.profileId ?? ''} onChange={(e) => upd(m.id, { profileId: e.target.value })}>{profiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></td>
                      <td className="px-4 py-2"><button type="button" onClick={() => upd(m.id, { active: !m.active })} className={`text-xs ${m.active ? 'text-destructive' : 'text-navy'} hover:underline`}>{m.active ? 'Deactivate' : 'Reactivate'}</button></td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3 text-sm">
          <input className="h-8 w-64 rounded-md border border-border bg-background px-2" placeholder="Their MECE account email" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" />
          <select className={sel} value={roleId} onChange={(e) => setRoleId(e.target.value)} aria-label="Role">{roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
          <select className={sel} value={profileId} onChange={(e) => setProfileId(e.target.value)} aria-label="Profile">{profiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
          <button type="button" onClick={add} disabled={!email.includes('@')} className="h-8 rounded-md bg-navy px-3 text-navy-foreground disabled:opacity-50">Add user</button>
          <p className="w-full text-xs text-muted-foreground">They sign in with their normal MECE account and see only /crm, limited by their profile. They don’t get the rest of the admin area.</p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-card p-4 text-sm">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">Role hierarchy</h2>
            <button type="button" onClick={() => setRoleEdit({ id: '', name: '', parentId: roles.find((r) => !r.parentId)?.id ?? null, shareWithPeers: false })} className="text-xs text-navy hover:underline">+ Role</button>
          </div>
          <p className="mb-2 text-xs text-muted-foreground">Managers see and edit their team’s records. Peers see each other’s only if “share with peers” is on.</p>
          <ul>{tree(null, 0)}</ul>
          {roleEdit && <RoleEditor role={roleEdit} roles={roles} onDone={() => { setRoleEdit(null); router.refresh(); }} />}
        </section>
        <section className="rounded-lg border border-border bg-card p-4 text-sm">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">Profiles</h2>
            <Link href="/crm/setup/profiles/new" className="text-xs text-navy hover:underline">+ Profile</Link>
          </div>
          <ul className="divide-y divide-border">
            {profiles.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2">
                <span><span className="font-medium">{p.name}</span><span className="block text-xs text-muted-foreground">{p.description}</span></span>
                <Link href={`/crm/setup/profiles/${p.id}`} className="text-xs text-navy hover:underline">Permissions</Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function RoleEditor({ role, roles, onDone }: { role: Role; roles: Role[]; onDone: () => void }) {
  const [name, setName] = useState(role.name);
  const [parentId, setParentId] = useState(role.parentId ?? '');
  const [peers, setPeers] = useState(role.shareWithPeers);
  const save = async () => {
    const r = await setupSaveRole({ id: role.id || null, name, parentId: parentId || null, shareWithPeers: peers });
    if (!r.ok) return toast.error(r.error);
    onDone();
  };
  const del = async () => {
    if (!confirm('Delete this role?')) return;
    const r = await setupDeleteConfig(role.id, 'role');
    if (!r.ok) return toast.error(r.error);
    onDone();
  };
  return (
    <div className="mt-3 space-y-2 rounded-md border border-navy/30 p-3">
      <input className="h-8 w-full rounded-md border border-border bg-background px-2" placeholder="Role name" value={name} onChange={(e) => setName(e.target.value)} aria-label="Role name" />
      <select className="h-8 w-full rounded-md border border-border bg-background px-2" value={parentId} onChange={(e) => setParentId(e.target.value)} aria-label="Reports to">
        <option value="">— top of the hierarchy —</option>
        {roles.filter((r) => r.id !== role.id).map((r) => <option key={r.id} value={r.id}>Reports to {r.name}</option>)}
      </select>
      <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={peers} onChange={(e) => setPeers(e.target.checked)} /> Share data with peers in this role</label>
      <div className="flex gap-2">
        <button type="button" onClick={save} className="h-8 rounded-md bg-navy px-3 text-navy-foreground">Save</button>
        {role.id && <button type="button" onClick={del} className="h-8 rounded-md border border-destructive/40 px-3 text-destructive">Delete</button>}
        <button type="button" onClick={onDone} className="h-8 rounded-md border border-border px-3">Cancel</button>
      </div>
    </div>
  );
}
