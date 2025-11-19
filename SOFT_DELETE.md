# Soft Delete Implementation

Todos os métodos `delete` implementam **soft delete** usando o campo `deletedAt`.

## Schema Changes Required

Adicione o campo `deletedAt` aos seguintes modelos no `prisma/schema.prisma`:

```prisma
model Account {
  // ... existing fields
  deletedAt DateTime? @map("deleted_at")
}

model Client {
  // ... existing fields
  deletedAt DateTime? @map("deleted_at")
}

model Operation {
  // ... existing fields
  deletedAt DateTime? @map("deleted_at")
}

model Resource {
  // ... existing fields
  deletedAt DateTime? @map("deleted_at")
}

model PlatformUser {
  // ... existing fields
  deletedAt DateTime? @map("deleted_at")
}

model Alert {
  // ... existing fields
  deletedAt DateTime? @map("deleted_at")
}

model Notification {
  // ... existing fields
  deletedAt DateTime? @map("deleted_at")
}

model Setting {
  // ... existing fields
  deletedAt DateTime? @map("deleted_at")
}
```

## Behavior

- **Delete operations**: Atualizam `deletedAt` com a data/hora atual ao invés de remover o registro
- **Find operations**: Por padrão, filtram registros onde `deletedAt IS NULL`
- **Include deleted**: Use o parâmetro `includeDeleted: true` nos métodos `findAll` e `findById` para incluir registros deletados

## Migration

Após adicionar os campos ao schema, execute:

```bash
npx prisma migrate dev --name add_soft_delete
npx prisma generate
```

