# Swagger/OpenAPI Documentation

## Acesso

A documentação interativa está disponível em:

```
http://localhost:3001/api-docs
```

## Configuração

O Swagger está configurado em `src/config/swagger.ts` e usa:
- **swagger-jsdoc** - Para gerar documentação a partir de comentários JSDoc
- **swagger-ui-express** - Para interface visual interativa

## Como Adicionar Documentação

### 1. Documentar Endpoints nas Rotas

Adicione comentários JSDoc com `@swagger` nos arquivos de rotas:

```typescript
/**
 * @swagger
 * /accounts:
 *   get:
 *     summary: Listar contas
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Lista de contas
 */
router.get('/', api('index'));
```

### 2. Estrutura de Documentação

#### Endpoint Básico

```typescript
/**
 * @swagger
 * /resource:
 *   get:
 *     summary: Descrição curta
 *     description: Descrição detalhada (opcional)
 *     tags: [TagName]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: param
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sucesso
 *       400:
 *         description: Erro
 */
```

#### Request Body

```typescript
/**
 * @swagger
 * /resource:
 *   post:
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - field1
 *             properties:
 *               field1:
 *                 type: string
 *               field2:
 *                 type: integer
 */
```

#### Path Parameters

```typescript
/**
 * @swagger
 * /resource/{id}:
 *   get:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
```

#### Query Parameters

```typescript
/**
 * @swagger
 * /resource:
 *   get:
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 */
```

### 3. Schemas Reutilizáveis

Schemas comuns estão definidos em `src/config/swagger.ts`:

- `Error` - Formato de erro padrão
- `Success` - Formato de sucesso padrão
- `Pagination` - Dados de paginação

Use com `$ref`:

```typescript
/**
 * @swagger
 * /resource:
 *   get:
 *     responses:
 *       400:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
```

### 4. Autenticação

Para endpoints protegidos, adicione:

```typescript
security:
  - bearerAuth: []
```

## Exemplos por Tipo de Endpoint

### GET - Listar

```typescript
/**
 * @swagger
 * /accounts:
 *   get:
 *     summary: Listar contas
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de contas
 */
```

### GET - Obter por ID

```typescript
/**
 * @swagger
 * /accounts/{id}:
 *   get:
 *     summary: Obter conta por ID
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dados da conta
 *       404:
 *         description: Não encontrado
 */
```

### POST - Criar

```typescript
/**
 * @swagger
 * /accounts:
 *   post:
 *     summary: Criar conta
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
```

### PUT - Atualizar

```typescript
/**
 * @swagger
 * /accounts/{id}:
 *   put:
 *     summary: Atualizar conta
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Atualizado
 *       404:
 *         description: Não encontrado
 */
```

### DELETE

```typescript
/**
 * @swagger
 * /accounts/{id}:
 *   delete:
 *     summary: Deletar conta
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Deletado
 *       404:
 *         description: Não encontrado
 */
```

## Testando Endpoints

1. Acesse `http://localhost:3001/api-docs`
2. Clique em "Authorize" e adicione o token JWT (obtido em `/api/auth/login`)
3. Clique em um endpoint para expandir
4. Clique em "Try it out"
5. Preencha os parâmetros
6. Clique em "Execute"
7. Veja a resposta

## Recursos

- **Swagger UI**: Interface visual para testar endpoints
- **OpenAPI 3.0**: Especificação padrão da indústria
- **JSDoc Comments**: Documentação no código
- **Schemas Reutilizáveis**: Componentes compartilhados
- **Autenticação**: Suporte a Bearer Token (JWT)

## Próximos Passos

1. Adicionar documentação aos demais endpoints
2. Criar schemas específicos para cada modelo (Account, Client, Operation, etc.)
3. Adicionar exemplos de resposta
4. Documentar códigos de erro específicos

