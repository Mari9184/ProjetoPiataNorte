# Relatório de auditoria de segurança

- **Data:** 2026-11-04
- **Status final:** **Remediado**
- **Escopo:** Aplicação Angular/Firebase, dependências do `package-lock.json`,
  autenticação, autorização e regras do Cloud Firestore.

## Achados e remediações

| # | Severidade | Arquivo(s) | Linhas | Risco identificado | Solução implementada | Status |
|---|---|---|---|---|---|---|
| 1 | HIGH | `Budget manager/package-lock.json`, `Budget manager/package.json` | `package-lock.json`: 2250-2252; `package.json`: 37-40 | `@grpc/grpc-js@1.9.16`, transitivo de Firebase Firestore, estava no intervalo de advisories que gerou cinco alertas HIGH no `npm audit --omit=dev`. | Adicionado override compatível para `@grpc/grpc-js@1.14.7` sob `@firebase/firestore`; `npm audit fix` também atualizou dependências de desenvolvimento afetadas. Auditoria final: zero vulnerabilidades. | Remediado |
| 2 | HIGH | `Budget manager/package-lock.json` | 7787-7789 | A versão do Vite transitiva do Angular Build estava afetada por advisories HIGH de desenvolvimento e ferramentas do servidor local. | Atualização sem downgrade forçado via `npm audit fix --legacy-peer-deps`; Vite resolvido para 8.3.5 e auditoria completa final sem vulnerabilidades. | Remediado |
| 3 | MEDIUM | `Budget manager/src/app/pages/login/login.ts` | 84-94 | A recuperação de senha distinguia explicitamente `user-not-found`, permitindo enumerar contas por e-mail. | Sucesso e `auth/user-not-found` agora recebem a mesma mensagem neutra; esse código não é escrito no console. Falhas operacionais recebem uma mensagem genérica. Ative Email Enumeration Protection no Firebase Authentication para bloquear enumeração via chamadas diretas. | Remediado |
| 4 | MEDIUM | `Budget manager/src/app/app.routes.ts`, `Budget manager/src/app/services/auth.ts`, `firestore.rules` | `app.routes.ts`: 40-43; `auth.ts`: 41-74; `firestore.rules`: 48-54 | A exigência administrativa para cadastrar colaboradores impedia usuários autenticados sem a claim de acessar a função. | Rota e serviço agora permitem cadastro/listagem a qualquer usuário autenticado; as regras Firestore autorizam essas operações e validam campos do perfil. | Ajustado conforme requisito |
| 5 | MEDIUM | `firestore.rules`, `firebase.json` | `firestore.rules`: 1-63; `firebase.json`: 1-5 | Sem regras versionadas, as permissões efetivas de leitura e escrita do Firestore não podiam ser auditadas no repositório. | Regras versionadas exigem autenticação para orçamentos e listagem/criação de perfis; atualização de perfis fica restrita ao titular ou admin. A claim não pode ser escrita pelo cliente. | Remediado |

## Política de autorização implementada

- Usuários autenticados podem ler e modificar a coleção `orcamentos`, conforme
  a política escolhida para manter o fluxo atual.
- Usuários autenticados podem listar perfis e cadastrar colaboradores. Essa
  listagem expõe nome e e-mail aos demais usuários autenticados.
- Um usuário pode atualizar apenas o próprio perfil; alterações e exclusões de
  perfis de terceiros continuam reservadas a admins.
- A criação/alteração de perfis aceita apenas campos definidos nas regras; o
  cliente não pode autoatribuir a claim `admin`.
- Email Enumeration Protection deve estar habilitado nas configurações do
  Firebase Authentication implantadas.

## Validação final

- `npm audit`: 0 vulnerabilidades.
- `npm test -- --watch=false`: 20 testes aprovados em 17 arquivos.
- `npm audit` e `npm audit --omit=dev`: zero vulnerabilidades.
- Build de produção Angular concluído (bundle inicial de 889,85 kB); são
  emitidos avisos de orçamento configurados em `angular.json`.
- As regras devem ser publicadas no projeto Firebase correto com
  `firebase deploy --only firestore:rules` para que o cadastro/listagem de
  colaboradores funcione também no ambiente Firebase remoto.
