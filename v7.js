/* v7.js : mécaniques de la V7 (chargé avant jeu.js ; tout ce qui touche C / WORLD n'est lu qu'à l'exécution) */
const REG=Object.assign({fs:1,vit:1,anim:1,j:0,auto:0},lire('reg',{}));
let STAT=Object.assign({n:0,v:0,races:{},jobs:{},morts:{},maxAge:0},lire('stats',{}));
const DIFF={a:3,b:8,c:3,d:2};
const nomS=()=>(C.nom||'Le personnage')+(C.sur?' '+C.sur:'');

/* ---------- Surnoms ---------- */
const SURN={"Premier vainqueur":"l'Élu","Première âme perdue":"le Premier Défunt","Mort-né":"le Mort-né","Chanceux insolent":"le Veinard","Première bourse pleine":"le Prospère","Fortune de roi":"le Nabab","Découvreur":"le Découvreur","Tueur de gardien":"le Tueur de gardiens","Premier maître":"le Maître","Vétéran":"le Vétéran","Mille lieues":"le Vagabond","Vieux sage":"le Sage","Ami du monde":"l'Aimé","Haï de tous":"le Maudit","Marqué à vie":"le Traumatisé","Vengeance accomplie":"le Vengeur","Colosse":"le Colosse","Victoire à l'arraché":"le Rescapé"};
function majSurnom(){if(C.sur)return;const s=C.succ[0];
 if(s){C.sur=SURN[s]||(/^Premier .* victorieux$/.test(s)?'le Pionnier':'');return}
 if(!C.fin)return;
 const r=[[C.boss>0,'le Pourfendeur'],[C.dec>0&&C.vis.length>=4,"l'Explorateur"],[(C.cic||[]).length>=1,'le Balafré'],[C.or>=40,'le Prospère'],[C.vis.length>=5,'le Voyageur'],[(C.rang||0)>=2,'le Maître'],[C.vie.length>=18,'le Tenace'],[C.fin==='mort'&&C.vie.length<=4,"l'Éphémère"]].find(x=>x[0]);
 if(r)C.sur=r[1]}

/* ---------- Objectifs chiffrés ---------- */
function progres(s){const m={vie:()=>[C.vie.length,s.n],or:()=>[C.or,s.n],ev:()=>[cnt(e=>e.t===s.v&&e.ok),s.n],tag:()=>[cnt(e=>ETAG[e.t]===s.v&&e.ok),s.n],comp:()=>[Math.max(0,...C.comp.map(niv)),s.n],lieux:()=>[C.vis.length,s.n],stat:()=>[C.st[s.k],s.n],lieu:()=>[C.pos===s.v?1:0,1]}[s.t];if(!m)return null;const r=m();return[Math.max(0,Math.min(r[0],r[1])),r[1]]}
function progTxt(e){const s=e&&e[3];if(!s||s.t==='lieu')return '';const p=progres(s);return p?' ('+p[0]+'/'+p[1]+')':''}

/* ---------- Choix à un moment clé ---------- */
const CHOIX={
"Embuscade":[["Se battre","For",0,{Combattant:2,Orc:1.5,Minotaure:1.5}],["Fuir","Agi",1,{Voyageur:1.5,Roublard:2,Peureux:2.5,Halfelin:1.5,Félin:1.5}]],
"Combat de rue":[["Cogner","For",0,{Combattant:2,Orc:1.5}],["Esquiver","Agi",-1,{Roublard:2,Halfelin:1.5,Félin:1.5}]],
"Vengeance de l'ennemi":[["Affronter","For",0,{Rancunier:2,Combattant:1.5}],["Tendre un piège","Esp",0,{Érudit:2,Roublard:1.5,Curieux:1.5}]],
"Duel avec le rival":[["Duel d'honneur","For",0,{Loyal:2,Combattant:1.5}],["Coup bas","Agi",0,{Menteur:2,Roublard:2}]],
"Négociation tendue":[["Marchander","Cha",0,{Commerçant:2,Marchand:1.5,Généreux:1.2}],["Menacer","For",1,{Combattant:1.5,Têtu:1.5}]],
"Cambriolage":[["Discrétion","Agi",0,{Roublard:2,Halfelin:1.5,Gobelin:1.5}],["Force brute","For",1,{Combattant:1.5,Orc:1.5,Minotaure:2}]],
"Une maladie":[["Se reposer","End",0,{Paysan:1.3,Nain:1.3}],["Chercher un remède","Esp",-1,{Soigneur:2,Érudit:1.5,Gnome:1.5}]],
"Tempête en mer":[["Tenir le cap","End",0,{Marin:2,Voyageur:1.5}],["Chercher un abri","Agi",-1,{Peureux:2,Halfelin:1.5}]],
"Tournoi":[["Charger","For",0,{Combattant:2,Orc:1.5}],["Jouer la technique","Agi",0,{Elfe:1.5,Félin:1.5,Roublard:1.5}]],
"Épreuve d'honneur":[["Foncer","For",0,{Têtu:1.5,Orc:1.5}],["Réfléchir","Esp",0,{Érudit:1.5,Curieux:2}]]};
function choix(v){const o=CHOIX[v],e=EF[v];if(!o||!e||!e.jet)return null;const a=C.rep.map(r=>r[1]).concat(C.fl,C.inv);
 const w=o.map(x=>{let m=.5+(C.st[x[1]]||5)/10;a.forEach(k=>{if(x[3][k])m*=x[3][k]});return m}),s=w.reduce((p,q)=>p+q,0);let r=Math.random()*s,i=0;for(;i<o.length-1;i++){if(r<w[i])break;r-=w[i]}
 const x=o[i],b=e.jet;e.jet=[x[1],Math.max(6,b[1]+x[2])];return{fin:tx=>{e.jet=b;tx.unshift('Choix : '+x[0]+' ('+Math.round(w[i]/s*100)+' % de chances)')}}}

/* ---------- Rangs, blessures, compagnon, rumeurs ---------- */
const RANGS={Combattant:["Vétéran","Capitaine","Commandant"],Voyageur:["Guide confirmé","Maître-guide","Légende des routes"],Érudit:["Docte","Maître","Grand savant"],Artisan:["Compagnon","Maître artisan","Grand maître"],Commerçant:["Négociant","Grand négociant","Magnat"],Roublard:["Malin","Maître voleur","Ombre légendaire"],Soigneur:["Praticien","Grand guérisseur","Sage"],Mystique:["Initié","Adepte","Grand mystique"]};
const titreRang=()=>{const ar=(C.rep.find(x=>x[0]==='Archétype')||[])[1];return (C.rang||0)>0?(RANGS[ar]||[])[C.rang-1]||'':''};
function rangMaj(tx){const k=C.comp[0];if(!k)return;const n=niv(k),r=n>=7?3:n>=5?2:n>=3?1:0;
 if(r>(C.rang||0)){C.rang=r;tx.push('Promotion : '+titreRang());C.pvm++;C.pv++;C.or+=5*r;if(!C.fl.includes('Gradé'))C.fl.push('Gradé')}}
const BLES=[["Jambe brisée",{Agi:-1},6],["Bras blessé",{For:-1},5],["Fièvre",{End:-1,Esp:-1},4],["Côtes fêlées",{End:-1},5]];
function blessure(tx,nom){const b=nom?BLES.find(x=>x[0]===nom):BLES[rnd(BLES.length)];C.bl=C.bl||[];if(!b||C.bl.some(x=>x.n===b[0]))return;C.bl.push({n:b[0],s:b[1],t:b[2]});tx.push('Blessure durable : '+b[0]+' ('+b[2]+' actions)')}
const COMBATS=["Embuscade","Combat de rue","Vengeance de l'ennemi","Duel avec le rival","Tournoi","Épreuve d'honneur","Sortie de la forteresse"];
const REPP=["Marché florissant","Banquet","Commande importante","Mission de l'allié","Cours improvisé","Commandement"];
const REPW={plus:{"Repos à l'auberge":1.8,"Banquet":2,"Rencontre d'un allié":1.6,"Marché florissant":1.5,"Embuscade":.5,"Combat de rue":.5,"Rumeur entendue":1.4},moins:{"Embuscade":1.8,"Combat de rue":1.8,"Une trahison":1.6,"Repos à l'auberge":.5,"Banquet":.4,"Marché florissant":.6}};
const repMult=nom=>{const rp=(WORLD.rep&&WORLD.rep[C.pos])||0;return rp>=3?(REPW.plus[nom]||1):rp<=-3?(REPW.moins[nom]||1):1};
function repMaj(v,ok,tx){if(!C.pos)return;let d=0;if(ok&&REPP.includes(v))d=1;else if(ok&&v==='Cambriolage')d=-2;else if(ok&&v==='Combat de rue')d=-1;
 if(d){const r=Math.max(-5,Math.min(5,(WORLD.rep[C.pos]||0)+d));WORLD.rep[C.pos]=r;tx.push('Réputation à '+C.pos+' : '+(r>0?'+':'')+r)}}
function rumeur(tx){if(C.sq)return;const L=tous().filter(x=>x!==C.pos);if(!L.length)return;const l=L[rnd(L.length)],k=rnd(3),d=C.vie.length;
 C.sq=k===0?{txt:'Un colis à livrer à '+l,lieu:l,rec:{or:10+rnd(8)},dep:d}:k===1?{txt:'Un trésor oublié près de '+l,lieu:l,rec:{or:16+rnd(14)},dep:d}:{txt:'Un vieil ami à retrouver à '+l,lieu:l,rec:{or:6,it:'Potion de soin'},dep:d};
 tx.push('Quête secondaire : '+C.sq.txt)}
function apresAction(v,ok,perte,dt,tx){
 C.bl=C.bl||[];const nouv=C.bl.length;
 if(!ok&&perte>=3&&COMBATS.includes(v)&&Math.random()<.45)blessure(tx);
 if(!ok&&v==='Une maladie')blessure(tx,'Fièvre');
 const ancien=C.bl.slice(0,nouv);ancien.forEach(b=>{b.t--});
 if(v==="Soins d'un guérisseur"){if(C.bl.length)tx.push('Les blessures sont soignées');C.bl=[]}
 if(v==="Repos à l'auberge")C.bl.forEach(b=>b.t-=2);
 C.bl=C.bl.filter(b=>{if(b.t<=0){tx.push('Guéri : '+b.n);return false}return true});
 if(v==="Rencontre d'un allié"&&!C.cmp&&C.ally){C.cmp={n:C.ally,ty:'Allié',niv:1,ag:18+rnd(25)};tx.push('Compagnon : '+C.ally+' vous suit désormais')}
 if(C.cmp){C.cmp.ag+=dt/12;
  if(v==="Mission de l'allié"&&ok&&C.cmp.niv<4){C.cmp.niv++;tx.push('Votre compagnon progresse (niveau '+C.cmp.niv+')')}
  if((!ok&&COMBATS.includes(v)&&Math.random()<.18)||C.cmp.ag>(C.cmp.ty==='Animal'?15:80)){tx.push('Votre compagnon '+C.cmp.n+' meurt');C.cmp=null}}
 if(v==="Naissance d'un enfant"){const n=NOMS1[rnd(NOMS1.length)];C.enf=C.enf||[];C.enf.push({n,an:anCourant()});tx.push('Naissance de '+n)}
 if(v==='Rumeur entendue')rumeur(tx);
 rangMaj(tx);repMaj(v,ok,tx);
 if(ok&&(v==='Marché florissant'||v==='Négociation tendue'))WORLD.prix=Math.max(.7,+(WORLD.prix-.03).toFixed(2));
 if(ok&&v==='Cambriolage')WORLD.prix=Math.min(1.5,+(WORLD.prix+.03).toFixed(2));
 if(C.mnd&&C.mnd.n==='Guerre'&&Math.random()<.3)WORLD.prix=Math.min(1.5,+(WORLD.prix+.01).toFixed(2));
 ecrire('monde',WORLD)}

/* ---------- Lieux : fondations, tombes, reliques, quête secondaire ---------- */
const FOND={"Auberge":(tx,f)=>{C.en=Math.min(C.enm,C.en+4);C.pv=Math.min(C.pvm,C.pv+1);tx.push(f.n+' : vous y reprenez des forces (Énergie +4)')},
"Forge":(tx,f)=>{C.us={};tx.push(f.n+' : vos outils sont remis en état')},
"Camp":(tx,f)=>{C.pv=Math.min(C.pvm,C.pv+3);tx.push(f.n+' : vos plaies sont soignées (Vie +3)')},
"Chapelle":(tx,f)=>{C.bl=[];C.pv=Math.min(C.pvm,C.pv+2);tx.push(f.n+' : on prie pour vous (blessures guéries, Vie +2)')},
"Boutique":(tx,f)=>{C.inv.push('Potion de soin');tx.push(f.n+' : une potion vous est offerte')}};
const RARES=['Épée bénie','Talisman béni','Relique','Armure légère'];
function tombeEffet(tx,t){const m=t.leg?2:1,k=rnd(4),so=t.race===race()?' (un des vôtres)':'';
 const b=k===0?(C.comp.forEach(s=>s.xp+=m),'toutes vos compétences progressent'):k===1?(C.or+=6*m+rnd(6),'quelques pièces laissées en offrande'):k===2?(C.pvm+=1,C.pv+=1,'Vie max +1'):(C.inv.push('Talisman béni'),'un talisman béni');
 tx.push('Tombe de '+t.nom+so+' : '+b)}
function lieuEffets(tx){const p=C.pos;if(!p)return;C.vl=C.vl||[];const une=(id,f)=>{if(C.vl.includes(id))return;C.vl.push(id);f()};
 WORLD.fond.filter(f=>f.n===p).forEach(f=>une('f'+f.n,()=>FOND[f.ty]&&FOND[f.ty](tx,f)));
 WORLD.tombes.filter(t=>t.lieu===p).forEach((t,i)=>une('t'+t.nom+t.an,()=>{if(Math.random()<.55)tombeEffet(tx,t)}));
 WORLD.reliques.filter(r=>r.lieu===p).forEach(r=>une('r'+r.it+r.an,()=>{if(Math.random()<.6){C.inv.push(r.it);WORLD.reliques=WORLD.reliques.filter(x=>x!==r);tx.push('Relique retrouvée : '+r.it+' (laissée par '+r.par+')')}}));
 if(C.sq){if(C.sq.lieu===p&&C.vie.length>C.sq.dep){const q=C.sq;C.or+=q.rec.or||0;if(q.rec.it)C.inv.push(q.rec.it);C.sqn=(C.sqn||0)+1;C.sq=null;tx.push('Quête secondaire accomplie : '+q.txt+' (or +'+(q.rec.or||0)+(q.rec.it?', + '+q.rec.it:'')+')')}
  else if(C.vie.length-C.sq.dep>16){tx.push("La rumeur s'est éteinte : "+C.sq.txt);C.sq=null}}}

/* ---------- Fin de vie : mort dramatique, traces dans le monde, statistiques ---------- */
const FTY=["Auberge","Forge","Camp","Chapelle","Boutique"];
function fonderLieu(){const ty=FTY[rnd(5)],b=pos(C.pos),a=Math.random()*6.28,d=5+rnd(4),x=+(b[0]+Math.cos(a)*d).toFixed(1),y=+(b[1]+Math.sin(a)*d).toFixed(1),n=ty+' de '+((C.nom||'Inconnu').split(' ')[0]);
 if(WORLD.fond.some(f=>f.n===n))return;WORLD.fond.push({n,ty,x,y,par:nomS(),an:anCourant()});P[n]=[x,y];built=false;C.fondL=n}
function traceMonde(){
 const mort=C.fin==='mort',rc=race();
 if(mort){const w=[2+(C.succ.length?2:0)+C.boss+(C.rel.Peuple>=2?1:0)+(C.rang||0)*.5,3+(C.vie.length<8?2:0),.5+C.succ.length*1.5+(C.dec?1:0)+(C.rang||0)];
  let r=Math.random()*(w[0]+w[1]+w[2]),i=0;for(;i<2;i++){if(r<w[i])break;r-=w[i]}
  C.mortT=['Mort en héros','Mort oubliée','Mort en légende'][i];if(i===2&&!C.sur)C.sur='la Légende';
  if(i!==1){WORLD.tombes.push({nom:nomS(),race:rc,an:anCourant(),lieu:C.pos,leg:i===2});WORLD.tombes=WORLD.tombes.slice(-25);
   RARES.filter(x=>C.inv.includes(x)).slice(0,2).forEach(x=>WORLD.reliques.push({it:x,lieu:C.pos,par:nomS(),an:anCourant()}));WORLD.reliques=WORLD.reliques.slice(-10)}
  if(WORLD.mnd)WORLD.mnd.fin+=1}
 else if(WORLD.mnd)WORLD.mnd.fin-=2;
 majSurnom();
 if(C.fl.includes('Ennemi juré')&&C.nem&&WORLD.ennemis.length<5)WORLD.ennemis.push({n:C.nem,de:nomS(),an:anCourant()});
 if((C.fin==='victoire'&&C.or>=40||C.or>=75)&&WORLD.fond.length<10&&Math.random()<.65)fonderLieu();
 if((C.enf||[]).length){const it=C.inv.filter(x=>!['Ration','Potion de soin','Carte au trésor','Relique'].includes(x)).slice(0,2),bc=C.comp.slice().sort((a,b)=>b.xp-a.xp)[0];
  WORLD.fam={de:nomS(),enf:C.enf[0].n,it,comp:bc?{n:bc.n,tag:bc.tag}:null,or:Math.round(C.or*.3)}}
 const s=STAT,jb=(C.rep.find(x=>x[0]==='Métier')||[])[1]||'?',cause=mort?(age()>=70?'Vieillesse':((C.vie[C.vie.length-1]||{}).t||'Inconnue')):null;
 s.n++;if(!mort)s.v++;s.maxAge=Math.max(s.maxAge,age());
 const rr=s.races[rc]=s.races[rc]||{n:0,v:0};rr.n++;if(!mort)rr.v++;const jj=s.jobs[jb]=s.jobs[jb]||{n:0,v:0};jj.n++;if(!mort)jj.v++;
 if(cause)s.morts[cause]=(s.morts[cause]||0)+1;
 ecrire('monde',WORLD);ecrire('stats',STAT)}
function heritages(){C.famTx=[];
 if(WORLD.mnd&&anCourant()<WORLD.mnd.fin){C.mnd={n:WORLD.mnd.n,fin:C.t+(WORLD.mnd.fin-anCourant())*12};C.famTx.push('Le monde porte encore la marque de : '+WORLD.mnd.n.toLowerCase()+' (environ '+(WORLD.mnd.fin-anCourant())+' ans)')}else WORLD.mnd=null;
 if(WORLD.ennemis.length&&Math.random()<.55){const e=WORLD.ennemis.shift();C.nem=e.n;if(!C.fl.includes('Ennemi juré'))C.fl.push('Ennemi juré');C.famTx.push('Un ennemi hérité : '+e.n+", qui en voulait à "+e.de)}
 if(WORLD.fam){const f=WORLD.fam;if(C.famOk){(f.it||[]).forEach(x=>C.inv.push(x));if(f.comp&&!C.comp.some(s=>s.n===f.comp.n))C.comp.push({n:f.comp.n,tag:f.comp.tag,xp:2,rate:1});C.or+=f.or||0;
   C.famTx.push('Héritage de '+f.de+' : '+((f.it||[]).concat(f.comp?[f.comp.n]:[]).join(', ')||'rien de matériel')+(f.or?' et '+f.or+' or':''))}WORLD.fam=null}
 WORLD.prix=+(WORLD.prix+(1-WORLD.prix)*.4).toFixed(2);
 Object.keys(WORLD.rep).forEach(k=>{if(Math.random()<.3){WORLD.rep[k]-=Math.sign(WORLD.rep[k]);if(!WORLD.rep[k])delete WORLD.rep[k]}});
 ecrire('monde',WORLD)}
const chienCmp=()=>{if(C.inv.includes('Chien fidèle')&&!C.cmp)C.cmp={n:'Chien fidèle',ty:'Animal',niv:1,ag:1}};

/* ---------- Statistiques ---------- */
function rendreStats(){const el=$('stt');if(!el)return;const s=STAT;if(!s.n){el.innerHTML='<li>Aucune vie terminée pour l’instant.</li>';return}
 const pc=(a,b)=>Math.round(a/b*100)+' %',top=(o,n)=>Object.entries(o).sort((a,b)=>(b[1].n||b[1])-(a[1].n||a[1])).slice(0,n);
 el.innerHTML='<li><b>Vies terminées</b>'+s.n+', dont '+s.v+' victoires ('+pc(s.v,s.n)+')</li><li><b>Record de longévité</b>'+s.maxAge+' ans</li>'
  +'<li><b>Par race</b>'+top(s.races,14).map(([k,r])=>esc(k)+' : '+r.v+'/'+r.n+' ('+pc(r.v,r.n)+')').join('<br>')+'</li>'
  +'<li><b>Par métier</b>'+top(s.jobs,6).map(([k,r])=>esc(k)+' : '+r.v+'/'+r.n+' ('+pc(r.v,r.n)+')').join('<br>')+'</li>'
  +(Object.keys(s.morts).length?'<li><b>Causes de mort</b>'+top(s.morts,5).map(([k,n])=>esc(k)+' : '+n).join('<br>')+'</li>':'')
  +'<li><b>Dans le monde</b>'+WORLD.tombes.length+' tombes, '+WORLD.fond.length+' fondations, '+WORLD.reliques.length+' reliques, prix ×'+WORLD.prix.toFixed(2)+'</li>'}

/* ---------- Portrait avec équipement ---------- */
let PGN=0;
const portrait=(r,px,eq)=>{const id='pg'+(++PGN),inv=eq&&typeof C!=='undefined'?C.inv:[],cic=eq&&typeof C!=='undefined'?(C.cic||[]):[];let e='',ar=inv.includes('Armure légère');
 if(inv.some(x=>x==='Épée'||x==='Épée bénie'))e+='<path d="M9.5 10L13 1" stroke="#d8dde6" stroke-width="1.1" stroke-linecap="round"/><path d="M8.2 9.2l2.6 1.1" stroke="#8a6d1a" stroke-width="1"/>';
 else if(inv.includes('Dague'))e+='<path d="M9.5 10L11.2 5" stroke="#d8dde6" stroke-width=".9" stroke-linecap="round"/>';
 if(inv.includes('Arc'))e+='<path d="M-10 0q-4 6 0 12" fill="none" stroke="#7a5a3a" stroke-width=".9"/><path d="M-10 0V12" stroke="#ddd" stroke-width=".2"/>';
 if(inv.includes('Marteau'))e+='<path d="M10 11L11.5 2" stroke="#7a5a3a" stroke-width="1"/><rect x="9.2" y="0.8" width="4.6" height="2.2" fill="#8a8f99"/>';
 if(inv.includes('Bâton'))e+='<path d="M-10.5 12L-10 -3" stroke="#7a5a3a" stroke-width="1"/>';
 if(inv.includes('Livre'))e+='<rect x="-9.5" y="8" width="3" height="3.4" fill="#7a3b3b"/>';
 if(inv.includes('Talisman béni'))e+='<circle cx="0" cy="8.4" r=".9" fill="#7fd3ff" stroke="#fff" stroke-width=".2"/>';
 if(inv.includes('Cheval'))e+='<path d="M-12 12l1-4 2-1 1 2-1 3z" fill="#8a5a33"/>';
 if(inv.includes('Chien fidèle'))e+='<ellipse cx="-8" cy="11.2" rx="2.2" ry="1.2" fill="#a07a50"/><circle cx="-6.2" cy="10.4" r=".8" fill="#a07a50"/>';
 const sc=cic.slice(0,3).map((c,i)=>'<path d="M'+(-3+i*3)+' '+(-2.2+i*.4)+'l1.6 3.4" stroke="#b03a3a" stroke-width=".35" stroke-linecap="round" transform="translate(0 -1.5) scale(1.35)"/>').join('');
 return '<svg viewBox="-13 -12 26 25" width="'+px+'" height="'+px+'" aria-hidden="true"><defs><radialGradient id="'+id+'" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></radialGradient></defs><circle r="11.6" fill="'+(RC[r]||RC.Humain)+'" opacity=".35"/><circle r="11.6" fill="url(#'+id+')"/><path d="M-10 11.5q1-8 10-8t10 8z" fill="'+(ar?'#9aa3ad':'#5a4a6a')+'" stroke="#3b2a1a" stroke-width=".4"/><g transform="translate(0 -1.5) scale(1.35)">'+icone(r)+'</g>'+sc+e+'</svg>'};

/* ---------- Carte vivante : brouillard, marqueurs, tombes, caravanes, foules ---------- */
function couches(){const f=n=>n.toFixed(1),L=tous(),q=L.map(pos);let h='<defs><radialGradient id="fogg"><stop offset="0" stop-color="#cfd6e0" stop-opacity=".97"/><stop offset=".72" stop-color="#cfd6e0" stop-opacity=".88"/><stop offset="1" stop-color="#cfd6e0" stop-opacity="0"/></radialGradient></defs>';
 const compte={};C.vie.forEach(e=>{if(e.p){const c=compte[e.p]=compte[e.p]||[];if(c.length<14)c.push(e)}});
 Object.keys(compte).forEach(n=>{const p=pos(n);compte[n].forEach((e,i)=>{const a=i*.9+1,r=3.6+(i>6?1.2:0);h+='<circle cx="'+f(p[0]+Math.cos(a)*r)+'" cy="'+f(p[1]+Math.sin(a)*r)+'" r=".45" fill="'+(e.ok===false?'#d9534f':'#6bbf59')+'" stroke="#fff" stroke-width=".12"><title>'+esc(e.t)+'</title></circle>'})});
 WORLD.tombes.forEach((t,i)=>{const p=pos(t.lieu);h+='<g transform="translate('+f(p[0]-4.2-(i%3)*1.4)+' '+f(p[1]+3)+')"><path d="M-.5 -2h1v1.2h1v1h-1v2.4h-1v-2.4h-1v-1h1z" fill="'+(t.leg?'#f0d77a':'#d4d4d4')+'" stroke="#555" stroke-width=".12"/><title>'+esc(t.nom)+'</title></g>'});
 if(REG.anim){[0,5,9].forEach((i,k)=>{if(L.length<3)return;const c=q[i%L.length],d=q[(i+1)%L.length];if(!c||!d)return;const mx=(c[0]+d[0])/2+(i%2?6:-6),my=(c[1]+d[1])/2+5;
   h+='<g><circle r=".6" fill="#8b5e34"/><rect x="-.9" y="-.4" width="1.8" height=".8" fill="#c9a36a" stroke="#4a3320" stroke-width=".1"/><animateMotion dur="'+(20+k*7)+'s" repeatCount="indefinite" path="M'+c[0]+' '+c[1]+'Q'+f(mx)+' '+f(my)+' '+d[0]+' '+d[1]+'"/></g>'});
  L.forEach((n,i)=>{if(!VILLES.includes(n)||!(C.vis.includes(n)||C.pos===n))return;for(let k=0;k<3;k++)h+='<g transform="translate('+f(q[i][0])+' '+f(q[i][1])+')"><circle r=".28" fill="#2b2b2b"><animateMotion dur="'+(5+k*2.3)+'s" repeatCount="indefinite" path="M-2.4 '+(k-1)+'a2.4 1.4 0 1 0 4.8 0a2.4 1.4 0 1 0 -4.8 0"/></circle></g>'})}
 L.forEach((n,i)=>{if(C.vis.includes(n)||C.pos===n||WORLD.sites.some(s=>s.n===n)||WORLD.fond.some(z=>z.n===n))return;h+='<g class="fog"><circle cx="'+f(q[i][0])+'" cy="'+f(q[i][1])+'" r="8" fill="url(#fogg)"/><text x="'+f(q[i][0])+'" y="'+f(q[i][1]+1)+'" text-anchor="middle" font-size="3.2" fill="#6a7384" style="stroke:none">?</text></g>'});
 return h}

/* ---------- Partage ---------- */
function partagerTexte(){const t=nomS()+'\n\n'+(typeof recit==='function'?recit():bio());if(navigator.share){navigator.share({title:nomS(),text:t}).catch(()=>{})}else{try{navigator.clipboard.writeText(t);alert('Récit copié.')}catch(e){alert(t)}}}
function partagerImage(){const W=1080,H=1500,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
 g.fillStyle='#12151c';g.fillRect(0,0,W,H);g.textAlign='center';g.fillStyle='#e8c872';g.font='bold 58px sans-serif';g.fillText(nomS(),W/2,110);
 const jb=(C.rep.find(x=>x[0]==='Métier')||[])[1]||'';g.fillStyle='#aab3c2';g.font='34px sans-serif';g.fillText(race()+' '+jb+(titreRang()?' · '+titreRang():''),W/2,165);
 const svg=portrait(race(),400,true).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" '),im=new Image();
 im.onload=()=>{g.drawImage(im,W/2-210,200,420,420);g.fillStyle='#e6e9ef';g.font='32px sans-serif';g.textAlign='left';
  const mots=bio().split(' ');let l='',y=690;mots.forEach(m=>{const t=l?l+' '+m:m;if(g.measureText(t).width>W-140){g.fillText(l,70,y);y+=46;l=m}else l=t});if(l)g.fillText(l,70,y);
  g.fillStyle='#667';g.font='26px sans-serif';g.textAlign='center';g.fillText('Roulette JDR',W/2,H-50);
  c.toBlob(b=>{const f=new File([b],'personnage.png',{type:'image/png'});if(navigator.canShare&&navigator.canShare({files:[f]}))navigator.share({files:[f],title:nomS()}).catch(()=>{});else{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='personnage.png';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000)}})};
 im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)}

/* ---------- Réglages et lecture automatique ---------- */
function appliquerReg(){const z=REG.fs;document.querySelectorAll('main,.carte').forEach(e=>{e.style.zoom=z});document.body.classList.toggle('calme',!REG.anim);
 const j=$('jt');if(j)j.textContent=REG.j?'Fermer':'Ouvrir';const a=$('au');if(a)a.textContent='Lecture auto : '+(REG.auto?'oui':'non')}
function sauverReg(){ecrire('reg',REG);appliquerReg();if(typeof ui==='function'&&typeof C!=='undefined')ui()}
function initReg(){const s=(id,k)=>{const e=$(id);if(!e)return;e.value=String(REG[k]);e.onchange=()=>{REG[k]=+e.value;sauverReg()}};s('rg-fs','fs');s('rg-vit','vit');s('rg-anim','anim');
 if($('jt'))$('jt').onclick=()=>{REG.j=REG.j?0:1;sauverReg()};if($('au'))$('au').onclick=()=>{REG.auto=REG.auto?0:1;sauverReg()};
 if($('pt'))$('pt').onclick=partagerTexte;if($('pi'))$('pi').onclick=partagerImage;appliquerReg()}
let autoDepuis=0;
setInterval(()=>{if(!REG.auto||typeof C==='undefined')return;const md=!$('md').hidden,pl=!$('plein').hidden,n=Date.now();
 if(md){autoDepuis=autoDepuis||n;if(n-autoDepuis>3200){autoDepuis=0;$('mok').click()}return}
 if(pl){autoDepuis=autoDepuis||n;if(n-autoDepuis>3000&&!occ&&!PLACE){autoDepuis=0;$('mf').click()}return}
 autoDepuis=0;if(!occ&&!C.fin&&cur.length&&!$('go').disabled)$('go').click()},900);
initReg();
