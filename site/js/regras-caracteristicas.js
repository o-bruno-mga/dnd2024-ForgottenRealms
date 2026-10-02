// ============================================================
// Motor de Características — Camada 4
// Estado e consumo genéricos para recursos próprios de subclasses.
// ============================================================
import { RECURSOS_SUBCLASSE_RUNTIME } from './catalogo-recursos-subclasses.js';
import { char, salvar } from './sheet/estado.js';
import { calcMod, semAcento, toast } from './utils.js';
import { regraCaracteristica } from './regras-caracteristicas-estruturadas.js';

const ATRIBUTOS = ['forca','destreza','constituicao','inteligencia','sabedoria','carisma'];

function chaveMeta(ctx,f){ return `${ctx?.subclasse}|${f?.nivel}|${f?.nome}`; }
function chaveEstado(ctx,f){ return `caracteristica:${chaveMeta(ctx,f)}`; }
export function metadadosCaracteristica(ctx,f){ return ctx?.subclasse && f ? RECURSOS_SUBCLASSE_RUNTIME[chaveMeta(ctx,f)] || null : null; }

function nivelClasse(ctx){ return Number(ctx?.nivelClasse || 1); }
export function usosMaximosCaracteristica(meta,ctx,f=null){
  const estruturada = regraCaracteristica(ctx, f);
  if (estruturada?.usos != null) meta = { ...meta, usos: estruturada.usos, recarga: estruturada.recarga || meta.recarga };
  if(!meta || meta.usos==null) return null;
  if(typeof meta.usos==='number') return meta.usos;
  const s=String(meta.usos);
  const m=s.match(/mod\.\s*(Carisma|Sabedoria|Força|Destreza|Constituição|Inteligência)/i);
  if(m){
    const alvo=semAcento(m[1]);
    const attr=ATRIBUTOS.find(a=>semAcento(a)===alvo) || 'carisma';
    return Math.max(1,calcMod(char?.atributos?.[attr] ?? 10));
  }
  const n=nivelClasse(ctx);
  if(/1\s*\+\s*n[ií]vel de Bruxo/i.test(s)) return 1+n;
  if(/quatro d12/i.test(s)) return n>=17?7:n>=12?6:n>=6?5:4;
  if(/2\s*\(cresce para 3/i.test(s)) return n>=14?3:2;
  if(/2 d20/i.test(s)) return n>=14?3:2;
  if(/3 d20/i.test(s)) return 3;
  if(/^1\s*\(leitura conservadora/i.test(s)) return 1;
  return null;
}

function estado(){ if(!char.recursos) char.recursos={}; if(!char.recursos.caracteristicas) char.recursos.caracteristicas={}; return char.recursos.caracteristicas; }
export function usosGastos(ctx,f){ return Number(estado()[chaveEstado(ctx,f)]?.gastos || 0); }
export function usosDisponiveis(meta,ctx,f){ const max=usosMaximosCaracteristica(meta,ctx,f); return max==null?null:Math.max(0,max-usosGastos(ctx,f)); }
export function gastarCaracteristica(meta,ctx,f,quantidade=1){
  const max=usosMaximosCaracteristica(meta,ctx,f); if(max==null) return false;
  const disponiveis=usosDisponiveis(meta,ctx,f);
  if(disponiveis<quantidade){ toast('Usos esgotados. Descanse para recuperar.','error'); return false; }
  estado()[chaveEstado(ctx,f)]={gastos:usosGastos(ctx,f)+quantidade}; salvar(); return true;
}
export function restaurarCaracteristicasPorDescanso(tipo){
  const mapa=estado();
  for(const [k,meta] of Object.entries(RECURSOS_SUBCLASSE_RUNTIME)){
    if(!['curto','curto-ou-longo','longo'].includes(meta.recarga)) continue;
    const restaura=tipo==='longo' || (tipo==='curto' && ['curto','curto-ou-longo'].includes(meta.recarga));
    if(restaura) delete mapa[`caracteristica:${k}`];
  }
}

function recargaLabel(r){ return r==='longo'?'Descanso Longo':r==='curto'?'Descanso Curto':r==='curto-ou-longo'?'Descanso Curto ou Longo':r==='especial'?'Recarga especial · manual':r==='outro'?'Recarga por gatilho · manual':'Recurso'; }

function recursoManual(meta){ return ['especial','outro'].includes(meta?.recarga); }
function podeRenderizar(meta){
  if(!meta) return false;
  if(['curto','curto-ou-longo','longo'].includes(meta.recarga)) return true;
  // Recursos fora do ciclo de descanso só entram no motor quando o catálogo
  // marcou explicitamente que existe uma ativação pelo jogador. Características
  // passivas/"uma vez por turno" continuam fora do contador.
  return recursoManual(meta) && meta.ativa === true;
}
export function renderMotorCaracteristica(f,ctx){
  const meta=metadadosCaracteristica(ctx,f);
  if(!podeRenderizar(meta)) return '';
  const max=usosMaximosCaracteristica(meta,ctx,f); if(max==null) return '';
  const gastos=usosGastos(ctx,f), disponiveis=Math.max(0,max-gastos);
  const manual=recursoManual(meta);
  const key=chaveMeta(ctx,f);
  return `<div class="no-print caracteristica-motor" data-caracteristica-motor="${key}" style="padding:5px 0 5px 16px;display:flex;align-items:center;gap:7px;flex-wrap:wrap">
    <span class="badge" style="font-size:.68rem">${disponiveis}/${max}</span>
    <span style="font-size:.72rem;color:var(--text-muted)">${recargaLabel(meta.recarga)} · recurso rastreado</span>
    <button class="btn btn-sm" data-caracteristica-gastar="${key}" ${disponiveis<=0?'disabled style="opacity:.5;cursor:not-allowed"':''}>${disponiveis ? (max===1?'Usar':'Gastar 1 uso') : '✗ Esgotado'}</button>
    ${manual && gastos>0 ? `<button class="btn btn-sm" data-caracteristica-restaurar="${key}">Restaurar</button>` : ''}
  </div>`;
}

export function setupMotorCaracteristicas(){
  document.querySelectorAll('[data-caracteristica-restaurar]').forEach(btn=>btn.addEventListener('click',e=>{
    e.stopPropagation(); e.preventDefault();
    const key=btn.dataset.caracteristicaRestaurar;
    const meta=RECURSOS_SUBCLASSE_RUNTIME[key]; if(!meta) return;
    const [subclasse,nivel,nome]=key.split('|');
    delete estado()[`caracteristica:${key}`];
    salvar(); window.dispatchEvent(new Event('hashchange')); toast(`${nome}: contador restaurado manualmente.`, 'success');
  }));

  document.querySelectorAll('[data-caracteristica-gastar]').forEach(btn=>btn.addEventListener('click',e=>{
    e.stopPropagation(); e.preventDefault();
    const key=btn.dataset.caracteristicaGastar;
    const meta=RECURSOS_SUBCLASSE_RUNTIME[key]; if(!meta) return;
    const [subclasse,nivel,nome]=key.split('|');
    const classeInfo=Array.isArray(char?.classes) ? char.classes.find(c=>c.classe===meta.classe && c.subclasse===subclasse) : null;
    const ctx={subclasse,nivelClasse:Number(classeInfo?.nivel || char?.nivel || 1)};
    // O catálogo pode não carregar o nome da classe; o nível do bloco já é
    // suficiente para a maioria dos limites, e o nível total é um fallback.
    const f={nome,nivel:Number(nivel)};
    if(gastarCaracteristica(meta,ctx,f,1)) { window.dispatchEvent(new Event('hashchange')); toast(`${nome}: 1 uso gasto.`,'success'); }
  }));
}
