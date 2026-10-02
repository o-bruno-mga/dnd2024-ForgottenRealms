// Motor de estados/efeitos persistentes de características.
// A camada mantém o estado separado dos contadores de usos e expõe metadados
// que outras partes da ficha podem consultar para derivar CA, deslocamento,
// bônus e lembretes sem criar dezenas de flags independentes.
import { char, salvar } from './sheet/estado.js';

export const EFEITOS_ATIVOS = {
  'Mago|Lâmina Cantante|2|Canção da Lâmina': {
    id: 'canção_da_lâmina',
    nome: 'Canção da Lâmina',
    duração: '1 minuto',
    resumo: 'Enquanto ativa: +Inteligência na CA, +3 m de Deslocamento e vantagem em testes de Acrobacia. Também concede vantagem em testes de Constituição para manter Concentração.',
    ca: 'modInt',
    deslocamento: 3,
    lembretes: ['Vantagem em Acrobacia', 'Vantagem em Concentração'],
    danoCorpoAC: 'modIntNoNivel14'
  },
  'Guerreiro|Cavaleiro Rúnico|3|Força do Gigante': {
    id: 'força_do_gigante',
    nome: 'Força do Gigante',
    duração: '1 minuto',
    resumo: 'Enquanto ativa: você fica Grande (se houver espaço), tem vantagem em testes e Salvaguardas de Força e, uma vez por turno, um ataque com arma ou desarmado causa +1d6 de dano.',
    tamanho: 'Grande',
    vantagemForca: true,
    danoExtra: '1d6 uma vez por turno',
    lembretes: ['Vantagem em Força', '+1d6 uma vez por turno']
  }
};

function estado() {
  if (!char) return null;
  if (!char.recursos) char.recursos = {};
  if (!char.recursos.efeitos_ativos) char.recursos.efeitos_ativos = {};
  return char.recursos.efeitos_ativos;
}

export function chaveEfeito(ctx, f) {
  return `${ctx?.classe || ''}|${ctx?.subclasse || ''}|${f?.nivel || ''}|${f?.nome || ''}`;
}

export function metadadoEfeito(ctx, f) {
  return EFEITOS_ATIVOS[chaveEfeito(ctx, f)] || null;
}

export function efeitoAtivo(ctx, f) {
  return !!estado()?.[chaveEfeito(ctx, f)];
}

export function alternarEfeito(ctx, f) {
  const key = chaveEfeito(ctx, f);
  if (!EFEITOS_ATIVOS[key] || !char) return false;
  const mapa = estado();
  if (mapa[key]) delete mapa[key];
  else mapa[key] = { iniciadoEm: Date.now() };
  salvar();
  window.dispatchEvent(new Event('hashchange'));
  return true;
}

export function desligarEfeitosAtivos() {
  const mapa = estado();
  if (!mapa) return;
  for (const key of Object.keys(mapa)) delete mapa[key];
  salvar();
}

export function bonusCAEfeitosAtivos() {
  let bonus = 0;
  const mapa = estado() || {};
  for (const [key, meta] of Object.entries(EFEITOS_ATIVOS)) {
    if (!mapa[key]) continue;
    if (meta.ca === 'modInt') {
      const int = Number(char?.atributos?.inteligencia ?? 10);
      bonus += Math.floor((int - 10) / 2);
    }
  }
  return bonus;
}

export function bonusDanoEfeitosAtivos({corpoAC=false} = {}) {
  let bonus = 0;
  const mapa = estado() || {};
  for (const [key, meta] of Object.entries(EFEITOS_ATIVOS)) {
    if (!mapa[key]) continue;
    if (corpoAC && meta.danoCorpoAC === 'modIntNoNivel14') {
      const nivel = Number(char?.classes?.find(c => c.classe === 'Mago' && c.subclasse === 'Lâmina Cantante')?.nivel || 0);
      if (nivel >= 14) bonus += Math.max(1, Math.floor((Number(char?.atributos?.inteligencia ?? 10) - 10) / 2));
    }
    if (meta.danoExtra === '1d6') {
      // Dado adicional é exibido como lembrete, não como modificador numérico.
    }
  }
  return bonus;
}

export function bonusDeslocamentoEfeitosAtivos() {
  let bonus = 0;
  const mapa = estado() || {};
  for (const [key, meta] of Object.entries(EFEITOS_ATIVOS)) {
    if (mapa[key]) bonus += Number(meta.deslocamento || 0);
  }
  return bonus;
}

export function efeitosAtivosDetalhados() {
  const mapa = estado() || {};
  return Object.entries(EFEITOS_ATIVOS)
    .filter(([key]) => !!mapa[key])
    .map(([key, meta]) => ({ key, id: meta.id, nome: meta.nome, resumo: meta.resumo, duração: meta.duração, lembretes: meta.lembretes || [] }));
}

export function lembretesEfeitosAtivos() {
  const mapa = estado() || {};
  return Object.entries(EFEITOS_ATIVOS)
    .filter(([key]) => !!mapa[key])
    .map(([key, meta]) => ({ key, ...meta }));
}
