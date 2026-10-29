/* jeu.js : état du personnage, roulette, jets, objets, boutique, saisons, quêtes, fin de partie, interface */
const nouveau=()=>({nom:'',rep:[],vie:[],pos:null,trail:[],st:{},pv:0,pvm:0,en:0,enm:0,inv:[],or:0,fl:[],comp:[],vis:[],rel:{Marchands:0,Couronne:0,Pègre:0,Peuple:0},cic:[],us:{},fat:0,cd:0,nem:'',ally:'',mnd:null,succ:[],expl:[],dec:0,boss:0,an0:0,lig:null,ligTrait:'',ligTx:[],fonde:'',obj:'',qs:0,t:0,age0:20,meteo:'Clair',fin:null,arch:0});
let PERSO=lire('perso',{tables:{},ev:[],efx:{},hist:{},etag:{},lieux:[],pos:{},extra:[]}),T=null,C=lire('c',nouveau()),PAN=lire('pan',[]),rot=0,occ=false,cur=[];
let WORLD=lire('monde',{annee:1200,sites:[]}),LIG=lire('lig',[]);WORLD.sites.forEach(s=>P[s.n]=[s.x,s.y]);
function appliquerPerso(){Object.assign(EF,PERSO.efx);Object.assign(HIST,PERSO.hist);Object.assign(ETAG,PERSO.etag);PERSO.lieux.forEach(l=>{P[l.n]=[l.x,l.y]});Object.keys(PERSO.pos).forEach(n=>{P[n]=PERSO.pos[n]})}
function construireT(){const t=JSON.parse(JSON.stringify(DEF));t.forEach(x=>{if(PERSO.tables[x.n])x.o=PERSO.tables[x.n]});
 const v=t.find(x=>x.vie);PERSO.ev.forEach(e=>{if(!v.o.some(y=>y[0]===e[0]))v.o.push(e)});
 const d=t.find(x=>x.n==='Décor');PERSO.lieux.forEach(l=>{if(!d.o.some(y=>y[0]===l.n))d.o.push([l.n,l.poids||1,{}])});
 const i=t.findIndex(x=>x.n==='Objectif');PERSO.extra.forEach((x,k)=>t.splice(i+k,0,JSON.parse(JSON.stringify(x))));return t}
appliquerPerso();T=construireT();
const ligTable=()=>({n:'Lignée',o:[['Sans lignée',8]].concat(LIG.map(l=>[l.nom,1.5]))}),etapes=()=>(LIG.length?[ligTable()]:[]).concat(T.filter(t=>!t.vie)),tous=()=>lieux().concat(WORLD.sites.map(s=>s.n)),anCourant=()=>C.an0+Math.floor(C.t/12),tv=()=>T.find(t=>t.vie),lieux=()=>((T.find(t=>t.n==='Décor')||{o:[]}).o).map(x=>x[0]);
const table=()=>C.rep.length<etapes().length?etapes()[C.rep.length]:tv();
const age=()=>C.age0+Math.floor(C.t/12),sai=()=>SAI[C.t%12],rnd=n=>Math.floor(Math.random()*n);
function meteo(){const s=sai(),r=Math.random();C.meteo=s==='hiver'?(r<.4?'Neige':r<.6?'Brume':'Clair'):s==='automne'?(r<.4?'Pluie':r<.55?'Orage':r<.7?'Brume':'Clair'):s==='printemps'?(r<.3?'Pluie':'Clair'):(r<.15?'Orage':'Clair')}
/* ----- Quêtes ----- */
const niv=k=>Math.floor(Math.sqrt(k.xp)),cnt=f=>C.vie.filter(f).length;
const okS=s=>({lieu:()=>C.pos===s.v&&C.vie.length>=6,vie:()=>C.vie.length>=s.n,or:()=>C.or>=s.n,ev:()=>cnt(e=>e.t===s.v&&e.ok)>=s.n,tag:()=>cnt(e=>ETAG[e.t]===s.v&&e.ok)>=s.n,comp:()=>C.comp.some(k=>niv(k)>=s.n),lieux:()=>C.vis.length>=s.n,stat:()=>C.st[s.k]>=s.n}[s.t]());
const etq=()=>{const o=C.obj;if(QU[o])return QU[o];const d=OBJD[o];return d?d.map(s=>[o,()=>okS(s),s.t==='ev'?'Ev:'+s.v:s.t==='tag'?'Tag:'+s.v:{lieu:'Lieu',or:'Or',lieux:'Explorer',comp:'Art'}[s.t]||'But']):[]};
function avancer(){const q=etq();while(C.qs<q.length&&q[C.qs][1]())C.qs++;return q.length>0&&C.qs>=q.length&&C.vie.length>0}
/* ----- Tirage pondéré : réponses précédentes, deux derniers événements, objets, états, lieu, météo, saison, étape de quête ----- */
function poids(t){
 if(t.stat){const b=C.rep.reduce((s,r)=>s+((SB[r[1]]||{})[t.stat]||0),0);return[2,3,4,5,6,7,8,9].map(v=>({t:String(v),w:Math.exp(-((v-5.5)**2)/6)*Math.exp(.22*b*(v-5.5))}))}
 const ev=t.vie?C.vie.filter(e=>e.t!=='Objet').slice(-2).map(e=>e.t):[],a=C.rep.map(r=>r[1]);let cx=[];
 if(t.vie){cx=ev.concat(C.fl,C.inv,[C.pos,C.meteo,cap(sai())],WORLD.sites.some(s=>s.n===C.pos)?['Site']:[]);if(C.en<=3)cx.push('Épuisé');if(C.pv<=4)cx.push('Blessé');const q=etq();if(C.qs<q.length)cx.push('Étape:'+q[C.qs][2])}
 a.push(...cx);const rw=cx.slice().reverse();
 const l=t.o.filter(x=>(!x[3]||a.includes(x[3]))&&!(x[0]==='Vengeance de l\'ennemi'&&C.cd>0)&&!(x[0]==='Explorer le site'&&C.expl.includes(C.pos))&&!(x[0]==='Piste d\'un lieu oublié'&&WORLD.sites.length>=12)).map(x=>{let w=x[1];a.forEach(k=>{if(x[2]&&x[2][k]!==undefined)w*=x[2][k]});if(t.vie){C.rep.concat(C.ligTrait?[['L',C.ligTrait]]:[]).forEach(r=>{const m=TR[r[1]];if(m&&m[x[0]])w*=m[x[0]]});RELF.forEach(f=>{const v=C.rel[f],k=v>=2?'Rel:'+f+'+':v<=-2?'Rel:'+f+'-':'',m=RELW[k];if(m&&m[x[0]])w*=m[x[0]]});const mo=C.mnd&&MONDE[C.mnd.n].w[x[0]];if(mo)w*=mo}
  const why=rw.find(k=>x[2]&&x[2][k]!==undefined&&x[2][k]!==1&&k!==C.pos&&!SAI.includes(k.toLowerCase()))||(x[3]&&x[3]!==C.pos?x[3]:'');return{t:x[0],w,why:why.startsWith('Étape:')?'son objectif':why}}).filter(x=>x.w>0);
 return l.length?l:t.o.filter(x=>!x[3]).map(x=>({t:x[0],w:x[1]}))}
function dessiner(w){
 const t=table();if(!t||C.fin){cur=[];$('g').innerHTML='';$('leg').innerHTML='';return}
 cur=poids(t);const s=cur.reduce((a,x)=>a+x.w,0);let a=-Math.PI/2,h='',leg=[];
 const p=(r,u)=>(150+r*Math.cos(u)).toFixed(1)+' '+(150+r*Math.sin(u)).toFixed(1);
 cur.forEach((x,i)=>{const d=x.w/s*2*Math.PI,b=a+d,c='hsl('+(i*47%360)+' 36% '+(i%2?38:46)+'%)',m=a+d/2;
  h+=cur.length>1?'<path d="M150 150L'+p(140,a)+'A140 140 0 '+(d>Math.PI?1:0)+' 1 '+p(140,b)+'Z" fill="'+c+'" stroke="'+(w===i?'#fff':'var(--s)')+'" stroke-width="'+(w===i?5:2)+'" opacity="'+(w!==undefined&&w!==i?.3:1)+'"/>':'<circle cx="150" cy="150" r="140" fill="'+c+'"/>';
  const L=x.t.length,fs=Math.min(12,88/(.56*L),d*80/1.2);
  if(fs>=7)h+='<text transform="translate('+p(88,m)+') rotate('+(m*180/Math.PI)+')" text-anchor="middle" dominant-baseline="middle" font-size="'+fs.toFixed(1)+'" fill="#fff" opacity="'+(w!==undefined&&w!==i?.3:1)+'">'+esc(x.t)+'</text>';a=b});
 $('g').innerHTML=h;
}
/* ----- Jets, effets, objets, boutique ----- */
function usure(k){const c=[];C.inv.filter((x,i,a)=>a.indexOf(x)===i).forEach(x=>{if(((ITEMS[x]||{})[k])&&DUR[x]){C.us[x]=(C.us[x]||0)+1;if(C.us[x]>=DUR[x]){C.inv.splice(C.inv.indexOf(x),1);C.us[x]=0;c.push(x)}}});return c}
function jet(k,d,tag){d+=1+Math.min(6,Math.floor(C.vie.length/4));const b=C.inv.reduce((s,x)=>s+((ITEMS[x]||{})[k]||0),0),cp=tag?bonusComp(tag):0,r=2+rnd(6)+rnd(6),st=Math.floor(C.st[k]/2),tot=r+st+b+cp;
 const casses=usure(k);return{ok:tot>=d,casses,txt:(/^[AEIOUÉ]/.test(S[k])?'Jet d\u2019':'Jet de ')+S[k]+' : '+tot+' (dés '+r+' + stat '+st+(b?' + objets '+b:'')+(cp?' + compétence '+cp:'')+') contre '+d}}
let LASTOK=true;
function initComp(){const g=k=>(C.rep.find(r=>r[0]===k)||[])[1],L=[];
 (SKM[g('Métier')]||[]).forEach(s=>L.push(s));if(RSK[g('Race')])L.push(RSK[g('Race')]);if(ASK[g('Archétype')])L.push(ASK[g('Archétype')]);
 C.comp=L.filter((s,i,a)=>a.findIndex(x=>x[0]===s[0])===i).map(s=>({n:s[0],tag:s[1],xp:1,rate:1}));C.vis=[C.pos]}
function bonusComp(tag){return Math.min(3,C.comp.filter(k=>k.tag===tag).reduce((m,k)=>Math.max(m,Math.ceil(niv(k)/2)),0))}
function gagner(v,ok,tx){const tag=ETAG[v];if(!tag)return;let k=C.comp.filter(s=>s.tag===tag);
 if(!k.length&&GEN[tag]){const n={n:GEN[tag],tag,xp:.5,rate:.5};C.comp.push(n);k=[n];tx.push('Nouvelle compétence : '+n.n)}
 k.forEach(s=>{const a=niv(s);s.xp+=s.rate*(ok?1.2:.8);if(niv(s)>a)tx.push(s.n+' niveau '+niv(s))});
 UNL.forEach(u=>{if(u[0]===v&&(u[1]===undefined||u[1]===ok)&&!C.comp.some(s=>s.n===u[2])){C.comp.push({n:u[2],tag:u[3],xp:1,rate:.8});tx.push('Compétence débloquée : '+u[2])}})}
function donner(v){const e=CAD[v]||{},tx=[];
 Object.keys(S).forEach(k=>{if(e[k]){C.st[k]+=e[k];tx.push(S[k]+' +'+e[k])}});
 if(e.or){C.or+=e.or;tx.push('Or +'+e.or)}if(e.pvm){C.pvm+=e.pvm;C.pv+=e.pvm;tx.push('Vie max +'+e.pvm)}if(e.enm){C.enm+=e.enm;C.en+=e.enm;tx.push('Énergie max +'+e.enm)}
 if(e.xp){C.comp.forEach(s=>s.xp+=e.xp);tx.push('Toutes les compétences progressent')}if(e.it){C.inv.push(e.it);tx.push('+ '+e.it)}if(e.fl){C.fl.push(e.fl);tx.push(e.fl)}return tx}
const CIC=['au bras','à la jambe','au visage','au flanc'],nomPropre=()=>NOMS1[rnd(NOMS1.length)]+' '+NOMS2[rnd(NOMS2.length)];
function cicatrice(tx){const k=Object.keys(S)[rnd(5)];C.st[k]=Math.max(1,C.st[k]-1);C.pvm=Math.max(5,C.pvm-1);C.pv=Math.min(C.pv,C.pvm);const t='Cicatrice '+CIC[rnd(4)]+' ('+S[k]+' -1)';C.cic.push(t);tx.push(t)}
function evMonde(tx){const m=C.mnd;if(m&&C.t>=m.fin){tx.push('Fin : '+m.n);C.mnd=null;return}
 if(!m&&C.vie.length>=3&&Math.random()<.12){const k=Object.keys(MONDE),n=k[rnd(k.length)],d=10+rnd(15);C.mnd={n,fin:C.t+d};tx.push('Le monde change : '+n+' ('+d+' mois). '+MONDE[n].t)}}
const vieChere=tx=>{if(VILLES.includes(C.pos)&&C.or>0){C.or--;tx.push('Vie chère : or -1')}};
const etats=()=>C.fl.map(f=>f==='Ennemi juré'&&C.nem?'Ennemi juré : '+C.nem:f==='Allié'&&C.ally?'Allié : '+C.ally:f).concat(C.cic);
function appliquer(v){const e=EF[v]||{},tx=[];let ok=true;if(v==='Piste d\'un lieu oublié')decouvrir(tx);if(v==='Explorer le site')explorer(tx);
 if(e.jet){const j=jet(e.jet[0],e.jet[1],ETAG[v]);ok=j.ok;tx.push(j.txt+' : '+(ok?'réussi':'raté'));j.casses.forEach(x=>tx.push(x+' se brise'))}
 Object.keys(S).forEach(k=>{if(e[k]){C.st[k]=Math.max(1,C.st[k]+e[k]);tx.push(S[k]+(e[k]>0?' +':' ')+e[k])}});
 if(e.PV){let d=e.PV;if(d<0&&e.jet&&ok)d=Math.min(-1,Math.ceil(d/2));C.pv=Math.min(C.pvm,C.pv+d);tx.push('Vie '+(d>0?'+':'')+d);if(d<0&&e.jet&&!ok&&Math.random()<.5)cicatrice(tx)}
 if(e.EN){C.en=Math.max(0,Math.min(C.enm,C.en+e.EN));tx.push('Énergie '+(e.EN>0?'+':'')+e.EN)}
 if(e.or&&(e.or<0||ok)){C.or=Math.max(0,C.or+e.or);tx.push('Or '+(e.or>0?'+':'')+e.or)}
 if(e.it&&ok){C.inv.push(e.it);tx.push('+ '+e.it)}
 if(e.fl&&!C.fl.includes(e.fl)){C.fl.push(e.fl);tx.push(e.fl);if(e.fl==='Ennemi juré'&&!C.nem)C.nem=nomPropre();if(e.fl==='Allié'&&!C.ally)C.ally=nomPropre()}
 if(e.uf&&(ok||!e.jet)){C.fl=C.fl.filter(f=>f!==e.uf);if(e.uf==='Ennemi juré')C.nem=''}
 const rl=REL[v];if(rl&&ok)Object.keys(rl).forEach(f=>{C.rel[f]=Math.max(-5,Math.min(5,C.rel[f]+rl[f]));tx.push(f+(rl[f]>0?' +':' ')+rl[f])});LASTOK=ok;gagner(v,ok,tx);return tx}
function auto(tx){ /* objets utilisés seuls */
 let k;while(C.pv>0&&C.pv<=4&&(k=C.inv.indexOf('Potion de soin'))>=0){C.inv.splice(k,1);C.pv=Math.min(C.pvm,C.pv+ITEMS['Potion de soin'].n);tx.push('boit une Potion de soin')}
 while(C.pv>0&&C.en<=2&&(k=C.inv.indexOf('Ration'))>=0){C.inv.splice(k,1);C.en=Math.min(C.enm,C.en+ITEMS['Ration'].n);tx.push('mange une Ration')}}
const px=x=>Math.round(ITEMS[x].p*(C.rel.Marchands>=2?.75:C.rel.Marchands<=-2?1.25:1)*(C.mnd&&C.mnd.n==='Famine'&&x==='Ration'?2:1)*(C.mnd&&C.mnd.n==='Guerre'&&['Épée','Dague','Arc','Armure légère'].includes(x)?1.5:1));
function boutique(tx){ /* achats seuls en ville */
 if(!VILLES.includes(C.pos)||C.pv<=0)return;const a=x=>{const p=px(x);C.or-=p;C.inv.push(x);tx.push('achète : '+x+' ('+p+' or)')},n=x=>C.inv.filter(y=>y===x).length;
 if(!n('Potion de soin')&&C.or>=px('Potion de soin')+3)a('Potion de soin');if(n('Ration')<2&&C.or>=px('Ration'))a('Ration');
 if(!C.inv.some(x=>['Épée','Dague','Marteau','Arc'].includes(x))&&C.or>=px('Épée'))a('Épée');if(!n('Armure légère')&&C.or>=px('Armure légère')+5)a('Armure légère')}
function verifier(){
 if(C.en<=0){C.fat++;if(C.fat%2===0&&C.enm>3)C.enm--;if(C.pv>0)C.pv--}
 if(C.pv<=0){C.pv=0;C.fin='mort';return}
 if(age()>=70){C.fin='mort';return}
 if(avancer())C.fin='victoire'}
function cible(c){const o=C.obj,q=etq();let tg=null;if(C.qs<q.length){const d=OBJD[o]&&OBJD[o][C.qs];if(d){if(d.t==='lieu')tg=d.v;else if(d.t==='ev'){const e=tv().o.find(x=>x[0]===d.v);tg=e&&e[3]}}else if(o==='Retrouver la Relique'&&C.qs===1)tg='Désert aux ruines'}
 return tg&&c.includes(tg)&&Math.random()<.65?tg:c[rnd(c.length)]}
function agir(v,why){
 const nm=v==='Vengeance de l\'ennemi'?C.nem:'',d0=cap(sai())+', '+age()+' ans',tx=appliquer(v),sc=(EF[v]||{}).sc;let txt=v,vers=null,de=C.pos,dt=1+rnd(2);
 if(/^voyage/i.test(v)){const c=tous().filter(x=>x!==C.pos);if(c.length&&C.pos){vers=cible(c);txt=v+' : '+de+' vers '+vers;C.trail.push([de,vers]);C.pos=vers;if(!C.vis.includes(vers))C.vis.push(vers);const cf=C.inv.includes('Cheval')?1:2;C.en=Math.max(0,C.en-cf);tx.push('Énergie -'+cf);dt=3}}
 else txt+=(C.pos?' à '+C.pos:'');
 if(sai()==='hiver'){C.en=Math.max(0,C.en-1);tx.push('Froid : Énergie -1')}
 C.t+=dt;meteo();if(C.cd>0)C.cd--;if(v==='Vengeance de l\'ennemi')C.cd=4;evMonde(tx);vieChere(tx);auto(tx);boutique(tx);succes(tx);verifier();if(C.en<=0&&!C.fin)tx.push('épuisé');
 if(tx.includes('Ennemi juré')&&C.nem)txt+=' (ennemi : '+C.nem+')';if(nm)txt=v+' : '+nm;if(/allié/i.test(v)&&C.ally)txt+=' : '+C.ally;
 C.vie.push({t:v,ok:LASTOK,txt:d0+' : '+txt+(why?' (suite à : '+why+')':'')+(tx.length?' ['+tx.join(', ')+']':'')+(C.fin==='mort'?' : mort'+(age()>=70?' de vieillesse':''):'')});
 $('act').textContent=C.vie[C.vie.length-1].txt;ecrire('c',C);return{tx,vers,de,sc}}
function fin(){C.pvm=C.pv=8+C.st.End;C.enm=C.en=6+Math.floor(C.st.End/2);C.or=5;C.age0=17+rnd(14);C.t=rnd(12);meteo();
 const g=k=>(C.rep.find(r=>r[0]===k)||[])[1];C.inv=[INV[g('Métier')]||'Bâton','Ration'];C.obj=g('Objectif')||'';initComp();C.an0=WORLD.annee+1+rnd(20);applyLig()}
/* ----- Fin de partie ----- */
function bio(){const g=k=>((C.rep.find(r=>r[0]===k)||[])[1]||'').toLowerCase(),ev=C.vie.filter(x=>x.t!=='Objet').map(x=>x.t.toLowerCase()).slice(0,5).join(', ');
 return (C.nom||'Le personnage')+', '+g('Race')+' '+g('Métier')+' ('+g('Origine')+', '+g('Trait de caractère')+' et '+g('Défaut')+'). '+(ev?'Sa vie : '+ev+'. ':'')
  +(C.fin==='mort'?'Fin : mort à '+age()+' ans.':'Fin : objectif accompli (« '+C.obj+' ») à '+age()+' ans.')+' Fortune : '+C.or+' pièces d\u2019or.'+(C.lig?' Lignée : '+C.lig.nom+'.':'')+(C.fonde?' Il fonde la '+C.fonde+'.':'')+(C.succ.length?' Succès : '+C.succ.join(', ')+'.':'')}
function effet(e,tx){if(!e)return;Object.keys(e.st||{}).forEach(k=>{C.st[k]=Math.max(1,C.st[k]+e.st[k]);tx.push(S[k]+' +'+e.st[k])});
 if(e.or){C.or+=e.or;tx.push('Or +'+e.or)}if(e.it){C.inv.push(e.it);tx.push('+ '+e.it)}if(e.xp){C.comp.forEach(s=>s.xp+=e.xp);tx.push('Compétences +'+e.xp)}
 if(e.comp&&!C.comp.some(s=>s.n===e.comp[0])){C.comp.push({n:e.comp[0],tag:e.comp[1],xp:4,rate:1});tx.push('Compétence héritée : '+e.comp[0])}
 if(e.trait){C.ligTrait=e.trait;tx.push('Trait de lignée : '+e.trait)}}
function applyLig(){C.ligTx=[];if(!C.lig)return;effet(C.lig.heri.eff,C.ligTx);(C.lig.gains||[]).forEach(g=>effet(g.eff,C.ligTx))}
function succes(tx){SUCC.forEach(s=>{if(!C.succ.includes(s[0])&&s[1](C)){C.succ.push(s[0]);const t2=[];effet(s[2],t2);tx.push('Succès : '+s[0]+' ('+t2.join(', ')+')')}})}
function decouvrir(tx){const ty=SITES[rnd(SITES.length)],n=ty+' '+SNOMS[rnd(SNOMS.length)];if(WORLD.sites.some(s=>s.n===n))return;let x,y,k=0;
 do{x=32+rnd(150);y=16+rnd(86);k++}while(k<30&&Object.values(P).some(q=>Math.hypot(q[0]-x,q[1]-y)<12));
 WORLD.sites.push({n,ty,x,y,an:anCourant(),par:C.nom||'Un inconnu',expl:0});P[n]=[x,y];C.dec++;built=false;ecrire('monde',WORLD);tx.push('Découverte : '+n+' (ajouté à la carte)')}
function explorer(tx){const s=WORLD.sites.find(z=>z.n===C.pos);if(!s)return;const pille=s.expl>0&&anCourant()-s.an<100,m=pille?.25:1,boss=Math.random()<.35;let ok=true;
 if(boss){const j=jet(Math.random()<.5?'For':'Agi',12,'combat');ok=j.ok;tx.push('Un gardien surgit. '+j.txt+' : '+(ok?'réussi':'raté'));j.casses.forEach(x=>tx.push(x+' se brise'));if(ok)C.boss++;else{C.pv=Math.max(0,C.pv-5);tx.push('Vie -5')}}
 const or=Math.round((12+rnd(15))*m*(boss&&ok?1.8:1)*(ok?1:.4));C.or+=or;tx.push('Butin : or +'+or+(pille?' (site déjà pillé)':''));
 if(s.expl===0&&ok&&Math.random()<.5){const it=['Épée bénie','Talisman béni','Potion de soin'][rnd(3)];C.inv.push(it);tx.push('+ '+it)}
 s.expl++;C.expl.push(s.n);ecrire('monde',WORLD)}
function fonder(){const g=k=>(C.rep.find(r=>r[0]===k)||[])[1]||'',pre=(C.nom||'sans nom').split(' ')[0];let nom='Lignée '+pre;while(LIG.some(l=>l.nom===nom))nom+=' II';
 const bs=Object.keys(S).sort((a,b)=>C.st[b]-C.st[a])[0],bc=C.comp.slice().sort((a,b)=>b.xp-a.xp)[0],tr=g('Trait de caractère'),r=Math.random();let heri;
 if(r<.3&&bc)heri={txt:'Héritage de savoir : '+bc.n,eff:{comp:[bc.n,bc.tag]}};else if(r<.6)heri={txt:'Héritage de sang : '+S[bs]+' +1',eff:{st:{[bs]:1}}};else if(r<.8&&tr)heri={txt:'Héritage de caractère : '+tr.toLowerCase(),eff:{trait:tr}};else heri={txt:'Héritage de fortune : 15 pièces d\u2019or',eff:{or:15}};
 const gains=C.succ.slice(0,2).map(n=>({txt:n,eff:SUCC.find(x=>x[0]===n)[2]})),l={nom,fond:C.nom||'Sans nom',txt:(C.nom||'Un ancêtre')+', '+g('Race').toLowerCase()+' '+g('Métier').toLowerCase()+', a fondé cette lignée. '+heri.txt+(gains.length?'. Succès transmis : '+gains.map(x=>x.txt).join(', '):'')+'.',heri,gains};
 LIG.push(l);ecrire('lig',LIG);C.fonde=nom;return l}
function archiver(){if(!C.fin||C.arch)return;C.arch=1;WORLD.annee=Math.max(WORLD.annee,anCourant());ecrire('monde',WORLD);
 const marq=(C.fin==='victoire'&&C.succ.length>=1)||C.succ.length>=3||(C.dec>0&&C.boss>0);if(marq&&Math.random()<.08+.92/(1+.6*LIG.length))fonder();
 PAN.unshift({nom:C.nom||'Sans nom',race:race(),metier:((C.rep.find(r=>r[0]==='Métier')||[])[1]||''),fin:C.fin,age:age(),bio:bio(),lig:C.lig?C.lig.nom:'',nouvelle:C.fonde});PAN=PAN.slice(0,15);ecrire('pan',PAN);ecrire('c',C)}
/* ----- Interface ----- */
const jauge=(n,v,m)=>'<li class="st"><span>'+n+'</span><i style="--v:'+Math.max(0,Math.min(100,v/m*100))+'%"></i><b>'+v+'/'+m+'</b></li>';
const libItem=x=>{const i=ITEMS[x]||{},b=Object.keys(S).filter(k=>i[k]).map(k=>'+'+i[k]+' '+S[k]);return esc(x)+(b.length?' <small>('+b.join(', ')+' aux jets)</small>':i.use?' <small>(utilisé seul si besoin)</small>':'')};
function ui(){
 const t=table(),n=etapes().length,f=C.fin;archiver();feedback();document.body.dataset.s=C.pvm?sai():'';
 $('et').textContent=f?'':C.rep.length<n?'Création, étape '+(C.rep.length+1)+'/'+n+' : '+t.n:(C.nom||'Votre personnage')+' : '+cap(sai())+', '+age()+' ans, '+C.meteo.toLowerCase()+(C.mnd?', '+C.mnd.n.toLowerCase()+' en cours':'')+'. Tirez un événement';
 $('ico').innerHTML=C.rep.length?iconeSVG(race(),42):'';
 const nomsS=Object.values(S),q=etq();
 $('fi').innerHTML=(C.pvm?jauge('Vie',C.pv,C.pvm)+jauge('Énergie',C.en,C.enm)+'<li class="st"><span>Or</span><i></i><b>'+C.or+'</b></li>'+RELF.map(f=>'<li class="st"><span>'+f+'</span><i style="--v:'+((C.rel[f]+5)*10)+'%"></i><b>'+(C.rel[f]>0?'+':'')+C.rel[f]+'</b></li>').join(''):'')+Object.keys(C.st).map(k=>'<li class="st"><span>'+S[k]+'</span><i style="--v:'+Math.min(100,C.st[k]/12*100)+'%"></i><b>'+C.st[k]+'</b></li>').join('')
  +(C.rep.filter(r=>!nomsS.includes(r[0])&&r[0]!=='Objectif').map(r=>'<li><b>'+esc(r[0])+'</b>'+esc(r[1])+'</li>').join('')||'<li>Pas encore de réponse.</li>')
  +(C.comp.length?'<li><b>Compétences</b>'+C.comp.map(k=>esc(k.n)+' <small>niv. '+niv(k)+'</small>').join('<br>')+'</li>':'')
  +(etats().length?'<li><b>États</b>'+etats().map(esc).join('<br>')+'</li>':'')+(C.succ.length?'<li><b>Succès</b>'+C.succ.map(esc).join('<br>')+'</li>':'')
  +(C.obj?'<li><b>Objectif</b>'+esc(C.obj)+(q.length>1?'<br><small>'+q.map((e,i)=>(i<C.qs?'fait : ':i===C.qs?'en cours : ':'à venir : ')+esc(e[0])).join('<br>')+'</small>':'')+'</li>':'');
 $('inv').innerHTML=C.inv.map(x=>'<li>'+libItem(x)+'</li>').join('')||'<li>Inventaire vide.</li>';
 $('mn').innerHTML=WORLD.sites.map(s=>'<li><b>'+esc(s.ty)+' : '+esc(s.n)+'</b>découvert par '+esc(s.par)+' (an '+s.an+'), '+s.expl+' exploration'+(s.expl>1?'s':'')+(s.expl>0&&(C.an0?anCourant():WORLD.annee)-s.an<100?', déjà pillé':', intact')+'</li>').join('')||'<li>Aucun lieu découvert.</li>';
 $('j').innerHTML=C.vie.map(x=>'<li>'+esc(x.txt)+'</li>').join('')||'<li>Aucun événement pour l\u2019instant.</li>';
 $('pan').innerHTML=PAN.map(x=>'<li><span class="pi">'+iconeSVG(x.race,30)+'</span><span><b>'+esc(x.nom)+' : '+(x.fin==='mort'?'mort':'victoire')+' à '+x.age+' ans</b>'+esc(x.race+' '+x.metier+(x.lig?', '+x.lig:'')+(x.nouvelle?', fonde la '+x.nouvelle:''))+'</span></li>').join('')||'<li>Aucun personnage terminé pour l\u2019instant.</li>';
 $('fin').hidden=!f;if(f)$('fin').innerHTML='<b>'+(f==='mort'?esc(C.nom||'Le personnage')+' est mort.':'Objectif accompli !')+'</b><br>'+esc(bio());
 $('go').disabled=!t||occ||!!f;$('vc').hidden=!C.pos;dessiner()}
/* ----- Son, tirage synchronisé, carte du destin ----- */
let AC=null,MUET=lire('muet',false);
function bip(f,d,v,t){if(MUET)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain();o.type=t||'triangle';o.frequency.value=f;const T0=AC.currentTime;g.gain.setValueAtTime(.0001,T0);g.gain.linearRampToValueAtTime(v||.05,T0+.006);g.gain.exponentialRampToValueAtTime(.0001,T0+d);o.connect(g);g.connect(AC.destination);o.start(T0);o.stop(T0+d+.02)}catch(e){}}
const ding=()=>{bip(660,.5,.07,'sine');setTimeout(()=>bip(990,.7,.06,'sine'),90)};
let TIC=0;const tic=k=>{const n=performance.now();if(n-TIC<90)return;TIC=n;bip(380+20*(k%6),.04,.012,'sine')};
$('son').textContent='Son : '+(MUET?'non':'oui');$('son').onclick=()=>{MUET=!MUET;ecrire('muet',MUET);$('son').textContent='Son : '+(MUET?'non':'oui')};
const STORY=(t,v)=>(t.n==='Lignée'?(v==='Sans lignée'?'Aucun grand nom derrière lui : tout reste à écrire.':(LIG.find(l=>l.nom===v)||{}).txt):'')||HIST[v]||({'Trait de caractère':'Un trait qui marquera ses choix : '+v.toLowerCase()+'.','Défaut':'Son défaut, '+v.toLowerCase()+', lui jouera des tours.','Décor':'Sa vie commence ici : '+v+'.','Objectif':'Son but : '+v.toLowerCase()+'.'}[t.n]||'');
function modal(cat,titre,texte,liste,ok){const m=$('md');$('mca').textContent=cat;$('mti').textContent=titre;$('mtx').className='';$('mtx').textContent=texte;$('mli').innerHTML=(liste||[]).map(x=>'<li>'+esc(x)+'</li>').join('');
 $('mem').innerHTML=cat==='Race'?iconeSVG(titre,64):'<div class="gl">'+esc(titre.charAt(0))+'</div>';m.hidden=false;$('mok').onclick=()=>{m.hidden=true;ok&&ok()};$('mok').focus()}
function resume(){const k=Object.keys(S).sort((a,b)=>C.st[b]-C.st[a]);modal('Caractéristiques','Votre personnage',S[k[0]]+' est son point fort, '+S[k[4]]+' son point faible.',Object.keys(S).map(x=>S[x]+' : '+C.st[x]),()=>ui())}
$('go').onclick=()=>{
 if(occ||!cur.length)return;if(AC&&AC.state==='suspended')AC.resume();const t=table(),s=cur.reduce((a,x)=>a+x.w,0);let r=Math.random()*s,i=0,c=0;
 for(;i<cur.length-1;i++){if(r<c+cur[i].w)break;c+=cur[i].w}
 const r0=rot,d=(((-r/s*360-r0)%360)+360)%360,r1=r0+1800+d,t0=performance.now();let last=-1;occ=true;$('go').disabled=true;$('res').className='';$('act').textContent='';
 const f=()=>{const u=Math.min(1,(performance.now()-t0)/4300),a=r0+(r1-r0)*(1-Math.pow(1-u,3));$('g').style.transform='rotate('+a+'deg)';
  const th=(((-a%360)+360)%360)/360*s;let k=0,cc=0;for(;k<cur.length-1;k++){if(th<cc+cur[k].w)break;cc+=cur[k].w}
  if(k!==last){last=k;tic(k);$('res').textContent=cur[k].t}
  if(u<1)requestAnimationFrame(f);else{rot=r1;arret(t,i)}};requestAnimationFrame(f)};
function arret(t,i){const v=cur[i].t,why=cur[i].why;$('res').textContent=v;$('res').className='pop';dessiner(i);ding();try{navigator.vibrate&&navigator.vibrate(40)}catch(e){}
 setTimeout(()=>{occ=false;suite(t,v,why)},1000)}
function suite(t,v,why){
 if(t.vie){const o=agir(v,why);ui();modal(t.n,v,STORY(t,v),o.tx,()=>{o.vers?voyage(v,o.de,o.vers):o.sc?scene(o.sc,ui):ui()});return}
 C.rep.push([t.n,v]);if(t.n==='Lignée')C.lig=LIG.find(l=>l.nom===v)||null;if(t.n==='Décor')C.pos=v;if(t.stat)C.st[t.stat]=+v;let extra=[];if(C.rep.length===etapes().length){fin();if(t.n==='Cadeau divin')extra=donner(v).concat(C.ligTx||[])}ecrire('c',C);ui();
 if(t.stat){const nx=etapes()[C.rep.length];if(!nx||!nx.stat)resume();return}
 modal(t.n,v,STORY(t,v),extra,ui)}
/* ----- Retours visuels : dégâts, gains, confettis ----- */
let PV0=null,OR0=null,FETE=false;
const num=(t,c)=>{const e=document.createElement('div');e.className='num';e.textContent=t;e.style.color=c;document.body.appendChild(e);setTimeout(()=>e.remove(),1300)};
function feedback(){if(!C.pvm){PV0=OR0=null;return}
 if(PV0!==null){const d=C.pv-PV0,o=C.or-OR0;if(d<0){$('fx').className='';void $('fx').offsetWidth;$('fx').className='rouge';num(d+' Vie','#d33')}else if(d>0)num('+'+d+' Vie','#2a8');if(o>0)num('+'+o+' or','#b8862d')}
 PV0=C.pv;OR0=C.or;
 if(C.fin==='victoire'&&!FETE){FETE=true;for(let i=0;i<40;i++){const e=document.createElement('div');e.className='cf';e.style.left=Math.random()*100+'vw';e.style.background=['#d9a441','#d33','#2a8','#47a'][i%4];e.style.animationDelay=Math.random()*.8+'s';document.body.appendChild(e);setTimeout(()=>e.remove(),3600)}}}
$('nom').value=C.nom;$('nom').oninput=e=>{C.nom=e.target.value;ecrire('c',C)};
$('cop').onclick=()=>{const s=(C.nom||'Personnage')+'\n\n'+Object.keys(C.st).map(k=>S[k]+' : '+C.st[k]).join('\n')+'\n\n'+C.rep.filter(r=>!Object.values(S).includes(r[0])).map(r=>r[0]+' : '+r[1]).join('\n')+'\n\nInventaire : '+C.inv.join(', ')+' ; or : '+C.or+'\n\n'+C.vie.map(x=>x.txt).join('\n')+(C.fin?'\n\n'+bio():'');try{navigator.clipboard.writeText(s);$('cop').textContent='Copié'}catch(e){}setTimeout(()=>$('cop').textContent='Copier',1500)};
$('raz').onclick=()=>{if(occ||!confirm('Commencer un nouveau personnage ?'))return;FETE=false;C=nouveau();$('nom').value='';ecrire('c',C);$('res').textContent='';$('act').textContent='';ui()};
const edt=()=>T.filter(t=>!t.stat);
function menu(){$('sl').innerHTML=edt().map((x,i)=>'<option value="'+i+'">'+esc(x.n)+'</option>').join('');edit()}
function edit(){const t=edt()[+$('sl').value||0];$('ed').value=t.o.map(x=>{const m=x[2]||{},k=Object.keys(m);return x[0]+' | '+x[1]+(k.length||x[3]?' | '+k.map(y=>y+'='+m[y]).join('; '):'')+(x[3]?' | '+x[3]:'')}).join('\n')}
$('sl').onchange=edit;
$('sv').onclick=()=>{const o=$('ed').value.split('\n').map(l=>{const p=l.split('|').map(s=>s.trim()),w=parseFloat((p[1]||'').replace(',','.')),m={};
 (p[2]||'').split(';').forEach(s=>{const k=s.lastIndexOf('=');if(k>0){const v=parseFloat(s.slice(k+1).replace(',','.'));if(!isNaN(v))m[s.slice(0,k).trim()]=v}});const x=[p[0],w>0?w:1,m];if(p[3])x.push(p[3]);return x}).filter(x=>x[0]);
 if(!o.length)return alert('Ajoutez au moins une option.');const tb=edt()[+$('sl').value||0];tb.o=o;const ex=PERSO.extra.find(x=>x.n===tb.n);if(ex)ex.o=o;else PERSO.tables[tb.n]=o;built=false;ecrire('perso',PERSO);ui()};
$('rd').onclick=()=>{if(confirm('Remettre toutes les tables d\u2019origine ?')){PERSO.tables={};ecrire('perso',PERSO);T=construireT();built=false;menu();ui()}};
menu();ui();
