# Piata Norte — gestão de orçamentos

Aplicação web para a marcenaria Piata Norte criar, consultar, editar e acompanhar
orçamentos de projetos de móveis sob medida. O sistema também oferece uma página
pública de apresentação e um formulário de contato.

## Funcionalidades

- Autenticação por e-mail e senha, cadastro de usuários internos e redefinição
  de senha pelo Firebase Authentication.
- Criação, edição, duplicação, consulta e exclusão de orçamentos no Cloud
  Firestore.
- Cálculo de volume, custos por móvel e valor total do orçamento.
- Busca, filtros por status, paginação e pré-visualização para impressão/PDF.
- Página pública com contatos de WhatsApp e formulário de contato integrado ao
  EmailJS.
- Remoção automática de orçamentos com mais de seis meses quando o dashboard é
  aberto.

## Requisitos

- Node.js e npm compatíveis com o Angular CLI 22.
- Acesso à configuração do projeto Firebase e da conta EmailJS usados pela
  aplicação.

## Instalação e execução

Os fontes Angular estão na pasta `Budget manager`:

```bash
cd "Budget manager"
npm ci --legacy-peer-deps
npm start
```

Abra `http://localhost:4200/`. O servidor de desenvolvimento usa a configuração
`environment.development.ts`.

Comandos disponíveis:

```bash
npm run build                 # build de produção
npm test -- --watch=false     # testes unitários sem modo watch
```

O build de produção obedece aos limites de tamanho definidos em `angular.json`.
Os testes unitários usam o executor Angular configurado no projeto.

## Configuração e segurança

- Firebase e EmailJS são configurados pelos arquivos
  `Budget manager/src/environments/environment.ts` e
  `Budget manager/src/environments/environment.development.ts`. O Angular
  incorpora esses valores ao bundle do navegador; portanto, **Firebase API
  keys, IDs de serviço/modelo e chave pública do EmailJS não são segredos**.
  Restrinja a chave do Firebase no Google Cloud às APIs/domínios necessários e
  configure limites e proteção contra abuso no EmailJS.
- Nunca coloque senhas, chaves privadas ou credenciais de administrador nesses
  arquivos ou em qualquer código entregue ao navegador. Credenciais privadas
  devem permanecer em serviços de backend/secret manager.
- Os guards impedem a navegação desautenticada na interface, mas não protegem
  Firestore por si só. As regras de segurança do Firestore precisam ser
  publicadas no projeto Firebase. O arquivo [firestore.rules](./firestore.rules)
  permite operações em `orcamentos` a usuários autenticados e que qualquer
  usuário autenticado liste perfis e cadastre colaboradores. Como a tela exibe
  nomes e e-mails, compartilhe acesso apenas com pessoas autorizadas.
- Alterações e exclusões de perfis continuam restritas ao titular ou à claim
  administrativa, conforme as regras. Para publicar as regras atualizadas,
  selecione o projeto Firebase e execute `firebase deploy --only firestore:rules`
  na raiz.
- A claim `admin: true` para essas operações restritas só deve ser atribuída por
  um backend ou ferramenta confiável com Firebase Admin SDK; não é necessária
  para cadastrar colaboradores.
- Ative também **Email Enumeration Protection** nas configurações do Firebase
  Authentication. A interface de recuperação usa resposta neutra para
  endereços inexistentes, mas a proteção do serviço é necessária contra
  enumeração por chamadas diretas à API.
- O Angular escapa interpolações no HTML e os formulários validam os dados no
  cliente. Essas medidas melhoram a segurança e a experiência, mas validação e
  autorização definitivas devem ocorrer também no backend.
- `npm audit` foi executado após atualizar a dependência transitiva vulnerável
  e não reporta vulnerabilidades conhecidas no lockfile atual.

## Documentação

Veja [ESTRUTURA_E_ARQUITETURA.md](./ESTRUTURA_E_ARQUITETURA.md) para a árvore
do projeto e o mapeamento de páginas, componentes, integrações e mecanismos de
segurança.
