#!/usr/bin/env python3
import json, glob, re, unicodedata, os, sys
from collections import Counter

ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA=os.path.join(ROOT,'dados','classes')
OUT=os.path.join(ROOT,'dados','controle','subclasses_auditoria_5_1.json')
SUP={'Caldeirão de Tudo de Tasha','Guia de Xanathar para Todas as Coisas'}
XANATHAR_SUBS={
 'Caminho do Guardião Ancestral','Caminho do Arauto da Tempestade','Caminho do Fanático',
 'Colégio do Glamour','Colégio das Espadas','Colégio dos Sussurros',
 'O Celestial','Lâmina Maldita','Domínio da Forja','Domínio da Sepultura',
 'Círculo dos Sonhos','Círculo do Pastor','Alma Divina','Magia Sombria','Feitiçaria Tempestuosa',
 'Arqueiro Arcano','Cavaleiro','Samurai','Investigador','Mestre dos Mecanismos','Batedor','Espadachim',
 'Magia de Guerra','Mestre Embriagado','Kensei','Alma Solar','Juramento da Conquista','Juramento da Redenção',
 'Andarilho das Sombras','Andarilho do Horizonte','Matador de Monstros'
}

def norm(s):
    s=unicodedata.normalize('NFD',(s or '').lower())
    return ''.join(c for c in s if unicodedata.category(c)!='Mn')

def source_heading(desc):
    lines=[x.strip() for x in (desc or '').splitlines() if x.strip()]
    name=lines[0] if lines else ''
    m=re.search(r'(?:Característica|Habilidade)\s+de\s+(\d+)\s*[º°o]?\s*(?:Nível|nível)', desc or '', re.I)
    return name, int(m.group(1)) if m else None

# Known project aliases deliberately retained because runtime handlers/tests use them.
ALIASES={
 ('Paladino','Juramento da Glória','Destruição Inspiradora'): 'Canalizar Divindade',
 ('Paladino','Juramento da Glória','Magias do Juramento da Glória'): 'Magias de juramento',
 ('Guardião','Senhor das Feras','Companheiro Primal'): 'Companheiro Primitivo',
 ('Druida','Círculo das Estrelas','Forma Estrelada'): 'Forma Estelar',
 ('Druida','Círculo das Estrelas','Repleto de Estrelas'): 'Totalmente Estrelado',
 ('Guerreiro','Combatente Psíquico','Poder Psiônico'): 'Poder Psíquico',
 ('Guerreiro','Combatente Psíquico','Resguardo Mental'): 'Mente protegida',
 ('Guerreiro','Combatente Psíquico','Baluarte de Energia'): 'Baluarte Telecinético',
}

entries=[]
errors=[]
for path in sorted(glob.glob(os.path.join(DATA,'*.json'))):
    d=json.load(open(path,encoding='utf-8'))
    classe=d.get('nome')
    for sub in d.get('subclasses',[]):
        seen=Counter()
        for f in sub.get('caracteristicas',[]):
            fonte=f.get('fonte','')
            eh_tasha=fonte=='Caldeirão de Tudo de Tasha'
            eh_xan=sub['nome'] in XANATHAR_SUBS
            if not (eh_tasha or eh_xan): continue
            if eh_xan and not eh_tasha:
                # Xanathar 5.0 still stores page-concatenated OCR in this layer.
                # Keep it visible in the audit instead of pretending the heading parser is reliable.
                seen[norm(f['nome'])]+=1
                entries.append({
                    'classe':classe,'subclasse':sub['nome'],'caracteristica':f['nome'],
                    'nivel_projeto':f.get('nivel'),'fonte':'Guia de Xanathar para Todas as Coisas',
                    'nome_fonte':None,'nivel_fonte':None,
                    'status_nome':'PENDENTE_RECONSTRUCAO_XANATHAR',
                    'status_nivel':'PENDENTE_VERIFICACAO_FONTE',
                    'motivo':'descrição atual é OCR concatenado de página; não usar como mapeamento nominal.'
                })
                continue
            name_src,lvl_src=source_heading(f.get('descricao',''))
            key=(classe,sub['nome'],f['nome'])
            alias=ALIASES.get(key)
            status='OK' if norm(name_src)==norm(f['nome']) else ('ALIAS_LEGADO' if alias and norm(alias)==norm(name_src) else 'ERRO_NOME_DESCRICAO')
            if not name_src: status='ERRO_SEM_CABECALHO'
            if lvl_src is None: status='ERRO_SEM_NIVEL_FONTE'
            nivel_status='IGUAL' if lvl_src==f.get('nivel') else 'DIFERENTE_PROJETO_2024'
            seen[norm(f['nome'])]+=1
            rec={
                'classe':classe,'subclasse':sub['nome'],'caracteristica':f['nome'],
                'nivel_projeto':f.get('nivel'),'fonte':fonte,
                'nome_fonte':name_src,'nivel_fonte':lvl_src,
                'status_nome':status,'status_nivel':nivel_status,
            }
            if alias: rec['alias_fonte']=alias
            entries.append(rec)
            if status.startswith('ERRO'): errors.append(rec)
        for n,count in seen.items():
            if count>1: errors.append({'classe':classe,'subclasse':sub['nome'],'caracteristica':n,'status':'ERRO_DUPLICATA'})

summary={
 'versao':'5.1.0','total_caracteristicas_suplementos':len(entries),
 'erros':len(errors),
 'pendentes_xanathar':sum(1 for e in entries if e['status_nome']=='PENDENTE_RECONSTRUCAO_XANATHAR'),'xanathar_caracteristicas':sum(1 for e in entries if e['fonte']=='Guia de Xanathar para Todas as Coisas'),
 'aliases_legados':sum(1 for e in entries if e['status_nome']=='ALIAS_LEGADO'),
 'niveis_diferentes_por_adaptacao_2024':sum(1 for e in entries if e['status_nivel']=='DIFERENTE_PROJETO_2024'),
 'status':'OK' if not errors else 'ERROS',
}
out={'resumo':summary,'caracteristicas':entries,'erros':errors}
os.makedirs(os.path.dirname(OUT),exist_ok=True)
json.dump(out,open(OUT,'w',encoding='utf-8'),ensure_ascii=False,indent=2)
print(json.dumps(summary,ensure_ascii=False))
if errors:
    for e in errors: print('ERROR',e)
    sys.exit(1)
