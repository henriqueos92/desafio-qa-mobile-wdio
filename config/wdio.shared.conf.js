/**
 * Configuração compartilhada entre todas as plataformas e ambientes.
 *
 * As configurações específicas (Android, iOS e BrowserStack) importam este
 * arquivo e sobrescrevem apenas o que muda.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';
import allureReporter from '@wdio/allure-reporter';
import { captureFailureScreenshot } from '../test/utils/screenshot.js';
import logger from '../test/utils/logger.js';
import { getEnvironmentInfo } from '../test/utils/environment.js';

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

    reporters: [
        'spec',
        [
            'allure',
            {
                outputDir: path.join(ROOT, 'allure-results'),
                disableWebdriverStepsReporting: false,
                disableWebdriverScreenshotsReporting: false,
                disableMochaHooks: false,
                addConsoleLogs: true,
                // Sobrescrito por cada configuração de plataforma/ambiente.
                reportedEnvironmentVars: {},
            },
        ],
    ],

    /** Diretórios usados para evidências. */
    screenshotPath: path.join(ROOT, 'screenshots'),

    /** Registra os dados da sessão assim que ela é estabelecida. */
    before: async function before() {
        logger.session(getEnvironmentInfo());
    },

    /** @param {object} test objeto de teste do Mocha */
    beforeTest: async function beforeTest(test) {
        logger.testStart(test);
    },

    /** Encerramento da sessão. */
    after: async function after(result) {
        logger.info(`SESSÃO encerrada — código de saída ${result}`);
    },

    /**
     * Captura automática de evidência APENAS quando o teste falha.
     *
     * @param {object} test objeto de teste do Mocha
     * @param {object} _context
     * @param {{ passed: boolean, error?: Error }} result
     */
    afterTest: async function afterTest(test, _context, { passed, error, duration }) {
        logger.testEnd(test, { passed, duration, error });

        if (passed) {
            return;
        }

        try {
            const evidence = await captureFailureScreenshot(test);

            if (evidence) {
                logger.evidence(evidence.filePath);
                // Anexa a mesma evidência ao Allure, junto do teste que falhou.
                allureReporter.addAttachment(
                    `Screenshot da falha — ${test.title}`,
                    Buffer.from(evidence.base64, 'base64'),
                    'image/png',
                );
            }
        } catch (screenshotError) {
            // Uma falha ao capturar a evidência não pode mascarar a falha real do teste.
            logger.warn(`EVIDÊNCIA não foi possível capturar a screenshot: ${screenshotError.message}`);
        }
    },
};

export const ROOT_DIR = ROOT;
export default sharedConfig;
