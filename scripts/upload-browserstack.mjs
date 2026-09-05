#!/usr/bin/env node
/**
 * Envia o binário para o BrowserStack App Automate e imprime o `app_url`
 * (bs://<hash>) que deve ser usado como BROWSERSTACK_APP_ID.
 *
 * As credenciais vêm de BROWSERSTACK_USERNAME / BROWSERSTACK_ACCESS_KEY e
 * nunca são impressas.
 *
 * Uso:
 *   npm run app:upload -- --platform=android
 *   npm run app:upload -- --platform=ios
 */
import { createReadStream } from 'node:fs';
import { basename } from 'node:path';
import 'dotenv/config';
import { resolveAppPath } from '../config/app-path.js';

const UPLOAD_URL = 'https://api-cloud.browserstack.com/app-automate/upload';

const platform = (process.argv.find((arg) => arg.startsWith('--platform=')) || '--platform=android').split('=')[1];
const { BROWSERSTACK_USERNAME: user, BROWSERSTACK_ACCESS_KEY: key } = process.env;

if (!user || !key) {
    console.error('Defina BROWSERSTACK_USERNAME e BROWSERSTACK_ACCESS_KEY (via .env ou CI/CD Variables).');
    process.exit(1);
}

const appPath = resolveAppPath(platform);
const form = new FormData();

form.append('file', await fileFromPath(appPath));
form.append('custom_id', `native-demo-app-${platform}`);

console.log(`[app:upload] enviando ${basename(appPath)} para o BrowserStack ...`);

const response = await fetch(UPLOAD_URL, {
    method: 'POST',
    headers: { Authorization: `Basic ${Buffer.from(`${user}:${key}`).toString('base64')}` },
    body: form,
});

const payload = await response.json().catch(() => ({}));

if (!response.ok) {
    // A mensagem da API pode ecoar dados da requisição — imprimimos apenas o essencial.
    console.error(`[app:upload] falha — HTTP ${response.status}: ${payload.error || 'erro desconhecido'}`);
    process.exit(1);
}

console.log(`[app:upload] app_url: ${payload.app_url}`);
console.log('[app:upload] use este valor em BROWSERSTACK_APP_ID');

/** Constrói um File a partir de um caminho, em streaming. */
async function fileFromPath(filePath) {
    const chunks = [];

    for await (const chunk of createReadStream(filePath)) {
        chunks.push(chunk);
    }

    return new File([Buffer.concat(chunks)], basename(filePath));
}
