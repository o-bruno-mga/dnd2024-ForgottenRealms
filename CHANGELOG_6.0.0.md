# D&D 2024 — 6.0.0

## Motor de Características Estruturadas

A versão 6.0 inicia a migração de regras importantes de subclasses de texto inferido para dados mecânicos explícitos.

### Implementado
- Novo `site/js/regras-caracteristicas-estruturadas.js`.
- Regras estruturadas para características de Guerreiro, Bruxo, Guardião, Monge e Mago.
- O motor genérico de recursos passa a consultar a regra estruturada antes da heurística textual quando houver um registro explícito.
- A ficha exibe, nas características cobertas, uma síntese estruturada de ação, usos, recarga, duração e efeito.
- As características que já possuem handlers dedicados continuam usando esses handlers; a camada 6 não os substitui.
- Teste automático garante que nenhuma regra estruturada aponte para uma característica inexistente.

### Princípio
A descrição continua sendo o texto editorial completo. A regra estruturada é uma segunda camada, destinada ao comportamento da ficha. Isso evita transformar prosa em regra por regex quando a informação já foi auditada.
