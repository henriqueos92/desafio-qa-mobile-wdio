#!/usr/bin/env node
/**
 * Validação estática dos Page Objects — roda SEM emulador, Appium ou device.
 *
 * Substitui os globais `$` e `driver` do WebdriverIO por stubs, importa todos
 * os Page Objects e confere que os seletores gerados correspondem aos
 * identificadores extraídos do código-fonte do native-demo-app v2.2.0
 * (ver docs/app-analysis.md).
 *
 * Uso:
 *   npm run validate:selectors
 *   npm run validate:selectors -- --platform=ios
 */
import assert from 'node:assert/strict';

const platform = (process.argv.find((arg) => arg.startsWith('--platform=')) || '--platform=android').split('=')[1];
const isAndroid = platform === 'android';

globalThis.$ = (selector) => ({ selector, __stub: true });
globalThis.$$ = (selector) => [{ selector, __stub: true }];
globalThis.driver = {
    isAndroid,
    isIOS: !isAndroid,
    capabilities: { platformName: isAndroid ? 'Android' : 'iOS' },
    requestedCapabilities: {},
};
globalThis.browser = globalThis.driver;

const [
    { default: loginPage, VALIDATION_MESSAGES },
    { default: formsPage, SWITCH_TEXTS, ACTIVE_BUTTON_ALERT },
    { default: homePage },
    { default: swipePage },
    { default: dragPage, PUZZLE_POSITIONS },
    { default: permissionsPage },
    { default: dataManagementPage },
    { default: tabBar },
    { default: sideMenu },
    { default: nativeAlert },
] = await Promise.all([
    import('../test/pageobjects/login.page.js'),
    import('../test/pageobjects/forms.page.js'),
    import('../test/pageobjects/home.page.js'),
    import('../test/pageobjects/swipe.page.js'),
    import('../test/pageobjects/drag.page.js'),
    import('../test/pageobjects/permissions.page.js'),
    import('../test/pageobjects/data-management.page.js'),
    import('../test/pageobjects/components/tab-bar.component.js'),
    import('../test/pageobjects/components/side-menu.component.js'),
    import('../test/pageobjects/components/native-alert.component.js'),
]);

const checks = [];
const check = (description, actual, expected) => checks.push({ description, actual, expected });

const sel = (element) => element.selector;

// --- Telas ------------------------------------------------------------------
check('Home — container', sel(homePage.screen), '~Home-screen');
check('Login — container', sel(loginPage.screen), '~Login-screen');
check('Forms — container', sel(formsPage.screen), '~Forms-screen');
check('Swipe — container', sel(swipePage.screen), '~Swipe-screen');
check('Drag — container', sel(dragPage.screen), '~Drag-drop-screen');
check('Permissions — container', sel(permissionsPage.screen), '~Permissions-screen');
check('DataManagement — container', sel(dataManagementPage.screen), '~DataManagement-screen');

// --- Login / Sign up --------------------------------------------------------
check('Login — aba Login', sel(loginPage.loginTab), '~button-login-container');
check('Login — aba Sign up', sel(loginPage.signUpTab), '~button-sign-up-container');
check('Login — campo e-mail', sel(loginPage.emailInput), '~input-email');
check('Login — campo senha', sel(loginPage.passwordInput), '~input-password');
check('Login — confirmar senha', sel(loginPage.repeatPasswordInput), '~input-repeat-password');
check('Login — botão LOGIN', sel(loginPage.loginButton), '~button-LOGIN');
// Espaco, nao hifen: Button.tsx monta `button-${text}` e o texto e "SIGN UP".
check('Login — botão SIGN UP', sel(loginPage.signUpButton), '~button-SIGN UP');
check('Login — botão biométrico', sel(loginPage.biometricButton), '~button-biometric');
check('Login — mensagem e-mail inválido', VALIDATION_MESSAGES.invalidEmail, 'Please enter a valid email address');
check('Login — mensagem senha curta', VALIDATION_MESSAGES.shortPassword, 'Please enter at least 8 characters');
check('Login — mensagem senhas diferentes', VALIDATION_MESSAGES.passwordMismatch, 'Please enter the same password');

// --- Forms ------------------------------------------------------------------
check('Forms — campo de texto', sel(formsPage.inputField), '~text-input');
check('Forms — resultado do texto', sel(formsPage.inputResult), '~input-text-result');
check('Forms — switch', sel(formsPage.switch), '~switch');
check('Forms — texto do switch', sel(formsPage.switchText), '~switch-text');
check('Forms — dropdown', sel(formsPage.dropdown), '~Dropdown');
check('Forms — picker do dropdown', sel(formsPage.dropdownPicker), '~Dropdown picker');
check('Forms — botão Active', sel(formsPage.activeButton), '~button-Active');
check('Forms — botão Inactive', sel(formsPage.inactiveButton), '~button-Inactive');
check('Forms — texto switch OFF', SWITCH_TEXTS.off, 'Click to turn the switch ON');
check('Forms — texto switch ON', SWITCH_TEXTS.on, 'Click to turn the switch OFF');
check('Forms — alerta do botão Active', ACTIVE_BUTTON_ALERT.message, 'This button is active');

// --- Navegação --------------------------------------------------------------
check('TabBar — Home', sel(tabBar.home), '~Home');
check('TabBar — Webview', sel(tabBar.webview), '~Webview');
check('TabBar — Login', sel(tabBar.login), '~Login');
check('TabBar — Forms', sel(tabBar.forms), '~Forms');
check('TabBar — Swipe', sel(tabBar.swipe), '~Swipe');
check('TabBar — Drag', sel(tabBar.drag), '~Drag');
check('TabBar — Menu', sel(tabBar.menu), '~Menu');
check('SideMenu — painel', sel(sideMenu.panel), '~tab-side-menu-panel');
check('SideMenu — item permissions', sel(sideMenu.item('permissions')), '~side-menu-item-permissions');
check('SideMenu — item data-management', sel(sideMenu.item('data-management')), '~side-menu-item-data-management');
check('SideMenu — estrela forms', sel(sideMenu.star('forms')), '~side-menu-star-forms');

// --- Drag and drop ----------------------------------------------------------
check('Drag — peça l1', sel(dragPage.dragItem('l1')), '~drag-l1');
check('Drag — destino r3', sel(dragPage.dropZone('r3')), '~drop-r3');
check('Drag — botão renew', sel(dragPage.renewButton), '~renew');
check('Drag — 9 posições', PUZZLE_POSITIONS.length, 9);

// --- Data management --------------------------------------------------------
check('Data — input memory', sel(dataManagementPage.input('memory')), '~data-memory-input');
check('Data — readout async', sel(dataManagementPage.readout('async')), '~data-async-readout');
check('Data — salvar sqlite', sel(dataManagementPage.saveButton('sqlite')), '~button-data-sqlite-save');
check('Data — limpar secure', sel(dataManagementPage.clearButton('secure')), '~button-data-secure-clear');

// --- Alerta nativo (específico por plataforma) ------------------------------
check(
    'Alerta nativo — título',
    sel(nativeAlert.title),
    isAndroid
        ? 'android=new UiSelector().resourceIdMatches(".*:id/alertTitle")'
        : '-ios class chain:**/XCUIElementTypeAlert/**/XCUIElementTypeStaticText[1]',
);

// --- Guardas de arquitetura -------------------------------------------------
assert.throws(() => sideMenu.item('inexistente'), /não existe no menu lateral/, 'SideMenu deveria rejeitar rota inválida');
assert.throws(() => dragPage.dragItem('z9'), /inválida/, 'DragPage deveria rejeitar posição inválida');

let failed = 0;
for (const { description, actual, expected } of checks) {
    if (actual === expected) {
        console.log(`  ✓ ${description} -> ${actual}`);
    } else {
        failed += 1;
        console.error(`  ✗ ${description}\n      esperado: ${expected}\n      obtido:   ${actual}`);
    }
}

console.log(`\n[${platform}] ${checks.length - failed}/${checks.length} seletores validados`);

if (failed > 0) {
    process.exit(1);
}
