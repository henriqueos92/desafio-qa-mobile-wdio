/**
 * Deep merge mínimo usado para compor as configurações do WebdriverIO.
 *
 * Arrays são substituídos (e não concatenados), evitando reporters ou
 * services duplicados ao sobrescrever a configuração compartilhada.
 */
export function mergeConfig(base, override) {
    const result = { ...base };

    for (const [key, value] of Object.entries(override)) {
        const current = result[key];

        if (isPlainObject(current) && isPlainObject(value)) {
            result[key] = mergeConfig(current, value);
        } else {
            result[key] = value;
        }
    }

    return result;
}

function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
