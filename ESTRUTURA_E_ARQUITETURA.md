# Estrutura e arquitetura

## Árvore do projeto

A árvore abaixo contém os arquivos versionados da aplicação. Dependências
instaladas (`node_modules`), cache Angular (`.angular`) e saídas de build (`dist`,
`out-tsc`) são gerados localmente e não fazem parte do código-fonte versionado.

```text
.
├── README.md
├── ESTRUTURA_E_ARQUITETURA.md
├── securityReview.md
├── firebase.json
├── firestore.rules
└── Budget manager/
    ├── .gitignore
    ├── angular.json
    ├── package.json
    ├── package-lock.json
    ├── tsconfig.json
    ├── tsconfig.app.json
    ├── tsconfig.spec.json
    ├── public/
    │   ├── AreaChurrasco.png
    │   ├── Beliche.png
    │   ├── Cozinha.png
    │   ├── EstandeLivros.png
    │   ├── EstanteBranca.png
    │   ├── Homero.jpeg
    │   ├── Logo.png
    │   ├── Mariano.jpeg
    │   ├── Modulos.png
    │   ├── ParedeTrabalhada.png
    │   ├── SalaBranca.png
    │   ├── SalaCadeira.png
    │   ├── SalaVerd.png
    │   └── Salald.png
    └── src/
        ├── index.html
        ├── main.ts
        ├── styles.css
        ├── environments/
        │   ├── environment.ts
        │   └── environment.development.ts
        └── app/
            ├── app.ts
            ├── app.html
            ├── app.css
            ├── app.config.ts
            ├── app.routes.ts
            ├── app.spec.ts
            ├── guards/
            │   ├── auth-guard.ts
            │   └── auth-guard.spec.ts
            ├── models/
            │   ├── orcamento.model.ts
            │   └── usuario.model.ts
            ├── services/
            │   ├── auth.ts
            │   ├── auth.spec.ts
            │   ├── orcamento.service.ts
            │   └── orcamento.service.spec.ts
            ├── testing/
            │   └── firebase-test-providers.ts
            ├── utils/
            │   └── error-code.ts
            ├── component/
            │   ├── card-summary/
            │   │   ├── card-summary.ts
            │   │   ├── card-summary.html
            │   │   ├── card-summary.css
            │   │   └── card-summary.spec.ts
            │   ├── contact-form/
            │   │   ├── contact-form.ts
            │   │   ├── contact-form.html
            │   │   ├── contact-form.css
            │   │   └── contact-form.spec.ts
            │   ├── menu-lateral/
            │   │   ├── menu-lateral.ts
            │   │   ├── menu-lateral.html
            │   │   ├── menu-lateral.css
            │   │   └── menu-lateral.spec.ts
            │   ├── menu-top/
            │   │   ├── menu-top.ts
            │   │   ├── menu-top.html
            │   │   ├── menu-top.css
            │   │   └── menu-top.spec.ts
            │   ├── user/
            │   │   ├── user.ts
            │   │   ├── user.html
            │   │   ├── user.css
            │   │   └── user.spec.ts
            │   └── whatsapp-selector/
            │       ├── whatsapp-selector.ts
            │       ├── whatsapp-selector.html
            │       ├── whatsapp-selector.css
            │       └── whatsapp-selector.spec.ts
            └── pages/
                ├── cadastro/
                │   ├── cadastro.ts
                │   ├── cadastro.html
                │   ├── cadastro.css
                │   └── cadastro.spec.ts
                ├── dashboard/
                │   ├── dashboard.ts
                │   ├── dashboard.html
                │   ├── dashboard.css
                │   └── dashboard.spec.ts
                ├── formulario/
                │   ├── formulario.ts
                │   ├── formulario.html
                │   ├── formulario.css
                │   └── formulario.spec.ts
                ├── lading-page/
                │   ├── lading-page.ts
                │   ├── lading-page.html
                │   ├── lading-page.css
                │   └── lading-page.spec.ts
                ├── login/
                │   ├── login.ts
                │   ├── login.html
                │   ├── login.css
                │   └── login.spec.ts
                ├── not-found/
                │   ├── not-found.ts
                │   ├── not-found.html
                │   ├── not-found.css
                │   └── not-found.spec.ts
                └── preview/
                    ├── preview.ts
                    ├── preview.html
                    ├── preview.css
                    └── preview.spec.ts
```

## Visão geral da arquitetura

- `main.ts` inicializa a aplicação standalone Angular usando `app.config.ts`.
- `app.config.ts` registra o roteador e os provedores Firebase Authentication e
  Cloud Firestore, inicializados com o environment ativo.
- `app.routes.ts` associa URLs a componentes carregados sob demanda e protege
  telas internas com `authGuard`.
- `pages/` contém as telas roteáveis; `component/` contém elementos
  reutilizáveis; `services/` concentra operações compartilhadas; `models/`
  define os contratos TypeScript.
- O Firestore é acessado pelo SDK modular por meio do AngularFire. EmailJS é
  chamado diretamente pelo formulário público. Links de WhatsApp apontam para
  `wa.me`.
- `firebase.json` aponta para `firestore.rules`; para que a política local
  proteja o banco de produção, publique as regras no projeto Firebase correto.

## Mapeamento página por página

### Página inicial pública — `/`

- **Objetivo da Página:** Apresentar a marcenaria, exibir meios de contato e
  oferecer envio de solicitação comercial.
- **Funções e Métodos:** `LadingPageComponent` compõe a tela com o seletor de
  WhatsApp e `ContactForm`; a lógica de validação e envio fica no formulário.
- **Bibliotecas e Dependências:** Angular standalone, `CommonModule`,
  `WhatsappSelectorComponent` e `ContactForm`.
- **Imports:** `Component`, `CommonModule`, `WhatsappSelectorComponent` e
  `ContactForm`.
- **Integrações de API:** EmailJS via `ContactForm`; links externos para
  WhatsApp e Instagram.
- **Mecanismos de Segurança:** Rota pública sem guard. Conteúdo renderizado por
  interpolação Angular; os dados de contato são validados no cliente. EmailJS
  usa chave pública, que não deve ser tratada como segredo.

### Login — `/login`

- **Objetivo da Página:** Autenticar usuários e iniciar redefinição de senha.
- **Funções e Métodos:** `validarLogin()` valida o formulário e chama o serviço
  de autenticação; `esqueciMinhaSenha()` solicita redefinição; `alternarSenha()`
  alterna a visibilidade do campo; `tratarErroFirebase()` converte códigos em
  mensagens para a tela.
- **Bibliotecas e Dependências:** Angular Reactive Forms, Router e
  `AuthService`.
- **Imports:** `Component`, `inject`, `ChangeDetectorRef`, `FormControl`,
  `FormGroup`, `ReactiveFormsModule`, `Validators`, `Router`, `AuthService` e
  `errorCode`.
- **Integrações de API:** Firebase Authentication (login e envio de e-mail de
  redefinição) e gravação do último acesso no Firestore via `AuthService`.
- **Mecanismos de Segurança:** Página pública; valida e-mail e campos
  obrigatórios no cliente. Os erros exibidos não incluem detalhes do backend;
  os logs registram somente o código do erro.

### Dashboard — `/dashboard`

- **Objetivo da Página:** Listar e pesquisar orçamentos, resumir status e
  disponibilizar ações de visualização, duplicação e exclusão.
- **Funções e Métodos:** `inscreverOrcamentos()` observa a coleção;
  `executarLimpezaAntigos()` executa a limpeza automática; getters calculam
  filtros, totais e paginação; `duplicarOrcamento()` duplica um orçamento;
  `confirmarExclusao()` exclui após confirmação; `formatarData()` e auxiliares
  organizam a apresentação.
- **Bibliotecas e Dependências:** Angular Forms, Router, RxJS, Firebase
  Timestamp, `OrcamentoService`, `MenuTop` e `CardSummary`.
- **Imports:** `ChangeDetectorRef`, `Component`, `DestroyRef`, `HostListener`,
  `inject`, `NgZone`, `OnInit`, `takeUntilDestroyed`, `FormsModule`,
  `RouterLink`, `Timestamp`, `CardSummary`, `MenuTop`, `Orcamento`,
  `OrcamentoService` e `errorCode`.
- **Integrações de API:** Observação de `orcamentos`; exclusão de documentos
  antigos, duplicação e exclusão pelo Firestore.
- **Datas:** Duplicações e atualizações gravam a data local atual no campo
  `data_orcamento`.
- **Mecanismos de Segurança:** Rota protegida por `authGuard`; erros são
  apresentados por mensagens genéricas. A limpeza em lote depende das regras
  Firestore e executa com a identidade do usuário autenticado. As regras locais
  limitam a coleção a usuários autenticados; o guard só controla a navegação da
  interface.

### Formulário de orçamento — `/orcamento` e `/orcamento/:id`

- **Objetivo da Página:** Criar orçamento quando não há `:id`; preencher e
  atualizar o documento existente quando há `:id`.
- **Funções e Métodos:** Carregamento inicial e `preencherFormulario()`;
  `adicionarMovel()` e `removerMovel()` administram itens; `subtotal()` e
  `montarOrcamento()` calculam valores; `visualizar()` preserva rascunho e
  navega à prévia; `salvar()` valida e cria/atualiza; `alternarStatus()` muda o
  estado da produção.
- **Bibliotecas e Dependências:** Angular Reactive Forms, Router,
  `takeUntilDestroyed`, `MenuTop`, modelos `ItemOrcamento`/`Orcamento` e
  `OrcamentoService`.
- **Imports:** `ChangeDetectorRef`, `Component`, `inject`,
  `takeUntilDestroyed`, `FormBuilder`, `ReactiveFormsModule`, `Validators`,
  `ActivatedRoute`, `Router`, `RouterLink`, `MenuTop`, `ItemOrcamento`,
  `Orcamento`, `OrcamentoFormDraft`, `OrcamentoService` e `errorCode`.
- **Integrações de API:** Leitura, criação e atualização de documentos
  Firestore pela camada `OrcamentoService`.
- **Mecanismos de Segurança:** Ambas as rotas são protegidas por `authGuard`.
  Os campos obrigatórios e as medidas numéricas são validados no formulário;
  conteúdo é mostrado com interpolação Angular. Validação e autorização
  definitivas precisam estar nas regras/serviços backend. Sem regras
  Firestore versionadas, as permissões reais não são auditáveis neste
  repositório.

### Pré-visualização — `/preview`

- **Objetivo da Página:** Exibir o orçamento selecionado ou o rascunho atual e
  permitir impressão/salvamento como PDF.
- **Funções e Métodos:** A rota observa `id` e consulta o documento; valida
  dados de estado com `ehOrcamento()`/`ehRascunho()`; `voltar()` restaura o
  rascunho; funções de formatação preparam preço, medidas, data, código e
  status; `imprimir()` abre a impressão do navegador.
- **Bibliotecas e Dependências:** Angular Router, `toSignal`, RxJS,
  `ViewEncapsulation`, `MenuTop`, modelos e `OrcamentoService`.
- **Imports:** `Component`, `inject`, `ViewEncapsulation`, `toSignal`,
  `ActivatedRoute`, `Router`, `of`, `switchMap`, `MenuTop`, `Orcamento`,
  `OrcamentoFormDraft` e `OrcamentoService`.
- **Integrações de API:** Consulta `orcamentos/{id}` no Firestore quando a URL
  contém um ID; sem ID, usa dados de demonstração ou estado fornecido pela
  navegação.
- **Mecanismos de Segurança:** Rota protegida por `authGuard`; o ID consultado
  ainda deve ser autorizado pelas regras Firestore. O retorno de navegação é
  limitado a rotas internas conhecidas; dados exibidos por interpolação
  Angular.

### Gestão de usuários — `/cadastro`

- **Objetivo da Página:** Listar perfis cadastrados e criar novas contas de
  colaboradores.
- **Funções e Métodos:** `cadastrarUsuario()` valida nome, e-mail e tamanho
  mínimo da senha e delega a criação da conta e perfil ao serviço;
  `errorCode()` extrai códigos seguros para logs e mensagens.
- **Bibliotecas e Dependências:** Angular `CommonModule`, `FormsModule`,
  `RouterLink` e `AuthService`.
- **Imports:** `Component`, `inject`, `CommonModule`, `FormsModule`,
  `RouterLink`, `AuthService` e `errorCode`.
- **Integrações de API:** `AuthService` lista `users`, cria a conta pelo
  Firebase Authentication e grava o perfil em `users/{uid}`.
- **Mecanismos de Segurança:** Rota protegida por `authGuard`; validação de
  nome/e-mail/senha no cliente e exibição escapada por Angular. Qualquer
  usuário autenticado pode listar e cadastrar colaboradores; as regras Firestore
  validam os campos permitidos. A listagem inclui nomes e e-mails dos usuários.

### Página não encontrada — `**`

- **Objetivo da Página:** Informar que uma URL não corresponde a nenhuma rota.
- **Funções e Métodos:** `NotFound` é um componente de apresentação sem lógica
  de dados.
- **Bibliotecas e Dependências:** Componente Angular standalone e template
  estático.
- **Imports:** `Component`.
- **Integrações de API:** Nenhuma.
- **Mecanismos de Segurança:** Rota pública sem acesso a dados.

## Componentes compartilhados

### `ContactForm`

- **Objetivo e rotinas:** Formulário de contato; valida campos, aplica máscara
  telefônica, direciona foco ao primeiro campo inválido e envia os dados.
- **Bibliotecas/imports:** Angular Forms, Signals, `ElementRef`,
  `takeUntilDestroyed`, EmailJS e configuração `environment`.
- **Imports:** `Component`, `ElementRef`, `inject`, `output`, `signal`,
  `takeUntilDestroyed`, tipos/validadores de `@angular/forms`, EmailJS e
  `environment`.
- **Integrações:** EmailJS usando `serviceId`, `templateId` e chave pública
  definidos nos arquivos de environment.
- **Segurança:** Valida nome não vazio, formato de e-mail e telefone com DDD;
  não injeta HTML dos dados. A chave EmailJS é pública no browser e deve ter
  restrições/rate limits no provedor.

### `WhatsappSelectorComponent`

- **Objetivo e rotinas:** Monta links de contato WhatsApp para os números
  configurados e uma mensagem predefinida codificada em URL.
- **Bibliotecas/imports:** Angular `Component`; não usa serviço interno.
- **Integrações:** `https://wa.me/`.
- **Segurança:** Número e mensagem vêm de constantes locais; conferir os
  destinos antes de alterar os contatos.

### `MenuLateralComponent`

- **Objetivo e rotinas:** Navegação lateral e indicador de orçamentos em
  produção via `orcamentosEmAndamento$`.
- **Bibliotecas/imports:** `CommonModule`, `RouterLink`, `OrcamentoService`.
- **Imports:** `Component`, `inject`, `CommonModule`, `RouterLink` e
  `OrcamentoService`.
- **Integrações:** Consulta `orcamentos` pelo `OrcamentoService`, filtrando
  status `Em produção`.
- **Segurança:** Deve ser renderizado no shell das rotas internas; a consulta
  precisa ser limitada por regras Firestore.

### `MenuTop` e `HeaderComponent`

- **Objetivo e rotinas:** `MenuTop` compõe o cabeçalho; `HeaderComponent`
  observa a sessão/perfil em `users/{uid}` e encerra sessão em `logout()`.
- **Bibliotecas/imports:** Angular, AngularFire Auth/Firestore, RxJS e Router.
- **Imports:** `Component`, `inject`, `CommonModule`, `Router`, `Auth`, `user`,
  `signOut`, `Firestore`, `doc`, `docData`, `Observable`, `of`, `switchMap` e
  `errorCode`.
- **Integrações:** Firebase Authentication e leitura do documento do usuário
  atual.
- **Segurança:** O documento consultado usa o UID autenticado; as regras devem
  impedir leitura/escrita indevida de perfis.

### `CardSummary`

- **Objetivo e rotinas:** Apresenta rótulo, valor e texto auxiliar do resumo do
  dashboard por inputs.
- **Bibliotecas/imports:** Angular `Component`, `Input` e `NgClass`.
- **Imports:** `Component`, `Input`, `NgClass`.
- **Integrações:** Nenhuma; recebe dados do dashboard.
- **Segurança:** Apenas apresentação de texto/valor, sem acesso ao backend.

## Serviços e modelos

- **`AuthService`** — `login()` autentica e atualiza perfil/último acesso;
  `redefinirSenha()` encaminha solicitação ao Firebase;
  `obterUsuarios()` consulta perfis; `cadastrarUsuario()` cria uma conta e
  perfil em `users/{uid}` sem substituir a sessão atual;
  `salvarUsuarioFirestore()` atualiza dados do usuário. Imports: Angular DI,
  AngularFire Auth/Firestore e Firebase Auth secundário.
- **`OrcamentoService`** — Observa coleção/documento, cria, atualiza e exclui
  orçamentos, renovando `data_orcamento` para a data local atual ao atualizar;
  consulta os itens em produção para o menu; descobre o nome do editor; gerencia
  rascunhos em memória; apaga documentos com data anterior a seis meses em
  lotes. Imports: Angular DI, AngularFire Auth/Firestore e RxJS.
- **`Orcamento`, `ItemOrcamento` e `OrcamentoFormDraft`** — contratos dos dados
  persistidos e dos rascunhos; definidos em `models/orcamento.model.ts`.
- **`Usuario`** — contrato do perfil Firebase em `models/usuario.model.ts`.
- **`authGuard`** — observa o estado do Firebase Authentication; permite a
  navegação quando existe sessão e redireciona usuários não autenticados para
  `/login`. É um controle de interface e não substitui regras Firestore.
- **`errorCode()`** — extrai apenas códigos de erro estruturados para logs;
  evita imprimir mensagens ou dados de requisição do backend.

## Segurança e limitações conhecidas

1. As credenciais presentes nos environments são configurações client-side
   públicas, não segredos. A chave Firebase não autoriza acesso a dados sem
   regras apropriadas; ainda assim, restrinja APIs e domínios na plataforma.
2. Qualquer usuário autenticado pode listar nomes/e-mails e cadastrar
   colaboradores. Restrinja contas do sistema a pessoas autorizadas; a claim
   `admin` continua necessária para editar ou excluir perfis de terceiros.
3. Guard e validação Angular podem ser contornados por chamadas diretas ao
   Firebase. As regras locais exigem autenticação para `orcamentos`, listagem e
   criação de perfis, limitando atualização ao titular ou admin. Revise e
   publique as regras no projeto Firebase correto antes do uso.
4. Angular escapa valores de interpolação por padrão. Evite APIs como
   `innerHTML`/`bypassSecurityTrust*` para conteúdo de usuário e não registre
   credenciais ou objetos de erro completos no console.
5. O lockfile usa override de `@grpc/grpc-js` para manter uma versão corrigida
   apesar da faixa antiga declarada transitivamente por `@firebase/firestore`.
   O SDK deve ser atualizado e auditado novamente em futuras atualizações.
