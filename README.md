# Mobile Automation — WebdriverIO + Appium

Suíte de automação mobile **Android e iOS** para o aplicativo oficial
[`webdriverio/native-demo-app`](https://github.com/webdriverio/native-demo-app)
(versão **v2.2.0**), com Page Object Model, testes orientados a dados,
evidências automáticas, Allure Report, execução em dispositivos reais no
BrowserStack e pipeline no GitLab CI/CD.

---

## Sumário

- [O desafio](#o-desafio)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Estrutura de arquivos](#estrutura-de-arquivos)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Appium](#appium)
- [Android](#android)
- [iOS](#ios)
- [BrowserStack](#browserstack)
- [Allure Report](#allure-report)
- [Cenários automatizados](#cenários-automatizados)
- [Data-driven testing](#data-driven-testing)
- [Screenshots](#screenshots)
- [Logs](#logs)
- [CI/CD](#cicd)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Validações sem device](#validações-sem-device)
- [Limitações conhecidas](#limitações-conhecidas)
- [Melhorias futuras](#melhorias-futuras)

---

## O desafio

Construir uma suíte de automação mobile profissional sobre o `native-demo-app`,
cobrindo 10 cenários que exercitam login, cadastro, validações de formulário,
navegação entre telas e interação com componentes nativos — demonstrando não
apenas escrita de testes, mas arquitetura de automação, evidências, execução
multiplataforma, cloud devices, Git e CI/CD.

Todos os seletores foram extraídos do **código-fonte oficial** do aplicativo;
a rastreabilidade completa está em [`docs/app-analysis.md`](docs/app-analysis.md).

## Tecnologias

| Camada | Ferramenta | Versão |
|---|---|---|
| Linguagem | JavaScript (ESM) | Node.js ≥ 20.19 |
| Framework de automação | WebdriverIO | 9.x |
| Driver mobile | Appium | 3.x (UiAutomator2 / XCUITest) |
| Test runner | Mocha | 12.x |
| Assertions | Chai | 6.x |
| Arquitetura | Page Object Model | — |
| Relatórios | Allure Report | 2.x |
| Cloud devices | BrowserStack App Automate | — |
| CI/CD | GitLab CI/CD | — |

> **Por que ESM?** Chai 6 e Mocha 12 são *ESM-only*. O projeto usa
> `"type": "module"`, e os Page Objects exportam com `export default` em vez de
> `module.exports` — mesma arquitetura, sintaxe atual.

## Arquitetura

### Page Object Model

Cada tela do aplicativo é uma classe que concentra **elementos, seletores,
ações, esperas e comportamentos reutilizáveis**. As specs descrevem apenas a
jornada e as asserções — **nenhum seletor aparece em arquivo `.spec.js`**.

```
spec  →  page object  →  elemento
 |            |
 |            └── seletores, esperas explícitas, ações compostas
 └── describe / it / assertions (Chai)
```

* `BasePage` centraliza esperas (`waitForIsShown`, `tap`, `fill`,
  `isEventuallyDisplayed`) para que nenhum Page Object repita `waitForDisplayed`.
* Componentes transversais (tab bar, menu lateral e alerta nativo) ficam em
  `test/pageobjects/components/` e são compostos pelas páginas e specs.
* Diferenças entre Android e iOS ficam isoladas em `test/utils/environment.js`
  e `test/utils/selectors.js` — as specs são idênticas nas duas plataformas.
* Page Objects **não contêm asserções**; retornam estado (texto, booleano) para
  que a spec decida o que validar.

### Estratégia de seletores

Prioridade adotada, conforme o próprio app expõe os identificadores:

1. **Accessibility ID** (`~id`) — estratégia padrão; o app gera
   `accessibilityLabel` no Android e `testID` no iOS a partir do mesmo valor.
2. **Busca por texto** (`UiSelector().text()` / predicate iOS) — apenas para as
   mensagens de validação, que o app renderiza sem identificador.
3. **XPath / class chain** — **somente** para alertas nativos e picker, que são
   renderizados pelo sistema operacional. Sem XPath absoluto e sem seletores
   por posição.

## Estrutura de arquivos

```
mobile-automation/
│
├── apps/                          # binários da aplicação (não versionados)
│   ├── android/                   #   android.wdio.native.app.v2.2.0.apk
│   └── ios/                       #   wdiodemoapp.app
│
├── config/
│   ├── wdio.shared.conf.js        # base comum (specs, mocha, allure, hooks)
│   ├── wdio.android.conf.js       # UiAutomator2
│   ├── wdio.ios.conf.js           # XCUITest
│   ├── wdio.browserstack.conf.js  # devices reais
│   ├── app-path.js                # resolução do binário
│   ├── environment-info.js        # metadados publicados no Allure
│   └── merge.js                   # deep merge das configurações
│
├── docs/
│   ├── app-analysis.md            # telas, seletores e diferenças Android/iOS
│   └── test-scenarios.md          # CT-01 a CT-10 detalhados
│
├── scripts/
│   ├── download-app.mjs           # baixa os binários oficiais
│   ├── upload-browserstack.mjs    # envia o app e retorna o app_url
│   ├── validate-pageobjects.mjs   # valida seletores sem device
│   ├── validate-configs.mjs       # valida capabilities e ausência de segredos
│   ├── validate-ci.mjs            # valida o .gitlab-ci.yml
│   └── mocha-globals-stub.js      # stub dos globais para o dry-run
│
├── test/
│   ├── data/                      # massas JSON (data-driven)
│   │   ├── users.json
│   │   ├── signup.json
│   │   ├── forms.json
│   │   └── navigation.json
│   │
│   ├── pageobjects/
│   │   ├── base.page.js
│   │   ├── home.page.js
│   │   ├── login.page.js
│   │   ├── forms.page.js
│   │   ├── swipe.page.js
│   │   ├── drag.page.js
│   │   ├── permissions.page.js
│   │   ├── data-management.page.js
│   │   └── components/
│   │       ├── tab-bar.component.js
│   │       ├── side-menu.component.js
│   │       └── native-alert.component.js
│   │
│   ├── specs/
│   │   ├── login.spec.js
│   │   ├── signup.spec.js
│   │   ├── forms.spec.js
│   │   └── navigation.spec.js
│   │
│   └── utils/
│       ├── environment.js         # plataforma e metadados da sessão
│       ├── selectors.js           # seletores por texto multiplataforma
│       ├── gestures.js            # swipe e drag com W3C Actions
│       ├── screenshot.js          # evidência de falha
│       ├── logger.js              # log com redação de segredos
│       └── data-loader.js         # carga das massas JSON
│
├── screenshots/                   # evidências de falha (não versionadas)
├── logs/                          # logs de execução (não versionados)
│
├── .env.example
├── .gitlab-ci.yml
├── package.json
└── README.md
```

## Pré-requisitos

| Requisito | Observação |
|---|---|
| **Node.js ≥ 20.19** | `nvm use` respeita o `.nvmrc` |
| **Java JDK 11+** | necessário para o Android SDK e para o `allure generate` |
| **Appium 3** | instalado como dependência do projeto (`npx appium`) |
| **Android SDK + Emulador** | somente para `npm run test:android` |
| **Xcode (completo)** | somente para `npm run test:ios` — **exclusivo de macOS** |

## Instalação

```bash
git clone git@github.com:henriqueos92/desafio-qa-mobile-wdio.git
cd desafio-qa-mobile-wdio
npm install
cp .env.example .env
```

Baixe os binários oficiais da aplicação sob teste:

```bash
npm run app:download
```

## Appium

O Appium vem como dependência do projeto. Instale os drivers uma única vez:

```bash
npx appium driver install uiautomator2
npx appium driver install xcuitest
npx appium driver list --installed
```

Diagnostique o ambiente (SDKs, variáveis, dependências):

```bash
npx appium-doctor
```

Não é necessário subir o servidor manualmente: `@wdio/appium-service` inicia e
encerra o Appium automaticamente em cada execução local.

## Android

Pré-requisitos específicos:

1. Instalar o **Android Studio** e, pelo SDK Manager, o **Android SDK** e o
   **Android Emulator**.
2. Criar um **AVD** pelo Device Manager (ex.: `Pixel_8_API_35`).
3. Exportar as variáveis do SDK:

```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator"
```

Suba o emulador (ou conecte um device físico com depuração USB) e confirme:

```bash
adb devices
```

Execute:

```bash
npm run test:android
```

Definindo `ANDROID_AVD` no `.env`, o próprio Appium sobe o emulador. O caminho
do APK vem de `ANDROID_APP_PATH` ou, na ausência dela, do binário em
`apps/android`.

**Capabilities usadas** (confirmadas no `AndroidManifest.xml` oficial):
`appPackage=com.wdiodemoapp`, `appActivity=com.wdiodemoapp.MainActivity`,
`automationName=UiAutomator2`, `autoGrantPermissions=true`.

## iOS

**Etapas exclusivas de macOS** — não há como executar iOS em Linux/Windows:

1. Instalar o **Xcode** completo pela App Store (Command Line Tools **não**
   bastam) e aceitar a licença:

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept
```

2. Instalar as dependências do XCUITest:

```bash
brew install carthage ios-deploy
npx appium driver install xcuitest
```

3. Listar os simuladores disponíveis e ajustar `IOS_DEVICE_NAME` no `.env`:

```bash
xcrun simctl list devices available
```

Execute:

```bash
npm run test:ios
```

**Capabilities usadas** (confirmadas no `Info.plist` do build v2.2.0):
`bundleId=org.wdiodemoapp`, `automationName=XCUITest`. `autoAcceptAlerts` fica
**desligado** de propósito — os alertas do app fazem parte das asserções.

## BrowserStack

1. Cadastre as credenciais no `.env` (nunca no código):

```bash
BROWSERSTACK_USERNAME=...
BROWSERSTACK_ACCESS_KEY=...
```

2. Envie o binário e obtenha o `app_url`:

```bash
npm run app:download -- --platform=android
npm run app:upload -- --platform=android
# saída: [app:upload] app_url: bs://a1b2c3d4e5...
```

3. Use o valor retornado como `BROWSERSTACK_APP_ID` e execute:

```bash
export BROWSERSTACK_APP_ID=bs://a1b2c3d4e5...
npm run test:browserstack
```

O upload equivale a:

```bash
curl -u "$BROWSERSTACK_USERNAME:$BROWSERSTACK_ACCESS_KEY" \
  -X POST https://api-cloud.browserstack.com/app-automate/upload \
  -F "file=@apps/android/android.wdio.native.app.v2.2.0.apk"
```

### Matriz de dispositivos

Definida em `config/wdio.browserstack.conf.js` e ajustável por variáveis:

| Plataforma | Device padrão | Versão |
|---|---|---|
| Android | Samsung Galaxy S23 | 13.0 |
| Android | Google Pixel 8 | 14.0 |
| iOS | iPhone 15 | 17 |

Por padrão apenas a matriz Android roda (o `app_url` do APK não serve para
iOS). Use `BROWSERSTACK_PLATFORM=ios` ou `=all` após enviar o `.ipa`
correspondente. Cada sessão é registrada com `projectName`, `buildName`
(derivado do `CI_PIPELINE_ID` no GitLab) e `sessionName`.

## Allure Report

```bash
npm run report:generate   # allure-results/ -> allure-report/
npm run report:open       # abre o relatório no navegador
npm run report:clean      # remove resultados e relatório
```

O relatório apresenta quantidade de testes executados, aprovados e falhados,
duração, suítes, logs, **screenshots das falhas anexadas ao teste** e as
informações de ambiente:

```
Platform=Android
Device=Pixel_8_API_35
PlatformVersion=15
AutomationName=UiAutomator2
Automation=Appium
Framework=WebdriverIO
TestRunner=Mocha
Assertions=Chai
Application=native-demo-app
AppVersion=v2.2.0
Environment=Local
```

Na execução em nuvem os mesmos campos registram `Environment=BrowserStack`,
`Provider`, `ProjectName`, `BuildName` e a lista de `Devices`.

## Cenários automatizados

Detalhamento completo (objetivo, pré-condições, dados, passos e resultado
esperado) em [`docs/test-scenarios.md`](docs/test-scenarios.md).

| ID | Cenário | Spec | Prioridade |
|---|---|---|---|
| CT-01 | Login com credenciais válidas | `login.spec.js` | Alta |
| CT-02 | Login com e-mail em formato inválido | `login.spec.js` | Alta |
| CT-03 | Mensagem de erro para senha com menos de 8 caracteres | `login.spec.js` | Alta |
| CT-04 | Login orientado a dados (data-driven) | `login.spec.js` | Alta |
| CT-05 | Cadastro de novo usuário com sucesso | `signup.spec.js` | Alta |
| CT-06 | Validação de campos obrigatórios no cadastro | `signup.spec.js` | Alta |
| CT-07 | Navegação entre telas pela tab bar | `navigation.spec.js` | Média |
| CT-08 | Navegação para tela não fixada via menu lateral | `navigation.spec.js` | Média |
| CT-09 | Preenchimento de formulário e reflexo do valor digitado | `forms.spec.js` | Alta |
| CT-10 | Interação com componentes mobile (switch, dropdown, botões) | `forms.spec.js` | Alta |

Os 10 cenários expandem para **27 testes executáveis**, por causa das massas
de dados.

## Data-driven testing

As massas ficam em `test/data/*.json` e são consumidas por
`test/utils/data-loader.js`. Incluir um novo caso **não exige mudança de
código**:

```json
{
  "id": "CT-04.7",
  "description": "login com e-mail com espaço",
  "email": "usuario invalido@webdriver.io",
  "password": "SuperSecret123",
  "expected": "invalid-email"
}
```

```javascript
const users = loadData('users');

users.forEach((user) => {
    it(`${user.id} - deve validar ${user.description}`, async () => {
        await loginPage.login(user.email, user.password);
        await EXPECTATIONS[user.expected]();
    });
});
```

O campo `expected` seleciona a estratégia de verificação (`success`,
`invalid-email`, `short-password`), mantendo a lógica do teste estável.

| Arquivo | Alimenta |
|---|---|
| `users.json` | CT-04 — 6 combinações de login |
| `signup.json` | CT-05 e CT-06 |
| `forms.json` | CT-09 (textos) e CT-10 (opções do dropdown) |
| `navigation.json` | CT-07 e CT-08 (rotas e telas esperadas) |

## Screenshots

Capturadas **apenas quando um teste falha**, pelo hook `afterTest`, em
`screenshots/` (fora do versionamento). O nome identifica plataforma, suíte,
teste e data/hora, é sanitizado e nunca sobrescreve um arquivo existente:

```
android_login_ct-02-deve-exibir-erro-de-formato_2026-09-05T14-31-07-482Z.png
```

A mesma imagem é anexada ao teste correspondente no Allure. Uma falha na
captura da evidência é registrada como aviso e **nunca mascara a falha real**.

## Logs

Gravados em `logs/execution-<data>.log` e também no console:

```
2026-09-05T14:23:05.986Z [INFO] SESSÃO iniciada — Platform=Android | PlatformVersion=15 | Device=Pixel_8_API_35 | ...
2026-09-05T14:23:05.989Z [INFO] INÍCIO  Login > CT-01 - deve autenticar o usuário
2026-09-05T14:23:05.990Z [INFO] SUCESSO Login > CT-01 - deve autenticar o usuário (4210ms)
2026-09-05T14:23:05.990Z [ERROR] FALHA   Login > CT-02 - erro de e-mail (912ms)
2026-09-05T14:23:05.990Z [ERROR]         motivo: expected true to be false
2026-09-05T14:23:05.991Z [INFO] EVIDÊNCIA screenshot salva em .../screenshots/android_login_...png
```

Uma linha por evento relevante — sem ruído. **Senhas, tokens, e o usuário e a
access key do BrowserStack são mascarados** (`***REDACTED***`) antes de
qualquer gravação. Os logs do próprio Appium ficam no mesmo diretório.

## CI/CD

Pipeline em [`.gitlab-ci.yml`](.gitlab-ci.yml), disparado em **commits de
branch e em merge requests** (sem pipelines duplicados):

| Stage | Job | O que faz |
|---|---|---|
| `install` | `install:dependencies` | aquece o cache do npm (`npm ci`) |
| `validate` | `validate:project` | valida seletores (Android e iOS), configurações e specs — sem device |
| `test` | `test:browserstack` | executa a suíte em dispositivos reais |
| `report` | `report:allure` | gera o Allure e publica os artefatos |
| `report` | `pages` | publica o relatório no GitLab Pages (branch padrão), **inclusive quando os testes falham** |

Rodar um **emulador Android dentro de um runner compartilhado do GitLab exige
KVM/virtualização**, normalmente indisponível; por isso o pipeline usa o
BrowserStack. O job de teste só executa quando as credenciais existem, e envia
o app automaticamente caso `BROWSERSTACK_APP_ID` não esteja definido.

Todos os artefatos usam `when: always`, então **evidências ficam disponíveis
mesmo quando os testes falham**: `allure-results/`, `allure-report/`,
`screenshots/` e `logs/`.

O job `pages` usa `when: always` de propósito: o relatório precisa estar
publicado justamente quando algo falha. O `needs: report:allure` continua
impedindo a publicação caso o próprio relatório não seja gerado — não há o que
publicar nesse caso.

`node_modules` (~260 MB) **não** trafega como artefato entre jobs — o cache
guarda apenas o diretório de download do npm (`.npm/`), e cada job reconstrói
as dependências com `npm ci --prefer-offline`, resolvendo tudo offline. Isso
evita consumir cota de armazenamento a cada pipeline. `npm run validate:ci`
falha se alguém reintroduzir `node_modules` como artefato.

### Cadastrando as variáveis no GitLab

`Settings > CI/CD > Variables > Add variable`, para cada uma:

| Key | Value | Flags |
|---|---|---|
| `BROWSERSTACK_USERNAME` | seu usuário | Masked, Protected |
| `BROWSERSTACK_ACCESS_KEY` | sua access key | Masked, Protected |
| `BROWSERSTACK_APP_ID` | `bs://...` (opcional) | Masked |

Nenhum segredo é escrito no YAML — apenas referências às variáveis.

## Variáveis de ambiente

Todas documentadas em [`.env.example`](.env.example), sem valores reais.

| Variável | Uso |
|---|---|
| `BROWSERSTACK_USERNAME` / `BROWSERSTACK_ACCESS_KEY` | credenciais do App Automate |
| `BROWSERSTACK_APP_ID` | `app_url` retornado pelo upload |
| `BROWSERSTACK_PROJECT_NAME` / `BROWSERSTACK_BUILD_NAME` | organização das execuções |
| `BROWSERSTACK_PLATFORM` | `android` (padrão), `ios` ou `all` |
| `ANDROID_APP_PATH` / `IOS_APP_PATH` | caminho do binário |
| `ANDROID_DEVICE_NAME` / `ANDROID_PLATFORM_VERSION` / `ANDROID_AVD` | device Android |
| `IOS_DEVICE_NAME` / `IOS_PLATFORM_VERSION` / `IOS_UDID` | simulador iOS |
| `APPIUM_HOST` / `APPIUM_PORT` | servidor Appium |
| `WAIT_TIMEOUT` / `SUBMIT_TIMEOUT` / `MOCHA_TIMEOUT` | esperas explícitas |
| `WDIO_LOG_LEVEL` / `TEST_ENV` | verbosidade e rótulo de ambiente |

O arquivo `.env` real está no `.gitignore` e nunca deve ser versionado.

## Validações sem device

O projeto valida boa parte de si mesmo sem emulador, simulador ou credenciais:

```bash
npm run validate              # roda todas as validações abaixo
npm run validate:selectors    # 49 seletores conferidos (use -- --platform=ios)
npm run validate:configs      # capabilities W3C e ausência de segredos
npm run validate:specs        # estrutura das suites (mocha --dry-run)
npm run validate:ci           # estrutura do .gitlab-ci.yml
```

## Limitações conhecidas

* A execução end-to-end depende de emulador/simulador ou de credenciais do
  BrowserStack. Onde não há esse acesso, as validações acima cobrem seletores,
  configurações, estrutura de testes e pipeline.
* O carrossel da tela Swipe usa `testID` puro (sem o helper do app), logo não é
  acessível por *accessibility id* no Android — o gesto é feito por
  coordenadas relativas. Ver `docs/app-analysis.md`.
* A tela Webview não possui identificador no container; a navegação até ela é
  validada por outros meios.
* Alertas nativos e o picker são renderizados pelo sistema operacional e podem
  variar entre versões de Android/iOS — confirme com o **Appium Inspector** ao
  rodar contra uma versão de OS diferente.

## Melhorias futuras

* Execução paralela por plataforma com *sharding* de specs.
* Testes visuais (comparação de imagens) para a Home e para os formulários.
* Cobertura das telas Permissions e Data management além da navegação
  (permissões nativas e persistência em SQLite/SecureStore).
* Histórico e tendências no Allure (`allure-results/history`) preservados entre
  pipelines.
* Retentativa automática apenas de testes *flaky*, com marcação no relatório.
* `docker-compose` com Appium + emulador para execução local reprodutível.
* Integração com um gerenciador de casos de teste (Xray/TestRail) usando os
  IDs `CT-xx` já presentes nos títulos.
