/**
 * Execução local em Android — Appium + UiAutomator2.
 *
 * Pré-requisitos: Android SDK, um AVD criado (ou device físico com depuração
 * USB) e os drivers do Appium instalados:
 *
 *   npx appium driver install uiautomator2
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
            platformName: 'Android',
            'appium:automationName': 'UiAutomator2',
            'appium:deviceName': process.env.ANDROID_DEVICE_NAME || 'Android Emulator',
            ...(process.env.ANDROID_PLATFORM_VERSION
                ? { 'appium:platformVersion': process.env.ANDROID_PLATFORM_VERSION }
                : {}),
            // Quando informado, o Appium inicia o emulador automaticamente.
            ...(process.env.ANDROID_AVD ? { 'appium:avd': process.env.ANDROID_AVD, 'appium:avdLaunchTimeout': 300000 } : {}),
            'appium:app': resolveAppPath('android'),
            'appium:appPackage': 'com.wdiodemoapp',
            'appium:appActivity': 'com.wdiodemoapp.MainActivity',
            'appium:appWaitActivity': 'com.wdiodemoapp.MainActivity',
            'appium:autoGrantPermissions': true,
            'appium:newCommandTimeout': 240,
            'appium:noReset': false,
            'appium:fullReset': false,
        },
    ],
});

export default config;
