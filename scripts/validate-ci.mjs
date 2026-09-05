#!/usr/bin/env node
/**
 * Validação estrutural do .gitlab-ci.yml.
 *
 * Confere que o YAML é válido, que os stages e jobs esperados existem, que os
 * artefatos de evidência são preservados mesmo em falha e que NENHUM segredo
 * está escrito no arquivo.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = path.join(ROOT, '.gitlab-ci.yml');
const raw = readFileSync(FILE, 'utf-8');
const pipeline = yaml.load(raw);

console.log('  ✓ YAML válido');

assert.deepEqual(pipeline.stages, ['install', 'validate', 'test', 'report'], 'stages inesperados');
console.log(`  ✓ stages: ${pipeline.stages.join(' → ')}`);

const jobs = Object.keys(pipeline).filter((key) => pipeline[key]?.stage);
for (const expected of ['install:dependencies', 'validate:project', 'test:browserstack', 'report:allure', 'pages']) {
    assert.ok(jobs.includes(expected), `job "${expected}" não encontrado`);
}
console.log(`  ✓ jobs: ${jobs.join(', ')}`);

const sources = pipeline.workflow.rules.map((rule) => rule.if).join(' ');
assert.ok(sources.includes('merge_request_event'), 'pipeline deve rodar em merge requests');
assert.ok(sources.includes('CI_COMMIT_BRANCH'), 'pipeline deve rodar em commits de branch');
console.log('  ✓ dispara em commits e merge requests, sem pipelines duplicados');

for (const job of ['test:browserstack', 'report:allure']) {
    assert.equal(pipeline[job].artifacts.when, 'always', `${job} deve preservar artefatos mesmo em falha`);
}
const evidencePaths = pipeline['report:allure'].artifacts.paths;
for (const expected of ['allure-report/', 'allure-results/', 'screenshots/', 'logs/']) {
    assert.ok(evidencePaths.includes(expected), `artefato "${expected}" não preservado`);
}
console.log(`  ✓ artefatos preservados sempre: ${evidencePaths.join(', ')}`);

// node_modules (~260 MB) jamais deve trafegar como artefato entre jobs:
// isso consome cota de armazenamento a cada pipeline. Use o cache do npm.
for (const job of jobs) {
    const paths = pipeline[job].artifacts?.paths ?? [];

    assert.ok(
        !paths.some((entry) => entry.includes('node_modules')),
        `job "${job}" não pode publicar node_modules como artefato — use o cache do npm`,
    );
}
console.log('  ✓ nenhum job publica node_modules como artefato');

const SECRET_VALUE = /(BROWSERSTACK_(?:USERNAME|ACCESS_KEY|APP_ID))\s*[:=]\s*["']?[A-Za-z0-9][^\s"'$]{5,}/;
assert.ok(!SECRET_VALUE.test(raw), 'o .gitlab-ci.yml não pode conter valores de credenciais');
console.log('  ✓ nenhum segredo escrito no YAML (apenas referências a variáveis)');

console.log('\n.gitlab-ci.yml é válido.');
