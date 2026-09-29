/**
 * Minimal TypeScript require hook for the node:test suites in qa/ (no extra deps):
 * transpiles .ts with the project's own `typescript` package and resolves the '@/' alias.
 *   node --require ./qa/ts-register.cjs --test qa/voice/*.test.cjs
 */
const fs = require('fs');
const path = require('path');
const Module = require('module');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...rest) {
  if (request.startsWith('@/')) request = path.join(root, request.slice(2));
  return origResolve.call(this, request, parent, ...rest);
};
require.extensions['.ts'] = function (module, filename) {
  const src = fs.readFileSync(filename, 'utf8');
  const out = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    fileName: filename,
  });
  module._compile(out.outputText, filename);
};
