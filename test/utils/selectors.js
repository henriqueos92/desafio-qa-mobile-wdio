/**
 * Construtores de seletores multiplataforma.
 *
 * Alguns textos do app (mensagens de validação do react-native-elements) são
 * renderizados sem `testID`/`accessibilityLabel`. Nesses casos a busca por
 * texto é a alternativa correta — e continua sendo melhor que XPath absoluto
 * ou seletores por posição.
 */
import { isAndroid } from './environment.js';

/**
 * Elemento cujo texto é exatamente o informado.
 * @param {string} text
 * @returns {ChainablePromiseElement}
 */
export function byExactText(text) {
    if (isAndroid()) {
        return $(`android=new UiSelector().text("${escapeForUiAutomator(text)}")`);
    }

    return $(`-ios predicate string:type == "XCUIElementTypeStaticText" AND label == "${escapeForPredicate(text)}"`);
}

/**
 * Elemento que contém o texto informado.
 * @param {string} text
 * @returns {ChainablePromiseElement}
 */
export function byPartialText(text) {
    if (isAndroid()) {
        return $(`android=new UiSelector().textContains("${escapeForUiAutomator(text)}")`);
    }

    return $(`-ios predicate string:type == "XCUIElementTypeStaticText" AND label CONTAINS "${escapeForPredicate(text)}"`);
}

function escapeForUiAutomator(value) {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function escapeForPredicate(value) {
    return value.replace(/"/g, '\\"');
}
