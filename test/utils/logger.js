/**
 * Log de execução dos testes.
 *
 * Objetivos:
 *  - registrar início/fim de cada teste, falhas, plataforma, device e ambiente
 *  - manter o volume enxuto (uma linha por evento relevante)
 *  - NUNCA expor senhas, tokens ou a access key do BrowserStack
 */
import { appendFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const LOG_DIR = process.env.LOG_DIR || path.join(ROOT, 'logs');

/** Variáveis de ambiente cujo VALOR nunca pode aparecer no log. */
const SECRET_ENV_VARS = [
    'BROWSERSTACK_ACCESS_KEY',
    'BROWSERSTACK_USERNAME',
    'BROWSERSTACK_APP_ID',
    'APPIUM_TOKEN',
];

/** Chaves cujo valor é mascarado quando aparecem em pares chave/valor. */
const SECRET_KEY_PATTERN =
    /((?:access[_-]?key|api[_-]?key|secret|token|password|passwd|senha|authorization)["']?\s*[:=]\s*["']?)([^\s"',;}]+)/gi;

const MASK = '***REDACTED***';

/**
 * Remove dados sensíveis de uma mensagem antes de gravá-la.
 * @param {unknown} message
 * @returns {string}
 */
export function redact(message) {
    let text = typeof message === 'string' ? message : JSON.stringify(message, replacerForSecrets);

    if (text === undefined) {
        return String(message);
    }

    text = text.replace(SECRET_KEY_PATTERN, `$1${MASK}`);

    for (const name of SECRET_ENV_VARS) {
        const value = process.env[name];

        if (value && value.length >= 4) {
            text = text.split(value).join(MASK);
        }
    }

    return text;
}

function replacerForSecrets(key, value) {
    return SECRET_KEY_PATTERN.test(`${key}=`) ? MASK : value;
}

class Logger {
    #file;

    constructor() {
        const stamp = new Date().toISOString().slice(0, 10);

        this.#file = path.join(LOG_DIR, `execution-${stamp}.log`);
    }

    /** Caminho do arquivo de log corrente. */
    get file() {
        return this.#file;
    }

    #write(level, message) {
        const line = `${new Date().toISOString()} [${level}] ${redact(message)}`;

        try {
            mkdirSync(LOG_DIR, { recursive: true });
            appendFileSync(this.#file, `${line}\n`, 'utf-8');
        } catch {
            // Falha ao gravar o arquivo não pode interromper a suite.
        }

        if (level === 'ERROR') {
            console.error(line);
        } else if (level !== 'DEBUG' || process.env.WDIO_LOG_LEVEL === 'debug') {
            console.log(line);
        }
    }

    info(message) {
        this.#write('INFO', message);
    }

    warn(message) {
        this.#write('WARN', message);
    }

    error(message) {
        this.#write('ERROR', message);
    }

    debug(message) {
        this.#write('DEBUG', message);
    }

    /**
     * Registra os dados da sessão (plataforma, device, ambiente).
     * @param {Record<string, string>} info
     */
    session(info) {
        const summary = Object.entries(info)
            .map(([key, value]) => `${key}=${value}`)
            .join(' | ');

        this.info(`SESSÃO iniciada — ${summary}`);
    }

    /** @param {{ title: string, parent?: string }} test */
    testStart(test) {
        this.info(`INÍCIO  ${test.parent ? `${test.parent} > ` : ''}${test.title}`);
    }

    /**
     * @param {{ title: string, parent?: string }} test
     * @param {{ passed: boolean, duration?: number, error?: Error }} result
     */
    testEnd(test, { passed, duration, error }) {
        const name = `${test.parent ? `${test.parent} > ` : ''}${test.title}`;
        const time = duration !== undefined ? ` (${duration}ms)` : '';

        if (passed) {
            this.info(`SUCESSO ${name}${time}`);

            return;
        }

        this.error(`FALHA   ${name}${time}`);

        if (error?.message) {
            this.error(`        motivo: ${error.message.split('\n')[0]}`);
        }
    }

    /** @param {string} filePath */
    evidence(filePath) {
        this.info(`EVIDÊNCIA screenshot salva em ${filePath}`);
    }
}

export default new Logger();
export { LOG_DIR };
