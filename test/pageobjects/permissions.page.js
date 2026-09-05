import BasePage from './base.page.js';

/** Tela de permissões (`src/screens/Permissions.tsx`). */
class PermissionsPage extends BasePage {
    get screen() {
        return $('~Permissions-screen');
    }
}

export default new PermissionsPage();
