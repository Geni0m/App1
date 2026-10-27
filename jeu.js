/* jeu.js : état du personnage, roulette, jets, objets, boutique, saisons, quêtes, fin de partie, interface */
const nouveau=()=>({nom:'',rep:[],vie:[],pos:null,trail:[],st:{},pv:0,pvm:0,en:0,enm:0,inv:[],or:0,fl:[],obj:'',qs:0,t:0,age0:20,meteo:'Clair',fin:null,arch:0});
let T=lire('t',DEF),C=lire('c',nouveau()),PAN=lire('pan',[]),rot=0,occ=false,cur=[];
const etapes=()=>T.filter(t=>!t.vie),tv=()=>T.find(t=>t.vie),lieux=()=>((T.find(t=>t.n==='Décor')||{o:[]}).o).map(x=>x[0]);
const table=()=>C.rep.length<etapes().length?etapes()[C.rep.length]:tv();
const age=()=>C.age0+Math.floor(C.t/12),sai=()=>SAI[C.t%12],rnd=n=>Math.floor(Math.random()*n);
function meteo(){const s=sai(),r=Math.random();C.meteo=s==='hiver'?(r<.4?'Neige':r<.6?'Brume':'Clair'):s==='automne'?(r<.4?'Pluie':r<.55?'Orage':r<.7?'Brume':'Clair'):s==='printemps'?(r<.3?'Pluie':'Clair'):(r<.15?'Orage':'Clair')}
/* ----- Quêtes ----- */
const etq=()=>{const o=C.obj;if(QU[o])return QU[o];if(o.startsWith('Atteindre : ')){const l=o.slice(12);return[[o,()=>C.pos===l,'Lieu']]}
 if(o.startsWith('Survivre'))return[[o,()=>C.vie.length>=12,'Vie']];if(o.startsWith('Réunir'))return[[o,()=>C.or>=40,'Or']];return[]};
function avancer(){const q=etq();while(C.qs<q.length&&q[C.qs][1]())C.qs++;return q.length>0&&C.qs>=q.length&&C.vie.length>0}
/* ----- Tirage pondéré : réponses précédentes, deux derniers événements, objets, états, lieu, météo, saison, étape de quête ----- */
function poids(t){
 if(t.stat){const b=C.rep.reduce((s,r)=>s+((SB[r[1]]||{})[t.stat]||0),0);return[2,3,4,5,6,7,8,9].map(v=>({t:String(v),w:Math.exp(-((v-5.5)**2)/6)*Math.exp(.22*b*(v-5.5))}))}
 const ev=t.vie?C.vie.filter(e=>e.t!=='Objet').slice(-2).map(e=>e.t):[],a=C.rep.map(r=>r[1]);let cx=[];
 if(t.vie){cx=ev.concat(C.fl,C.inv,[C.pos,C.meteo,cap(sai())]);if(C.en<=3)cx.push('Épuisé');if(C.pv<=4)cx.push('Blessé');const q=etq();if(C.qs<q.length)cx.push('Étape:'+q[C.qs][2])}
 a.push(...cx);const rw=cx.slice().reverse();
 const l=t.o.filter(x=>!x[3]||a.includes(x[3])).map(x=>{let w=x[1];a.forEach(k=>{if(x[2]&&x[2][k]!==undefined)w*=x[2][k]});
  const why=rw.find(k=>x[2]&&x[2][k]!==undefined&&x[2][k]!==1&&k!==C.pos&&!SAI.includes(k.toLowerCase()))||(x[3]&&x[3]!==C.pos?x[3]:'');return{t:x[0],w,why}}).filter(x=>x.w>0);
 return l.length?l:t.o.filter(x=>!x[3]).map(x=>({t:x[0],w:x[1]}))}
function dessiner(){
 const t=table();if(!t||C.fin){cur=[];$('g').innerHTML='';$('leg').innerHTML='';return}
 cur=poids(t);const s=cur.reduce((a,x)=>a+x.w,0);let a=-Math.PI/2,h='',leg=[];
 const p=(r,u)=>(150+r*Math.cos(u)).toFixed(1)+' '+(150+r*Math.sin(u)).toFixed(1);
 cur.forEach((x,i)=>{const d=x.w/s*2*Math.PI,b=a+d,c='hsl('+(i*47%360)+' 36% '+(i%2?38:46)+'%)',m=a+d/2;
  h+=cur.length>1?'<path d="M150 150L'+p(140,a)+'A140 140 0 '+(d>Math.PI?1:0)+' 1 '+p(140,b)+'Z" fill="'+c+'" stroke="var(--s)" stroke-width="2"/>':'<circle cx="150" cy="150" r="140" fill="'+c+'"/>';
  const L=x.t.length,fs=Math.min(12,88/(.56*L),d*80/1.2),ok=fs>=7,txt=ok?esc(x.t):String(i+1);if(!ok)leg.push((i+1)+'. '+esc(x.t));
  h+='<text transform="translate('+p(ok?88:105,m)+') rotate('+(m*180/Math.PI)+')" text-anchor="middle" dominant-baseline="middle" font-size="'+(ok?fs.toFixed(1):11)+'" fill="#fff">'+txt+'</text>';a=b});
 $('g').innerHTML=h;$('leg').innerHTML=leg.join(' · ');
}
/* ----- Jets, effets, objets, boutique ----- */
function jet(k,d){const b=C.inv.reduce((s,x)=>s+((ITEMS[x]||{})[k]||0),0),r=2+rnd(6)+rnd(6),st=Math.floor(C.st[k]/2),tot=r+st+b;
 return{ok:tot>=d,txt:'Jet de '+S[k]+' : '+tot+' (dés '+r+' + stat '+st+(b?' + objets '+b:'')+') contre '+d}}
function appliquer(v){const e=EF[v]||{},tx=[];let ok=true;
 if(e.jet){const j=jet(e.jet[0],e.jet[1]);ok=j.ok;tx.push(j.txt+' : '+(ok?'réussi':'raté'))}
 Object.keys(S).forEach(k=>{if(e[k]){C.st[k]=Math.max(1,C.st[k]+e[k]);tx.push(S[k]+(e[k]>0?' +':' ')+e[k])}});
 if(e.PV){let d=e.PV;if(d<0&&e.jet&&ok)d=Math.min(-1,Math.ceil(d/2));C.pv=Math.min(C.pvm,C.pv+d);tx.push('Vie '+(d>0?'+':'')+d)}
 if(e.EN){C.en=Math.max(0,Math.min(C.enm,C.en+e.EN));tx.push('Énergie '+(e.EN>0?'+':'')+e.EN)}
 if(e.or&&(e.or<0||ok)){C.or=Math.max(0,C.or+e.or);tx.push('Or '+(e.or>0?'+':'')+e.or)}
 if(e.it&&ok){C.inv.push(e.it);tx.push('+ '+e.it)}
 if(e.fl&&!C.fl.includes(e.fl)){C.fl.push(e.fl);tx.push(e.fl)}
 if(e.uf)C.fl=C.fl.filter(f=>f!==e.uf);return tx}
function auto(tx){ /* objets utilisés seuls */
 let k;while(C.pv>0&&C.pv<=4&&(k=C.inv.indexOf('Potion de soin'))>=0){C.inv.splice(k,1);C.pv=Math.min(C.pvm,C.pv+ITEMS['Potion de soin'].n);tx.push('boit une Potion de soin')}
 while(C.pv>0&&C.en<=2&&(k=C.inv.indexOf('Ration'))>=0){C.inv.splice(k,1);C.en=Math.min(C.enm,C.en+ITEMS['Ration'].n);tx.push('mange une Ration')}}
function boutique(tx){ /* achats seuls en ville */
 if(!VILLES.includes(C.pos)||C.pv<=0)return;const a=x=>{C.or-=ITEMS[x].p;C.inv.push(x);tx.push('achète : '+x)},n=x=>C.inv.filter(y=>y===x).length;
 if(!n('Potion de soin')&&C.or>=5)a('Potion de soin');if(n('Ration')<2&&C.or>=2)a('Ration');
 if(!C.inv.some(x=>['Épée','Dague','Marteau'].includes(x))&&C.or>=15)a('Épée');if(!n('Armure légère')&&C.or>=20)a('Armure légère')}
function verifier(){
 if(C.en<=0&&C.pv>0)C.pv--;
 if(C.pv<=0){C.pv=0;C.fin='mort';return}
 if(age()>=70){C.fin='mort';return}
 if(avancer())C.fin='victoire'}
function agir(v,why){
 const d0=cap(sai())+', '+age()+' ans',tx=appliquer(v),sc=(EF[v]||{}).sc;let txt=v,vers=null,de=C.pos,dt=1+rnd(2);
 if(/^voyage/i.test(v)){const c=lieux().filter(x=>x!==C.pos);if(c.length&&C.pos){vers=c[rnd(c.length)];txt=v+' : '+de+' vers '+vers;C.trail.push([de,vers]);C.pos=vers;C.en=Math.max(0,C.en-2);tx.push('Énergie -2');dt=3}}
 else txt+=(C.pos?' à '+C.pos:'');
 if(sai()==='hiver'){C.en=Math.max(0,C.en-1);tx.push('Froid : Énergie -1')}
 C.t+=dt;meteo();auto(tx);boutique(tx);verifier();if(C.en<=0&&!C.fin)tx.push('épuisé');
 C.vie.push({t:v,txt:d0+' : '+txt+(why?' (suite à : '+why+')':'')+(tx.length?' ['+tx.join(', ')+']':'')+(C.fin==='mort'?' : mort'+(age()>=70?' de vieillesse':''):'')});
 $('act').textContent=C.vie[C.vie.length-1].txt;ecrire('c',C);
 if(vers)voyage(v,de,vers);else if(sc)scene(sc,ui);else ui()}
function fin(){C.pvm=C.pv=8+C.st.End;C.enm=C.en=6+Math.floor(C.st.End/2);C.or=5;C.age0=17+rnd(14);C.t=rnd(12);meteo();
 const g=k=>(C.rep.find(r=>r[0]===k)||[])[1];C.inv=[INV[g('Métier')]||'Bâton','Ration'];C.obj=g('Objectif')||''}
/* ----- Fin de partie ----- */
function bio(){const g=k=>((C.rep.find(r=>r[0]===k)||[])[1]||'').toLowerCase(),ev=C.vie.filter(x=>x.t!=='Objet').map(x=>x.t.toLowerCase()).slice(0,5).join(', ');
 return (C.nom||'Le personnage')+', '+g('Race')+' '+g('Métier')+' ('+g('Origine')+', '+g('Trait de caractère')+' et '+g('Défaut')+'). '+(ev?'Sa vie : '+ev+'. ':'')
  +(C.fin==='mort'?'Fin : mort à '+age()+' ans.':'Fin : objectif accompli (« '+C.obj+' ») à '+age()+' ans.')+' Fortune : '+C.or+' pièces d\u2019or.'}
function archiver(){if(!C.fin||C.arch)return;C.arch=1;PAN.unshift({nom:C.nom||'Sans nom',race:race(),metier:((C.rep.find(r=>r[0]==='Métier')||[])[1]||''),fin:C.fin,age:age(),bio:bio()});PAN=PAN.slice(0,15);ecrire('pan',PAN);ecrire('c',C)}
/* ----- Interface ----- */
const jauge=(n,v,m)=>'<li class="st"><span>'+n+'</span><i style="--v:'+Math.max(0,Math.min(100,v/m*100))+'%"></i><b>'+v+'/'+m+'</b></li>';
const libItem=x=>{const i=ITEMS[x]||{},b=Object.keys(S).filter(k=>i[k]).map(k=>'+'+i[k]+' '+S[k]);return esc(x)+(b.length?' <small>('+b.join(', ')+' aux jets)</small>':i.use?' <small>(utilisé seul si besoin)</small>':'')};
function ui(){
 const t=table(),n=etapes().length,f=C.fin;archiver();
 $('et').textContent=f?'':C.rep.length<n?'Création, étape '+(C.rep.length+1)+'/'+n+' : '+t.n:(C.nom||'Votre personnage')+' : '+cap(sai())+', '+age()+' ans, '+C.meteo.toLowerCase()+'. Tirez un événement';
 $('ico').innerHTML=C.rep.length?iconeSVG(race(),42):'';
 const nomsS=Object.values(S),q=etq();
 $('fi').innerHTML=(C.pvm?jauge('Vie',C.pv,C.pvm)+jauge('Énergie',C.en,C.enm)+'<li class="st"><span>Or</span><i></i><b>'+C.or+'</b></li>':'')+Object.keys(C.st).map(k=>'<li class="st"><span>'+S[k]+'</span><i style="--v:'+Math.min(100,C.st[k]/12*100)+'%"></i><b>'+C.st[k]+'</b></li>').join('')
  +(C.rep.filter(r=>!nomsS.includes(r[0])&&r[0]!=='Objectif').map(r=>'<li><b>'+esc(r[0])+'</b>'+esc(r[1])+'</li>').join('')||'<li>Pas encore de réponse.</li>')
  +(C.fl.length?'<li><b>États</b>'+C.fl.map(esc).join(', ')+'</li>':'')
  +(C.obj?'<li><b>Objectif</b>'+esc(C.obj)+(q.length>1?'<br><small>'+q.map((e,i)=>(i<C.qs?'fait : ':i===C.qs?'en cours : ':'à venir : ')+esc(e[0])).join('<br>')+'</small>':'')+'</li>':'');
 $('inv').innerHTML=C.inv.map(x=>'<li>'+libItem(x)+'</li>').join('')||'<li>Inventaire vide.</li>';
 $('j').innerHTML=C.vie.map(x=>'<li>'+esc(x.txt)+'</li>').join('')||'<li>Aucun événement pour l\u2019instant.</li>';
 $('pan').innerHTML=PAN.map(x=>'<li><span class="pi">'+iconeSVG(x.race,30)+'</span><span><b>'+esc(x.nom)+' : '+(x.fin==='mort'?'mort':'victoire')+' à '+x.age+' ans</b>'+esc(x.race+' '+x.metier)+'</span></li>').join('')||'<li>Aucun personnage terminé pour l\u2019instant.</li>';
 $('fin').hidden=!f;if(f)$('fin').innerHTML='<b>'+(f==='mort'?esc(C.nom||'Le personnage')+' est mort.':'Objectif accompli !')+'</b><br>'+esc(bio());
 $('go').disabled=!t||occ||!!f;$('vc').hidden=!C.pos;dessiner()}
$('go').onclick=()=>{
 if(occ||!cur.length)return;const t=table(),s=cur.reduce((a,x)=>a+x.w,0);let r=Math.random()*s,i=0,c=0;
 for(;i<cur.length-1;i++){if(r<c+cur[i].w)break;c+=cur[i].w}
 const d=(((-r/s*360-rot)%360)+360)%360;rot+=1800+d;occ=true;$('res').textContent='…';$('act').textContent='';
 $('g').style.transform='rotate('+rot+'deg)';
 setTimeout(()=>{occ=false;const v=cur[i].t,why=cur[i].why;$('res').textContent=v;
  if(t.vie)agir(v,why);else{C.rep.push([t.n,v]);if(t.n==='Décor')C.pos=v;if(t.stat)C.st[t.stat]=+v;if(C.rep.length===etapes().length)fin();ecrire('c',C);ui()}},4100)};
$('nom').value=C.nom;$('nom').oninput=e=>{C.nom=e.target.value;ecrire('c',C)};
$('cop').onclick=()=>{const s=(C.nom||'Personnage')+'\n\n'+Object.keys(C.st).map(k=>S[k]+' : '+C.st[k]).join('\n')+'\n\n'+C.rep.filter(r=>!Object.values(S).includes(r[0])).map(r=>r[0]+' : '+r[1]).join('\n')+'\n\nInventaire : '+C.inv.join(', ')+' ; or : '+C.or+'\n\n'+C.vie.map(x=>x.txt).join('\n')+(C.fin?'\n\n'+bio():'');try{navigator.clipboard.writeText(s);$('cop').textContent='Copié'}catch(e){}setTimeout(()=>$('cop').textContent='Copier',1500)};
$('raz').onclick=()=>{if(occ||!confirm('Commencer un nouveau personnage ?'))return;C=nouveau();$('nom').value='';ecrire('c',C);$('res').textContent='';$('act').textContent='';ui()};
const edt=()=>T.filter(t=>!t.stat);
function menu(){$('sl').innerHTML=edt().map((x,i)=>'<option value="'+i+'">'+esc(x.n)+'</option>').join('');edit()}
function edit(){const t=edt()[+$('sl').value||0];$('ed').value=t.o.map(x=>{const m=x[2]||{},k=Object.keys(m);return x[0]+' | '+x[1]+(k.length||x[3]?' | '+k.map(y=>y+'='+m[y]).join('; '):'')+(x[3]?' | '+x[3]:'')}).join('\n')}
$('sl').onchange=edit;
$('sv').onclick=()=>{const o=$('ed').value.split('\n').map(l=>{const p=l.split('|').map(s=>s.trim()),w=parseFloat((p[1]||'').replace(',','.')),m={};
 (p[2]||'').split(';').forEach(s=>{const k=s.lastIndexOf('=');if(k>0){const v=parseFloat(s.slice(k+1).replace(',','.'));if(!isNaN(v))m[s.slice(0,k).trim()]=v}});const x=[p[0],w>0?w:1,m];if(p[3])x.push(p[3]);return x}).filter(x=>x[0]);
 if(!o.length)return alert('Ajoutez au moins une option.');edt()[+$('sl').value||0].o=o;built=false;ecrire('t',T);ui()};
$('rd').onclick=()=>{if(confirm('Remettre toutes les tables d\u2019origine ?')){T=JSON.parse(JSON.stringify(DEF));built=false;ecrire('t',T);menu();ui()}};
menu();ui();
