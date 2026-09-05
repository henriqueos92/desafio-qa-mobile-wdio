/**
 * Metadados de ambiente publicados no Allure Report.
 *
 * São resolvidos em tempo de configuração e repassados ao reporter pela opção
 * `reportedEnvironmentVars` (a API `addEnvironment` está descontinuada no
 * @wdio/allure-reporter v9).
 *
 * NUNCA inclua credenciais aqui — o arquivo vira `environment.properties`
 * dentro do relatório publicado.
 */

/**
 * @param {Record<string, string|undefined>} overrides
 * @returns {Record<string, string>}
 */
export function buildEnvironmentInfo(overrides = {}) {
    const base = {
        Framework: 'WebdriverIO',
        Automation: 'Appium',
        TestRunner: 'Mocha',
        Assertions: 'Chai',
        Application: 'native-demo-app',
        AppVersion: process.env.NATIVE_DEMO_APP_VERSION || 'v2.2.0',
        Environment: process.env.TEST_ENV || 'Local',
        CI: process.env.CI ? 'true' : 'false',
        ...(process.env.CI_COMMIT_SHORT_SHA ? { Commit: process.env.CI_COMMIT_SHORT_SHA } : {}),
        ...(process.env.CI_COMMIT_REF_NAME ? { Branch: process.env.CI_COMMIT_REF_NAME } : {}),
    };

    return Object.fromEntries(
        Object.entries({ ...base, ...overrides })
            .filter(([, value]) => value !== undefined && value !== null && value !== ''),
    );
}
