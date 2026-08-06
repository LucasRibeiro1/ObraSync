# ObraSync — Documentação do Projeto

Plataforma de gestão de obras (construção civil) com Diário de Obra digital, módulo de Segurança do Trabalho e controle de usuários. Todo o estado é client-side via Zustand + localStorage. Sem backend ainda.

## Comandos

```bash
npm run dev      # servidor de desenvolvimento → http://localhost:5173
npm run build    # build de produção (tsc + vite build)
npm run lint     # ESLint
npm run preview  # servir o build de produção localmente
```

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | React 19 + TypeScript 6 + Vite 8 |
| UI | Ant Design 6 + @ant-design/icons 6 |
| Roteamento | React Router v7 |
| Estado | Zustand 5 (persist → localStorage) |
| Queries | TanStack Query v5 (instalado, não usado ainda) |
| Gráficos | Recharts 3 |
| PDF | jsPDF 4 + html2canvas 1 |
| Datas | dayjs 1 |
| HTTP | axios 1 (instalado, **não usado** — dados são mock) |
| Forms Ant | Ant Design Form (usado em todo lugar) |
| react-hook-form | Instalado, **não usado** — pode ser removido |

## Arquitetura de arquivos

```
src/
├── main.tsx                  # entry point, monta React + StrictMode
├── App.tsx                   # ConfigProvider (tema, locale pt-BR), BrowserRouter, todas as rotas
├── types/
│   └── index.ts              # todos os tipos TypeScript do domínio
├── store/
│   └── index.ts              # todos os stores Zustand (auth, obras, diario, segurança, users)
├── components/
│   └── common/
│       └── Layout.tsx        # sidebar + header + Outlet (responsivo: Drawer no mobile)
└── pages/
    ├── Dashboard.tsx         # dashboard executivo com KPIs e gráficos
    ├── Obras.tsx             # CRUD de obras com modal
    ├── DiarioList.tsx        # listagem + filtros de diários de obra
    ├── DiarioForm.tsx        # criação/edição de diário (tabs: equipe, atividades, materiais, equipamentos, ocorrências)
    ├── DiarioView.tsx        # visualização + exportação PDF de um diário
    ├── SegurancaDashboard.tsx # dashboard segurança com tabs (acidentes, incidentes, ações, relatos)
    ├── AcidenteForm.tsx      # form de acidente de trabalho
    ├── IncidenteForm.tsx     # form de incidente (quase-acidente)
    ├── AcaoForm.tsx          # form de ação preventiva (DDS, inspeção, etc.)
    ├── RelatoForm.tsx        # form de relato de segurança
    └── Usuarios.tsx          # CRUD de usuários com modal
```

## Rotas

| Path | Componente | Descrição |
|---|---|---|
| `/` | → `/dashboard` | redirect |
| `/dashboard` | Dashboard | KPIs + gráficos |
| `/obras` | Obras | listagem + CRUD |
| `/diario` | DiarioList | listagem com filtros |
| `/diario/novo` | DiarioForm | novo diário |
| `/diario/:id` | DiarioView | visualizar + PDF |
| `/diario/:id/editar` | DiarioForm | editar diário |
| `/seguranca` | SegurancaDashboard | dashboard + tabs |
| `/seguranca/acidente/novo` | AcidenteForm | novo acidente |
| `/seguranca/acidente/:id/editar` | AcidenteForm | editar acidente |
| `/seguranca/incidente/novo` | IncidenteForm | novo incidente |
| `/seguranca/incidente/:id/editar` | IncidenteForm | editar incidente |
| `/seguranca/acao/novo` | AcaoForm | nova ação preventiva |
| `/seguranca/acao/:id/editar` | AcaoForm | editar ação |
| `/seguranca/relato/novo` | RelatoForm | novo relato |
| `/seguranca/relato/:id/editar` | RelatoForm | editar relato |
| `/usuarios` | Usuarios | CRUD (só para role=admin) |

## Stores (Zustand + persist)

Todos persistem no localStorage. Cada store tem seu próprio key:

| Store | Key localStorage | Funções |
|---|---|---|
| `useAuthStore` | `auth-store` | `login`, `logout`, `toggleTheme` |
| `useObrasStore` | `obras-store` | `addObra`, `updateObra`, `removeObra` |
| `useDiarioStore` | `diario-store` | `addDiario`, `updateDiario`, `removeDiario`, `getDiarioById` |
| `useSegurancaStore` | `seguranca-store` | add/update/remove para: acidentes, incidentes, acoesPreventivas, relatos |
| `useUsersStore` | `users-store` | `addUser`, `updateUser`, `removeUser` |

## Tipos principais (src/types/index.ts)

- `UserRole`: `'admin' | 'engenheiro' | 'encarregado' | 'tecnico_seguranca' | 'consulta'`
- `User`: id, nome, email, role, empresa?, ativo, criadoEm
- `DiarioObra`: obra completa com equipe[], atividades[], materiais[], equipamentos[], ocorrencias[], anexos[]
- `AcidenteTrabalho`: gravidade (leve/moderada/grave), afastamento, encaminhamento médico
- `Incidente`: quase-acidente sem vítimas
- `AcaoPreventiva`: tipo (dds/treinamento/fiscalizacao/inspecao/campanha/outro)
- `RelatoSeguranca`: relato de observação de segurança por funcionário
- `Obra`: nome, endereço, responsável, datas, status (ativa/concluida/paralisada)

## Tema e aparência

- Cor primária: `#1a56db`
- Fonte: Inter (Google Fonts)
- Dark mode: controlado por `useAuthStore.isDarkMode`, toggle no header
- `ConfigProvider` em App.tsx aplica tema globalmente (Ant Design dark/light algorithm)
- Border radius padrão: 8px (token Ant Design)

## Responsividade

Implementado com Ant Design Grid System (`xs/sm/md/lg`):

- **Layout.tsx**: sidebar vira `Drawer` em telas `< md` (< 768px); hamburger abre/fecha; nome do usuário some no header mobile
- **Tabelas**: todas com `scroll={{ x: ... }}` para scroll horizontal; colunas menos importantes com `responsive: ['sm']` ou `responsive: ['md']`
- **KPI cards**: `xs={12} sm={6}` (2 por linha no mobile, 4 no desktop)
- **Filtros**: `xs={24}` para empilhar verticalmente no mobile
- **Headers de página**: `flex-wrap: wrap` + `Space wrap` para botões quebrarem linha

## Dados mock (src/store/index.ts)

O projeto usa dados mock hardcoded no store. Ao fazer a integração com backend, substituir as constantes `mock*` por chamadas à API.

- 3 obras de exemplo
- 2 diários de obra
- 1 acidente, 1 incidente, 2 ações preventivas, 1 relato
- 4 usuários (engenheiro ×2, técnico segurança, admin)
- Usuário logado padrão: `mockUsers[3]` (Admin Sistema)

## Módulo de exportação PDF (DiarioView)

`handleExportPDF` usa `html2canvas` + `jsPDF`:
1. Renderiza o `<div ref={printRef}>` como imagem via `html2canvas` (scale=2)
2. Calcula paginação automática para A4 portrait
3. Salva como `{numeroRelatorio}.pdf`

## Integração Segurança ↔ Diário

O campo `Ocorrencia.origem` pode ser `'seguranca'`, vinculando uma ocorrência do módulo de segurança a um diário de obra. Em `DiarioView`, ocorrências com `origem === 'seguranca'` recebem um `Alert` de aviso e borda vermelha.

## Dependências instaladas mas não utilizadas

- `axios` — para futura integração com API REST
- `react-hook-form` — pode ser removido; todos os formulários usam Ant Design Form
- `@tanstack/react-query` — configurado em App.tsx com `QueryClientProvider`, mas nenhuma query é feita ainda

## Melhorias futuras identificadas

1. **Backend/API** — substituir mock data por chamadas REST via axios + TanStack Query
2. **Autenticação real** — tela de login com JWT; atualmente o usuário admin é hardcoded no store
3. **Upload de anexos** — o tipo `Anexo` já está definido, mas a UI de upload não foi implementada
4. **Exportação de selecionados** — botão "Exportar selecionados" em DiarioList está `disabled`
5. **Controle de acesso por role** — menu já filtra `/usuarios` por role=admin, mas as rotas não têm guards
6. **Notificações** — sino no header tem badge "2" hardcoded; sem sistema de notificações real
7. **Progress real das obras** — `Math.random()` no Dashboard para porcentagem de progresso
8. **Testes** — nenhum teste unitário ou de integração ainda
