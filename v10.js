/* v10.js : destin, relations, chaînes, humeurs, roue truquée, coups du sort, bilan, records, livre d'or, thèmes, export, transfert, test auto */
const W10=()=>{['pnj','biens'].forEach(k=>WORLD[k]=WORLD[k]||[]);WORLD.hu=WORLD.hu||{}};
const humeur=l=>{const h=(WORLD.hu||{})[l];return h&&C.an0&&anCourant()-h.an<30?h.h:''};
const HUM=['prospère','en guerre','en deuil','en fête'];
const PNJR={rival:'Rival',mentor:'Mentor',amour:'Amour'};
const PNJT={rival:(p)=>'Un rival hérité : '+p.n+', qui s’opposait à '+p.de,mentor:(p)=>'Un mentor : '+p.n+', qui avait guidé '+p.de,amour:(p)=>'Un amour : '+p.n+', que '+p.de+' a laissé derrière lui'};

/* ---- Boosts de tirage : destin, humeur du lieu, chaînes ---- */
function v10Boost(n){if(!C.pvm||C.fin)return 1;let m=1;const d=(C.rep.find(r=>r[0]==='Destin')||[])[1],g=ETAG[n];
 if(d==='Maudit'&&['Une trahison','Une maladie','Embuscade','Une dette','Cambriolage'].includes(n))m*=1.5;
 if(d==='Béni des dieux'&&['Un coup de chance','Un héritage inattendu',"Soins d'un guérisseur","Rencontre d'un allié"].includes(n))m*=1.5;
 if(d==='Marqué du sceau'&&['Vision étrange','Une rencontre décisive',"Vengeance de l'ennemi",'Mémoire des défunts'].includes(n))m*=1.6;
 if(d==='Étoile du berger'&&['Un coup de chance','Un héritage inattendu','Marché florissant'].includes(n))m*=2;
 const h=humeur(C.pos);
 if(h==='prospère'&&(g==='commerce'||n==='Marché florissant'))m*=1.35;
 if(h==='en guerre'&&(g==='combat'||n==='Embuscade'))m*=1.4;
 if(h==='en deuil'&&(g==='mystique'||g==='social'||n==='Cérémonie'))m*=1.3;
 if(h==='en fête'&&(g==='hospitalité'||n==='Banquet'||n==='Tournoi'))m*=1.4;
 (C.ch||[]).forEach(c=>{if(c.ev===n&&C.vie.length>=c.de&&C.vie.length<=c.a)m*=500});
 return m}

/* ---- Roue truquée : rare, annoncée ---- */
function truquer(cur,t){const e=$('et');if(e)e.textContent=e.textContent.replace(/ — La roue est truquée.*$/,'');
 if(!t||!t.vie||!C.tru||cur.length<4)return cur;const i=Math.floor(C.tru.s*cur.length),r=cur.map(x=>Object.assign({},x));
 if(C.tru.k==='d'){r[i].w*=3;if(e)e.textContent+=' — La roue est truquée : « '+r[i].t+' » compte triple'}
 else{const nom=r[i].t;r.splice(i,1);if(e)e.textContent+=' — La roue est truquée : « '+nom+' » disparaît'}
 return r}

/* ---- Création : destin, relations, légendes, lignées, bien hérité ---- */
function v10Debut(){W10();const g=k=>(C.rep.find(r=>r[0]===k)||[])[1],d=g('Destin');C.famTx=C.famTx||[];C.cp=[];C.ch=[];C.tru=null;
 if(d==='Béni des dieux'){C.pvm+=2;C.pv+=2;C.or+=8;C.famTx.push('Béni des dieux : Vie +2, or +8')}
 else if(d==='Maudit'){C.comp.forEach(k=>k.xp+=2);C.famTx.push('Maudit : les ennuis viennent plus souvent, mais forgent le caractère (compétences +2)')}
 else if(d==='Marqué du sceau'){C.st.Esp=Math.min(12,C.st.Esp+1);if(!C.fl.includes('Ennemi juré')){C.fl.push('Ennemi juré');if(!C.nem)C.nem=nomPropre()}C.famTx.push('Marqué du sceau : Esprit +1, un ennemi inconnu vous traque')}
 else if(d==='Étoile du berger'){C.or+=10;C.famTx.push('Étoile du berger : or +10, la chance sourit')}
 if(WORLD.pnj.length&&Math.random()<.5){const p=WORLD.pnj.shift();C.pnj=p;C.fl.push(PNJR[p.role]);C.famTx.push(PNJT[p.role](p))}
 const lg=WORLD.tombes.filter(t=>t.leg);if(lg.length&&Math.random()<.25){C.fl.push('Légende');C.famTx.push('Les récits de '+lg[rnd(lg.length)].nom+', mort en légende, courent encore')}
 if(C.lig&&C.lig.rel){C.lrel=C.lig.rel;C.fl.push(C.lig.rel.ty==='rivale'?'Lignée rivale':'Lignée alliée');C.famTx.push('La '+C.lig.nom+' est '+C.lig.rel.ty+' de la '+C.lig.rel.avec)}
 if(C.famOk&&WORLD.biens.length){const b=WORLD.biens.shift();C.biens=[b];C.famTx.push('Bien hérité : '+b.n)}
 const h=humeur(C.pos);if(h)C.famTx.push('Ici, l’ambiance est : '+h)}

/* ---- Après chaque action ---- */
const COUPS=[['Une pièce brille au bord du chemin : or +3',()=>{C.or+=3}],['Un inconnu offre à boire : Énergie +2',()=>{C.en=Math.min(C.enm,C.en+2)}],['Un mauvais pressentiment : Énergie -1',()=>{C.en=Math.max(0,C.en-1)}],['Une bourse perdue : or -3',()=>{C.or=Math.max(0,C.or-3)}],['Un sommeil réparateur : Vie +2',()=>{C.pv=Math.min(C.pvm,C.pv+2)}],['Une chute bête : Vie -1',()=>{C.pv=Math.max(1,C.pv-1)}]];
const TER={'Village de montagne':[['Éboulis sur le sentier : Énergie -1',()=>{C.en=Math.max(0,C.en-1)}],['Une source fraîche : Énergie +1',()=>{C.en=Math.min(C.enm,C.en+1)}]],
'Forêt interdite':[['Des ronces griffent la route : Vie -1',()=>{C.pv=Math.max(1,C.pv-1)}],['Des baies sauvages : Énergie +1',()=>{C.en=Math.min(C.enm,C.en+1)}]],
'Désert aux ruines':[['Soif et poussière : Énergie -1',()=>{C.en=Math.max(0,C.en-1)}],['Une pièce ancienne dans le sable : or +4',()=>{C.or+=4}]],
'Cité portuaire':[['Un marin vend des nouvelles : or -1',()=>{C.or=Math.max(0,C.or-1)}],['Un docker donne un coup de main : Énergie +1',()=>{C.en=Math.min(C.enm,C.en+1)}]]};
const TERR=[['Un péage inattendu : or -2',()=>{C.or=Math.max(0,C.or-2)}],['Un charretier prend le voyageur : Énergie +1',()=>{C.en=Math.min(C.enm,C.en+1)}]];
function v10Apres(v,ok,tx){W10();C.cp=C.cp||[];const L=C.vie.length;
 if((age()>=50||C.vie.length>=14)&&!C.fl.includes('Âgé')){C.fl.push('Âgé');tx.push('Les années commencent à peser')}
 C.ch=(C.ch||[]).filter(c=>c.ev!==v&&L<=c.a);
 if(CHAIN[v]&&!C.ch.length&&Math.random()<.6){C.ch.push({ev:CHAIN[v][0],de:L+2,a:L+6});tx.push('Cet épisode risque d’avoir des suites')}
 if(/^voyage/i.test(v)&&Math.random()<.4){const a=TER[C.pos]||TERR,e=a[rnd(a.length)];e[1]();tx.push('En chemin : '+e[0])}
 if(['Chanson de taverne','Fantôme croisé','Épée célèbre aperçue'].includes(v)){const l=WORLD.tombes.filter(t=>t.leg);if(l.length)tx.push('Légende : '+l[rnd(l.length)].nom)}
 if(C.pnj&&PNJR[C.pnj.role]&&{'Retour du rival':'rival','Leçon du mentor':'mentor',"Lettre de l'être aimé":'amour'}[v]===C.pnj.role)tx.push('Avec '+C.pnj.n);
 if(v==='Querelle de lignées'&&C.lrel)tx.push('Contre la '+C.lrel.avec);if(v==='Soutien de la lignée alliée'&&C.lrel)tx.push('Aide de la '+C.lrel.avec);
 if(v==='Testament'){const B=C.biens||[],E=C.enf||[];tx.push('À léguer : '+(B.map(b=>b.n).join(', ')||'ses souvenirs')+(E.length?', à '+E.map(e=>e.n).join(', '):''))}
 const B=C.biens||[];
 if(B.length&&C.or<4&&Math.random()<.3){const b=B.pop(),p=Math.floor((BIENS[b.ty]||20)*.6);C.or+=p;tx.push('Vente : '+b.n+' (or +'+p+')')}
 else if(B.length&&((C.mnd&&['Guerre','Brigandage'].includes(C.mnd.n)&&Math.random()<.06)||(v==='Incendie'&&!ok&&Math.random()<.35))){const b=B.pop();tx.push('Perdu : '+b.n+' (pillage ou incendie)')}
 if(C.vie.length>=2&&Math.random()<.07){const e=COUPS[rnd(COUPS.length)];e[1]();tx.push('Coup du sort : '+e[0])}
 const mk=tx.find(x=>/^(Succès mondial|Découverte|Promotion|Naissance de)/.test(x));if(mk)C.cp.push(cap(sai())+', '+age()+' ans, '+(C.pos||'')+' : '+mk.replace(/\s*\(.*$/,''));
 C.tru=(!C.fin&&C.pv>0&&Math.random()<.06)?{k:Math.random()<.5?'d':'x',s:Math.random()}:null}

/* ---- Fin de vie : records, relations laissées, humeurs, biens transmis ---- */
function v10Fin(){W10();STAT.rec=STAT.rec||{};const nom=nomS(),a=age(),o=C.or,n=C.vie.length;
 [['age',a],['or',o],['vie',n]].forEach(([k,v])=>{if(!STAT.rec[k]||v>STAT.rec[k].v)STAT.rec[k]={v,nom,race:race()}});
 if(C.fin==='victoire'&&(!STAT.rec.vf||n<STAT.rec.vf.v))STAT.rec.vf={v:n,nom,race:race()};
 if(WORLD.pnj.length<6&&Math.random()<.45){const r=['rival','mentor','amour'][rnd(3)];WORLD.pnj.push({n:NOMS1[rnd(NOMS1.length)],role:r,de:nom,an:anCourant()})}
 if(C.pnj&&Math.random()<.4&&WORLD.pnj.length<6)WORLD.pnj.push(C.pnj);
 if(C.mortT==='Mort en légende'||C.mortT==='Mort en héros'){if(C.pos)WORLD.hu[C.pos]={h:'en deuil',an:anCourant()}}
 else if(C.fin==='victoire'&&C.pos&&Math.random()<.5)WORLD.hu[C.pos]={h:'en fête',an:anCourant()};
 if(Math.random()<.35){const l=lieux();if(l.length)WORLD.hu[l[rnd(l.length)]]={h:HUM[rnd(4)],an:anCourant()}}
 if((C.biens||[]).length&&(C.enf||[]).length){WORLD.biens=WORLD.biens.concat(C.biens.slice(0,1)).slice(-3);WORLD.fam=WORLD.fam||{de:nom,it:[],or:0}}
 if(C.fonde){const l=LIG.find(x=>x.nom===C.fonde),o2=LIG.filter(x=>x!==l);if(l&&o2.length&&Math.random()<.4){const b=o2[rnd(o2.length)],ty=Math.random()<.5?'rivale':'alliée';l.rel={avec:b.nom,ty};if(!b.rel)b.rel={avec:l.nom,ty};ecrire('lig',LIG)}}
 ecrire('monde',WORLD);ecrire('stats',STAT)}

/* ---- Fiche : lignes supplémentaires ---- */
function fiche10(){let h='';const d=(C.rep.find(r=>r[0]==='Destin')||[])[1];
 if(d&&d!=='Aucun destin')h+='<li><b>Destin</b>'+esc(d)+'</li>';
 if(C.pnj)h+='<li><b>'+cap(C.pnj.role)+'</b>'+esc(C.pnj.n)+'</li>';
 if(C.lrel)h+='<li><b>Lignée '+esc(C.lrel.ty)+'</b>'+esc(C.lrel.avec)+'</li>';
 const hu=humeur(C.pos);if(hu)h+='<li><b>Ambiance ici</b>'+esc(hu)+'</li>';
 if((C.ch||[]).length)h+='<li><b>Suites en vue</b>un épisode récent pourrait revenir</li>';
 return h}

/* ---- Bilan de fin de vie ---- */
function bilan(){if(!C.fin)return;const V=C.vie.filter(e=>e.t!=='Objet'),f={};V.forEach(e=>f[e.t]=(f[e.t]||0)+1);const top=Object.keys(f).sort((a,b)=>f[b]-f[a]).slice(0,3).map(k=>k+' ×'+f[k]);
 const ok=V.filter(e=>e.ok).length,L=[];
 L.push(V.length+' événements, '+age()+' ans, '+C.or+' pièces d’or');L.push('Réussites : '+ok+' sur '+V.length);if(top.length)L.push('Les plus fréquents : '+top.join(', '));
 L.push('Lieux : '+(C.vis.join(', ')||'aucun'));
 const rk=(k,v)=>PAN.filter(p=>(p[k]||0)>v).length+1;
 if(PAN.length>1){L.push('Durée de vie : n°'+rk('age',age())+' sur '+PAN.length);L.push('Fortune : n°'+rk('or',C.or)+' sur '+PAN.length)}
 if(STAT.rec&&STAT.rec.age)L.push('Record de longévité : '+STAT.rec.age.nom+' ('+STAT.rec.age.v+' ans)');
 (C.cp||[]).forEach(c=>L.push('✉ '+c));
 modal('Bilan',nomS(),C.fin==='mort'?'Mort à '+age()+' ans.':'Objectif accompli.',L,null)}
$('fin').addEventListener('click',e=>{if(e.target.id==='bl')bilan()});

/* ---- Records, chronique, livre d'or (section histoire du monde) ---- */
function hist10(){const rc=$('rc');if(rc){const R=STAT.rec||{},lab={age:'Vie la plus longue',or:'Plus grande fortune',vie:'Plus d’événements',vf:'Victoire la plus rapide'};
 rc.innerHTML=Object.keys(lab).filter(k=>R[k]).map(k=>'<li><b>'+lab[k]+'</b>'+esc(R[k].nom)+' ('+esc(R[k].race||'')+') : '+R[k].v+(k==='age'?' ans':k==='or'?' or':' événements')+'</li>').join('')+Object.keys(RH).map(k=>'<li><b>'+esc(k)+'</b>'+(RH[k].v||0)+' victoire(s), '+(RH[k].m||0)+' mort(s)</li>').join('')||'<li>Aucun record pour l’instant.</li>'}
 const lo=$('lo');if(lo){const d=Object.keys(WORLD.succ);lo.innerHTML=d.length?SUCC.filter(x=>WORLD.succ[x[0]]).map(x=>{const s=WORLD.succ[x[0]];return '<li><b>'+esc(x[0])+'</b>'+esc(x[3]||'')+'<br><small>Pris par '+esc(s.par)+(s.race?' ('+esc(s.race)+')':'')+', an '+s.an+(s.ag?', à '+s.ag+' ans':'')+(s.obj?', objectif : '+esc(s.obj):'')+'</small></li>'}).join(''):'<li>Aucun succès pris pour l’instant.</li>'}}

/* ---- Récit enrichi ---- */
function recitPlus(){const o=[],V=C.vie.filter(e=>e.t!=='Objet'),nom=(C.nom||'Le personnage').split(' ')[0],ls=[...new Set(V.map(e=>e.p).filter(Boolean))];
 if(V.length>=6){const k=Math.ceil(V.length/3),P=[['Sa jeunesse',V.slice(0,k)],['Son âge mûr',V.slice(k,2*k)],['Ses dernières années',V.slice(2*k)]];
  P.forEach(([t,a])=>{if(!a.length)return;const f={};a.forEach(e=>f[e.t]=(f[e.t]||0)+1);const top=Object.keys(f).sort((x,y)=>f[y]-f[x]).slice(0,2).map(x=>x.toLowerCase());o.push(t+' est faite de '+top.join(' et ')+(a.filter(e=>!e.ok).length>a.length/2?', et de bien des revers.':', plutôt heureusement.'))})}
 if(ls.length>1)o.push(nom+' aura vécu à '+ls.slice(0,-1).join(', ')+' et '+ls[ls.length-1]+'.');
 const pr=[];if(C.pnj)pr.push(C.pnj.n+' ('+C.pnj.role+')');if(C.cmp)pr.push(C.cmp.n);(C.enf||[]).forEach(e=>pr.push(e.n+' (enfant)'));
 if(pr.length)o.push('Autour de '+nom+' : '+pr.join(', ')+'.');
 if((C.biens||[]).length)o.push(nom+' possédait : '+C.biens.map(b=>b.n).join(', ')+'.');
 if(C.lrel)o.push('Sa lignée, la '+C.lig.nom+', était '+C.lrel.ty+' de la '+C.lrel.avec+'.');
 return o}

/* ---- Thèmes, pause de lecture ---- */
function appliquerTh(){document.documentElement.dataset.th=REG.th||''}
appliquerTh();
const sel10=(id,k,num)=>{const e=$(id);if(!e)return;e.value=String(REG[k]===undefined?(num?1:''):REG[k]);e.onchange=()=>{REG[k]=num?+e.value:e.value;ecrire('reg',REG);appliquerTh()}};
sel10('rg-th','th',false);sel10('rg-pa','pa',true);

/* ---- Sauvegarde : état visible, code de transfert ---- */
function majSv(){const p=$('sv-i');if(!p)return;p.textContent=REG.la?'Dernière copie automatique : '+new Date(REG.la).toLocaleString('fr-FR'):'Aucune copie automatique pour l’instant.'}
async function codeTransfert(){const s=exporter();if(!window.CompressionStream)return 'B64:'+btoa(unescape(encodeURIComponent(s)));
 const buf=await new Response(new Blob([s]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer();let b='';new Uint8Array(buf).forEach(x=>b+=String.fromCharCode(x));return 'JDR1:'+btoa(b)}
async function lireCode(t){t=t.trim();if(t[0]==='{')return t;if(t.startsWith('B64:'))return decodeURIComponent(escape(atob(t.slice(4))));
 if(t.startsWith('JDR1:')){const u=Uint8Array.from(atob(t.slice(5)),c=>c.charCodeAt(0));return await new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'))).text()}throw 0}

/* ---- Export du panthéon (page à partager) ---- */
function exporterPanteon(){if(!PAN.length)return alert('Panthéon vide.');
 const h='<!doctype html><meta charset="utf-8"><title>Panthéon</title><body style="font-family:Georgia,serif;max-width:640px;margin:20px auto;padding:0 14px;line-height:1.5"><h1>Panthéon</h1>'+PAN.map(x=>'<h2>'+esc(x.nom)+' — '+(x.fin==='mort'?'mort':'victoire')+' à '+x.age+' ans</h2><p><i>'+esc(x.race+' '+x.metier)+'</i></p><p style="white-space:pre-wrap">'+esc(x.rec||x.bio||'')+'</p>').join('')+'</body>';
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([h],{type:'text/html'}));a.download='pantheon.html';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000)}
if($('pe'))$('pe').onclick=exporterPanteon;
$('fin').addEventListener('click',()=>{});

/* ---- Test automatique intégré ---- */
async function autotest(n,sortie){if(occ)return alert('Attends la fin du tirage.');const snap=snapAll(),pk=Object.keys(P),err={};let v=0,m=0;NOSAVE=true;
 const note=(w,e)=>{const k=w+' : '+e.message;err[k]=(err[k]||0)+1};
 try{blankWorld();W10();
  for(let i=0;i<n;i++){try{creerAlea()}catch(e){note('création',e)}
   try{vivre()}catch(e){note('vie',e)}
   try{archiver()}catch(e){note('archivage',e)}
   try{recit();bilan10()}catch(e){note('récit/bilan',e)}
   try{debugTxt();hist();hist10();fiche10()}catch(e){note('affichage',e)}
   if(C.fin==='victoire')v++;else m++;if(i%3===2)await new Promise(r=>setTimeout(r,0))}
  try{ui()}catch(e){note('ui',e)}
  const k=Object.keys(err);sortie(k.length?'Erreurs détectées :\n'+k.map(x=>'- '+x+' (×'+err[x]+')').join('\n'):'Aucune erreur sur '+n+' vies ('+v+' victoires, '+m+' morts).')}
 catch(e){sortie('Échec du test : '+e.message)}
 finally{restoreAll(snap,pk);NOSAVE=false;ui()}}
function bilan10(){const V=C.vie;return V.length}
