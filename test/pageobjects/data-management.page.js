import BasePage from './base.page.js';

/** Blocos de persistência da tela Data management (`src/screens/DataManagement.tsx`). */
const STORES = ['memory', 'async', 'sqlite', 'secure'];

class DataManagementPage extends BasePage {
    get screen() {
        return $('~DataManagement-screen');
    }

    /** @param {'memory'|'async'|'sqlite'|'secure'} store */
    input(store) {
        this.#assertStore(store);

        return $(`~data-${store}-input`);
    }

    /** @param {'memory'|'async'|'sqlite'|'secure'} store */
    readout(store) {
        this.#assertStore(store);

        return $(`~data-${store}-readout`);
    }

    /** @param {'memory'|'async'|'sqlite'|'secure'} store */
    saveButton(store) {
        this.#assertStore(store);

        return $(`~button-data-${store}-save`);
    }

    /** @param {'memory'|'async'|'sqlite'|'secure'} store */
    clearButton(store) {
        this.#assertStore(store);

        return $(`~button-data-${store}-clear`);
    }

    /**
     * Escreve um valor e persiste no store informado.
     * @param {string} store
     * @param {string} value
     */
    async saveValue(store, value) {
        await this.fill(this.input(store), value);
        await this.hideKeyboardIfVisible();
        await this.tap(this.saveButton(store));

        return this;
    }

    /** @param {string} store */
    async getStoredValue(store) {
        return this.getTextOf(this.readout(store));
    }

    #assertStore(store) {
        if (!STORES.includes(store)) {
            throw new Error(`Store "${store}" inválido. Use um de: ${STORES.join(', ')}`);
        }
    }
}

export default new DataManagementPage();
