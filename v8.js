/* v8.js : debug, contrôle des objectifs, biens et métier, annulation, sauvegarde auto (chargé avant jeu.js) */
let UNDO=null;
const vcf=()=>REG.vc===undefined?1:REG.vc;

/* ---------- À faire : lisible pour l'objectif en cours ---------- */
function afaire(e){if(!e)return '';const s=e[3];if(!s)return e[0];const p=progres(s);
 const L={lieu:'atteindre '+s.v+(atteint(s.v)?' (déjà fait)':' (pas encore atteint)'),vie:'vivre '+s.n+' événements',or:'réunir '+s.n+' pièces d’or',ev:'réussir « '+s.v+' » '+s.n+' fois',tag:'réussir '+s.n+' actions de type '+s.v,comp:'porter une compétence au niveau '+s.n,lieux:'visiter '+s.n+' lieux',stat:'atteindre '+s.n+' en '+(S[s.k]||s.k)}[s.t]||e[0];
 return L+(p&&s.t!=='lieu'?' ('+p[0]+'/'+p[1]+')':'')}

/* ---------- Coup de pouce de l'étape en cours (tous objectifs) ---------- */
const OB={a:4,b:3.5,c:2,d:2.4};
function objBoost(n){if(!C.obj||C.fin)return 1;const q=etq(),e=q[C.qs],s=e&&e[3],k=e&&e[2];let m=1;
 if(k==='Ennemi'&&n==='Une trahison')m=4;
 if(k==='Vengeance'&&n==='Vengeance de l\u2019ennemi'.replace('\u2019',"'"))m=6;
 if(k==='Relique'&&n==='Fouille des ruines')m=3;
 if(k==='Carte'&&['Rencontre d\'un allié','Mission de l\'allié','Lettre mystérieuse','Lettre déchiffrée'].includes(n))m=3;
 if(!s)return m;const ef=EF[n]||{};
 if(s.t==='ev'&&n===s.v)m=OB.a;
 else if(s.t==='tag'&&ETAG[n]===s.v)m=OB.b;
 else if(s.t==='comp'){const b=C.comp.slice().sort((x,y)=>y.xp-x.xp)[0];if(b&&ETAG[n]===b.tag)m=OB.b}
 else if(s.t==='lieux'&&/^voyage/i.test(n))m=OB.c;
 else if(s.t==='or'&&(ef.or>0||ETAG[n]==='commerce'))m=OB.d;
 else if(s.t==='stat'&&ef.st&&ef.st[s.k]>0)m=OB.c+1;
 return m}

/* ---------- Debug ---------- */
function debugTxt(){const L=[],q=etq(),e=q[C.qs];
 L.push('OBJECTIF : '+(C.obj||'aucun'));
 L.push('Étape '+Math.min(C.qs+1,q.length)+'/'+q.length+' : '+(e?e[0]+' — '+afaire(e):'terminée'));
 L.push('Condition remplie maintenant : '+(e?(e[1]()?'OUI':'non'):'-'));
 L.push('Position : '+C.pos+' | arrivé par voyage à : '+((C.arr||[]).join(', ')||'aucun lieu')+' | vus : '+C.vis.join(', '));
 L.push('Événements vécus : '+C.vie.length+' | âge '+age()+' | mois '+C.t+' | or '+C.or);
 L.push('États : '+(C.fl.join(', ')||'-')+' | blessures : '+((C.bl||[]).map(b=>b.n+'('+b.t+')').join(', ')||'-'));
 L.push('Compagnon : '+(C.cmp?C.cmp.n+' niv. '+C.cmp.niv:'-')+' | rang : '+(C.rang||0)+' | biens : '+((C.biens||[]).map(b=>b.n).join(', ')||'-'));
 L.push('Quête secondaire : '+(C.sq?C.sq.txt:'-')+' | talents endormis : '+((C.lat||[]).map(x=>x[0]).join(', ')||'-'));
 L.push('Monde : an '+anCourant()+' | '+(C.mnd?C.mnd.n+' (fin au mois '+C.mnd.fin+')':'pas d’événement mondial')+' | prix ×'+WORLD.prix+' | réputation ici : '+(WORLD.rep[C.pos]||0));
 const t=table();if(t&&!C.fin&&C.pvm){const w=poids(t),s=w.reduce((a,x)=>a+x.w,0);L.push('');L.push('PROCHAIN TIRAGE ('+t.n+') :');
  w.slice().sort((a,b)=>b.w-a.w).slice(0,22).forEach(x=>L.push((x.w/s*100).toFixed(1).padStart(5)+' %  '+x.t+(x.why?'   ← '+x.why:'')))}
 return L.join('\n')}
function debugForcer(v){if(!v||!C.pvm||C.fin||occ)return alert('Aucun personnage en cours.');snapUndo();const o=agir(v,'debug');ui();modal('Debug',v,'Événement forcé.',o.tx,()=>{o.vers?voyage(v,o.de,o.vers):ui()},['ev',v])}

/* ---------- Contrôle automatique des objectifs (isolé de la partie) ---------- */
const snapAll=()=>JSON.stringify({C,WORLD,LIG,RH,STAT,PAN});
function restoreAll(s,keep){const o=JSON.parse(s);C=o.C;WORLD=o.WORLD;LIG=o.LIG;RH=o.RH;STAT=o.STAT;PAN=o.PAN;Object.keys(P).forEach(k=>{if(keep&&!keep.includes(k))delete P[k]});
 WORLD.sites.forEach(x=>P[x.n]=[x.x,x.y]);WORLD.fond.forEach(x=>P[x.n]=[x.x,x.y]);built=false}
function blankWorld(){WORLD={annee:1200,sites:[],succ:{},fond:[],tombes:[],reliques:[],ennemis:[],rep:{},prix:1,mnd:null,fam:null};LIG=[];RH={};STAT={n:0,v:0,races:{},jobs:{},morts:{},maxAge:0};PAN=[]}
const tirer=w=>{const s=w.reduce((a,x)=>a+x.w,0);let r=Math.random()*s;for(const x of w){if(r<x.w)return x.t;r-=x.w}return w[w.length-1].t};
function creerAlea(obj){C=nouveau();C.nom='Audit';let g=0;
 while(C.rep.length<etapes().length&&g++<40){const t=table(),v=(t.n==='Objectif'&&obj)?obj:tirer(poids(t));
  C.rep.push([t.n,v]);if(t.n==='Lignée')C.lig=LIG.find(l=>l.nom===v)||null;if(t.n==='Famille')C.famOk=(v==='Héritage familial');if(t.n==='Décor')C.pos=v;if(t.stat)C.st[t.stat]=+v;
  if(C.rep.length===etapes().length){fin();if(t.n==='Cadeau divin'){donner(v);chienCmp()}}}}
function vivre(){let g=0;while(!C.fin&&g++<160)agir(tirer(poids(tv())),'')}
function fmtAudit(r,fait,tot){const L=['Contrôle des objectifs ('+fait+'/'+tot+')',''];let W=0,K=0;
 r.forEach(x=>{W+=x[1];K+=x[2];const p=Math.round(x[1]/x[2]*100);L.push((p<10?'!! ':p<25?'!  ':'   ')+String(p).padStart(3)+' %  '+x[0]+'   (durée moy. '+x[3]+' événements)')});
 if(K)L.push('','Moyenne : '+Math.round(W/K*100)+' % de victoires'+(fait<tot?'  ... en cours':''));L.push('','!! = presque jamais réussi, ! = trop rare. Objectif visé : 25 à 60 %.');return L.join('\n')}
async function audit(n,sortie){if(occ)return alert('Attends la fin du tirage.');const snap=snapAll(),pk=Object.keys(P),rep=[],objs=OBJ.map(o=>o[0]);NOSAVE=true;
 try{for(let i=0;i<objs.length;i++){let w=0,L=0;for(let j=0;j<n;j++){blankWorld();
    for(let t=0;t<6;t++){creerAlea(objs[i]);const d=(OBJD[objs[i]]||[])[0];if(!(d&&d.t==='lieu'&&d.v===C.pos))break}
    vivre();if(C.fin==='victoire')w++;L+=C.vie.length;if(j%2===1)await new Promise(r=>setTimeout(r,0))}
   rep.push([objs[i],w,n,Math.round(L/n)]);sortie(fmtAudit(rep,i+1,objs.length))}}
 catch(e){sortie('Erreur : '+e.message+'\n'+(e.stack||'').split('\n')[1])}
 finally{restoreAll(snap,pk);NOSAVE=false;ui()}}

/* ---------- Biens et métier exercé ---------- */
const BIENS={"Maison":18,"Étal":14,"Boutique":22,"Atelier":18,"Auberge":28,"Ferme":24,"Boulangerie":20};
const JOBB={Aubergiste:"Auberge",Cuisinier:"Auberge",Forgeron:"Atelier",Charpentier:"Atelier",Bijoutier:"Atelier",Tisserand:"Atelier",Boulanger:"Boulangerie","Marchand ambulant":"Étal",Changeur:"Boutique",Éleveur:"Ferme"};
function immoAuto(tx){if(!VILLES.concat(['Village de montagne']).includes(C.pos)||C.pv<=0)return;C.biens=C.biens||[];if(C.biens.length>=2)return;
 const job=(C.rep.find(x=>x[0]==='Métier')||[])[1],ty=C.biens.length===0?(JOBB[job]||'Maison'):'Maison';if(C.biens.some(b=>b.ty===ty))return;
 const c=BIENS[ty];if(C.or<c+3||Math.random()>.7)return;C.or-=c;C.biens.push({ty,lieu:C.pos,n:ty+' à '+C.pos,rev:ty==='Maison'?1:(ty==='Boutique'||ty==='Auberge')?3:2});tx.push('Achat : '+ty+' à '+C.pos+' ('+c+' or)')}

function revenus(tx,v){const B=C.biens||[];if(!B.length||C.pv<=0)return;let g=0;
 B.forEach(b=>{if(Math.random()<.35)g+=b.rev});if(v==='Journée de travail'){g+=1+Math.min(3,C.rang||0)+B.length*2}
 if(g){C.or+=g;tx.push('Revenus'+(B.length?' (biens)':'')+' : or +'+g)}}

/* ---------- Annuler le dernier tirage ---------- */
function snapUndo(){try{UNDO=snapAll()}catch(e){UNDO=null}}
function annuler(){if(!UNDO||occ)return;restoreAll(UNDO,null);UNDO=null;ecrire('c',C);ecrire('monde',WORLD);ecrire('lig',LIG);ecrire('raceh',RH);ecrire('stats',STAT);ecrire('pan',PAN);
 $('res').textContent='';$('act').textContent='';$('plein').hidden=true;$('md').hidden=true;ui()}

/* ---------- Sauvegarde automatique et rappel ---------- */
function autoSauve(){try{autoS()}catch(e){}}
function autoS(){if(typeof idb!=='function'||typeof exporter!=='function')return;const n=Date.now();if(n-(REG.la||0)<45000)return;REG.la=n;idb('set','auto',exporter())}
function banniere(){try{banR()}catch(e){}}
function banR(){const b=$('bk');if(!b)return;const n=Date.now(),l=REG.lb||0,util=STAT.n>0||C.vie.length>5;b.hidden=!((n-l)>7*864e5&&util);
 if(!b.hidden){b.innerHTML='<b>Sauvegarde de sécurité</b><br>'+(l?'Dernière : il y a '+Math.floor((n-l)/864e5)+' jours.':'Aucune sauvegarde téléchargée.')+'<br><button id="bk-b">Télécharger maintenant</button>';
  $('bk-b').onclick=()=>{telecharger();REG.lb=Date.now();ecrire('reg',REG);banniere()}}}
if($('un'))$("un").onclick=annuler;
if($('pan'))$('pan').addEventListener('click',e=>{const li=e.target.closest&&e.target.closest('li[data-p]');if(!li)return;const x=PAN[+li.dataset.p];if(!x)return;
 modal('Panthéon',x.nom,'',[],null);$('mtx').textContent=x.rec||x.bio||'';$('mtx').className='long'});
