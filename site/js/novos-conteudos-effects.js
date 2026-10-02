// ============================================================
// Camada 3 — efeitos funcionais dos conteúdos adicionados pelos suplementos.
//
// Esta camada NÃO altera o texto das regras. Ela transforma as características
// novas em estado utilizável pela ficha: recursos, escolhas e efeitos que
// podem ser aplicados sem substituir o dado original do suplemento.
// ============================================================
import { calcMod, escHtml, toast, abrirModal } from './utils.js';
import { char, salvar } from './sheet/estado.js';

function rerender() { window.dispatchEvent(new Event('hashchange')); }

export function estadoArtifice() {
  if (!char.recursos) char.recursos = {};
  if (!char.recursos.artifice) char.recursos.artifice = {};
  return char.recursos.artifice;
}

export function renderArtificeFeature(f, ctx) {
  if (ctx?.classe !== 'Artífice' || ctx?.subclasse == null) return '';
  const sub = ctx.subclasse;
  const n = f.nome;
  const e = estadoArtifice();
  let html = '';

  if (sub === 'Alquimista' && n === 'Elixir Experimental') {
    const nivel = ctx.nivelClasse || 1;
    const gratuitos = nivel >= 15 ? 3 : nivel >= 6 ? 2 : 1;
    const criados = e.elixires || [];
    html = `<div class="no-print" style="padding:6px 0 6px 16px">
      <span style="font-size:.75rem;color:var(--text-muted)">Elixires gratuitos após Descanso Longo: ${gratuitos}. Criados: ${criados.length}.</span>
      <button class="btn btn-sm" data-novo-artifice-acao="elixir">Criar elixir</button>
    </div>`;
  }

  if (sub === 'Armeiro' && n === 'Armadura Arcana') {
    const modelo = e.armadura_modelo || '';
    html = `<div class="no-print" style="padding:6px 0 6px 16px">
      <label style="font-size:.75rem">Modelo: </label>
      <select data-novo-artifice-modelo="armadura" style="font-size:.75rem">
        <option value="">Selecione</option><option value="Guardião" ${modelo==='Guardião'?'selected':''}>Guardião</option><option value="Infiltrador" ${modelo==='Infiltrador'?'selected':''}>Infiltrador</option>
      </select>
      <button class="btn btn-sm" data-novo-artifice-acao="armadura">Aplicar</button>
    </div>`;
  }

  if (sub === 'Atirador' && n === 'Canhão Místico') {
    const canhao = e.canhao || '';
    html = `<div class="no-print" style="padding:6px 0 6px 16px">
      <label style="font-size:.75rem">Canhão: </label>
      <select data-novo-artifice-canhao="tipo" style="font-size:.75rem">
        <option value="">Selecione</option><option value="Chama" ${canhao==='Chama'?'selected':''}>Lança-chamas</option><option value="Balista de Força" ${canhao==='Balista de Força'?'selected':''}>Balista de Força</option><option value="Protetor" ${canhao==='Protetor'?'selected':''}>Protetor</option>
      </select>
      <button class="btn btn-sm" data-novo-artifice-acao="canhao">Criar/Ativar</button>
    </div>`;
  }

  if (sub === 'Ferreiro de Batalha' && n === 'Defensor de Aço') {
    const ativo = !!e.defensor_aco_ativo;
    html = `<div class="no-print" style="padding:6px 0 6px 16px">
      <button class="btn btn-sm" data-novo-artifice-acao="defensor">${ativo ? 'Dispensar Defensor de Aço' : 'Invocar Defensor de Aço'}</button>
      ${ativo ? '<span style="font-size:.75rem;color:var(--text-muted)">Defensor ativo. Comande-o com sua Ação Bônus conforme a característica.</span>' : ''}
    </div>`;
  }
  return html;
}

export function setupNovosConteudosEffects() {
  document.querySelectorAll('[data-novo-artifice-acao]').forEach(btn => btn.addEventListener('click', () => {
    const acao = btn.dataset.novoArtificeAcao;
    const e = estadoArtifice();
    if (acao === 'armadura') {
      const modelo = document.querySelector('[data-novo-artifice-modelo="armadura"]')?.value || '';
      if (!modelo) return toast('Escolha um modelo de Armadura Arcana.', 'error');
      e.armadura_modelo = modelo;
      e.armadura_arcana_ativa = true;
      salvar(); rerender(); toast(`Armadura Arcana: modelo ${modelo}.`, 'success');
    }
    if (acao === 'canhao') {
      const tipo = document.querySelector('[data-novo-artifice-canhao="tipo"]')?.value || '';
      if (!tipo) return toast('Escolha o tipo do Canhão Místico.', 'error');
      e.canhao = tipo; e.canhao_ativo = true;
      salvar(); rerender(); toast(`Canhão Místico: ${tipo}.`, 'success');
    }
    if (acao === 'defensor') {
      e.defensor_aco_ativo = !e.defensor_aco_ativo;
      salvar(); rerender();
      toast(e.defensor_aco_ativo ? 'Defensor de Aço invocado.' : 'Defensor de Aço dispensado.', 'success');
    }
    if (acao === 'elixir') {
      const nivel = char.nivel || 1;
      const int = calcMod(char.atributos?.inteligencia ?? 10);
      const efeitos = [
        ['Cura', `recupera 2d4 + ${Math.max(1,int)} PV`],
        ['Celeridade', 'deslocamento +3 m por 1 hora'],
        ['Resiliência', '+1 CA por 10 minutos'],
        ['Ousadia', '1d4 extra nas jogadas de ataque e salvaguardas por 1 minuto'],
        ['Voo', 'deslocamento de voo por 10 minutos'],
        ['Transformação', 'transforma-se como pela magia Alterar-se por 10 minutos']
      ];
      const [nome, efeito] = efeitos[Math.floor(Math.random()*efeitos.length)];
      if (!Array.isArray(e.elixires)) e.elixires=[];
      e.elixires.push({nome,efeito,criado_em:new Date().toISOString()});
      salvar();
      abrirModal('Elixir Experimental', `<div style="text-align:center;padding:12px"><strong>${escHtml(nome)}</strong><p>${escHtml(efeito)}</p><small>O elixir permanece até ser consumido ou até o fim do próximo descanso longo.</small></div>`, '<button class="btn btn-primary" onclick="fecharModal()">OK</button>');
      renderFichaCompleta();
    }
  }));
}
