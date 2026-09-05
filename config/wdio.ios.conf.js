/**
 * Execução local em iOS Simulator — Appium + XCUITest.
 *
 * Exclusivo de macOS: exige Xcode completo (não apenas Command Line Tools),
 * um simulador disponível e o driver do Appium instalado:
 *
 *   npx appium driver install xcuitest
 */
import { sharedConfig } from './wdio.shared.conf.js';
import { mergeConfig } from './merge.js';
import { resolveAppPath } from './app-path.js';

export const config = mergeConfig(sharedConfig, {
    port: Number(process.env.APPIUM_PORT || 4723),
    path: '/',

    services: [
        [
            'appium',
            {
                args: {
                    address: process.env.APPIUM_HOST || '127.0.0.1',
                    port: Number(process.env.APPIUM_PORT || 4723),
                    relaxedSecurity: true,
                },
                logPath: sharedConfig.outputDir,
            },
        ],
    ],

    capabilities: [
        {
            platformName: 'iOS',
            'appium:automationName': 'XCUITest',
            'appium:deviceName': process.env.IOS_DEVICE_NAME || 'iPhone 16',
            ...(process.env.IOS_PLATFORM_VERSION
                ? { 'appium:platformVersion': process.env.IOS_PLATFORM_VERSION }
                : {}),
            ...(process.env.IOS_UDID ? { 'appium:udid': process.env.IOS_UDID } : {}),
            'appium:app': resolveAppPath('ios'),
            'appium:bundleId': 'org.wdiodemoapp',
            // Os alertas do próprio app fazem parte das asserções (CT-01, CT-05,
            // CT-10), portanto NÃO podem ser aceitos automaticamente.
            'appium:autoAcceptAlerts': false,
            'appium:autoDismissAlerts': false,
            'appium:newCommandTimeout': 240,
            'appium:wdaLaunchTimeout': 240000,
            'appium:wdaConnectionTimeout': 240000,
            'appium:simulatorStartupTimeout': 300000,
        },
    ],
});

export default config;
