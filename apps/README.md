# Binários da aplicação sob teste

Os binários do `native-demo-app` **não são versionados** (ver `.gitignore`) — são
baixados sob demanda a partir dos *releases* oficiais do repositório
[`webdriverio/native-demo-app`](https://github.com/webdriverio/native-demo-app/releases).

```bash
npm run app:download          # baixa Android + iOS da versão padrão
npm run app:download -- --platform=android
npm run app:download -- --platform=ios --version=v2.2.0
```

Estrutura resultante:

```
apps/
├── android/android.wdio.native.app.v2.2.0.apk
└── ios/wdio.native.app.v2.2.0.app        (extraído do .zip do simulador)
```

Os caminhos são resolvidos automaticamente pelas configurações do WebdriverIO
(`config/wdio.android.conf.js` e `config/wdio.ios.conf.js`), e podem ser
sobrescritos pelas variáveis de ambiente `ANDROID_APP_PATH` e `IOS_APP_PATH`.
