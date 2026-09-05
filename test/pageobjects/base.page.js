import { DEFAULT_TIMEOUT, isAndroid } from '../utils/environment.js';

/**
 * Classe base dos Page Objects.
 *
 * Concentra esperas explícitas e ações reutilizáveis. As subclasses devem
 * expor o getter `screen` com o container da tela.
 */
export default class BasePage {
    /**
     * Container da tela. Deve ser sobrescrito pela subclasse.
     * @returns {ChainablePromiseElement}
     */
    get screen() {
        throw new Error(`${this.constructor.name} precisa implementar o getter "screen"`);
    }

    /**
     * Aguarda a tela ficar visível (ou deixar de estar).
     *
     * @param {boolean} [isShown=true]
     * @param {number} [timeout]
     */
    async waitForIsShown(isShown = true, timeout = DEFAULT_TIMEOUT) {
        await this.screen.waitForDisplayed({
            timeout,
            reverse: !isShown,
            timeoutMsg: `Tela de ${this.constructor.name} ${isShown ? 'não ficou visível' : 'continuou visível'} após ${timeout}ms`,
        });

        return this;
    }

    /** @returns {Promise<boolean>} se o container da tela está visível. */
    async isDisplayed() {
        return this.screen.isDisplayed();
    }

    /**
     * Espera o elemento e clica nele.
     * @param {ChainablePromiseElement} element
     */
    async tap(element, timeout = DEFAULT_TIMEOUT) {
        await element.waitForDisplayed({ timeout });
        await element.waitForEnabled({ timeout });
        await element.click();
    }

    /**
     * Espera o elemento, limpa e digita o valor informado.
     * @param {ChainablePromiseElement} element
     * @param {string} value
     */
    async fill(element, value, timeout = DEFAULT_TIMEOUT) {
        await element.waitForDisplayed({ timeout });
        await element.click();
        await element.clearValue();
        await element.setValue(value);
    }

    /** Esconde o teclado quando ele estiver aberto (sem falhar se não estiver). */
    async hideKeyboardIfVisible() {
        try {
            if (await driver.isKeyboardShown()) {
                await driver.hideKeyboard(isAndroid() ? undefined : 'pressKey', 'Done');
            }
        } catch {
            // Alguns drivers lançam erro quando o teclado já está fechado — irrelevante para o teste.
        }
    }

    /**
     * Espera um elemento existir e retorna seu texto.
     * @param {ChainablePromiseElement} element
     */
    async getTextOf(element, timeout = DEFAULT_TIMEOUT) {
        await element.waitForDisplayed({ timeout });

        return element.getText();
    }

    /**
     * Indica se um elemento ficou visível dentro do timeout, sem lançar erro.
     * Útil para asserções negativas ("a mensagem NÃO deve aparecer").
     *
     * @param {ChainablePromiseElement} element
     * @param {number} [timeout]
     * @returns {Promise<boolean>}
     */
    async isEventuallyDisplayed(element, timeout = DEFAULT_TIMEOUT) {
        try {
            await element.waitForDisplayed({ timeout });

            return true;
        } catch {
            return false;
        }
    }
}
