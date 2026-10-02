# D&D 2024 — 5.0.0 — Auditoria estrutural de subclasses

## Objetivo
Revisão estrutural das subclasses de Xanathar e Tasha para eliminar características ausentes, duplicadas ou com descrições de outra característica, mantendo a ficha autossuficiente.

## Correções principais
- Reconstruídas, a partir dos PDFs fornecidos, descrições individuais de características de subclasses de Tasha onde o catálogo anterior havia concatenado páginas ou misturado características.
- Corrigidas características ausentes/colapsadas em: O Insondável, Colégio da Eloquência, Círculo dos Esporos, Domínio da Paz e subclasses de monge Caminho da Misericórdia/Forma Astral.
- Corrigida a progressão do Cavaleiro Rúnico para os níveis 3/3/3/7/10/15/18 conforme o PDF, com Proficiências Bônus, Entalhador de Runas, Poderio Gigante, Escudo Rúnico, Grande Estatura, Mestre das Runas e Colosso Rúnico.
- Corrigidas as características da Trilha da Besta e da Trilha da Magia Selvagem para não duplicarem nomes/níveis.
- Corrigido o 17º nível do Domínio do Crepúsculo para Manto do Crepúsculo.
- Corrigidos nomes estruturais internos onde a tradução do projeto estava desalinhada com os títulos do PDF, preservando aliases históricos quando o motor existente depende deles.
- Mapa Estelar/Presságio Cósmico: o código de recursos do Druida passa a usar Bônus de Proficiência, conforme a regra da fonte; o catálogo de uso foi atualizado para Mapa Estelar.
- Detecção de ação reconhece também a redação “usar sua reação”.

## Autossuficiência
A auditoria encontrou 294 características de subclasses provenientes de Xanathar/Tasha no conjunto atual. Todas as descrições dessas características têm conteúdo textual local e não contêm instruções para consultar o PDF/suplemento.

## Validação
- 553 testes executados.
- 361 passaram.
- 0 falharam.
- 192 foram classificados como skips/limitações conhecidas da suíte (principalmente heurísticas genéricas ou recursos compostos com ramo dedicado).
- `node --check` aprovado para os arquivos JavaScript alterados.

## Observação sobre nomenclatura
O projeto mantém algumas nomenclaturas históricas em características já ligadas ao motor para evitar quebrar handlers existentes. O texto mecânico foi corrigido independentemente do nome exibido.
