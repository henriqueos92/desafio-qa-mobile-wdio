/**
 * Gestos mobile implementados com o protocolo W3C Actions.
 *
 * Não utiliza a API `touchAction`, removida/obsoleta nas versões atuais do
 * WebdriverIO e do Appium.
 */

const SWIPE_DURATION = 1000;

/**
 * Executa um swipe entre dois pontos relativos ao tamanho da tela.
 *
 * @param {{ x: number, y: number }} from ponto inicial (0 a 1)
 * @param {{ x: number, y: number }} to ponto final (0 a 1)
 * @param {number} [duration] duração do movimento em ms
 */
export async function swipeRelative(from, to, duration = SWIPE_DURATION) {
    const { width, height } = await driver.getWindowSize();
    const start = { x: Math.round(width * from.x), y: Math.round(height * from.y) };
    const end = { x: Math.round(width * to.x), y: Math.round(height * to.y) };

    await driver.performActions([
        {
            type: 'pointer',
            id: 'finger1',
            parameters: { pointerType: 'touch' },
            actions: [
                { type: 'pointerMove', duration: 0, x: start.x, y: start.y },
                { type: 'pointerDown', button: 0 },
                { type: 'pause', duration: 100 },
                { type: 'pointerMove', duration, x: end.x, y: end.y },
                { type: 'pointerUp', button: 0 },
            ],
        },
    ]);
    await driver.releaseActions();
}

/** Swipe da direita para a esquerda (avança um item de carrossel). */
export async function swipeLeft(y = 0.5) {
    await swipeRelative({ x: 0.85, y }, { x: 0.15, y });
}

/** Swipe da esquerda para a direita (volta um item de carrossel). */
export async function swipeRight(y = 0.5) {
    await swipeRelative({ x: 0.15, y }, { x: 0.85, y });
}

/** Swipe de baixo para cima (rola a tela para baixo). */
export async function swipeUp(x = 0.5) {
    await swipeRelative({ x, y: 0.75 }, { x, y: 0.25 });
}

/** Swipe de cima para baixo (rola a tela para cima). */
export async function swipeDown(x = 0.5) {
    await swipeRelative({ x, y: 0.25 }, { x, y: 0.75 });
}

/**
 * Arrasta um elemento até o centro de outro elemento.
 *
 * @param {WebdriverIO.Element} source
 * @param {WebdriverIO.Element} target
 */
export async function dragAndDrop(source, target) {
    const sourceCenter = await getCenter(source);
    const targetCenter = await getCenter(target);

    await driver.performActions([
        {
            type: 'pointer',
            id: 'finger1',
            parameters: { pointerType: 'touch' },
            actions: [
                { type: 'pointerMove', duration: 0, ...sourceCenter },
                { type: 'pointerDown', button: 0 },
                { type: 'pause', duration: 500 },
                { type: 'pointerMove', duration: SWIPE_DURATION, ...targetCenter },
                { type: 'pause', duration: 300 },
                { type: 'pointerUp', button: 0 },
            ],
        },
    ]);
    await driver.releaseActions();
}

async function getCenter(element) {
    const { x, y } = await element.getLocation();
    const { width, height } = await element.getSize();

    return { x: Math.round(x + width / 2), y: Math.round(y + height / 2) };
}
