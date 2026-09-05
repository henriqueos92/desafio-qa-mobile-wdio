#!/usr/bin/env node
/**
 * Baixa os binários oficiais do `webdriverio/native-demo-app` a partir dos
 * releases do GitHub, evitando versionar arquivos grandes no repositório.
 *
 * Uso:
 *   node scripts/download-app.mjs
 *   node scripts/download-app.mjs --platform=android
 *   node scripts/download-app.mjs --platform=ios --version=v2.2.0
 */
import { createWriteStream } from 'node:fs';
import { mkdir, rm, readdir, stat } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_VERSION = 'v2.2.0';
const RELEASE_URL = 'https://github.com/webdriverio/native-demo-app/releases/download';

const args = Object.fromEntries(
    process.argv.slice(2)
        .filter((arg) => arg.startsWith('--'))
        .map((arg) => {
            const [key, value = 'true'] = arg.replace(/^--/, '').split('=');
            return [key, value];
        }),
);

const version = args.version || process.env.NATIVE_DEMO_APP_VERSION || DEFAULT_VERSION;
const platform = (args.platform || 'all').toLowerCase();

const ARTIFACTS = {
    android: {
        file: `android.wdio.native.app.${version}.apk`,
        dir: path.join(ROOT, 'apps', 'android'),
    },
    ios: {
        file: `ios.simulator.wdio.native.app.${version}.zip`,
        dir: path.join(ROOT, 'apps', 'ios'),
    },
};

async function download(url, destination) {
    const response = await fetch(url, { redirect: 'follow' });

    if (!response.ok) {
        throw new Error(`Falha ao baixar ${url} — HTTP ${response.status}`);
    }

    await pipeline(Readable.fromWeb(response.body), createWriteStream(destination));
}

async function unzipInPlace(zipPath, targetDir) {
    await execFileAsync('unzip', ['-o', '-q', zipPath, '-d', targetDir]);
    await rm(zipPath, { force: true });
    await rm(path.join(targetDir, '__MACOSX'), { recursive: true, force: true });
}

async function handle(name) {
    const { file, dir } = ARTIFACTS[name];
    const url = `${RELEASE_URL}/${version}/${file}`;
    const destination = path.join(dir, file);

    await mkdir(dir, { recursive: true });
    console.log(`[app:download] ${name} — baixando ${file} ...`);
    await download(url, destination);

    if (file.endsWith('.zip')) {
        console.log(`[app:download] ${name} — extraindo ${file} ...`);
        await unzipInPlace(destination, dir);
    }

    const entries = await readdir(dir);
    const artifacts = entries.filter((entry) => /\.(apk|app|ipa)$/.test(entry));
    for (const artifact of artifacts) {
        const { size } = await stat(path.join(dir, artifact));
        console.log(`[app:download] ${name} — pronto: apps/${name}/${artifact} (${(size / 1024 / 1024).toFixed(1)} MB)`);
    }
}

const targets = platform === 'all' ? Object.keys(ARTIFACTS) : [platform];

for (const target of targets) {
    if (!ARTIFACTS[target]) {
        console.error(`[app:download] Plataforma inválida: "${target}". Use android, ios ou all.`);
        process.exit(1);
    }
    await handle(target);
}
