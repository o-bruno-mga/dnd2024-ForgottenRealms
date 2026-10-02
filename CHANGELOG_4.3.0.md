# D&D 2024 — Motor de Características 4.3.0

## Motor de Características
- O motor genérico agora reconhece também recursos cujo gatilho de recuperação não é um Descanso.
- Recursos catalogados como `recarga: "outro"` só aparecem no motor quando o catálogo marca explicitamente `ativa: true`, evitando transformar características passivas/"uma vez por turno" em contadores indevidos.
- `Trilha da Árvore do Mundo — Percorrer a Árvore` passa a ser tratada como recurso ativável de recuperação por gatilho.
- Para recursos de recuperação especial/manual, a ficha oferece **Restaurar** para corrigir o contador quando o gatilho narrativo ocorrer (por exemplo, nova ativação de Fúria).
- Descanso Curto/Longo continua usando a restauração automática já existente.

## Validação
- `node --check` dos módulos alterados.
- Suíte de subclasses: **553 testes, 368 passando, 0 falhando, 185 skips esperados**.
- A cobertura continua separando características ativas de características passivas; o motor não cria contadores para efeitos sem ativação explícita.
