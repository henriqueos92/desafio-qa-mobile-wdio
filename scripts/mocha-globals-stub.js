/**
 * Stub dos globais do WebdriverIO para validar as specs SEM device.
 *
 * Usado apenas por `npm run validate:specs` (mocha --dry-run), que carrega os
 * arquivos de teste e confere a estrutura das suites sem executar comandos.
 * Não é carregado em nenhuma execução real de teste.
 */
const stubElement = (selector) => ({ selector, __stub: true });

globalThis.$ = stubElement;
globalThis.$$ = (selector) => [stubElement(selector)];
globalThis.driver = {
    isAndroid: true,
    isIOS: false,
    capabilities: { platformName: 'Android' },
    requestedCapabilities: {},
};
globalThis.browser = globalThis.driver;
