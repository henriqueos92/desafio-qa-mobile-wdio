#!/usr/bin/env node
/**
 * Validação estática das configurações do WebdriverIO — roda SEM device.
 *
 * Confere que cada configuração carrega, que as capabilities usam o padrão
 * W3C com prefixo `appium:` e que nenhuma credencial está embutida no código.
 */
import assert from 'node:assert/strict';

process.env.ANDROID_APP_PATH ||= '/tmp/native-demo-app.apk';
process.env.IOS_APP_PATH ||= '/tmp/native-demo-app.app';

const TARGETS = [
    { name: 'android', file: '../config/wdio.android.conf.js', platform: 'Android', automation: 'UiAutomator2' },
    { name: 'ios', file: '../config/wdio.ios.conf.js', platform: 'iOS', automation: 'XCUITest' },
];

if (process.argv.includes('--with-browserstack')) {
    TARGETS.push({ name: 'browserstack', file: '../config/wdio.browserstack.conf.js', automation: null });
}

const W3C_STANDARD_KEYS = new Set(['platformName', 'browserName', 'browserVersion', 'acceptInsecureCerts', 'pageLoadStrategy', 'proxy', 'setWindowRect', 'timeouts', 'strictFileInteractability', 'unhandledPromptBehavior']);
const SECRET_PATTERN = /(access[_-]?key|password|token|secret)\s*[:=]\s*['"][^'"$]{6,}['"]/i;

let failures = 0;
const fail = (message) => {
    failures += 1;
    console.error(`  ✗ ${message}`);
};

for (const target of TARGETS) {
    const { config } = await import(target.file);

    console.log(`\n[${target.name}]`);

    assert.equal(config.framework, 'mocha', 'framework deve ser mocha');
    assert.ok(Array.isArray(config.specs) && config.specs.length > 0, 'specs deve estar definido');
    assert.ok(Array.isArray(config.capabilities) && config.capabilities.length > 0, 'capabilities deve estar definido');
    console.log(`  ✓ framework=mocha, ${config.capabilities.length} capability(ies), reporters=${JSON.stringify(config.reporters)}`);

    for (const capability of config.capabilities) {
        for (const key of Object.keys(capability)) {
            const isValid = W3C_STANDARD_KEYS.has(key) || key.includes(':');

            if (!isValid) {
                fail(`[${target.name}] capability "${key}" não é W3C nem possui prefixo de vendor`);
            }
        }

        if (target.platform) {
            assert.equal(capability.platformName, target.platform, `platformName deve ser ${target.platform}`);
        }
        if (target.automation) {
            assert.equal(capability['appium:automationName'], target.automation, `automationName deve ser ${target.automation}`);
        }
    }
    console.log('  ✓ todas as capabilities seguem o padrão W3C (prefixo appium:/bstack:)');

    const serialized = JSON.stringify(config, (key, value) => (typeof value === 'function' ? value.toString() : value));

    if (SECRET_PATTERN.test(serialized)) {
        fail(`[${target.name}] possível credencial embutida na configuração`);
    } else {
        console.log('  ✓ nenhuma credencial embutida (valores vêm de variáveis de ambiente)');
    }
}

console.log(failures === 0 ? '\nTodas as configurações são válidas.' : `\n${failures} problema(s) encontrado(s).`);
process.exit(failures === 0 ? 0 : 1);
