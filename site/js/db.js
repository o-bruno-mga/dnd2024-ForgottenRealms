// ============================================================
// Carregador de dados JSON (acessa ../dados/)
// Cache em memória para evitar re-fetch
// ============================================================

// Caminho base para os arquivos de dados.
// A aplicação pode ser servida em /site/ (GitHub Pages) ou na raiz (alguns
// servidores locais). Em ambos os casos, ../dados a partir da página atual
// aponta para a pasta de dados na raiz do repositório.
const BASE_PATH = (typeof window !== 'undefined' && window.location?.href)
  ? new URL('../dados/', window.location.href).href.replace(/\/$/, '')
  : new URL('../../dados/', import.meta.url).href.replace(/\/$/, '');

const cache = {};

/** Busca um JSON com cache em memória */
async function fetchJSON(caminho) {
  if (cache[caminho]) return cache[caminho];
  try {
    const resp = await fetch(`${BASE_PATH}/${caminho}`, { cache: 'no-store' });
    if (!resp.ok) throw new Error(`Erro ${resp.status}: ${caminho}`);
    const dados = await resp.json();
    cache[caminho] = dados;
    return dados;
  } catch (err) {
    console.error(`Erro ao carregar ${caminho}:`, err);
    return null;
  }
}

// --- Classes ---

/** Carrega dados de uma classe específica */
export async function getClasse(nome) {
  const nomeArq = nome.toLowerCase()
    .replace(/á/g, 'a').replace(/ã/g, 'a').replace(/é/g, 'e')
    .replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u');
  const dados = await fetchJSON(`classes/${nomeArq}.json`);
  if (!dados) return null;

  return dados;
}

/** Carrega lista de magias de uma classe conjuradora */
export async function getMagiasClasse(nomeClasse) {
  const nomeArq = nomeClasse.toLowerCase()
    .replace(/á/g, 'a').replace(/ã/g, 'a').replace(/é/g, 'e')
    .replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u');
  const dados = await fetchJSON(`classes/magias_${nomeArq}.json`);
  // O catálogo do Artífice nasceu em formato plano ({magias:[...]}),
  // enquanto o criador trabalha com {lista_magias:{...}}. Normalize aqui
  // para que qualquer consumidor receba o mesmo contrato das demais classes.
  if (dados?.lista_magias) return dados;
  if (Array.isArray(dados?.magias)) {
    const lista_magias = { Truques: [], ...Object.fromEntries(Array.from({length:9},(_,i)=>[`${i+1}º Círculo`,[]])) };
    for (const m of dados.magias) {
      const c = Number(m?.circulo ?? 0);
      const chave = c === 0 ? 'Truques' : `${c}º Círculo`;
      if (lista_magias[chave]) lista_magias[chave].push(typeof m === 'string' ? { nome: m } : m);
    }
    return { ...dados, lista_magias };
  }
  return dados;
}

// --- Origens ---

/** Carrega todos os antecedentes */
export async function getAntecedentes() {
  return fetchJSON('origens/antecedentes.json');
}

/** Carrega todas as espécies */
export async function getEspecies() {
  const caminho = 'origens/especies.json';
  const dados = await fetchJSON(caminho);
  if (dados && Array.isArray(dados.especies)) return dados;
  return null;
}

// --- Talentos ---

/** Carrega todos os talentos */
export async function getTalentos() {
  return fetchJSON('talentos/talentos.json');
}

// --- Equipamento ---

/** Carrega armas */
export async function getArmas() {
  return fetchJSON('equipamento/armas.json');
}

/** Carrega armaduras */
export async function getArmaduras() {
  return fetchJSON('equipamento/armaduras.json');
}

/** Carrega equipamento de aventura */
export async function getEquipamentoAventura() {
  return fetchJSON('equipamento/equipamento_aventura.json');
}

/** Carrega ferramentas */
export async function getFerramentas() {
  return fetchJSON('equipamento/ferramentas.json');
}

// --- Magias ---

/** Carrega índice de todas as magias (resumido) */
export async function getIndiceMagias() {
  return fetchJSON('magias/_indice.json');
}

/** Carrega magias de um círculo específico (com descrição completa) */
export async function getMagiasPorCirculo(circulo) {
  const nome = circulo === 0 ? 'truques' : `circulo_${circulo}`;
  return fetchJSON(`magias/${nome}.json`);
}

/** Carrega magias de uma classe (lista resumida: nome, circulo, escola) */
export async function getMagiasPorClasseLista(nomeClasse) {
  const nomeArq = nomeClasse.toLowerCase()
    .replace(/á/g, 'a').replace(/ã/g, 'a').replace(/é/g, 'e')
    .replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u');
  return fetchJSON(`magias/por_classe/${nomeArq}.json`);
}

/**
 * Devolve as magias de um círculo que têm o marcador Ritual, com a magia
 * inteira (descrição, alcance, componentes, duração).
 *
 * O marcador vem de `tempo_conjuracao` -- "1 minuto ou Ritual",
 * "1 ação ou Ritual" etc. É o mesmo critério que o Pacto do Tomo do Bruxo
 * (sheet/classes/bruxo.js) já usava, e é a leitura certa: o campo `ritual`
 * booleano que o Conjurador Ritualista procurava NÃO existe em lugar nenhum
 * do acervo, e por isso a lista dele nascia vazia.
 *
 * A outra fonte possível seria o campo `especial` de
 * `classes/magias_<classe>.json` ('R', e também os combinados 'R, M' e
 * 'C, R'). Conferido: para o 1º círculo as duas fontes dão exatamente as
 * mesmas 11 magias. Esta é preferível por ser um arquivo só, em vez da união
 * das oito listas de classe, e por já trazer a descrição -- os cards mostram
 * "ver detalhes" sem uma segunda busca.
 */
export async function getMagiasRituais(circulo) {
  const dados = await getMagiasPorCirculo(circulo);
  return (dados?.magias || [])
    .filter(m => (m.tempo_conjuracao || '').toLowerCase().includes('ritual'))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

/** Busca uma magia específica pelo nome (carrega o círculo inteiro) */
export async function getMagia(nome, circulo) {
  const dados = await getMagiasPorCirculo(circulo);
  if (!dados) return null;
  return dados.magias.find(m => m.nome === nome) || null;
}

/** Busca magias por nome (busca no índice, retorna matches) */
export async function buscarMagias(termo) {
  const indice = await getIndiceMagias();
  if (!indice) return [];
  const termoNorm = termo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return indice.magias.filter(m => {
    const nomeNorm = m.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return nomeNorm.includes(termoNorm);
  });
}

// --- Apêndices ---

/** Carrega criaturas */
export async function getCriaturas() {
  return fetchJSON('apendices/criaturas.json');
}

/** Carrega glossário */
export async function getGlossario() {
  return fetchJSON('apendices/glossario.json');
}

// --- Pré-carregamento ---

/** Pré-carrega dados essenciais para criação de personagem */
export async function precarregarDadosCriacao() {
  await Promise.all([
    getAntecedentes(),
    getEspecies(),
    getTalentos(),
    getArmas(),
    getArmaduras(),
    getIndiceMagias()
  ]);
}
