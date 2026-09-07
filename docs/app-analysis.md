# Análise do aplicativo sob teste — `webdriverio/native-demo-app`

> Versão analisada: **v2.2.0** (release oficial de `webdriverio/native-demo-app`)
> Fonte: código-fonte do branch `main` do repositório oficial. Nenhum seletor
> aqui foi inventado — todos foram extraídos dos arquivos citados.

## 1. Como o app expõe identificadores de teste

O app centraliza a geração dos identificadores em `src/config/TestProperties.ts`:

```ts
if (IS_IOS) {
  return { testID: id };          // iOS  -> accessibilityIdentifier -> "name"
}
return { accessibilityLabel: id }; // Android -> content-desc
```

**Consequência prática:** o mesmo id funciona nas duas plataformas através do
seletor **Accessibility ID** do Appium (`$('~id')`), porque:

| Plataforma | Atributo gerado | Estratégia Appium `accessibility id` |
|---|---|---|
| Android (UiAutomator2) | `content-desc` | casa com `content-desc` |
| iOS (XCUITest) | `accessibilityIdentifier` | casa com `name` |

Por isso o projeto usa **Accessibility ID como estratégia primária**, com XPath
apenas onde o elemento é renderizado pelo **sistema operacional** (alertas
nativos e o picker nativo), casos em que o app não controla os identificadores.

### Botões

`src/components/Button.tsx` monta o id como `` `button-${testID || text}` ``.
Logo, um `<Button text="LOGIN" />` vira `~button-LOGIN`, e um
`<Button testID="data-memory-save" />` vira `~button-data-memory-save`.

## 2. Telas existentes

Definidas em `app/(tabs)/_layout.tsx` (expo-router) e `src/screens/*`:

| Tela | Rota | Accessibility ID do container | Observação |
|---|---|---|---|
| Home | `index` | `~Home-screen` | Logo WebdriverIO + textos "WEBDRIVER", "Demo app for the appium-boilerplate", "Support" |
| Webview | `webview` | *(não possui)* | `WebView` para `https://webdriver.io/` — o container **não** tem `testProperties` |
| Login / Sign up | `login` | `~Login-screen` | Formulário com abas Login e Sign up |
| Forms | `forms` | `~Forms-screen` | Input, switch, dropdown e botões |
| Swipe | `swipe` | `~Swipe-screen` | Carrossel horizontal + conteúdo escondido abaixo |
| Drag and Drop | `drag` | `~Drag-drop-screen` | Puzzle 3x3 de arrastar e soltar |
| Permissions | `permissions` | `~Permissions-screen` | Switches de permissões nativas (câmera, microfone, localização, fotos) |
| Data management | `data-management` | `~DataManagement-screen` | Persistência em memória, AsyncStorage, SQLite e SecureStore |

## 3. Navegação (mudança importante na v2.x)

A v2 substituiu a tab bar fixa por uma **tab bar customizada + menu lateral**
(`src/components/CustomBottomTabBar.tsx` e `src/components/TabSideMenu.tsx`).

* Abas **fixadas por padrão**: `Home`, `Webview`, `Login`, `Forms`, `Swipe`, `Drag`
  (`defaultPinned` em `src/context/TabBarMenuContext.tsx`).
* `Permissions` e `Data management` **não aparecem na tab bar por padrão** —
  são acessíveis apenas pelo botão `~Menu`.
* Limite de 5 abas entre Home e Menu (`MAX_PINNED_TABS`); exceder dispara o
  alerta nativo "Tab bar full".

### Seletores de navegação

| Elemento | Seletor | Origem |
|---|---|---|
| Aba Home / Webview / Login / Forms / Swipe / Drag | `~Home`, `~Webview`, `~Login`, `~Forms`, `~Swipe`, `~Drag` | `tabBarAccessibilityLabel` em `_layout.tsx` |
| Abas opcionais (quando fixadas) | `~Permissions`, `~Data management` | idem |
| Botão do menu lateral | `~Menu` | `accessibilityLabel="Menu"` |
| Painel do menu | `~tab-side-menu-panel` | `testProperties` |
| Itens do menu | `~side-menu-item-home`, `~side-menu-item-webview`, `~side-menu-item-login`, `~side-menu-item-forms`, `~side-menu-item-swipe`, `~side-menu-item-drag`, `~side-menu-item-permissions`, `~side-menu-item-data-management` | `testProperties` |
| Estrela (fixar/desafixar aba) | `~side-menu-star-<rota>` | `testProperties` |

## 4. Tela Login / Sign up (`src/components/LoginForm.tsx`)

| Elemento | Seletor |
|---|---|
| Aba "Login" | `~button-login-container` |
| Aba "Sign up" | `~button-sign-up-container` |
| Campo e-mail | `~input-email` |
| Campo senha | `~input-password` |
| Campo confirmar senha (só na aba Sign up) | `~input-repeat-password` |
| Botão LOGIN | `~button-LOGIN` |
| Botão SIGN UP | `~button-SIGN UP` (**espaço**, não hífen — o texto do botão é `SIGN UP`) |
| Botão biométrico (só se o device tiver biometria cadastrada) | `~button-biometric` |

### Comportamento de estado do formulário (confirmado em execução real)

Os campos **não são limpos** ao alternar entre as abas Login e Sign up: o
estado (`email`, `password`, `passwordConfirmation`) vive no componente
`LoginForm` e sobrevive à troca de aba e à navegação entre telas.

Consequência para a automação: um cenário de "campos obrigatórios vazios"
precisa **reiniciar o app** (`restartApp()` em `test/utils/environment.js`).
Apenas limpar os campos não é confiável, porque o estado do React pode
continuar preenchido mesmo com o campo visualmente vazio.

### Regras de validação (extraídas do código)

* E-mail: precisa casar com a regex de e-mail do componente.
* Senha: **mínimo de 8 caracteres**.
* Confirmação (Sign up): precisa ser igual à senha **e** ter ≥ 8 caracteres.
* O envio simula uma chamada de API com **`setTimeout` de 1500 ms** antes de
  exibir o alerta — a espera precisa ser explícita, nunca `pause` fixo.

### Mensagens

| Situação | Texto exibido |
|---|---|
| E-mail inválido | `Please enter a valid email address` |
| Senha curta | `Please enter at least 8 characters` |
| Confirmação divergente | `Please enter the same password` |
| Login com sucesso | Alerta nativo — título `Success`, mensagem `You are logged in!` |
| Cadastro com sucesso | Alerta nativo — título `Signed Up!`, mensagem `You successfully signed up!` |

## 5. Tela Forms (`src/components/FormComponents.tsx`)

| Elemento | Seletor | Comportamento |
|---|---|---|
| Campo de texto | `~text-input` | placeholder "Type something" |
| Resultado do texto | `~input-text-result` | espelha em tempo real o que foi digitado |
| Switch | `~switch` | alterna ON/OFF |
| Texto do switch | `~switch-text` | `Click to turn the switch ON` / `... OFF` (mostra a **próxima** ação) |
| Dropdown (wrapper) | `~Dropdown` | `react-native-picker-select`; declarado com `accessible: false`, então `getText()` nele retorna vazio no Android — leia pelo texto renderizado |
| Dropdown (picker) | `~Dropdown picker` | picker nativo |
| Botão ativo | `~button-Active` | abre alerta `This button is` / `This button is active` com opções "Ask me later", "Cancel", "OK" |
| Botão inativo | `~button-Inactive` | desabilitado (não dispara ação) |

Opções do dropdown: `webdriver.io is awesome`, `Appium is awesome`, `This app is awesome`.

## 6. Tela Swipe (`src/screens/Swipe.tsx`)

| Elemento | Seletor | Observação |
|---|---|---|
| Container | `~Swipe-screen` | |
| Carrossel | `testID="Carousel"` (**sem** `testProperties`) | ⚠️ ver limitação abaixo |
| Logo escondido | `~WebdriverIO logo` | visível somente após swipe vertical |
| Texto escondido | `You found me!!!` | |

## 7. Tela Drag and Drop (`src/screens/Drag.tsx`)

| Elemento | Seletor |
|---|---|
| Container | `~Drag-drop-screen` |
| Peças arrastáveis | `~drag-l1`, `~drag-c1`, `~drag-r1`, `~drag-l2`, `~drag-c2`, `~drag-r2`, `~drag-l3`, `~drag-c3`, `~drag-r3` |
| Áreas de destino | `~drop-l1` … `~drop-r3` (mesmo padrão) |
| Botão de reset | `~renew` |
| Botão de reinício após concluir | `~button-Retry` |

## 8. Tela Data management (`src/screens/DataManagement.tsx`)

| Bloco | Input | Leitura | Salvar | Limpar |
|---|---|---|---|---|
| Em memória | `~data-memory-input` | `~data-memory-readout` | `~button-data-memory-save` | `~button-data-memory-clear` |
| AsyncStorage | `~data-async-input` | `~data-async-readout` | `~button-data-async-save` | `~button-data-async-clear` |
| SQLite | `~data-sqlite-input` | `~data-sqlite-readout` | `~button-data-sqlite-save` | `~button-data-sqlite-clear` |
| SecureStore | `~data-secure-input` | `~data-secure-readout` | `~button-data-secure-save` | `~button-data-secure-clear` |

## 9. Diferenças Android × iOS relevantes para a automação

| Tema | Android (UiAutomator2) | iOS (XCUITest) |
|---|---|---|
| Origem do accessibility id | `accessibilityLabel` → `content-desc` | `testID` → `accessibilityIdentifier` |
| Alertas nativos | **confirmado em device real**: título `<pacote>:id/alert_title` (Material Components, com underscore), mensagem `android:id/message`, botão OK `android:id/button1`. Botões vêm em CAIXA ALTA, então a busca por rótulo precisa ser case-insensitive | elemento `XCUIElementTypeAlert`; título/mensagem são `XCUIElementTypeStaticText` filhos |
| Dropdown | `useNativeAndroidPickerStyle={false}` → itens renderizados como *modal* React Native | `UIPickerWheel` nativo — selecionado via `setValue` na roda do picker |
| Switch | `android.widget.Switch` (atributo `checked`) | `XCUIElementTypeSwitch` (`value` `"0"`/`"1"`) |
| Teclado | pode cobrir campos; usar `hideKeyboard()` | idem, além do botão "Done" da toolbar |
| Permissões | diálogo do sistema; `autoGrantPermissions` na capability | diálogo do sistema; `autoAcceptAlerts` na capability |

## 10. Limitações e pontos a confirmar com Appium Inspector

Estes pontos **não são totalmente determináveis pelo código-fonte** e devem ser
confirmados com o **Appium Inspector** contra um device real/emulador:

1. **`Carousel` (tela Swipe)** — usa `testID` *puro*, sem passar por
   `testProperties`. No iOS vira `name="Carousel"`; no Android o RN mapeia
   `testID` para `resource-id`, o que **não** é acessível via `~Carousel`.
   Por isso o projeto trata o swipe por **gesto de coordenadas relativas** na
   área do carrossel, e não por seletor do carrossel.
2. **Alertas nativos** — a hierarquia interna é do SO. O projeto usa os
   seletores documentados acima, que são o padrão de mercado (mesma abordagem do
   `webdriverio/appium-boilerplate`), mas variam entre versões de OS.
3. **Itens do picker (dropdown)** — a renderização depende de versão do
   Android/iOS; o texto das opções é estável, o *container* não.
4. **Tela Webview** — não possui accessibility id no container; a validação de
   navegação é feita pela mudança de contexto (`WEBVIEW_*`) ou pelo estado
   selecionado da aba, e não por um `~Webview-screen` (que **não existe**).
