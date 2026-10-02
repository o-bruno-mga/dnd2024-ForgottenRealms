# D&D 2024 — 4.9.0 — Correção estrutural de subclasses

## O que mudou

Esta revisão corrige quatro subclasses de suplementos cuja estrutura do catálogo não correspondia ao texto-fonte do Caldeirão de Tudo de Tasha.

### Bruxo — O Gênio
- 1º: Receptáculo do Gênio
- 1º: Lista Expandida de Magias
- 6º: Dom Elemental
- 10º: Receptáculo Protetor
- 14º: Desejo Restrito

### Feiticeiro — Mente Aberrante
- 1º: Magias Psiônicas
- 1º: Discurso Telepático
- 6º: Feitiçaria Psiônica
- 6º: Defesas Psíquicas
- 14º: Revelação na Carne
- 18º: Implosão Anômala

### Guardião — Portador do Enxame
- 3º: Enxame Reunido
- 3º: Magia do Portador do Enxame
- 7º: Maré Ondulante
- 11º: Enxame Poderoso
- 15º: Dispersão do Enxame

### Ladino — Alma Laminada
- 3º: Poder Psíquico
- 3º: Lâminas Psíquicas
- 9º: Lâminas da Alma
- 13º: Véu Psíquico
- 17º: Mente Pura

As descrições dessas 21 características foram reconstruídas diretamente dos trechos correspondentes do PDF de Tasha, evitando o texto OCR concatenado que contaminava a versão anterior.

## Compatibilidade

Os nomes antigos usados pelo motor de recursos foram mantidos como aliases internos para não quebrar estados ou regras existentes.

## Validação

- `node --check` dos arquivos JS alterados: OK.
- Suíte de regras: 553 testes; 368 passaram, 0 falharam, 185 skips esperados.

## Observação

Esta versão não afirma que todas as 264 características de subclasses de suplementos já foram auditadas individualmente. O restante do catálogo continua sendo o próximo lote da revisão estrutural.
