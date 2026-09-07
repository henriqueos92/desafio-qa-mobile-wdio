import { expect } from 'chai';
import loginPage, { VALIDATION_MESSAGES } from '../pageobjects/login.page.js';
import nativeAlert from '../pageobjects/components/native-alert.component.js';
import tabBar from '../pageobjects/components/tab-bar.component.js';
import { loadData } from '../utils/data-loader.js';

const { validSignUp, invalidSignUps } = loadData('signup');

/** Alerta exibido pelo app após um cadastro bem-sucedido. */
const SIGNED_UP_ALERT = {
    title: 'Signed Up!',
    message: 'You successfully signed up!',
};

const NEGATIVE_TIMEOUT = 3000;

describe('Cadastro (Sign up)', () => {
    beforeEach(async () => {
        await tabBar.openLogin();
        await loginPage.openSignUpForm();
    });

    afterEach(async () => {
        // Um alerta esquecido na tela bloqueia o próximo teste e faz o Mocha
        // abortar a suíte inteira. O catch garante que a limpeza jamais
        // transforme uma falha isolada em cascata.
        await nativeAlert.dismissIfPresent(NEGATIVE_TIMEOUT).catch(() => undefined);
    });

    it('CT-05 - deve cadastrar um novo usuário com dados válidos', async () => {
        await loginPage.signUp(validSignUp.email, validSignUp.password, validSignUp.repeatPassword);

        expect(await nativeAlert.getTitle(), 'título do alerta de cadastro').to.equal(SIGNED_UP_ALERT.title);
        expect(await nativeAlert.getMessage(), 'mensagem do alerta de cadastro').to.equal(SIGNED_UP_ALERT.message);

        await nativeAlert.accept();

        expect(await loginPage.isDisplayed(), 'tela de login deve continuar visível').to.be.true;
    });

    it('CT-06 - deve exigir os campos obrigatórios ao submeter o formulário vazio', async () => {
        await loginPage.submitEmptySignUp();

        expect(
            await loginPage.isEventuallyDisplayed(loginPage.invalidEmailMessage, NEGATIVE_TIMEOUT),
            `mensagem "${VALIDATION_MESSAGES.invalidEmail}" deveria estar visível`,
        ).to.be.true;
        expect(
            await loginPage.isEventuallyDisplayed(loginPage.shortPasswordMessage, NEGATIVE_TIMEOUT),
            `mensagem "${VALIDATION_MESSAGES.shortPassword}" deveria estar visível`,
        ).to.be.true;
        expect(
            await nativeAlert.isEventuallyShown(NEGATIVE_TIMEOUT),
            'o cadastro não deveria ser concluído',
        ).to.be.false;
    });

    describe('CT-06 - validações do cadastro orientadas a dados (test/data/signup.json)', () => {
        const MESSAGE_BY_EXPECTATION = {
            'invalid-email': () => loginPage.invalidEmailMessage,
            'short-password': () => loginPage.shortPasswordMessage,
        };

        invalidSignUps.forEach((testCase) => {
            it(`${testCase.id} - deve bloquear ${testCase.description}`, async () => {
                await loginPage.signUp(testCase.email, testCase.password, testCase.repeatPassword);

                const getMessage = MESSAGE_BY_EXPECTATION[testCase.expected];

                expect(getMessage, `resultado esperado "${testCase.expected}" não é suportado`).to.be.a('function');
                expect(
                    await loginPage.isEventuallyDisplayed(getMessage(), NEGATIVE_TIMEOUT),
                    `mensagem de erro de "${testCase.expected}" deveria estar visível`,
                ).to.be.true;
                expect(
                    await nativeAlert.isEventuallyShown(NEGATIVE_TIMEOUT),
                    'o cadastro não deveria ser concluído',
                ).to.be.false;
            });
        });
    });
});
