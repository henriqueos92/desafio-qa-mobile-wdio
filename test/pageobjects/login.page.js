import BasePage from './base.page.js';
import { byExactText } from '../utils/selectors.js';
import { SUBMIT_TIMEOUT } from '../utils/environment.js';

/** Mensagens de validação renderizadas pelo formulário (`src/components/LoginForm.tsx`). */
export const VALIDATION_MESSAGES = {
    invalidEmail: 'Please enter a valid email address',
    shortPassword: 'Please enter at least 8 characters',
    passwordMismatch: 'Please enter the same password',
};

/** Tela de Login / Sign up (`src/screens/Login.tsx`). */
class LoginPage extends BasePage {
    get screen() {
        return $('~Login-screen');
    }

    get loginTab() {
        return $('~button-login-container');
    }

    get signUpTab() {
        return $('~button-sign-up-container');
    }

    get emailInput() {
        return $('~input-email');
    }

    get passwordInput() {
        return $('~input-password');
    }

    get repeatPasswordInput() {
        return $('~input-repeat-password');
    }

    get loginButton() {
        return $('~button-LOGIN');
    }

    get signUpButton() {
        return $('~button-SIGN-UP');
    }

    /** Só existe quando o device tem biometria cadastrada. */
    get biometricButton() {
        return $('~button-biometric');
    }

    get invalidEmailMessage() {
        return byExactText(VALIDATION_MESSAGES.invalidEmail);
    }

    get shortPasswordMessage() {
        return byExactText(VALIDATION_MESSAGES.shortPassword);
    }

    get passwordMismatchMessage() {
        return byExactText(VALIDATION_MESSAGES.passwordMismatch);
    }

    /** Seleciona a aba interna "Login" e aguarda o formulário. */
    async openLoginForm() {
        await this.waitForIsShown();
        await this.tap(this.loginTab);
        await this.emailInput.waitForDisplayed({ timeout: SUBMIT_TIMEOUT });

        return this;
    }

    /** Seleciona a aba interna "Sign up" e aguarda o campo extra de confirmação. */
    async openSignUpForm() {
        await this.waitForIsShown();
        await this.tap(this.signUpTab);
        await this.repeatPasswordInput.waitForDisplayed({
            timeout: SUBMIT_TIMEOUT,
            timeoutMsg: 'Campo de confirmação de senha não apareceu ao abrir a aba "Sign up"',
        });

        return this;
    }

    /**
     * Preenche e submete o formulário de login.
     * @param {string} email
     * @param {string} password
     */
    async login(email, password) {
        await this.fill(this.emailInput, email);
        await this.fill(this.passwordInput, password);
        await this.hideKeyboardIfVisible();
        await this.tap(this.loginButton);

        return this;
    }

    /**
     * Preenche e submete o formulário de cadastro.
     * @param {string} email
     * @param {string} password
     * @param {string} [repeatPassword] quando omitido, repete a senha informada
     */
    async signUp(email, password, repeatPassword = password) {
        await this.fill(this.emailInput, email);
        await this.fill(this.passwordInput, password);
        await this.fill(this.repeatPasswordInput, repeatPassword);
        await this.hideKeyboardIfVisible();
        await this.tap(this.signUpButton);

        return this;
    }

    /** Submete o formulário de cadastro sem preencher nenhum campo. */
    async submitEmptySignUp() {
        await this.hideKeyboardIfVisible();
        await this.tap(this.signUpButton);

        return this;
    }
}

export default new LoginPage();
