import BasePage from './base.page.js';
import { byPartialText } from '../utils/selectors.js';

/** Tela inicial do app (`src/screens/Home.tsx`). */
class HomePage extends BasePage {
    get screen() {
        return $('~Home-screen');
    }

    get title() {
        return byPartialText('WEBDRIVER');
    }

    get description() {
        return byPartialText('Demo app for the appium-boilerplate');
    }
}

export default new HomePage();
