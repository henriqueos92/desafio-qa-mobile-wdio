import { DEFAULT_TIMEOUT } from '../../utils/environment.js';
import tabBar from './tab-bar.component.js';

/**
 * Menu lateral do native-demo-app (`src/components/TabSideMenu.tsx`).
 *
 * É o único caminho para as telas Permissions e Data management enquanto elas
 * não estiverem fixadas na tab bar.
 */
const ROUTES = ['home', 'webview', 'login', 'forms', 'swipe', 'drag', 'permissions', 'data-management'];

class SideMenu {
    get panel() {
        return $('~tab-side-menu-panel');
    }

    /**
     * Item de navegação do menu.
     * @param {'home'|'webview'|'login'|'forms'|'swipe'|'drag'|'permissions'|'data-management'} route
     */
    item(route) {
        this.#assertRoute(route);

        return $(`~side-menu-item-${route}`);
    }

    /**
     * Estrela que fixa/desafixa a rota na tab bar.
     * @param {string} route
     */
    star(route) {
        this.#assertRoute(route);

        return $(`~side-menu-star-${route}`);
    }

    /** Abre o menu lateral e aguarda a animação terminar. */
    async open() {
        await tabBar.openMenu();
        await this.waitForIsShown();

        return this;
    }

    /**
     * Abre o menu (se necessário) e navega para a rota informada.
     * @param {string} route
     */
    async navigateTo(route) {
        if (!(await this.panel.isDisplayed().catch(() => false))) {
            await this.open();
        }

        const item = this.item(route);

        await item.waitForDisplayed({
            timeout: DEFAULT_TIMEOUT,
            timeoutMsg: `Item "${route}" não encontrado no menu lateral`,
        });
        await item.click();
        await this.waitForIsShown(false);
    }

    /**
     * Alterna a fixação de uma rota na tab bar.
     * @param {string} route
     */
    async togglePin(route) {
        const star = this.star(route);

        await star.waitForDisplayed({ timeout: DEFAULT_TIMEOUT });
        await star.click();
    }

    async waitForIsShown(isShown = true, timeout = DEFAULT_TIMEOUT) {
        await this.panel.waitForDisplayed({
            timeout,
            reverse: !isShown,
            timeoutMsg: `Menu lateral ${isShown ? 'não abriu' : 'não fechou'} após ${timeout}ms`,
        });

        return this;
    }

    #assertRoute(route) {
        if (!ROUTES.includes(route)) {
            throw new Error(`Rota "${route}" não existe no menu lateral. Disponíveis: ${ROUTES.join(', ')}`);
        }
    }
}

export default new SideMenu();
