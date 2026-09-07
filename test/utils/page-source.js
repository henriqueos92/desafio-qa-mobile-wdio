/**
 * Captura da árvore de elementos (page source) em falhas.
 *
 * Uma screenshot mostra o que o usuário vê; o page source mostra o que o
 * Appium enxerga. Sem ele, diagnosticar "elemento não encontrado" vira
 * adivinhação — foi exatamente o que aconteceu com os alertas nativos.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildTimestamp, ensureUniquePath, sanitizeFileNameSegment } from './screenshot.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SOURCE_DIR = process.env.PAGE_SOURCE_DIR || path.join(ROOT, 'logs', 'page-source');

/**
 * Grava a árvore de elementos do teste que falhou.
 *
 * @param {{ title: string, parent?: string }} test objeto de teste do Mocha
 * @returns {Promise<string|null>} caminho do arquivo gravado
 */
export async function capturePageSource(test) {
    const platform = driver?.capabilities?.platformName || 'unknown';
    const segments = [
        sanitizeFileNameSegment(platform),
        test?.parent ? sanitizeFileNameSegment(test.parent) : null,
        sanitizeFileNameSegment(test?.title),
        buildTimestamp(),
    ].filter(Boolean);

    mkdirSync(SOURCE_DIR, { recursive: true });

    const filePath = ensureUniquePath(path.join(SOURCE_DIR, `${segments.join('_')}.xml`));

    writeFileSync(filePath, await driver.getPageSource(), 'utf-8');

    return filePath;
}

export { SOURCE_DIR };
