// ============================================================
// D&D 2024 — Camada 6.0: regras estruturadas de características
//
// A descrição continua sendo a fonte editorial exibida ao jogador. Este
// catálogo guarda apenas fatos mecânicos que o motor pode consumir sem
// tentar inferi-los de prosa: ação, usos, recarga, duração e efeitos.
// Entradas não presentes aqui continuam usando o catálogo genérico da
// Camada 4/5.
// ============================================================

export const REGRAS_CARACTERISTICAS = {
  'Guerreiro|Arqueiro Arcano|3|Disparo Arcano': {
    acao: 'Ataque', usos: 2, recarga: 'curto-ou-longo', duracao: 'instantânea',
    efeito: 'Adicionar uma opção de Disparo Arcano a uma flecha que acertou.'
  },
  'Guerreiro|Cavaleiro|3|Marca Inabalável': {
    acao: 'Parte do ataque', duracao: 'até o fim do próximo turno',
    efeito: 'Marca o alvo; dentro de 1,5 m, ataques dele contra outros alvos têm desvantagem.'
  },
  'Guerreiro|Samurai|3|Espírito Guerreiro': {
    acao: 'Ação Bônus', usos: 3, recarga: 'longo', duracao: 'até o fim do turno',
    efeito: 'Ganha PV temporários iguais a 5 + nível de Guerreiro e vantagem nas jogadas de ataque com armas.'
  },
  'Guerreiro|Cavaleiro Rúnico|3|Poderio Gigante': {
    acao: 'Ação Bônus', usos: 3, recarga: 'longo', duracao: '1 minuto',
    efeito: 'Fica Grande (se houver espaço), ganha vantagem em Força e adiciona 1d6 uma vez por turno a um ataque.'
  },
  'Bruxo|Lâmina Maldita|1|Maldição da Lâmina Maldita': {
    acao: 'Ação Bônus', usos: 1, recarga: 'curto-ou-longo', duracao: '1 minuto',
    efeito: 'Alvo a até 9 m; bônus de proficiência no dano, crítico com 19–20 e cura ao morrer.'
  },
  'Bruxo|Patrono O Grande Antigo|3|Mente Desperta': {
    acao: 'Passiva', duracao: 'sem duração',
    efeito: 'Comunicação telepática com criatura escolhida dentro de 9 m.'
  },
  'Bruxo|Patrono Arquifada|3|Passos Feéricos': {
    acao: 'Ação', usos: 1, recarga: 'curto-ou-longo', duracao: 'instantânea',
    efeito: 'Cada criatura escolhida a até 3 m realiza salvaguarda de Sabedoria ou fica Enfeitiçada ou Amedrontada.'
  },
  'Bruxo|Patrono Celestial|3|Luz Medicinal': {
    acao: 'Ação Bônus', usos: '1 + nível de Bruxo', recarga: 'longo', duracao: 'instantânea',
    efeito: 'Gasta dados d6 da reserva para curar uma criatura a até 18 m.'
  },
  'Bruxo|Patrono Ínfero|6|A Sorte do Próprio Tenebroso': {
    acao: 'Reação', usos: 'mod. Carisma (mín. 1)', recarga: 'longo', duracao: 'instantânea',
    efeito: 'Adiciona 1d10 a uma jogada após ver o resultado.'
  },
  'Guardião|Andarilho Feérico|15|Andarilho Nebuloso': {
    acao: 'Ação Bônus', usos: 'mod. Sabedoria (mín. 1)', recarga: 'longo', duracao: 'instantânea',
    efeito: 'Conjura Passo Nebuloso sem gastar espaço de magia.'
  },
  'Guardião|Portador do Enxame|3|Enxame Reunido': {
    acao: 'Passiva', duracao: 'uma vez por turno',
    efeito: 'Após acertar, o enxame pode causar dano adicional, mover o alvo ou mover você.'
  },
  'Mago|Lâmina Cantante|2|Canção da Lâmina': {
    acao: 'Ação Bônus', usos: 'bônus de proficiência', recarga: 'longo', duracao: '1 minuto',
    efeito: 'Ativa a canção: bônus de Inteligência na CA, +3 m de deslocamento e vantagens defensivas.'
  }
};

export function regraCaracteristica(ctx, f) {
  if (!ctx || !f) return null;
  return REGRAS_CARACTERISTICAS[`${ctx.classe || ''}|${ctx.subclasse || ''}|${f.nivel || ''}|${f.nome || ''}`] || null;
}

export function temRegraEstruturada(ctx, f) {
  return !!regraCaracteristica(ctx, f);
}
