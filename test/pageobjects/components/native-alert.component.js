import { byPlatform, isAndroid, DEFAULT_TIMEOUT, SUBMIT_TIMEOUT } from '../../utils/environment.js';

/**
 * Componente para os alertas NATIVOS do sistema operacional.
 *
 * O app não controla esses elementos (são renderizados pelo Android/iOS), por
 * isso este é o único ponto do projeto onde XPath/predicate são necessários.
 * Nenhum XPath absoluto ou baseado em posição é utilizado.
 */
const SELECTORS = {
    android: {
        alert: '//*[@resource-id="android:id/parentPanel" or @resource-id="android:id/content"]//*[@resource-id="android:id/alertTitle"]',
        title: '//android.widget.TextView[@resource-id="android:id/alertTitle"]',
        message: '//android.widget.TextView[@resource-id="android:id/message"]',
        // button1 = botão positivo (o último do array passado ao Alert.alert do React Native)
        primaryButton: '//android.widget.Button[@resource-id="android:id/button1"]',
    },
    ios: {
        alert: '-ios predicate string:type == "XCUIElementTypeAlert"',
        title: '-ios class chain:**/XCUIElementTypeAlert/**/XCUIElementTypeStaticText[1]',
        message: '-ios class chain:**/XCUIElementTypeAlert/**/XCUIElementTypeStaticText[2]',
        primaryButton: '-ios predicate string:type == "XCUIElementTypeButton" AND name == "OK"',
    },
};

class NativeAlert {
    get root() {
        return $(byPlatform({ android: SELECTORS.android.alert, ios: SELECTORS.ios.alert }));
    }

    get title() {
        return $(byPlatform({ android: SELECTORS.android.title, ios: SELECTORS.ios.title }));
    }

    get message() {
        return $(byPlatform({ android: SELECTORS.android.message, ios: SELECTORS.ios.message }));
    }

    get primaryButton() {
        return $(byPlatform({ android: SELECTORS.android.primaryButton, ios: SELECTORS.ios.primaryButton }));
    }

    /**
     * Botão do alerta identificado pelo rótulo (case-insensitive no Android,
     * onde o tema pode aplicar caixa alta).
     *
     * @param {string} label
     */
    button(label) {
        if (isAndroid()) {
            return $(`android=new UiSelector().className("android.widget.Button").textMatches("(?i)${label}")`);
        }

        return $(`-ios predicate string:type == "XCUIElementTypeButton" AND name == "${label}"`);
    }

    /**
     * Aguarda o alerta aparecer. Usa o timeout maior porque o app simula uma
     * chamada de API de 1500 ms antes de exibi-lo.
     */
    async waitForIsShown(isShown = true, timeout = SUBMIT_TIMEOUT) {
        await this.title.waitForDisplayed({
            timeout,
            reverse: !isShown,
            timeoutMsg: `Alerta nativo ${isShown ? 'não apareceu' : 'não foi fechado'} após ${timeout}ms`,
        });

        return this;
    }

    /** @returns {Promise<string>} título do alerta. */
    async getTitle() {
        await this.waitForIsShown();

        return this.title.getText();
    }

    /** @returns {Promise<string>} mensagem do alerta. */
    async getMessage() {
        await this.waitForIsShown();

        return this.message.getText();
    }

    /** Confirma o alerta pelo botão positivo e espera ele desaparecer. */
    async accept() {
        await this.primaryButton.waitForDisplayed({ timeout: DEFAULT_TIMEOUT });
        await this.primaryButton.click();
        await this.waitForIsShown(false, DEFAULT_TIMEOUT);
    }

    /**
     * Indica se o alerta apareceu dentro do timeout, sem lançar erro.
     * @param {number} [timeout]
     */
    async isEventuallyShown(timeout = SUBMIT_TIMEOUT) {
        try {
            await this.waitForIsShown(true, timeout);

            return true;
        } catch {
            return false;
        }
    }
}

export default new NativeAlert();
