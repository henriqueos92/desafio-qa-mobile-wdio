import BasePage from './base.page.js';
import { dragAndDrop } from '../utils/gestures.js';

/** Posições do puzzle 3x3 (`src/screens/Drag.tsx`). */
export const PUZZLE_POSITIONS = ['l1', 'c1', 'r1', 'l2', 'c2', 'r2', 'l3', 'c3', 'r3'];

/** Tela de drag and drop. */
class DragPage extends BasePage {
    get screen() {
        return $('~Drag-drop-screen');
    }

    get renewButton() {
        return $('~renew');
    }

    get retryButton() {
        return $('~button-Retry');
    }

    /** @param {string} position uma das PUZZLE_POSITIONS */
    dragItem(position) {
        this.#assertPosition(position);

        return $(`~drag-${position}`);
    }

    /** @param {string} position uma das PUZZLE_POSITIONS */
    dropZone(position) {
        this.#assertPosition(position);

        return $(`~drop-${position}`);
    }

    /**
     * Arrasta a peça até a área de destino de mesma posição.
     * @param {string} position
     */
    async dragPieceToTarget(position) {
        const source = await this.dragItem(position);
        const target = await this.dropZone(position);

        await source.waitForDisplayed();
        await target.waitForDisplayed();
        await dragAndDrop(source, target);

        return this;
    }

    /** Reinicia o puzzle. */
    async reset() {
        await this.tap(this.renewButton);

        return this;
    }

    #assertPosition(position) {
        if (!PUZZLE_POSITIONS.includes(position)) {
            throw new Error(`Posição "${position}" inválida. Use uma de: ${PUZZLE_POSITIONS.join(', ')}`);
        }
    }
}

export default new DragPage();
