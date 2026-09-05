# Cenários de teste automatizados

Aplicação sob teste: **`webdriverio/native-demo-app` v2.2.0** (Android e iOS).
Todos os cenários derivam de funcionalidades **existentes** no app — ver
[`app-analysis.md`](./app-analysis.md) para a rastreabilidade dos seletores.

| ID | Título | Spec | Prioridade |
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
| CT-10 | Interação com componentes mobile (switch, dropdown e botões) | `forms.spec.js` | Alta |

---

## CT-01 — Login com credenciais válidas

```
ID:                CT-01
Título:            Login com credenciais válidas
Objetivo:          Garantir que o app autentica o usuário e exibe o alerta
                   nativo de sucesso quando e-mail e senha são válidos.
Pré-condições:     App instalado e aberto na tela inicial (Home).
Dados:             email = qa.automation@webdriver.io
                   password = SuperSecret123
Passos:            1. Navegar para a aba "Login".
                   2. Selecionar a aba interna "Login".
                   3. Preencher o campo de e-mail.
                   4. Preencher o campo de senha.
                   5. Tocar no botão "LOGIN".
                   6. Aguardar o alerta nativo (o app simula 1500 ms de API).
Resultado esperado: Alerta nativo com título "Success" e mensagem
                   "You are logged in!". Ao confirmar com "OK" o alerta é
                   fechado e a tela de Login permanece visível.
Prioridade:        Alta
```

## CT-02 — Login com e-mail em formato inválido

```
ID:                CT-02
Título:            Login com e-mail em formato inválido
Objetivo:          Garantir que a validação de formato de e-mail bloqueia o
                   envio do formulário e exibe a mensagem de erro correta.
Pré-condições:     App aberto na tela de Login, aba interna "Login" ativa.
Dados:             email = email-invalido
                   password = SuperSecret123
Passos:            1. Navegar para a aba "Login".
                   2. Preencher o e-mail com um valor sem "@" e domínio.
                   3. Preencher a senha com um valor válido.
                   4. Tocar no botão "LOGIN".
Resultado esperado: A mensagem "Please enter a valid email address" é exibida
                   abaixo do campo de e-mail e NENHUM alerta de sucesso é
                   apresentado.
Prioridade:        Alta
```

## CT-03 — Mensagem de erro para senha com menos de 8 caracteres

```
ID:                CT-03
Título:            Mensagem de erro para senha com menos de 8 caracteres
Objetivo:          Validar a regra de negócio de tamanho mínimo de senha
                   (>= 8 caracteres) e a mensagem de erro correspondente.
Pré-condições:     App aberto na tela de Login, aba interna "Login" ativa.
Dados:             email = qa.automation@webdriver.io
                   password = 123
Passos:            1. Navegar para a aba "Login".
                   2. Preencher um e-mail válido.
                   3. Preencher uma senha com 3 caracteres.
                   4. Tocar no botão "LOGIN".
Resultado esperado: A mensagem "Please enter at least 8 characters" é exibida
                   abaixo do campo de senha e o login não é concluído.
Prioridade:        Alta
```

## CT-04 — Login orientado a dados (data-driven)

```
ID:                CT-04
Título:            Login orientado a dados (data-driven)
Objetivo:          Executar a mesma jornada de login para múltiplas massas de
                   dados definidas em arquivo JSON, sem alterar a lógica do
                   teste ao incluir novos casos.
Pré-condições:     App aberto; arquivo test/data/users.json disponível.
Dados:             test/data/users.json — cada registro contém
                   { description, email, password, expected, expectedMessage }
                   com expected = "success" | "invalid-email" | "short-password"
Passos:            1. Para cada registro do JSON:
                   2. Navegar para a aba "Login" e limpar o formulário.
                   3. Preencher e-mail e senha com os dados do registro.
                   4. Tocar em "LOGIN".
                   5. Validar o resultado conforme o campo "expected".
Resultado esperado: Registros "success" produzem o alerta "You are logged in!";
                   registros de erro produzem a mensagem inline esperada.
                   Adicionar um novo objeto ao JSON cria um novo teste
                   automaticamente.
Prioridade:        Alta
```

## CT-05 — Cadastro de novo usuário com sucesso

```
ID:                CT-05
Título:            Cadastro de novo usuário com sucesso
Objetivo:          Garantir que a aba "Sign up" cadastra o usuário quando
                   e-mail, senha e confirmação de senha são válidos e iguais.
Pré-condições:     App aberto na tela de Login.
Dados:             email = novo.usuario@webdriver.io
                   password = SuperSecret123
                   repeatPassword = SuperSecret123
Passos:            1. Navegar para a aba "Login".
                   2. Tocar na aba interna "Sign up".
                   3. Preencher e-mail, senha e confirmação de senha.
                   4. Tocar no botão "SIGN UP".
                   5. Aguardar o alerta nativo.
Resultado esperado: Alerta nativo com título "Signed Up!" e mensagem
                   "You successfully signed up!".
Prioridade:        Alta
```

## CT-06 — Validação de campos obrigatórios no cadastro

```
ID:                CT-06
Título:            Validação de campos obrigatórios no cadastro
Objetivo:          Garantir que o formulário de cadastro não é submetido com
                   campos vazios e que todas as mensagens de erro aparecem.
Pré-condições:     App aberto na tela de Login, aba interna "Sign up" ativa.
Dados:             Nenhum (todos os campos em branco); e massa complementar de
                   test/data/signup.json para o caso de senhas divergentes.
Passos:            1. Navegar para a aba "Login".
                   2. Tocar na aba interna "Sign up".
                   3. Sem preencher nenhum campo, tocar em "SIGN UP".
Resultado esperado: São exibidas as mensagens "Please enter a valid email
                   address" e "Please enter at least 8 characters", e nenhum
                   alerta de sucesso é exibido.
Prioridade:        Alta
```

## CT-07 — Navegação entre telas pela tab bar

```
ID:                CT-07
Título:            Navegação entre telas pela tab bar
Objetivo:          Garantir que cada aba fixada leva à tela correspondente e
                   que a tela anterior deixa de ser exibida.
Pré-condições:     App aberto com a configuração padrão de abas
                   (Home, Webview, Login, Forms, Swipe, Drag).
Dados:             test/data/navigation.json — lista de { tab, screen }
Passos:            1. A partir da Home, tocar na aba "Login".
                   2. Tocar na aba "Forms".
                   3. Tocar na aba "Swipe".
                   4. Tocar na aba "Drag".
                   5. Tocar na aba "Home".
Resultado esperado: A cada passo o container da tela correspondente
                   (~Login-screen, ~Forms-screen, ~Swipe-screen,
                   ~Drag-drop-screen, ~Home-screen) fica visível.
Prioridade:        Média
```

## CT-08 — Navegação para tela não fixada via menu lateral

```
ID:                CT-08
Título:            Navegação para tela não fixada via menu lateral
Objetivo:          Garantir o acesso às telas que não estão na tab bar por
                   padrão (Permissions e Data management) através do menu.
Pré-condições:     App aberto; abas "Permissions" e "Data management" não
                   fixadas (comportamento padrão do app).
Dados:             Nenhum.
Passos:            1. Tocar no botão "Menu" da tab bar.
                   2. Validar que o painel lateral é exibido.
                   3. Tocar no item "Permissions".
                   4. Reabrir o menu e tocar no item "Data".
Resultado esperado: O painel ~tab-side-menu-panel é exibido; a tela
                   ~Permissions-screen e depois ~DataManagement-screen ficam
                   visíveis, e o menu é fechado após cada seleção.
Prioridade:        Média
```

## CT-09 — Preenchimento de formulário e reflexo do valor digitado

```
ID:                CT-09
Título:            Preenchimento de formulário e reflexo do valor digitado
Objetivo:          Validar o comportamento do app APÓS a interação: o texto
                   digitado é espelhado em tempo real no elemento de resultado.
Pré-condições:     App aberto na tela "Forms".
Dados:             test/data/forms.json -> inputTexts
Passos:            1. Navegar para a aba "Forms".
                   2. Digitar o texto no campo de input.
                   3. Ocultar o teclado.
                   4. Ler o elemento de resultado.
Resultado esperado: O elemento ~input-text-result exibe exatamente o texto
                   digitado.
Prioridade:        Alta
```

## CT-10 — Interação com componentes mobile (switch, dropdown e botões)

```
ID:                CT-10
Título:            Interação com diferentes componentes mobile
Objetivo:          Exercitar componentes nativos distintos (switch, picker,
                   botão habilitado e botão desabilitado) e validar o
                   comportamento resultante de cada um.
Pré-condições:     App aberto na tela "Forms".
Dados:             test/data/forms.json -> dropdownOptions
Passos:            1. Navegar para a aba "Forms".
                   2. Alternar o switch e ler o texto auxiliar.
                   3. Alternar o switch novamente.
                   4. Selecionar uma opção no dropdown.
                   5. Tocar no botão "Active".
                   6. Fechar o alerta e verificar o botão "Inactive".
Resultado esperado: O texto do switch alterna entre "Click to turn the switch
                   ON" e "... OFF"; a opção escolhida passa a ser exibida no
                   dropdown; o botão "Active" abre o alerta "This button is
                   active"; o botão "Inactive" permanece sem ação.
Prioridade:        Alta
```

---

## Cobertura dos requisitos do desafio

| Requisito obrigatório | Cenário |
|---|---|
| Login válido | CT-01 |
| Login inválido | CT-02 |
| Cadastro | CT-05 |
| Validação de campos obrigatórios | CT-06 |
| Mensagem de erro | CT-03 |
| Navegação entre telas | CT-07, CT-08 |
| Preenchimento de formulário | CT-09 |
| Interação com diferentes componentes mobile | CT-10 |
| Validação de comportamento após interação | CT-09, CT-10 |
| Cenário data-driven | CT-04 (e massas em CT-06, CT-07, CT-09, CT-10) |
