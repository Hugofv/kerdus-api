# Autenticação e Autorização

## Visão Geral

O sistema de autenticação utiliza a tabela `PlatformUser` existente para todos os tipos de usuários. Não é necessário criar uma nova tabela.

## Estrutura de Usuários

### Tipos de Usuários

- **Admin** - Administra toda a plataforma, **não tem account**
- **Owner** - Proprietário de account(s), pode ter múltiplos accounts
- **Agent** - Agente que trabalha com account(s) específicos
- **Viewer** - Visualizador com acesso limitado a account(s)

### Hierarquia de Acesso

```
Admin (sem account)
  └─ Acesso total à plataforma
  └─ Pode gerenciar todos os accounts
  └─ Pode criar/editar/deletar qualquer recurso

Owner (pode ter accounts)
  └─ Acesso total aos seus accounts
  └─ Pode gerenciar clientes, operações, etc. do seu account

Agent (geralmente tem account)
  └─ Acesso limitado aos accounts atribuídos
  └─ Pode criar/editar recursos do account

Viewer (geralmente tem account)
  └─ Acesso somente leitura aos accounts atribuídos
```

### Lógica de Account

- **Admin**: Não precisa de account, `accountId` no token é `null`, tem acesso a todos os recursos
- **Owner**: Pode ter múltiplos accounts, `accountId` no token é o primeiro account (ou null), acesso aos seus accounts
- **Agent/Viewer**: Geralmente tem account, `accountId` no token é o account atribuído, acesso limitado ao account atribuído

## Schema

### Campos Adicionados ao `PlatformUser`

```prisma
model PlatformUser {
  // ... campos existentes
  isActive             Boolean   @default(true)
  emailVerifiedAt      DateTime?
  lastLoginAt          DateTime?
  passwordResetToken   String?
  passwordResetExpires DateTime?
  deletedAt            DateTime?  // Soft delete
}
```

## Endpoints

### POST `/api/auth/login`
Login com email e senha.

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin",
      "isActive": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800
  }
}
```

### POST `/api/auth/refresh`
Renovar access token usando refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### GET `/api/auth/me`
Obter dados do usuário autenticado.

**Headers:**
```
Authorization: Bearer <accessToken>
```

### POST `/api/auth/logout`
Logout (client-side remove o token).

### POST `/api/auth/forgot-password`
Solicitar reset de senha.

**Request:**
```json
{
  "email": "user@example.com"
}
```

### POST `/api/auth/reset-password`
Resetar senha com token.

**Request:**
```json
{
  "token": "reset-token-from-email",
  "password": "newPassword123"
}
```

## Uso do Token

### Headers
```
Authorization: Bearer <accessToken>
```

### Payload do Token JWT
```json
{
  "userId": 1,
  "email": "admin@example.com",
  "role": "admin",
  "accountId": null
}
```

## Middlewares de Autorização

### `requireAdmin()`
Apenas admin pode acessar.

```typescript
import { requireAdmin } from '../middlewares/role.middleware';

router.get('/admin-only', requireAdmin, handler);
```

### `requireOwnerOrAdmin()`
Owner ou admin podem acessar.

```typescript
import { requireOwnerOrAdmin } from '../middlewares/role.middleware';

router.get('/owner-admin', requireOwnerOrAdmin, handler);
```

### `requireAccountAccess()`
Verifica se o usuário tem acesso ao account solicitado. Admin sempre tem acesso.

```typescript
import { requireAccountAccess } from '../middlewares/role.middleware';

router.get('/account-data', requireAccountAccess, handler);
```

## Estrutura de Arquivos

### DTOs (`src/dtos/auth.dto.ts`)
- `loginSchema` - Validação de login
- `refreshTokenSchema` - Validação de refresh token
- `forgotPasswordSchema` - Solicitar reset
- `resetPasswordSchema` - Resetar senha

### Service (`src/services/auth.ts`)
- `login()` - Autenticação com email/password
- `refreshToken()` - Renovar access token
- `verifyToken()` - Validar JWT token
- `forgotPassword()` - Gerar token de reset
- `resetPassword()` - Resetar senha
- `getUserById()` - Buscar user para middleware
- `isAdmin()`, `isOwnerOrAdmin()` - Helpers de role
- `hasAccountAccess()` - Verificar acesso a account

### Controller (`src/controllers/auth.ts`)
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### Middleware de Auth (`src/middlewares/auth.middleware.ts`)
- Valida JWT token
- Busca user no banco
- Verifica se está ativo
- Adiciona `req.user` com dados completos

### Middleware de Role (`src/middlewares/role.middleware.ts`)
- `requireAdmin()` - Apenas admin
- `requireOwnerOrAdmin()` - Owner ou admin
- `requireAccountAccess()` - Verifica acesso a account (admin sempre tem)

## Configuração

### Variáveis de Ambiente

Adicione ao `.env`:

```env
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
ALLOW_UNAUTHENTICATED=false  # true apenas em desenvolvimento
```

## Criar Primeiro Admin

### Opção 1: Script Interativo (Recomendado)
```bash
npx ts-node src/scripts/create-admin.ts
```

### Opção 2: Prisma Studio
```bash
npx prisma studio
```
Criar manualmente com:
- `role: 'admin'`
- `isActive: true`
- `passwordHash`: gerar com bcrypt

### Opção 3: SQL Direto
```sql
INSERT INTO platform_users (name, email, password_hash, role, is_active, created_at, updated_at)
VALUES (
  'Admin',
  'admin@example.com',
  '$2b$10$...', -- hash gerado com bcrypt
  'admin',
  true,
  NOW(),
  NOW()
);
```

## Segurança

- ✅ Senhas hasheadas com bcrypt (10 rounds)
- ✅ JWT tokens assinados
- ✅ Refresh tokens para renovação
- ✅ Soft delete de usuários
- ✅ Verificação de email (opcional)
- ✅ Reset de senha com token expirável
- ⚠️ Rate limiting recomendado (implementar separadamente)

## Fluxo de Autenticação

1. **Login** → Recebe `accessToken` e `refreshToken`
2. **Requests** → Incluir `Authorization: Bearer <accessToken>`
3. **Token expira** → Usar `refreshToken` para obter novo `accessToken`
4. **Logout** → Remover tokens do client

## Exemplo de Uso

```typescript
// Login
POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "password123"
}

// Usar token em requests
GET /api/accounts
Headers: Authorization: Bearer <accessToken>

// Admin pode acessar tudo
// Owner/Agent/Viewer só acessam seus accounts
```

## Próximos Passos

1. ✅ Schema atualizado com campos de auth
2. ✅ Migration executada
3. ✅ Service de autenticação criado
4. ✅ Controller de autenticação criado
5. ✅ Middleware de auth atualizado
6. ✅ Rotas de auth configuradas
7. ⏳ Criar primeiro admin user
8. ⏳ Configurar variáveis de ambiente (JWT_SECRET, etc.)
9. ⏳ Testar login/logout
10. ⏳ Implementar email service para reset de senha (opcional)

