import BasePage from './base.page.js';
import { byPartialText } from '../utils/selectors.js';
import { swipeLeft, swipeRight, swipeUp } from '../utils/gestures.js';

/** Tela de swipe (`src/screens/Swipe.tsx`). */
class SwipePage extends BasePage {
    get screen() {
        return $('~Swipe-screen');
    }

    /** Logo escondido, revelado apenas após o swipe vertical. */
    get hiddenLogo() {
        return $('~WebdriverIO logo');
    }

    get hiddenText() {
        return byPartialText('You found me!!!');
    }

    /**
     * O carrossel usa `testID` puro (sem `testProperties`), então NÃO é
     * acessível por accessibility id no Android. O swipe é feito por gesto
     * relativo na faixa vertical onde o carrossel é renderizado.
     */
    async swipeCarouselLeft() {
        await swipeLeft(0.45);

        return this;
    }

    async swipeCarouselRight() {
        await swipeRight(0.45);

        return this;
    }

    /** Rola a tela até revelar o conteúdo escondido. */
    async revealHiddenContent(maxSwipes = 5) {
        for (let attempt = 0; attempt < maxSwipes; attempt += 1) {
            if (await this.hiddenLogo.isDisplayed().catch(() => false)) {
                return this;
            }
            await swipeUp(0.5);
        }

        await this.hiddenLogo.waitForDisplayed({
            timeoutMsg: `Conteúdo escondido não apareceu após ${maxSwipes} swipes verticais`,
        });

        return this;
    }
}

export default new SwipePage();
