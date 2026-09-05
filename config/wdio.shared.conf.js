/**
 * Configuração compartilhada entre todas as plataformas e ambientes.
 *
 * As configurações específicas (Android, iOS e BrowserStack) importam este
 * arquivo e sobrescrevem apenas o que muda.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const sharedConfig = {
    runner: 'local',

    specs: [path.join(ROOT, 'test', 'specs', '**', '*.spec.js')],
    exclude: [],

    maxInstances: 1,

    logLevel: process.env.WDIO_LOG_LEVEL || 'warn',
    outputDir: path.join(ROOT, 'logs'),
    bail: 0,

    waitforTimeout: Number(process.env.WAIT_TIMEOUT || 15000),
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,

    framework: 'mocha',
    mochaOpts: {
        ui: 'bdd',
        timeout: Number(process.env.MOCHA_TIMEOUT || 120000),
    },

    reporters: ['spec'],

    /** Diretórios usados para evidências. */
    screenshotPath: path.join(ROOT, 'screenshots'),
};

export const ROOT_DIR = ROOT;
export default sharedConfig;
