import { DEFAULT_TIMEOUT } from '../../utils/environment.js';

/**
 * Tab bar customizada do native-demo-app (`src/components/CustomBottomTabBar.tsx`).
 *
 * Por padrão apenas Home, Webview, Login, Forms, Swipe e Drag ficam fixadas;
 * Permissions e Data management são acessíveis pelo menu lateral.
 */
class TabBar {
    get home() {
        return $('~Home');
    }

    get webview() {
        return $('~Webview');
    }

    get login() {
        return $('~Login');
    }

    get forms() {
        return $('~Forms');
    }

    get swipe() {
        return $('~Swipe');
    }

    get drag() {
        return $('~Drag');
    }

    get menu() {
        return $('~Menu');
    }

    /**
     * Aba pelo rótulo de acessibilidade, permitindo navegação orientada a dados.
     * @param {'Home'|'Webview'|'Login'|'Forms'|'Swipe'|'Drag'|'Permissions'|'Data management'|'Menu'} label
     */
    tab(label) {
        return $(`~${label}`);
    }

    /**
     * Navega para uma aba fixada na tab bar.
     * @param {string} label
     */
    async openTab(label) {
        const tab = this.tab(label);

        await tab.waitForDisplayed({
            timeout: DEFAULT_TIMEOUT,
            timeoutMsg: `Aba "${label}" não está visível na tab bar`,
        });
        await tab.click();
    }

    async openHome() {
        await this.openTab('Home');
    }

    async openLogin() {
        await this.openTab('Login');
    }

    async openForms() {
        await this.openTab('Forms');
    }

    async openSwipe() {
        await this.openTab('Swipe');
    }

    async openDrag() {
        await this.openTab('Drag');
    }

    async openMenu() {
        await this.openTab('Menu');
    }

    /** Aguarda a tab bar estar pronta para interação. */
    async waitForIsShown(timeout = DEFAULT_TIMEOUT) {
        await this.home.waitForDisplayed({ timeout, timeoutMsg: 'Tab bar não ficou visível' });

        return this;
    }
}

export default new TabBar();
