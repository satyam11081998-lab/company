/* Runs every CRM unit test: `npm run test:crm` (uses npx tsx; no repo dependency). */
import { run } from './harness';
import './core.test';
import './engine.test';
import './marketing.test';
import './service.test';
import './automation.test';
import './insights.test';

run();
