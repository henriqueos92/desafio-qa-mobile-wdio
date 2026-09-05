/**
 * Carregador das massas de teste.
 *
 * Lê os JSON de `test/data` com `readFileSync` em vez de import assertions,
 * garantindo compatibilidade com qualquer runtime Node suportado e permitindo
 * adicionar novos casos sem tocar na lógica dos testes.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DATA_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');

/**
 * @template T
 * @param {string} fileName nome do arquivo dentro de test/data (com ou sem .json)
 * @returns {T}
 */
export function loadData(fileName) {
    const file = fileName.endsWith('.json') ? fileName : `${fileName}.json`;
    const filePath = path.join(DATA_DIR, file);

    try {
        return JSON.parse(readFileSync(filePath, 'utf-8'));
    } catch (error) {
        throw new Error(`Não foi possível carregar a massa de teste "${file}": ${error.message}`);
    }
}
