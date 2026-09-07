import { byPlatform, isAndroid, DEFAULT_TIMEOUT, SUBMIT_TIMEOUT } from '../../utils/environment.js';

/**
 * Componente para os alertas NATIVOS do sistema operacional.
 *
 * O app não controla esses elementos (são renderizados pelo Android/iOS), por
 * isso este é o único ponto do projeto onde XPath/predicate são necessários.
 * Nenhum XPath absoluto ou baseado em posição é utilizado.
 *
 * Estratégia dupla, por decisão de robustez: primeiro os seletores nativos e,
 * se eles não alcançarem o alerta, a API W3C de alertas (`getAlertText`,
 * `acceptAlert`). Isso evita que uma diferença de versão de OS derrube a
 * suíte inteira — foi exatamente o que aconteceu quando o id do título no
 * Android veio do AppCompat (`<pacote>:id/alertTitle`) e não do framework.
 */
const SELECTORS = {
    android: {
        // Ids CONFIRMADOS na árvore de elementos de um device real
        // (logs/page-source/, Galaxy S23 / Android 13):
        //   título   -> com.wdiodemoapp:id/alert_title   (layout do Material Components)
        //   mensagem -> android:id/message               (id do framework)
        //   OK       -> android:id/button1               (id do framework)
        //
        // O título usa "alert_title" com underscore, e não o "alertTitle" do
        // AppCompat. O regex aceita as duas grafias para tolerar mudanças de
        // tema entre versões do app.
        title: 'android=new UiSelector().resourceIdMatches(".*:id/alert_?[tT]itle")',
        message: 'android=new UiSelector().resourceIdMatches(".*:id/message")',
        // button1 = botão positivo (o último do array passado ao Alert.alert do React Native)
        primaryButton: 'android=new UiSelector().resourceIdMatches(".*:id/button1")',
    },
    ios: {
        title: '-ios class chain:**/XCUIElementTypeAlert/**/XCUIElementTypeStaticText[1]',
        message: '-ios class chain:**/XCUIElementTypeAlert/**/XCUIElementTypeStaticText[2]',
        primaryButton: '-ios predicate string:type == "XCUIElementTypeButton" AND name == "OK"',
    },
};

class NativeAlert {
    get title() {
        return $(byPlatform({ android: SELECTORS.android.title, ios: SELECTORS.ios.title }));
    }

    get message() {
        return $(byPlatform({ android: SELECTORS.android.message, ios: SELECTORS.ios.message }));
    }

    get primaryButton() {
        return $(byPlatform({ android: SELECTORS.android.primaryButton, ios: SELECTORS.ios.primaryButton }));
    }

    /**
     * Botão do alerta identificado pelo rótulo (case-insensitive no Android,
     * onde o tema pode aplicar caixa alta).
     *
     * @param {string} label
     */
    button(label) {
        if (isAndroid()) {
            return $(`android=new UiSelector().className("android.widget.Button").textMatches("(?i)${label}")`);
        }

        return $(`-ios predicate string:type == "XCUIElementTypeButton" AND name == "${label}"`);
    }

    /**
     * Aguarda o alerta aparecer pelos seletores nativos. Usa o timeout maior
     * porque o app simula uma chamada de API de 1500 ms antes de exibi-lo.
     */
    async waitForIsShown(isShown = true, timeout = SUBMIT_TIMEOUT) {
        await this.title.waitForDisplayed({
            timeout,
            reverse: !isShown,
            timeoutMsg: `Alerta nativo ${isShown ? 'não apareceu' : 'não foi fechado'} após ${timeout}ms`,
        });

        return this;
    }

    /** @returns {Promise<string>} título do alerta. */
    async getTitle() {
        return (await this.#readParts()).title;
    }

    /** @returns {Promise<string>} mensagem do alerta. */
    async getMessage() {
        return (await this.#readParts()).message;
    }

    /**
     * Confirma o alerta pelo botão positivo, com fallback para a API W3C.
     * Nunca deixa um alerta aberto por causa de um seletor que não casou.
     */
    async accept() {
        try {
            await this.primaryButton.waitForDisplayed({ timeout: DEFAULT_TIMEOUT });
            await this.primaryButton.click();
        } catch {
            await driver.acceptAlert();
        }

        await this.waitForIsShown(false, DEFAULT_TIMEOUT).catch(() => undefined);
    }

    /**
     * Indica se um alerta está presente, sem lançar erro.
     * Consulta os seletores nativos e, em seguida, a API W3C — assim uma
     * asserção negativa continua correta mesmo se os seletores mudarem.
     *
     * @param {number} [timeout]
     * @returns {Promise<boolean>}
     */
    async isEventuallyShown(timeout = SUBMIT_TIMEOUT) {
        try {
            await this.waitForIsShown(true, timeout);

            return true;
        } catch {
            return this.#existsViaWebDriver();
        }
    }

    /**
     * Fecha um alerta remanescente, se houver. Usado na limpeza entre testes:
     * um alerta esquecido na tela bloqueia o teste seguinte e faz o Mocha
     * abortar a suíte inteira.
     *
     * @param {number} [timeout]
     * @returns {Promise<boolean>} true se havia um alerta e ele foi fechado
     */
    async dismissIfPresent(timeout = 3000) {
        if (!(await this.isEventuallyShown(timeout))) {
            return false;
        }

        await this.accept();

        return true;
    }

    /**
     * Lê título e mensagem. Se os seletores nativos não alcançarem o alerta,
     * usa `getAlertText()`, que devolve as duas partes separadas por quebra
     * de linha.
     *
     * @returns {Promise<{ title: string, message: string }>}
     */
    async #readParts() {
        try {
            await this.waitForIsShown();

            const [title, message] = await Promise.all([
                this.title.getText().catch(() => ''),
                this.message.getText().catch(() => ''),
            ]);

            if (title || message) {
                return { title, message };
            }
        } catch {
            // Cai no fallback abaixo.
        }

        // Fallback W3C: sabidamente NAO cobre o Alert.alert do React Native no
        // Android, que e um AlertDialog dentro da app e nao um dialogo do SO.
        // Vale para os alertas de sistema (permissoes) e para o iOS.
        try {
            const [title, ...rest] = (await driver.getAlertText()).split('\n');

            return { title: title.trim(), message: rest.join('\n').trim() };
        } catch (error) {
            throw new Error(
                'Alerta não localizado: nem pelos seletores nativos nem pela API W3C. ' +
                'Verifique o page source salvo em logs/page-source/ para conferir os ' +
                `identificadores reais do diálogo. Causa original: ${error.message}`,
            );
        }
    }

    async #existsViaWebDriver() {
        try {
            await driver.getAlertText();

            return true;
        } catch {
            return false;
        }
    }
}

export default new NativeAlert();
