/* v9.js : filtres du panthéon, histoire du monde, objectif détaillé, partie rapide */
const PF={f:'',r:''};
const panOK=x=>(!PF.f||x.fin===PF.f)&&(!PF.r||x.race===PF.r);
function majPanF(){const s=$('pf-r');if(!s)return;const rs=[...new Set(PAN.map(x=>x.race))].sort();if(s.options.length-1!==rs.length){s.innerHTML='<option value="">Toutes races</option>'+rs.map(r=>'<option>'+esc(r)+'</option>').join('');s.value=PF.r}}
if($('pf-f'))$('pf-f').onchange=e=>{PF.f=e.target.value;ui()};
if($('pf-r'))$('pf-r').onchange=e=>{PF.r=e.target.value;ui()};
function hist(){const h=$('hm');if(!h)return;const E=[];
 Object.keys(WORLD.succ).forEach(k=>E.push([WORLD.succ[k].an,'Succès « '+k+' » : premier, '+WORLD.succ[k].par]));
 WORLD.sites.forEach(s=>E.push([s.an,s.ty+' découvert : '+s.n+' ('+s.par+')']));
 WORLD.fond.forEach(f=>E.push([f.an,'Fondation : '+f.n+' ('+f.par+')']));
 WORLD.tombes.forEach(t=>E.push([t.an,(t.leg?'Mort en légende : ':'Tombe de ')+t.nom+', '+String(t.race||'').toLowerCase()+(t.lieu?', à '+t.lieu:'')]));
 WORLD.reliques.forEach(r=>E.push([r.an,'Relique laissée : '+r.it+' ('+r.par+(r.lieu?', '+r.lieu:'')+')']));
 (WORLD.ennemis||[]).forEach(e=>E.push([e.an,'Rancune : '+e.n+' en veut à '+e.de]));
 E.sort((a,b)=>b[0]-a[0]);
 h.innerHTML=(WORLD.mnd?'<li><b>En cours</b> '+esc(WORLD.mnd.n)+' (jusqu’en '+WORLD.mnd.fin+')</li>':'')+E.slice(0,40).map(e=>'<li><b>An '+e[0]+'</b> '+esc(e[1])+'</li>').join('')||'<li>Le monde n’a encore rien vécu.</li>'}
function detailObjectif(){const q=etq();if(!C.obj)return;
 modal('Objectif',C.obj,q.length?'':'Aucune étape.',q.map((e,i)=>(i<C.qs?'✓ Fait : ':i===C.qs?'▶ En cours : ':'• À venir : ')+e[0]+(i===C.qs?' — '+afaire(e):'')),null)}
$('fi').addEventListener('click',e=>{if(e.target.closest&&e.target.closest('[data-ob]')&&!e.target.closest('.sk'))detailObjectif()});
function rapide(n){if(occ||C.fin||!C.pvm||C.rep.length<etapes().length)return;snapUndo();const L=[];
 for(let i=0;i<n&&!C.fin;i++){agir(tirer(poids(tv())),'');L.push(C.vie[C.vie.length-1].txt)}
 ui();modal('Partie rapide',L.length+' tirages',C.fin?(C.fin==='mort'?nomS()+' est mort.':'Objectif accompli !'):'',L,null)}
if($('rp'))$('rp').onclick=()=>rapide(5);
