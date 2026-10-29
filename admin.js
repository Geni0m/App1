/* admin.js : récit, sauvegardes, atelier d'édition (événements, tables, lieux, carte personnelle), mode hors ligne */
const TAGS=['combat','voyage','social','commerce','survie','hospitalité','soin','savoir','ruse','artisanat','mystique'];
const lo=s=>s?s.charAt(0).toLowerCase()+s.slice(1):'';

/* ----- Récit rédigé à partir de la vie du personnage ----- */
function recit(){
 const g=k=>(C.rep.find(r=>r[0]===k)||[])[1]||'',nom=C.nom||'Le personnage';
 if(!C.rep.length)return 'Aucune histoire à raconter pour l\u2019instant.';
 const sa={printemps:'au printemps',été:'en été',automne:'en automne',hiver:'en hiver'};
 const t=[nom+', '+lo(g('Race'))+' '+lo(g('Métier'))+'.',
  [HIST[g('Origine')],HIST[g('Race')],HIST[g('Archétype')],HIST[g('Métier')]].filter(Boolean).join(' '),
  (g('Trait de caractère')?nom+' est '+lo(g('Trait de caractère'))+(g('Défaut')?', mais '+lo(g('Défaut')):'')+'.':'')+(g('Décor')?' Son histoire commence ici : '+g('Décor')+'.':''),
  C.lig?nom+' porte l\u2019héritage de la '+C.lig.nom+'.':''];
 C.vie.filter(e=>e.t!=='Objet').forEach(e=>{
  const m=e.txt.match(/^([^,]+), (\d+) ans : (.*)$/);if(!m)return;const r=m[3],o=[];
  const vg=r.match(/: (.+?) vers (.+?)(?: \(| \[|$)/);if(vg)o.push(nom+' prend la route : '+vg[1]+' vers '+vg[2]+'.');
  if(r.includes(': réussi'))o.push(nom+' s\u2019en tire à son avantage.');else if(r.includes(': raté'))o.push('Cela tourne mal.');
  let x=r.match(/Vie (-\d+)/);if(x)o.push(nom+' y laisse '+(-x[1])+' points de vie.');
  x=r.match(/Or \+(\d+)/);if(x)o.push('La bourse gagne '+x[1]+' pièces d\u2019or.');
  x=r.match(/Succès : ([^(]+)\(/);if(x)o.push('Cet exploit lui vaut un titre : « '+x[1].trim()+' ».');
  x=r.match(/Nouvelle compétence : ([^,\]]+)/);if(x)o.push('Une nouvelle corde à son arc : '+x[1]+'.');
  x=r.match(/Découverte : ([^(]+)\(/);if(x)o.push(nom+' découvre : '+x[1].trim()+'.');
  x=r.match(/Le monde change : ([^ (]+)/);if(x)o.push('Le monde bascule : '+x[1].toLowerCase()+'.');
  t.push('À '+m[2]+' ans, '+(sa[m[1].toLowerCase()]||'')+'. '+(HIST[e.t]||e.t+'.')+' '+o.join(' '))});
 const d=C.vie[C.vie.length-1];
 t.push(C.fin==='mort'?nom+' meurt à '+age()+' ans.'+(d?' Sa dernière épreuve : '+lo(d.t)+'.':''):C.fin==='victoire'?'Objectif accompli : « '+C.obj+' ». '+nom+' peut regarder sa vie avec fierté.':'L\u2019histoire '+(/^[AEIOUYÉÈH]/i.test(nom)?'d\u2019':'de ')+nom+' n\u2019est pas terminée.');
 if(C.fonde)t.push('De '+nom+' naît une lignée : la '+C.fonde+'.');
 return t.filter(Boolean).join('\n\n')}
$('rec').onclick=()=>{modal('Récit',C.nom||'Votre personnage','',[],null);$('mtx').textContent=recit();$('mtx').className='long'};

/* ----- Sauvegardes ----- */
const cles=()=>Object.keys(localStorage).filter(k=>k.startsWith(K));
const exporter=()=>{const d={v:5,date:new Date().toISOString(),data:{}};cles().forEach(k=>{d.data[k]=localStorage.getItem(k)});return JSON.stringify(d)};
function importer(txt){try{const d=JSON.parse(txt);if(!d.data)throw 0;if(!confirm('Remplacer toutes les données de ce téléphone par cette sauvegarde ?'))return;
 cles().forEach(k=>localStorage.removeItem(k));Object.keys(d.data).forEach(k=>{if(k.startsWith(K))localStorage.setItem(k,d.data[k])});location.reload()}catch(e){alert('Sauvegarde illisible.')}}
function telecharger(){const b=new Blob([exporter()],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='roulette-jdr-sauvegarde.json';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000)}

/* ----- Carte personnelle (image stockée dans IndexedDB) ----- */
const idb=(m,k,v)=>new Promise(r=>{try{const q=indexedDB.open('jdr',1);q.onupgradeneeded=()=>q.result.createObjectStore('s');
 q.onsuccess=()=>{const s=q.result.transaction('s',m==='get'?'readonly':'readwrite').objectStore('s'),x=m==='get'?s.get(k):m==='set'?s.put(v,k):s.delete(k);x.onsuccess=()=>r(x.result);x.onerror=()=>r(null)};q.onerror=()=>r(null)}catch(e){r(null)}});
function chargerCarte(){idb('get','carte').then(b=>{if(CARTE_URL)URL.revokeObjectURL(CARTE_URL);CARTE_URL=b?URL.createObjectURL(b):'';built=false})}
function importerImage(f){if(!f)return;if(f.type==='image/svg+xml'){idb('set','carte',f).then(chargerCarte);return}
 const im=new Image();im.onload=()=>{const k=Math.min(1,2400/im.width),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);c.toBlob(b=>idb('set','carte',b).then(chargerCarte),'image/jpeg',.88)};im.src=URL.createObjectURL(f)}
function sauver(){ecrire('perso',PERSO);appliquerPerso();T=construireT();built=false;menu();lieuxMenu();ui()}
function placer(n){PLACE={n};monde();$('plein').hidden=false;$('mf').textContent='Annuler';$('mt').textContent='Touchez la carte pour placer : '+n;dyn(lieux()[0]);vue(100,60,205*innerHeight/innerWidth)}
function lieuxMenu(){const s=$('c-l');if(s)s.innerHTML=tous().map(n=>'<option>'+esc(n)+'</option>').join('')}

/* ----- Atelier ----- */
function atelier(){
 const a=$('adm'),ed=document.querySelector('main > details');if(ed)a.appendChild(ed);
 const sec=(t,h)=>{const d=document.createElement('details');d.innerHTML='<summary>'+t+'</summary>'+h;a.appendChild(d)};
 const sel=(id,l)=>'<select id="'+id+'">'+l.map(x=>'<option>'+x+'</option>').join('')+'</select>';
 sec('Nouvel événement','<input id="e-n" placeholder="Nom"><textarea id="e-t" placeholder="Histoire (une ou deux phrases)" style="min-height:70px"></textarea><div class="l"><input id="e-w" type="number" value="2" step="0.5" aria-label="Poids">'+sel('e-g',TAGS)+'</div><input id="e-m" placeholder="Réponse=multiplicateur; …"><input id="e-r" placeholder="Requis (état, lieu, objet…)"><div class="l"><input id="e-pv" type="number" placeholder="Vie ±"><input id="e-en" type="number" placeholder="Énergie ±"><input id="e-or" type="number" placeholder="Or ±"></div><div class="l">'+sel('e-s',['Aucun jet'].concat(Object.values(S)))+'<input id="e-d" type="number" value="10" aria-label="Difficulté du jet"></div><input id="e-i" placeholder="Objet gagné (facultatif)"><button class="go" id="e-ok">Ajouter l\u2019événement</button>');
 sec('Nouvelle table de création','<input id="t-n" placeholder="Nom (par exemple Passion)"><button class="go" id="t-ok">Créer la table</button><p style="color:var(--m);font-size:14px">Elle s\u2019insère avant « Objectif ». Modifiez ensuite ses options dans « Modifier les tables ».</p>');
 sec('Ma carte et mes lieux','<p style="color:var(--m);font-size:14px">Importez votre propre carte (PNG, JPG, WebP ou SVG). Elle remplace le décor dessiné ; les lieux, les voyages et les animations restent par-dessus.</p><input id="c-f" type="file" accept="image/*"><div class="l"><button id="c-x">Retirer l\u2019image</button></div><h2>Placer un lieu</h2><select id="c-l"></select><button class="go" id="c-p">Placer sur la carte</button><h2>Nouveau lieu</h2><input id="c-n" placeholder="Nom du lieu"><button class="go" id="c-a">Ajouter puis placer</button>');
 sec('Sauvegarde','<div class="l"><button id="s-d">Télécharger</button><button id="s-c">Copier</button></div><input id="s-f" type="file" accept=".json,application/json"><textarea id="s-t" placeholder="Ou collez ici une sauvegarde" style="min-height:70px"></textarea><button id="s-i">Importer le texte collé</button>');
 $('e-ok').onclick=()=>{const n=$('e-n').value.trim();if(!n)return alert('Donnez un nom.');const m={};
  ($('e-m').value||'').split(';').forEach(s=>{const k=s.lastIndexOf('=');if(k>0){const v=parseFloat(s.slice(k+1).replace(',','.'));if(!isNaN(v))m[s.slice(0,k).trim()]=v}});
  const o=[n,parseFloat($('e-w').value)||1,m];if($('e-r').value.trim())o.push($('e-r').value.trim());
  const ef={},pv=+$('e-pv').value,en=+$('e-en').value,or=+$('e-or').value;if(pv)ef.PV=pv;if(en)ef.EN=en;if(or)ef.or=or;
  const si=Object.values(S).indexOf($('e-s').value);if(si>=0)ef.jet=[Object.keys(S)[si],+$('e-d').value||10];if($('e-i').value.trim())ef.it=$('e-i').value.trim();
  PERSO.ev=PERSO.ev.filter(x=>x[0]!==n);PERSO.ev.push(o);PERSO.efx[n]=ef;PERSO.hist[n]=$('e-t').value.trim();PERSO.etag[n]=$('e-g').value;sauver();alert('Événement ajouté.')};
 $('t-ok').onclick=()=>{const n=$('t-n').value.trim();if(!n||T.some(t=>t.n===n))return alert('Nom vide ou déjà utilisé.');PERSO.extra.push({n,o:[['Option 1',1],['Option 2',1]]});sauver();alert('Table créée.')};
 $('c-f').onchange=e=>importerImage(e.target.files[0]);$('c-x').onclick=()=>idb('del','carte').then(chargerCarte);
 $('c-p').onclick=()=>placer($('c-l').value);
 $('c-a').onclick=()=>{const n=$('c-n').value.trim();if(!n||tous().includes(n))return alert('Nom vide ou déjà utilisé.');PERSO.lieux.push({n,x:100,y:60,poids:1});sauver();placer(n)};
 $('s-d').onclick=telecharger;$('s-c').onclick=()=>{try{navigator.clipboard.writeText(exporter());$('s-c').textContent='Copié'}catch(e){}setTimeout(()=>$('s-c').textContent='Copier',1500)};
 $('s-f').onchange=e=>{const f=e.target.files[0];if(f)f.text().then(importer)};$('s-i').onclick=()=>importer($('s-t').value);
 lieuxMenu()}
atelier();chargerCarte();
/* L'atelier se révèle avec l'adresse #admin ou 5 touchers rapides sur le titre */
if(location.hash==='#admin')$('adm').hidden=false;
let tp=0,tt=0;document.querySelector('h1').onclick=()=>{const n=Date.now();tp=n-tt<700?tp+1:1;tt=n;if(tp>=5){$('adm').hidden=!$('adm').hidden;tp=0}};
/* ----- Hors ligne ----- */
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
