import { expect } from 'chai';
import loginPage, { VALIDATION_MESSAGES } from '../pageobjects/login.page.js';
import nativeAlert from '../pageobjects/components/native-alert.component.js';
import tabBar from '../pageobjects/components/tab-bar.component.js';
import { loadData } from '../utils/data-loader.js';

const users = loadData('users');

/** Alerta exibido pelo app após um login bem-sucedido (`src/components/LoginForm.tsx`). */
const SUCCESS_ALERT = {
    title: 'Success',
    message: 'You are logged in!',
};

/** Timeout curto para asserções negativas — a validação do app é síncrona. */
const NEGATIVE_TIMEOUT = 3000;

/** Estratégias de verificação por tipo de resultado esperado na massa de dados. */
const EXPECTATIONS = {
    async success() {
        expect(await nativeAlert.getTitle(), 'título do alerta de sucesso').to.equal(SUCCESS_ALERT.title);
        expect(await nativeAlert.getMessage(), 'mensagem do alerta de sucesso').to.equal(SUCCESS_ALERT.message);
        await nativeAlert.accept();
    },
    async 'invalid-email'() {
        expect(
            await loginPage.isEventuallyDisplayed(loginPage.invalidEmailMessage, NEGATIVE_TIMEOUT),
            `mensagem "${VALIDATION_MESSAGES.invalidEmail}" deveria estar visível`,
        ).to.be.true;
        expect(await nativeAlert.isEventuallyShown(NEGATIVE_TIMEOUT), 'nenhum alerta deveria ser exibido').to.be.false;
    },
    async 'short-password'() {
        expect(
            await loginPage.isEventuallyDisplayed(loginPage.shortPasswordMessage, NEGATIVE_TIMEOUT),
            `mensagem "${VALIDATION_MESSAGES.shortPassword}" deveria estar visível`,
        ).to.be.true;
        expect(await nativeAlert.isEventuallyShown(NEGATIVE_TIMEOUT), 'nenhum alerta deveria ser exibido').to.be.false;
    },
};

describe('Login', () => {
    beforeEach(async () => {
        await tabBar.openLogin();
        await loginPage.openLoginForm();
    });

    afterEach(async () => {
        // Um alerta esquecido na tela bloqueia o próximo teste e faz o Mocha
        // abortar a suíte inteira. O catch garante que a limpeza jamais
        // transforme uma falha isolada em cascata.
        await nativeAlert.dismissIfPresent(NEGATIVE_TIMEOUT).catch(() => undefined);
    });

    it('CT-01 - deve autenticar o usuário com credenciais válidas', async () => {
        await loginPage.login('qa.automation@webdriver.io', 'SuperSecret123');

        expect(await nativeAlert.getTitle(), 'título do alerta').to.equal(SUCCESS_ALERT.title);
        expect(await nativeAlert.getMessage(), 'mensagem do alerta').to.equal(SUCCESS_ALERT.message);

        await nativeAlert.accept();

        expect(await loginPage.isDisplayed(), 'tela de login deve continuar visível').to.be.true;
    });

    it('CT-02 - deve exibir erro de formato ao informar um e-mail inválido', async () => {
        await loginPage.login('email-invalido', 'SuperSecret123');

        expect(
            await loginPage.isEventuallyDisplayed(loginPage.invalidEmailMessage, NEGATIVE_TIMEOUT),
            'mensagem de e-mail inválido deveria estar visível',
        ).to.be.true;
        expect(
            await nativeAlert.isEventuallyShown(NEGATIVE_TIMEOUT),
            'o login não deveria ser concluído',
        ).to.be.false;
    });

    it('CT-03 - deve exibir erro quando a senha tem menos de 8 caracteres', async () => {
        await loginPage.login('qa.automation@webdriver.io', '123');

        const message = await loginPage.getTextOf(loginPage.shortPasswordMessage);

        expect(message, 'mensagem de senha curta').to.equal(VALIDATION_MESSAGES.shortPassword);
        expect(
            await nativeAlert.isEventuallyShown(NEGATIVE_TIMEOUT),
            'o login não deveria ser concluído',
        ).to.be.false;
    });

    describe('CT-04 - login orientado a dados (test/data/users.json)', () => {
        users.forEach((user) => {
            it(`${user.id} - deve validar ${user.description}`, async () => {
                await loginPage.login(user.email, user.password);

                const verify = EXPECTATIONS[user.expected];

                expect(verify, `resultado esperado "${user.expected}" não é suportado`).to.be.a('function');

                await verify();
            });
        });
    });
});
