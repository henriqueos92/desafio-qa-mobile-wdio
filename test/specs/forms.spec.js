import { expect } from 'chai';
import formsPage, { SWITCH_TEXTS, ACTIVE_BUTTON_ALERT } from '../pageobjects/forms.page.js';
import nativeAlert from '../pageobjects/components/native-alert.component.js';
import tabBar from '../pageobjects/components/tab-bar.component.js';
import { loadData } from '../utils/data-loader.js';

const { inputTexts, dropdownOptions } = loadData('forms');

const NEGATIVE_TIMEOUT = 3000;

describe('Formulários', () => {
    beforeEach(async () => {
        await tabBar.openForms();
        await formsPage.waitForIsShown();
    });

    afterEach(async () => {
        if (await nativeAlert.isEventuallyShown(NEGATIVE_TIMEOUT)) {
            await nativeAlert.accept();
        }
    });

    describe('CT-09 - preenchimento do campo de texto (test/data/forms.json)', () => {
        inputTexts.forEach((testCase) => {
            it(`${testCase.id} - deve refletir ${testCase.description} no resultado`, async () => {
                await formsPage.typeText(testCase.value);

                expect(await formsPage.getInputResult(), 'texto espelhado pelo app').to.equal(testCase.value);
            });
        });
    });

    it('CT-10 - deve alternar o switch e atualizar o texto auxiliar', async () => {
        const initialState = await formsPage.isSwitchOn();

        expect(initialState, 'o switch deve iniciar desligado').to.be.false;
        expect(await formsPage.getSwitchText(), 'texto inicial do switch').to.equal(SWITCH_TEXTS.off);

        await formsPage.toggleSwitch();

        expect(await formsPage.isSwitchOn(), 'switch deveria estar ligado').to.be.true;
        expect(await formsPage.getSwitchText(), 'texto após ligar').to.equal(SWITCH_TEXTS.on);

        await formsPage.toggleSwitch();

        expect(await formsPage.isSwitchOn(), 'switch deveria voltar a desligado').to.be.false;
        expect(await formsPage.getSwitchText(), 'texto após desligar').to.equal(SWITCH_TEXTS.off);
    });

    it('CT-10 - deve selecionar uma opção no dropdown', async () => {
        const [, secondOption] = dropdownOptions;

        await formsPage.selectDropdownOption(secondOption);

        expect(await formsPage.getSelectedDropdownOption(), 'opção selecionada no dropdown')
            .to.include(secondOption);
    });

    it('CT-10 - deve exibir o alerta ao tocar no botão habilitado', async () => {
        await formsPage.tapActiveButton();

        expect(await nativeAlert.getTitle(), 'título do alerta').to.equal(ACTIVE_BUTTON_ALERT.title);
        expect(await nativeAlert.getMessage(), 'mensagem do alerta').to.equal(ACTIVE_BUTTON_ALERT.message);

        await nativeAlert.accept();

        expect(await formsPage.isDisplayed(), 'tela de formulários deve continuar visível').to.be.true;
    });

    it('CT-10 - não deve executar ação ao tocar no botão desabilitado', async () => {
        await formsPage.tapInactiveButton();

        expect(
            await formsPage.isInactiveButtonDisplayed(),
            'o botão inativo deveria continuar na tela',
        ).to.be.true;
        expect(
            await nativeAlert.isEventuallyShown(NEGATIVE_TIMEOUT),
            'o botão inativo não deveria disparar alerta',
        ).to.be.false;
        expect(await formsPage.isDisplayed(), 'tela de formulários deve continuar visível').to.be.true;
    });
});
