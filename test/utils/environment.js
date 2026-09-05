/**
 * Helpers de ambiente e plataforma.
 *
 * Centraliza as diferenças entre Android e iOS para que os Page Objects não
 * precisem repetir condicionais de plataforma.
 */

/** @returns {boolean} true quando a sessão corrente é Android. */
export function isAndroid() {
    return Boolean(driver.isAndroid);
}

/** @returns {boolean} true quando a sessão corrente é iOS. */
export function isIOS() {
    return Boolean(driver.isIOS);
}

/**
 * Escolhe um valor conforme a plataforma da sessão.
 *
 * @template T
 * @param {{ android: T, ios: T }} options
 * @returns {T}
 */
export function byPlatform({ android, ios }) {
    return isAndroid() ? android : ios;
}

/**
 * Metadados do ambiente de execução, usados nos logs e no Allure.
 * Nunca inclui credenciais.
 *
 * @returns {Record<string, string>}
 */
export function getEnvironmentInfo() {
    const capabilities = driver.capabilities || {};
    const requested = driver.requestedCapabilities || {};

    const read = (key) => capabilities[key] ?? requested[key] ?? requested[`appium:${key}`];

    return {
        Platform: capabilities.platformName ?? requested.platformName ?? 'unknown',
        PlatformVersion: String(read('platformVersion') ?? 'unknown'),
        Device: String(read('deviceName') ?? read('device') ?? 'unknown'),
        AutomationName: String(read('automationName') ?? 'unknown'),
        Framework: 'WebdriverIO',
        Automation: 'Appium',
        Environment: process.env.TEST_ENV || (process.env.BROWSERSTACK_USERNAME ? 'BrowserStack' : 'Local'),
        App: String(read('bundleId') ?? read('appPackage') ?? 'native-demo-app'),
    };
}

/** Timeout padrão de espera explícita (ms), configurável por variável de ambiente. */
export const DEFAULT_TIMEOUT = Number(process.env.WAIT_TIMEOUT || 15000);

/**
 * Timeout maior para fluxos que dependem da "API" simulada do app,
 * que aguarda 1500 ms antes de responder.
 */
export const SUBMIT_TIMEOUT = Number(process.env.SUBMIT_TIMEOUT || 20000);
