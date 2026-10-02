// Camada 4.1 — controles funcionais para características de subclasses
// selecionadas dos suplementos enviados. O texto das características continua
// vindo dos JSONs; este módulo apenas adiciona estado e controles de mesa.
import { char, salvar } from './sheet/estado.js';
import { calcMod, escHtml, toast } from './utils.js';

function estado() {
  if (!char.recursos) char.recursos = {};
  if (!char.recursos.subclasses41) char.recursos.subclasses41 = {};
  return char.recursos.subclasses41;
}

function chave(ctx, nome) { return `${ctx?.classe}|${ctx?.subclasse}|${nome}`; }
function nivel(ctx) { return Number(ctx?.nivelClasse || 1); }

const ARCANE_SHOTS = [
  'Flecha da Explosão', 'Flecha da Sedução', 'Flecha do Agarrar',
  'Flecha do Banimento', 'Flecha Enfraquecedora', 'Flecha Perfurante', 'Flecha Buscadora', 'Flecha Sombria'
];

function arcaneShotOptions(n) {
  return n >= 18 ? 6 : n >= 15 ? 5 : n >= 10 ? 4 : n >= 7 ? 3 : 2;
}

function renderArcane(f, ctx) {
  const n = nivel(ctx), e = estado(), k = chave(ctx, f.nome);
  if (f.nome === 'Disparo Arcano') {
    const st = e[k] || { usos: 0, escolha: [] };
    const maxUsos = 2;
    const maxOpcoes = arcaneShotOptions(n);
    const escolhas = Array.isArray(st.escolha) ? st.escolha : [];
    return `<div class="no-print sub41-box">
      <div><strong>Disparos: ${Math.max(0,maxUsos-st.usos)}/${maxUsos}</strong> · recupera no Descanso Curto ou Longo.</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:5px">
        <select data-sub41-shot-select="${escHtml(k)}">
          <option value="">Escolha uma opção de Disparo Arcano</option>
          ${ARCANE_SHOTS.map(o=>`<option value="${escHtml(o)}" ${escolhas.includes(o)?'selected':''}>${escHtml(o)}</option>`).join('')}
        </select>
        <button class="btn btn-sm" data-sub41-shot-add="${escHtml(k)}">Adicionar</button>
        <button class="btn btn-sm btn-accent" data-sub41-shot-use="${escHtml(k)}" ${st.usos>=maxUsos||!escolhas.length?'disabled':''}>Usar 1 disparo</button>
      </div>
      <div style="font-size:.72rem;color:var(--text-muted);margin-top:4px">Opções conhecidas: ${escolhas.length}/${maxOpcoes}${escolhas.length?` — ${escolhas.map(escHtml).join(', ')}`:''}</div>
    </div>`;
  }
  if (f.nome === 'Tiro Curvado') {
    const st=e[k]||{usado_turno:false};
    return `<div class="no-print sub41-box"><button class="btn btn-sm" data-sub41-toggle="${escHtml(k)}">${st.usado_turno?'Tiro Curvado usado':'Marcar Tiro Curvado'}</button><span> · quando uma flecha errar, permite redirecioná-la conforme a característica.</span></div>`;
  }
  return '';
}

function renderSamurai(f, ctx) {
  if (f.nome !== 'Espírito de Combate') return '';
  const e=estado(), k=chave(ctx,f.nome), st=e[k]||{usos:0};
  const max=3;
  return `<div class="no-print sub41-box"><strong>${Math.max(0,max-st.usos)}/${max}</strong> usos até Descanso Longo.
    <button class="btn btn-sm btn-accent" data-sub41-samurai="${escHtml(k)}" ${st.usos>=max?'disabled':''}>Ativar Espírito de Combate</button>
    ${st.ativo?'<span> · ativo: vantagem nos ataques e PV temporários conforme a característica.</span>':''}
  </div>`;
}

function renderSwash(f,ctx){
  if (f.nome !== 'Panache') return '';
  const e=estado(), k=chave(ctx,f.nome), st=e[k]||{};
  return `<div class="no-print sub41-box">
    <button class="btn btn-sm btn-accent" data-sub41-panache="${escHtml(k)}">${st.alvo?'Encerrar Panache':'Usar Panache'}</button>
    ${st.alvo?`<span> · alvo: <strong>${escHtml(st.alvo)}</strong> · efeito dura enquanto as condições da característica forem mantidas.</span>`:'<span> · Ação; escolha um alvo que possa ouvi-lo e compartilhe seu idioma.</span>'}
  </div>`;
}

function renderRune(f,ctx){
  if (f.nome !== 'Força do Gigante') return '';
  const e=estado(), k=chave(ctx,f.nome), st=e[k]||{usos:0};
  const max=2;
  return `<div class="no-print sub41-box"><strong>${Math.max(0,max-st.usos)}/${max}</strong> usos até Descanso Longo.
    <button class="btn btn-sm btn-accent" data-sub41-rune-giant="${escHtml(k)}" ${st.usos>=max?'disabled':''}>Ativar Força do Gigante</button>
    ${st.ativo?'<span> · ativo por 1 minuto, conforme a característica.</span>':''}
  </div>`;
}




const ALIASES_SUPLEMENTOS_49 = {
  'Bruxo|O Gênio|Dádiva Elemental':'Bruxo|O Gênio|Dom Elemental',
  'Bruxo|O Gênio|Desejo Limitado':'Bruxo|O Gênio|Desejo Restrito',
  'Feiticeiro|Mente Aberrante|Revelações na Carne':'Feiticeiro|Mente Aberrante|Revelação na Carne',
  'Feiticeiro|Mente Aberrante|Implosão Psíquica':'Feiticeiro|Mente Aberrante|Implosão Anômala',
  'Guardião|Portador do Enxame|Maré Curativa':'Guardião|Portador do Enxame|Maré Ondulante',
  'Guardião|Portador do Enxame|Enxame Dispersivo':'Guardião|Portador do Enxame|Dispersão do Enxame',
  'Ladino|Alma Laminada|Lâminas Psíquicas: Teleporte':'Ladino|Alma Laminada|Lâminas da Alma',
  'Ladino|Alma Laminada|Lâminas Psíquicas: Véu do Medo':'Ladino|Alma Laminada|Véu Psíquico',
  'Ladino|Alma Laminada|Lâminas Psíquicas: Lâmina da Alma':'Ladino|Alma Laminada|Mente Pura'
};

const EXTRA_SUBCLASSES_42 = {
  'Bruxo|O Gênio': {
    'Dom Elemental': { usos: c => c.proficiencia || 2, recarga: 'longo', tipo: 'ativacao' },
    'Desejo Restrito': { usos: 1, recarga: 'especial', tipo: 'ativacao' },
  },
  'Bruxo|O Insondável': {
    'Tentáculos das Profundezas': { usos: c => c.proficiencia || 2, recarga: 'longo', tipo: 'ativacao' },
    'Tentáculo do Abismo': { usos: 1, recarga: 'curto', tipo: 'ativacao' },
  },
  'Bruxo|Lâmina Maldita': {
    'Maldição da Lâmina Maldita': { usos: 1, recarga: 'curto', tipo: 'ativacao' },
    'Espectro Amaldiçoado': { usos: 1, recarga: 'longo', tipo: 'ativacao' },
  },
  'Feiticeiro|Mente Aberrante': {
    'Fala Telepática': { usos: 1, recarga: 'especial', tipo: 'ativacao' },
    'Revelação na Carne': { usos: 1, recarga: 'especial', tipo: 'ativacao' },
    'Implosão Anômala': { usos: 1, recarga: 'longo', tipo: 'ativacao' },
  },
  'Guardião|Portador do Enxame': {
    'Maré Ondulante': { usos: c => c.proficiencia || 2, recarga: 'longo', tipo: 'ativacao' },
    'Dispersão do Enxame': { usos: c => c.proficiencia || 2, recarga: 'longo', tipo: 'reacao' },
  },
  'Guardião|Matador de Monstros': {
    'Matador de Presas': { usos: 1, recarga: 'curto', tipo: 'ativacao' },
    'Nêmesis Sobrenatural': { usos: 1, recarga: 'longo', tipo: 'ativacao' },
  },
  'Ladino|Alma Laminada': {
    'Véu Psíquico': { usos: 1, recarga: 'longo', tipo: 'ativacao' },
    'Mente Pura': { usos: 1, recarga: 'longo', tipo: 'ativacao' },
  }
};

const EXTRA_DESCRICOES_42 = {
  'Bruxo|O Gênio|Dom Elemental': 'A dádiva do patrono concede resistência a um tipo de dano determinado pelo tipo de gênio e, com uma ação bônus, permite obter deslocamento de voo de 9 m por 10 minutos. Os usos da ação bônus são recuperados no Descanso Longo. Conforme o PDF de Tasha, o tipo de dano é contundente (dao), trovejante (djinni), ígneo (ifriti) ou gélido (marid).',
  'Bruxo|O Gênio|Desejo Restrito': 'Com uma ação, você pode formular um desejo para o seu Receptáculo do Gênio e produzir o efeito de uma magia de 6º círculo ou menor que tenha tempo de conjuração de 1 ação, sem precisar atender aos requisitos da magia. Depois de usar, a característica exige 1d4 Descansos Longos antes de poder ser usada novamente.',
  'Bruxo|O Insondável|Tentáculos das Profundezas': 'Como ação bônus, você cria um tentáculo espectral em um ponto que possa ver a até 18 m. O tentáculo dura 1 minuto; ao criá-lo, você pode causar dano de frio a uma criatura a até 3 m dele e pode usar uma ação bônus para movê-lo. O PDF de Tasha especifica recuperação após Descanso Curto ou Longo.',
  'Bruxo|O Insondável|Tentáculo do Abismo': 'Você pode abrir um canal mágico para um destino aquático, teletransportando a si mesmo e até cinco criaturas voluntárias que estejam no campo de visão. A característica permite alcançar um corpo de água que você tenha visto, ou um ponto próximo dele, e é recuperada após Descanso Curto ou Longo.',
  'Bruxo|Lâmina Maldita|Maldição da Lâmina Maldita': 'Como ação bônus, amaldiçoe uma criatura que possa ver a até 9 m por 1 minuto. Enquanto a maldição durar, você recebe seu bônus de proficiência nos testes de dano contra o alvo e seus ataques contra ele são críticos com 19 ou 20. Se o alvo morrer, você recupera PV iguais ao seu nível de Bruxo + modificador de Carisma. A característica é recuperada após Descanso Curto ou Longo.',
  'Bruxo|Lâmina Maldita|Espectro Amaldiçoado': 'Quando você mata um humanoide, pode fazer o espírito dele surgir como um espectro sob seu serviço. O espectro recebe PV temporários iguais à metade do seu nível de Bruxo e permanece até o final do próximo Descanso Longo. Depois de usar a característica, você precisa terminar um Descanso Longo para usá-la novamente.',
  'Feiticeiro|Mente Aberrante|Fala Telepática': 'Como ação bônus, escolha uma criatura a até 9 m. Vocês podem falar telepaticamente enquanto estiverem dentro de uma distância baseada no seu modificador de Carisma. A conexão dura um número de minutos igual ao seu nível de Feiticeiro e termina antes se você ficar incapacitado ou formar uma nova conexão.',
  'Feiticeiro|Mente Aberrante|Revelação na Carne': 'Como ação bônus, gaste 1 ou mais Pontos de Feitiçaria para transformar seu corpo por 10 minutos. Cada ponto gasto concede um benefício escolhido entre visão de criaturas invisíveis, voo e planar, natação e respiração aquática, ou corpo viscoso capaz de atravessar espaços muito estreitos e escapar de amarras não mágicas/agarrões.',
  'Guardião|Portador do Enxame|Maré Ondulante': 'Use o enxame para transportar energia vital e restaurar pontos de vida conforme a descrição da característica da subclasse.',
  'Guardião|Portador do Enxame|Dispersão do Enxame': 'Quando sofre dano, pode usar sua reação para ganhar resistência a esse dano e se teletransportar até 9 m para um espaço desocupado que possa ver. A característica tem usos iguais ao bônus de proficiência e recupera todos no Descanso Longo.',
  'Guardião|Matador de Monstros|Sentido do Caçador': 'Ao observar uma criatura, você pode descobrir informações sobre suas capacidades, como resistências, imunidades e vulnerabilidades, conforme a característica. O alvo deve ser observado dentro do alcance exigido pelo texto da subclasse.',
  'Guardião|Matador de Monstros|Matador de Presas': 'Quando você acerta uma criatura, pode designá-la como sua presa sobrenatural, fazendo com que seus ataques contra ela recebam o benefício descrito pela característica até o término do efeito.',
  'Guardião|Matador de Monstros|Defesa Sobrenatural': 'Quando o alvo de Matador de Presas força você a realizar um teste de resistência, você pode usar sua reação para adicionar 1d6 ao teste; a característica também possui uma aplicação contra ataques, conforme a descrição da subclasse.',
  'Guardião|Matador de Monstros|Nêmesis Sobrenatural': 'Você pode escolher uma criatura que veja a até 36 m como sua nêmesis, obtendo os benefícios definidos pela característica contra ela. O efeito é uma ferramenta de marcação e controle de um alvo importante.',
  'Ladino|Alma Laminada|Véu Psíquico': 'Nome alternativo usado pelo catálogo local para Véu do Medo. A implementação utiliza a mesma regra e o mesmo estado do recurso correspondente.',
  'Ladino|Alma Laminada|Mente Pura': 'Ao usar suas Lâminas Psíquicas para causar Ataque Furtivo, você pode forçar o alvo a realizar uma salvaguarda de Sabedoria; em falha, ele fica atordoado e pode repetir a salvaguarda no final de cada turno. A característica retorna no Descanso Longo, ou pode ser reativada gastando um dado de Energia Psíquica.'
};

function renderExtra42(f,ctx){
  const id=`${ctx.classe}|${ctx.subclasse}|${f.nome}`;
  const cfg=EXTRA_SUBCLASSES_42[`${ctx.classe}|${ctx.subclasse}`]?.[f.nome];
  if(!cfg) return '';
  const e=estado(), k=`42|${id}`, st=e[k]||{usos:0,alvo:'',ativo:false};
  const max = typeof cfg.usos==='function' ? cfg.usos({ ...ctx, proficiencia: Number(ctx.proficiencia || ctx.pb || 2) }) : cfg.usos;
  const indef=cfg.recarga==='especial';
  return `<div class="no-print sub41-box"><strong>${Math.max(0,max-st.usos)}/${max}</strong>${indef?' · recarga especial.':` · ${cfg.recarga==='longo'?'Descanso Longo':cfg.recarga==='curto'?'Descanso Curto':'uso especial'}.`}
    <button class="btn btn-sm btn-accent" data-sub42-use="${escHtml(k)}" ${st.usos>=max?'disabled':''}>Usar</button>
    ${st.ativo?'<span> · ativo.</span>':''}${st.alvo?`<span> · alvo: <strong>${escHtml(st.alvo)}</strong></span>`:''}</div>`;
}

export function renderSubclasses41(f,ctx){
  if (!ctx?.subclasse || !f) return '';
  if (ctx.classe==='Guerreiro' && ctx.subclasse==='Arqueiro Arcano') return renderArcane(f,ctx);
  if (ctx.classe==='Guerreiro' && ctx.subclasse==='Samurai') return renderSamurai(f,ctx);
  if (ctx.classe==='Guerreiro' && ctx.subclasse==='Cavaleiro Rúnico') return renderRune(f,ctx);
  if (ctx.classe==='Ladino' && ctx.subclasse==='Espadachim') return renderSwash(f,ctx);
  return renderExtra42(f,ctx);
}

export function setupSubclasses41(){
  document.querySelectorAll('[data-sub42-use]').forEach(b=>b.addEventListener('click',()=>{ const k=b.dataset.sub42Use, st=estado()[k]||{usos:0}; if(st.usos>=1)return; st.usos++; st.ativo=true; estado()[k]=st; salvar(); window.dispatchEvent(new Event('hashchange')); toast('Recurso de subclasse usado.','success'); }));
  document.querySelectorAll('[data-sub41-shot-add]').forEach(b=>b.addEventListener('click',()=>{
    const k=b.dataset.sub41ShotAdd, select=document.querySelector(`[data-sub41-shot-select="${CSS.escape(k)}"]`), v=select?.value;
    if(!v) return toast('Escolha uma opção de Disparo Arcano.','error');
    const st=estado()[k]||{usos:0,escolha:[]};
    if(!Array.isArray(st.escolha)) st.escolha=[];
    if(st.escolha.includes(v)) return toast('Essa opção já foi escolhida.','info');
    st.escolha.push(v); estado()[k]=st; salvar(); window.dispatchEvent(new Event('hashchange'));
  }));
  document.querySelectorAll('[data-sub41-shot-use]').forEach(b=>b.addEventListener('click',()=>{
    const k=b.dataset.sub41ShotUse, st=estado()[k]||{usos:0,escolha:[]};
    if(st.usos>=2) return;
    st.usos++; estado()[k]=st; salvar(); window.dispatchEvent(new Event('hashchange')); toast('Disparo Arcano gasto.','success');
  }));
  document.querySelectorAll('[data-sub41-toggle]').forEach(b=>b.addEventListener('click',()=>{
    const k=b.dataset.sub41Toggle, st=estado()[k]||{}; st.usado_turno=!st.usado_turno; estado()[k]=st; salvar(); window.dispatchEvent(new Event('hashchange'));
  }));
  document.querySelectorAll('[data-sub41-samurai]').forEach(b=>b.addEventListener('click',()=>{
    const k=b.dataset.sub41Samurai, st=estado()[k]||{usos:0}; if(st.usos>=3)return; st.usos++; st.ativo=true; estado()[k]=st; salvar(); window.dispatchEvent(new Event('hashchange')); toast('Espírito de Combate ativado.','success');
  }));
  document.querySelectorAll('[data-sub41-panache]').forEach(b=>b.addEventListener('click',()=>{
    const k=b.dataset.sub41Panache, st=estado()[k]||{};
    if(st.alvo){ delete st.alvo; } else { const alvo=window.prompt('Nome do alvo de Panache:',''); if(!alvo)return; st.alvo=alvo; }
    estado()[k]=st; salvar(); window.dispatchEvent(new Event('hashchange'));
  }));
  document.querySelectorAll('[data-sub41-rune-giant]').forEach(b=>b.addEventListener('click',()=>{
    const k=b.dataset.sub41RuneGiant, st=estado()[k]||{usos:0}; if(st.usos>=2)return; st.usos++; st.ativo=true; estado()[k]=st; salvar(); window.dispatchEvent(new Event('hashchange')); toast('Força do Gigante ativada.','success');
  }));
}

export function restaurarSubclasses41(tipo){
  if(tipo!=='curto' && tipo!=='longo') return;
  const e=estado();
  for(const [k,st] of Object.entries(e)){
    if(k.startsWith('42|')) {
      const parts=k.split('|');
      const cfg=EXTRA_SUBCLASSES_42[`${parts[1]}|${parts[2]}`]?.[parts[3]];
      if(cfg && ((tipo==='curto' && cfg.recarga==='curto') || (tipo==='longo' && cfg.recarga==='longo'))) { st.usos=0; st.ativo=false; }
    }
    if(k.includes('|Arqueiro Arcano|Disparo Arcano') && (tipo==='curto'||tipo==='longo')) st.usos=0;
    if(tipo==='longo' && (k.includes('|Samurai|Espírito de Combate')||k.includes('|Cavaleiro Rúnico|Força do Gigante'))) { st.usos=0; st.ativo=false; }
    if(tipo==='curto' || tipo==='longo') if(k.includes('|Arqueiro Arcano|Tiro Curvado')) st.usado_turno=false;
  }
}

export function calcularIniciativaExtraSwashbuckler(){
  if(!Array.isArray(char?.classes)) return 0;
  const c=char.classes.find(x=>x.classe==='Ladino' && x.subclasse==='Espadachim');
  if(!c || Number(c.nivel||0)<3) return 0;
  return calcMod(char.atributos?.carisma ?? 10);
}
