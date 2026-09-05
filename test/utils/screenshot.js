/**
 * Captura de evidências em falha.
 *
 * A screenshot só é gerada quando o teste realmente falha, com nome
 * sanitizado, identificação da suite/teste, plataforma e data/hora, e sem
 * risco de sobrescrever um arquivo existente.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SCREENSHOT_DIR = process.env.SCREENSHOT_DIR || path.join(ROOT, 'screenshots');
const MAX_SEGMENT_LENGTH = 60;

/**
 * Converte um texto livre em um trecho seguro para nome de arquivo.
 * Remove acentos, troca separadores por hífen e limita o tamanho.
 *
 * @param {string} value
 * @returns {string}
 */
export function sanitizeFileNameSegment(value) {
    const normalized = String(value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    return normalized
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/-{2,}/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, MAX_SEGMENT_LENGTH)
        .toLowerCase() || 'teste-sem-nome';
}

/** Timestamp seguro para nome de arquivo: 2026-09-05T14-31-07-482Z */
export function buildTimestamp(date = new Date()) {
    return date.toISOString().replace(/[:.]/g, '-');
}

/**
 * Monta o nome do arquivo de evidência.
 *
 * @param {{ platform?: string, suite?: string, title: string, date?: Date }} params
 * @returns {string}
 */
export function buildScreenshotName({ platform = 'unknown', suite = '', title, date = new Date() }) {
    const segments = [
        sanitizeFileNameSegment(platform),
        suite ? sanitizeFileNameSegment(suite) : null,
        sanitizeFileNameSegment(title),
        buildTimestamp(date),
    ].filter(Boolean);

    return `${segments.join('_')}.png`;
}

/**
 * Garante um caminho inexistente, adicionando um sufixo incremental caso
 * dois testes falhem dentro do mesmo milissegundo.
 *
 * @param {string} filePath
 * @returns {string}
 */
export function ensureUniquePath(filePath) {
    if (!existsSync(filePath)) {
        return filePath;
    }

    const { dir, name, ext } = path.parse(filePath);

    let counter = 1;
    let candidate = path.join(dir, `${name}-${counter}${ext}`);

    while (existsSync(candidate)) {
        counter += 1;
        candidate = path.join(dir, `${name}-${counter}${ext}`);
    }

    return candidate;
}

/**
 * Captura a screenshot do teste que falhou e grava em `screenshots/`.
 *
 * @param {{ title: string, parent?: string }} test objeto de teste do Mocha
 * @returns {Promise<{ filePath: string, base64: string } | null>}
 */
export async function captureFailureScreenshot(test) {
    const platform = driver?.capabilities?.platformName || 'unknown';
    const fileName = buildScreenshotName({ platform, suite: test?.parent, title: test?.title });

    mkdirSync(SCREENSHOT_DIR, { recursive: true });

    const filePath = ensureUniquePath(path.join(SCREENSHOT_DIR, fileName));
    const base64 = await driver.takeScreenshot();

    writeFileSync(filePath, Buffer.from(base64, 'base64'));

    return { filePath, base64 };
}

export { SCREENSHOT_DIR };
