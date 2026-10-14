import { test, eq, ok } from './harness';
import { isStaffPath, staffDestination, ADMIN_LOGIN_PATH } from '../../lib/staff-paths';

test('staff paths: what counts as the admin console or the CRM', () => {
  for (const p of ['/admin', '/admin/coupons', '/admin/login', '/crm', '/crm/m/leads']) ok(isStaffPath(p), p);
  for (const p of ['/', '/administrator', '/adminx', '/crmx', '/crm-tips', '/login', '/dashboard', '/ADMIN']) ok(!isStaffPath(p), p);
  eq(ADMIN_LOGIN_PATH, '/admin/login');
});

test('staff paths: where a staff member lands after signing in', () => {
  const cases: Array<[string | null | undefined, string, string]> = [
    // [next, admin goes to, CRM member goes to]
    [null, '/admin', '/crm'],
    [undefined, '/admin', '/crm'],
    ['', '/admin', '/crm'],
    ['/admin', '/admin', '/crm'],
    ['/admin/journeys?range=7', '/admin/journeys?range=7', '/crm'],
    ['/crm', '/crm', '/crm'],
    ['/crm/m/leads', '/crm/m/leads', '/crm/m/leads'],
    ['/crm/reports?return=%2Fcrm%2Fx', '/crm/reports?return=%2Fcrm%2Fx', '/crm/reports?return=%2Fcrm%2Fx'],
    ['/dashboard', '/admin', '/crm'],
    ['/adminx', '/admin', '/crm'],
    ['/ADMIN/coupons', '/admin', '/crm'],
    // never off-site
    ['//evil.com', '/admin', '/crm'],
    ['https://evil.com/admin', '/admin', '/crm'],
    ['/\\evil.com', '/admin', '/crm'],
    ['/admin\\evil', '/admin', '/crm'],
    ['/admin/..//evil.com', '/admin', '/crm'],
    ['/crm/%2F%2Fevil.com', '/admin', '/crm'],
    ['/crm/%5cevil', '/admin', '/crm'],
    ['javascript:alert(1)', '/admin', '/crm'],
    // never the sign-in page again, however it is spelled
    ['/admin/login', '/admin', '/crm'],
    ['/admin/login?next=/admin/login', '/admin', '/crm'],
    ['/admin/./login', '/admin', '/crm'],
    ['/admin/x/../login', '/admin', '/crm'],
    ['/admin/%2e/login', '/admin', '/crm'],
    // only paths already in normal form
    ['/crm/m/./leads', '/admin', '/crm'],
    ['/crm/m/leads/.', '/admin', '/crm'],
    ['/crm/m/leads#x', '/admin', '/crm'],
    ['/crm/m/leads?q=a b', '/admin', '/crm'],
    ['/crm/"><script>', '/admin', '/crm'],
    ['/crm/' + 'x'.repeat(600), '/admin', '/crm'],
  ];
  for (const [n, admin, crm] of cases) {
    eq(staffDestination(n, 'admin'), admin, `admin next=${n}`);
    eq(staffDestination(n, 'crm'), crm, `crm next=${n}`);
  }
});
