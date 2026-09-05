import { expect } from 'chai';
import tabBar from '../pageobjects/components/tab-bar.component.js';
import sideMenu from '../pageobjects/components/side-menu.component.js';
import homePage from '../pageobjects/home.page.js';
import loginPage from '../pageobjects/login.page.js';
import formsPage from '../pageobjects/forms.page.js';
import swipePage from '../pageobjects/swipe.page.js';
import dragPage from '../pageobjects/drag.page.js';
import permissionsPage from '../pageobjects/permissions.page.js';
import dataManagementPage from '../pageobjects/data-management.page.js';
import { loadData } from '../utils/data-loader.js';

const { tabBarRoutes, sideMenuRoutes } = loadData('navigation');

/** Mapeia o identificador da massa de dados para o Page Object correspondente. */
const PAGES = {
    home: homePage,
    login: loginPage,
    forms: formsPage,
    swipe: swipePage,
    drag: dragPage,
    permissions: permissionsPage,
    dataManagement: dataManagementPage,
};

describe('Navegação', () => {
    beforeEach(async () => {
        await tabBar.openHome();
        await homePage.waitForIsShown();
    });

    it('CT-07 - deve navegar por todas as abas fixadas na tab bar', async () => {
        for (const route of tabBarRoutes) {
            await tabBar.openTab(route.tab);

            const page = PAGES[route.page];

            expect(page, `Page Object "${route.page}" não está mapeado`).to.exist;

            await page.waitForIsShown();

            expect(await page.isDisplayed(), `tela da aba "${route.tab}" deveria estar visível`).to.be.true;
        }
    });

    describe('CT-07 - navegação por aba, orientada a dados (test/data/navigation.json)', () => {
        tabBarRoutes.forEach((route) => {
            it(`${route.id} - deve abrir a tela da aba "${route.tab}"`, async () => {
                await tabBar.openTab(route.tab);

                const page = PAGES[route.page];

                await page.waitForIsShown();

                expect(await page.isDisplayed(), `tela ${route.screen} deveria estar visível`).to.be.true;
                expect(await homePage.isDisplayed().catch(() => false), 'a Home não deveria continuar visível')
                    .to.equal(route.page === 'home');
            });
        });
    });

    it('CT-08 - deve acessar telas não fixadas na tab bar pelo menu lateral', async () => {
        for (const route of sideMenuRoutes) {
            await sideMenu.open();

            expect(await sideMenu.panel.isDisplayed(), 'painel do menu lateral deveria estar visível').to.be.true;

            await sideMenu.navigateTo(route.route);

            const page = PAGES[route.page];

            await page.waitForIsShown();

            expect(await page.isDisplayed(), `tela ${route.screen} deveria estar visível`).to.be.true;
            expect(await sideMenu.panel.isDisplayed().catch(() => false), 'o menu deveria ter sido fechado').to.be.false;
        }
    });
});
