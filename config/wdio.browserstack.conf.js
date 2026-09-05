/**
 * Execução em dispositivos reais no BrowserStack App Automate.
 *
 * As credenciais vêm SEMPRE de variáveis de ambiente (.env local ou CI/CD
 * Variables no GitLab) — nunca do código.
 *
 * Antes de executar, envie o binário e use o `app_url` retornado:
 *   npm run app:upload -- --platform=android
 *   export BROWSERSTACK_APP_ID=bs://<hash retornado>
 *   npm run test:browserstack
 */
import { sharedConfig } from './wdio.shared.conf.js';
import { mergeConfig } from './merge.js';
import { buildEnvironmentInfo } from './environment-info.js';

const {
    BROWSERSTACK_USERNAME,
    BROWSERSTACK_ACCESS_KEY,
    BROWSERSTACK_APP_ID,
    BROWSERSTACK_PROJECT_NAME,
    BROWSERSTACK_BUILD_NAME,
} = process.env;

const missing = ['BROWSERSTACK_USERNAME', 'BROWSERSTACK_ACCESS_KEY', 'BROWSERSTACK_APP_ID']
    .filter((name) => !process.env[name]);

// Durante a validação estática não há credenciais — a checagem é adiada para a execução.
if (missing.length > 0 && !process.env.WDIO_VALIDATE_ONLY) {
    throw new Error(
        `Execução no BrowserStack exige as variáveis: ${missing.join(', ')}.\n` +
        '  → copie .env.example para .env (execução local)\n' +
        '  → ou cadastre-as em Settings > CI/CD > Variables no GitLab (pipeline)',
    );
}

const projectName = BROWSERSTACK_PROJECT_NAME || 'native-demo-app';
const buildName = BROWSERSTACK_BUILD_NAME
    || (process.env.CI_PIPELINE_ID ? `gitlab-${process.env.CI_PIPELINE_ID}` : `local-${new Date().toISOString().slice(0, 16)}`);

/** Opções comuns a todas as sessões do BrowserStack. */
const bstackOptions = {
    projectName,
    buildName,
    appiumVersion: process.env.BROWSERSTACK_APPIUM_VERSION || '2.6.0',
    debug: true,
    networkLogs: true,
    deviceLogs: true,
    idleTimeout: 120,
};

/** Matriz de dispositivos reais — Android e iOS na mesma execução. */
const devices = [
    {
        platformName: 'android',
        'appium:automationName': 'UiAutomator2',
        'appium:app': BROWSERSTACK_APP_ID,
        'bstack:options': {
            ...bstackOptions,
            deviceName: process.env.BROWSERSTACK_ANDROID_DEVICE || 'Samsung Galaxy S23',
            platformVersion: process.env.BROWSERSTACK_ANDROID_VERSION || '13.0',
            sessionName: 'native-demo-app — Android',
        },
    },
    {
        platformName: 'android',
        'appium:automationName': 'UiAutomator2',
        'appium:app': BROWSERSTACK_APP_ID,
        'bstack:options': {
            ...bstackOptions,
            deviceName: process.env.BROWSERSTACK_ANDROID_DEVICE_2 || 'Google Pixel 8',
            platformVersion: process.env.BROWSERSTACK_ANDROID_VERSION_2 || '14.0',
            sessionName: 'native-demo-app — Android (segundo device)',
        },
    },
    {
        platformName: 'ios',
        'appium:automationName': 'XCUITest',
        'appium:app': BROWSERSTACK_APP_ID,
        'bstack:options': {
            ...bstackOptions,
            deviceName: process.env.BROWSERSTACK_IOS_DEVICE || 'iPhone 15',
            platformVersion: process.env.BROWSERSTACK_IOS_VERSION || '17',
            sessionName: 'native-demo-app — iOS',
        },
    },
];

/**
 * Por padrão roda só a matriz Android (o mesmo app_url não serve para iOS:
 * é preciso enviar o .ipa separadamente). Defina BROWSERSTACK_PLATFORM=ios
 * ou =all conforme o binário enviado.
 */
const selected = {
    android: devices.filter((device) => device.platformName === 'android'),
    ios: devices.filter((device) => device.platformName === 'ios'),
    all: devices,
}[(process.env.BROWSERSTACK_PLATFORM || 'android').toLowerCase()] ?? devices;

export const config = mergeConfig(sharedConfig, {
    user: BROWSERSTACK_USERNAME,
    key: BROWSERSTACK_ACCESS_KEY,
    hostname: 'hub.browserstack.com',

    maxInstances: Number(process.env.BROWSERSTACK_PARALLEL || 2),

    services: [
        [
            'browserstack',
            {
                app: BROWSERSTACK_APP_ID,
                buildIdentifier: process.env.CI_PIPELINE_ID ? '${BUILD_NUMBER}' : undefined,
                browserstackLocal: process.env.BROWSERSTACK_LOCAL === 'true',
                testObservability: false,
            },
        ],
    ],

    reporters: [
        'spec',
        [
            'allure',
            {
                ...sharedConfig.reporters[1][1],
                reportedEnvironmentVars: buildEnvironmentInfo({
                    Environment: 'BrowserStack',
                    Provider: 'BrowserStack App Automate',
                    ProjectName: projectName,
                    BuildName: buildName,
                    Devices: selected
                        .map((device) => `${device['bstack:options'].deviceName} (${device['bstack:options'].platformVersion})`)
                        .join(', '),
                }),
            },
        ],
    ],

    capabilities: selected,
});

export default config;
