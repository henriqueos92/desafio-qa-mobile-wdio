import BasePage from './base.page.js';
import { byExactText } from '../utils/selectors.js';
import { DEFAULT_TIMEOUT, isAndroid } from '../utils/environment.js';

/** Textos auxiliares do switch (`src/components/FormComponents.tsx`). */
export const SWITCH_TEXTS = {
    off: 'Click to turn the switch ON',
    on: 'Click to turn the switch OFF',
};

/** Alerta disparado pelo botão "Active". */
export const ACTIVE_BUTTON_ALERT = {
    title: 'This button is',
    message: 'This button is active',
};

/** Tela de formulários (`src/screens/Forms.tsx`). */
class FormsPage extends BasePage {
    get screen() {
        return $('~Forms-screen');
    }

    get inputField() {
        return $('~text-input');
    }

    get inputResult() {
        return $('~input-text-result');
    }

    get switch() {
        return $('~switch');
    }

    get switchText() {
        return $('~switch-text');
    }

    get dropdown() {
        return $('~Dropdown');
    }

    get dropdownPicker() {
        return $('~Dropdown picker');
    }

    get activeButton() {
        return $('~button-Active');
    }

    get inactiveButton() {
        return $('~button-Inactive');
    }

    /** Botão "Done" da toolbar do picker no iOS (padrão do react-native-picker-select). */
    get pickerDoneButton() {
        return $('-ios predicate string:type == "XCUIElementTypeButton" AND name == "Done"');
    }

    get pickerWheel() {
        return $('-ios class chain:**/XCUIElementTypePickerWheel');
    }

    /**
     * Digita um texto no campo e fecha o teclado.
     * @param {string} text
     */
    async typeText(text) {
        await this.fill(this.inputField, text);
        await this.hideKeyboardIfVisible();

        return this;
    }

    /** @returns {Promise<string>} texto espelhado pelo app. */
    async getInputResult() {
        return this.getTextOf(this.inputResult);
    }

    /** Alterna o switch. */
    async toggleSwitch() {
        await this.tap(this.switch);

        return this;
    }

    /** @returns {Promise<string>} texto auxiliar do switch. */
    async getSwitchText() {
        return this.getTextOf(this.switchText);
    }

    /**
     * Estado atual do switch, normalizado entre as plataformas.
     * Android expõe `checked`, iOS expõe `value` "0"/"1".
     *
     * @returns {Promise<boolean>}
     */
    async isSwitchOn() {
        await this.switch.waitForDisplayed({ timeout: DEFAULT_TIMEOUT });

        if (isAndroid()) {
            return (await this.switch.getAttribute('checked')) === 'true';
        }

        return (await this.switch.getAttribute('value')) === '1';
    }

    /**
     * Seleciona uma opção do dropdown.
     *
     * Android: o picker abre uma lista e a opção é escolhida pelo texto.
     * iOS: abre uma `UIPickerWheel`, cujo valor é definido diretamente e
     * confirmado pelo botão "Done".
     *
     * @param {string} option rótulo exatamente como exibido no app
     */
    async selectDropdownOption(option) {
        await this.tap(this.dropdown);

        if (isAndroid()) {
            const item = byExactText(option);

            await item.waitForDisplayed({
                timeout: DEFAULT_TIMEOUT,
                timeoutMsg: `Opção "${option}" não apareceu no dropdown`,
            });
            await item.click();

            return this;
        }

        await this.pickerWheel.waitForDisplayed({ timeout: DEFAULT_TIMEOUT });
        await this.pickerWheel.addValue(option);
        await this.tap(this.pickerDoneButton);

        return this;
    }

    /** @returns {Promise<string>} rótulo atualmente exibido no dropdown. */
    async getSelectedDropdownOption() {
        await this.dropdown.waitForDisplayed({ timeout: DEFAULT_TIMEOUT });

        return this.dropdown.getText();
    }

    /** Toca no botão habilitado, que dispara um alerta nativo. */
    async tapActiveButton() {
        await this.tap(this.activeButton);

        return this;
    }

    /**
     * Toca no botão desabilitado.
     *
     * Não usa `tap()` de propósito: o `waitForEnabled` falharia, e o objetivo
     * do cenário é justamente comprovar que o toque não produz efeito.
     */
    async tapInactiveButton() {
        await this.inactiveButton.waitForDisplayed({ timeout: DEFAULT_TIMEOUT });
        await this.inactiveButton.click();

        return this;
    }

    /** @returns {Promise<boolean>} se o botão desabilitado continua visível. */
    async isInactiveButtonDisplayed() {
        return this.inactiveButton.isDisplayed();
    }
}

export default new FormsPage();
