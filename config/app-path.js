/**
 * Resolve o caminho do binário da aplicação sob teste.
 *
 * Ordem de precedência:
 *   1. variável de ambiente (ANDROID_APP_PATH / IOS_APP_PATH)
 *   2. binário baixado em apps/<plataforma> por `npm run app:download`
 */
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const PLATFORMS = {
    android: { dir: path.join(ROOT, 'apps', 'android'), extension: '.apk', envVar: 'ANDROID_APP_PATH' },
    ios: { dir: path.join(ROOT, 'apps', 'ios'), extension: '.app', envVar: 'IOS_APP_PATH' },
};

/**
 * @param {'android'|'ios'} platform
 * @returns {string} caminho absoluto do binário
 */
export function resolveAppPath(platform) {
    const { dir, extension, envVar } = PLATFORMS[platform];
    const fromEnv = process.env[envVar];

    if (fromEnv) {
        return path.isAbsolute(fromEnv) ? fromEnv : path.resolve(ROOT, fromEnv);
    }

    if (existsSync(dir)) {
        const binary = readdirSync(dir).find((entry) => entry.endsWith(extension));

        if (binary) {
            return path.join(dir, binary);
        }
    }

    throw new Error(
        `Binário ${platform} não encontrado.\n` +
        `  → rode "npm run app:download -- --platform=${platform}"\n` +
        `  → ou defina a variável de ambiente ${envVar}`,
    );
}
