/* carte.js : icônes de race, carte plein écran (monde, pays, ville), voyages et scènes animées */
const NS='http://www.w3.org/2000/svg';
const RC={Humain:'#e0b48a',Elfe:'#ecd6bd',Nain:'#d9a273',Orc:'#7fa650',Halfelin:'#e8c19a',Gnome:'#e6b89a',Démon:'#c0504d',Drakéen:'#5fa68a',Félin:'#d9a35c',Sylvain:'#8aa05a'};
function icone(r){
 const c=RC[r]||RC.Humain,yeux='<circle cx="-2.2" cy="-.4" r=".75" fill="#222"/><circle cx="2.2" cy="-.4" r=".75" fill="#222"/>';
 let ar='',av='';
 if(r==='Elfe'){ar='<path d="M-5.5 0l-5-4 1 6zM5.5 0l5-4-1 6z" fill="'+c+'" stroke="#3b2a1a" stroke-width=".4"/>';av='<path d="M-6 -2a6 6 0 0 1 12 0q-6-3-12 0z" fill="#d9dde6"/>'}
 else if(r==='Nain'){ar='<path d="M-6 1q6 13 12 0z" fill="#9a4b1f"/>';av='<path d="M-6.6 -1a6.6 6.6 0 0 1 13.2 0z" fill="#8a8f99"/>'}
 else if(r==='Orc'){av='<path d="M-3.4 3.6l1-3 1 3zM2.4 3.6l1-3 1 3z" fill="#fff"/><path d="M-4 -2.4l3 1M4 -2.4l-3 1" stroke="#222" stroke-width=".6"/>'}
 else if(r==='Halfelin'){av='<circle cx="-3.5" cy="-5" r="2.4" fill="#6b4a2b"/><circle cx="0" cy="-6" r="2.6" fill="#6b4a2b"/><circle cx="3.5" cy="-5" r="2.4" fill="#6b4a2b"/>'}
 else if(r==='Gnome'){av='<path d="M-6 -3.5L0 -13 6 -3.5z" fill="#c0504d"/><circle cx="0" cy="1.6" r="1.5" fill="#d9967a"/>'}
 else if(r==='Démon'){ar='<path d="M-4.5 -4l-2-5 4 2zM4.5 -4l2-5-4 2z" fill="#3a1a1a"/>';av='<path d="M-6 -1a6 6 0 0 1 12 0q-6-3-12 0z" fill="#2b1b1b"/>'}
 else if(r==='Drakéen'){ar='<path d="M-1.6 -6l1.6-4 1.6 4zM-4.2 -5l.8-3 1.7 3zM1.6 -5l1.7-3 .8 3z" fill="#2e7d65"/>';av='<path d="M-3 3.6q3 1.4 6 0" stroke="#1d4d3d" fill="none" stroke-width=".6"/>'}
 else if(r==='Félin'){ar='<path d="M-5.5 -3l-1-6 4 3zM5.5 -3l1-6-4 3z" fill="'+c+'" stroke="#3b2a1a" stroke-width=".4"/>';av='<path d="M-6 1.6h-4M-6 3h-4M6 1.6h4M6 3h4" stroke="#222" stroke-width=".3"/><path d="M-1 2l1 1 1-1z" fill="#c55"/>'}
 else if(r==='Sylvain'){av='<path d="M-4 -5q1-4 4-4 3 0 4 4-4-2-8 0z" fill="#4f8a3e"/><path d="M-2 -6q2-3 5-1" stroke="#2f5a26" fill="none" stroke-width=".5"/>'}
 else av='<path d="M-6.2 -1a6.2 6.2 0 0 1 12.4 0q-6.2-3.5-12.4 0z" fill="#6b4a2b"/>';
 return ar+'<circle r="6" fill="'+c+'" stroke="#3b2a1a" stroke-width=".5"/>'+yeux+av}
const iconeSVG=(r,px)=>'<svg viewBox="-11 -11 22 22" width="'+px+'" height="'+px+'" aria-hidden="true">'+icone(r)+'</svg>';
const race=()=>(C.rep.find(r=>r[0]==='Race')||[])[1]||'Humain';
const pos=n=>P[n]||(()=>{let h=0;for(const c of n)h=(h*31+c.charCodeAt(0))>>>0;return[28+h%150,16+(h>>8)%88]})();
const pays=q=>q[1]<41?'Royaume du Nord':q[1]>80?'Marches du Sud':'Terres du Centre';
const mp=$('mp');let V={cx:100,cy:60,h:120},TP=[0,0],built=false,CARTE_URL='',PLACE=null;
const R=(()=>{let s=7;return()=>(s=s*16807%2147483647)/2147483647})();
function vue(cx,cy,h){V={cx,cy,h};const w=h*innerWidth/innerHeight;mp.setAttribute('viewBox',(cx-w/2)+' '+(cy-h/2)+' '+w+' '+h);
 mp.style.setProperty('--k',h*.018);mp.style.setProperty('--sc',h/100);['plu','nei'].forEach(i=>{const e=$(i);if(e)e.setAttribute('patternTransform','scale('+h/100+')')});mp.dataset.z=w>150?'m':w>45?'p':'v';tok(TP[0],TP[1])}
function tok(x,y){TP=[x,y];const k=$('tk');if(k)k.setAttribute('transform','translate('+x+' '+y+') scale('+V.h/100+')')}
function tw(ms,f,fin){const t0=performance.now(),g=n=>{let u=Math.min(1,(n-t0)/ms);u=u*u*(3-2*u);f(u);u<1?requestAnimationFrame(g):fin&&fin()};requestAnimationFrame(g)}
function cam(cx,cy,h,ms,fin){const a=V;tw(ms,u=>vue(a.cx+(cx-a.cx)*u,a.cy+(cy-a.cy)*u,a.h+(h-a.h)*u),fin)}
/* Un bâtiment ou un repère propre à chaque lieu (visible aux zooms Pays et Ville) */
function ville(n,x,y){const f=v=>v.toFixed(1),r=(a,b,w,h,c)=>'<rect class="mai" x="'+f(x+a)+'" y="'+f(y+b)+'" width="'+w+'" height="'+h+'" fill="'+(c||'var(--rel)')+'" stroke="var(--e)" stroke-width=".12"/>';
 const S0=WORLD.sites.find(z=>z.n===n);if(S0){const t=S0.ty;if(t==='Grotte')return '<ellipse class="mai" cx="'+x+'" cy="'+y+'" rx="3" ry="2" fill="#4a4a4a"/>';if(t.startsWith('Temple'))return r(-3,-2,.9,3.5,'#9fb7c4')+r(0,-3,.9,4.5,'#9fb7c4')+r(3,-1,.9,2.5,'#9fb7c4');if(t.startsWith('Tour'))return r(-1,-6,2,7,'#a89d8f');if(t.startsWith('Mine'))return r(-3,-1,6,3,'#6b5a3a');if(t.startsWith('Cimetière'))return r(-3,-1,.6,2.5,'#bbb')+r(0,-2,.6,3.5,'#bbb')+r(3,-1,.6,2.5,'#bbb');return r(-4,-3,8,6,'#a89d8f')}
 if(n==='Capitale en révolte')return r(-4,-3.5,8,5,'#b9aea0')+r(-5.2,-6,2,4.5,'#a89d8f')+r(3.2,-6,2,4.5,'#a89d8f')+r(-1,-7,2,5,'#a89d8f')+'<path class="mai" d="M0 -7v-2.6l2.2.7-2.2.7" fill="#b02a2a"/>';
 if(n==='Cité portuaire')return r(-14,3,11,1.3,'#7a5a3a')+r(-12,4.3,.5,2,'#7a5a3a')+r(-7,4.3,.5,2,'#7a5a3a')+r(6,-5,1.6,6,'#eee')+'<path class="mai" d="M5.6 -5h2.4l-1.2-2z" fill="#b02a2a"/>';
 if(n==='Forteresse assiégée')return '<path class="mai" d="M'+f(x-5)+' '+f(y-4)+'h10v8h-10z" fill="none" stroke="var(--e)" stroke-width=".5"/>'+r(-6,-5,2.4,3,'#a89d8f')+r(3.6,-5,2.4,3,'#a89d8f')+r(-6,3,2.4,3,'#a89d8f')+r(3.6,3,2.4,3,'#a89d8f')+'<path class="mai" d="M0 -4v-3l2.2.8-2.2.8" fill="#b02a2a"/>';
 if(n==='Désert aux ruines')return r(-4,-2,.9,3.5,'#cdbf9a')+r(-1,-3,.9,4.5,'#cdbf9a')+r(2,-1,.9,2.5,'#cdbf9a')+r(-5,1.5,10,.7,'#cdbf9a');
 if(n==='Forêt interdite')return '<circle class="mai" cx="'+f(x)+'" cy="'+f(y)+'" r="4" fill="none" stroke="var(--rel)" stroke-width=".5" stroke-dasharray=".8 1"/>'+r(-.5,-2.5,1,2.4,'#8c8f96');
 let h='';for(let k=0;k<8;k++)h+=r((R()-.5)*9-.7,(R()-.5)*7,1.5,1.1)+(k<3?'<circle class="fu" style="animation-delay:-'+(R()*4).toFixed(1)+'s" cx="'+f(x+(R()-.5)*8)+'" cy="'+f(y+(R()-.5)*6)+'" r=".45"/>':'');return h}
function monde(){
 if(built)return;built=true;const L=tous(),q=L.map(pos),f=n=>n.toFixed(1);
 let h='<defs><pattern id="plu" width="5" height="6" patternUnits="userSpaceOnUse"><path d="M2 0l-.8 3" stroke="#6d8fb5" stroke-width=".25"/></pattern><pattern id="nei" width="6" height="8" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".35" fill="#fff"/><circle cx="5" cy="6" r=".3" fill="#fff"/></pattern></defs>'
 +'<path class="vg" d="M4 14q3-2 6 0t6 0M2 40q3-2 6 0t6 0M3 66q3-2 6 0t6 0M4 92q3-2 6 0t6 0"/><path d="M20 10L70 4L130 8L186 14L196 50L190 100L150 114L90 110L40 106L18 80L24 40Z" fill="var(--terre)" stroke="var(--rel)" stroke-width=".6"/>'
 +'<path d="M24 41H194M20 80H192" stroke="var(--rel)" stroke-width=".4" stroke-dasharray="2 1.5" fill="none"/>'
 +'<path d="M150 34C130 50 110 46 96 62S60 80 40 84" fill="none" stroke="var(--mer)" stroke-width="1.6"/>'
 +'<ellipse cx="160" cy="92" rx="22" ry="12" fill="#d9c58f" opacity=".55"/><ellipse cx="128" cy="76" rx="6" ry="3" fill="var(--mer)"/><ellipse cx="76" cy="52" rx="4" ry="2.4" fill="var(--mer)"/>'
 +'<path d="M140 30l6-12 6 12zM150 30l7-15 7 15zM162 30l5-10 5 10z" fill="var(--rel)"/>'
 +'<text class="pa" x="105" y="22">Royaume du Nord</text><text class="pa" x="105" y="74">Terres du Centre</text><text class="pa" x="105" y="104">Marches du Sud</text>';
 q.forEach((c,i)=>{const d=q[(i+1)%q.length];h+='<path d="M'+c[0]+' '+c[1]+'Q'+f((c[0]+d[0])/2+(i%2?6:-6))+' '+f((c[1]+d[1])/2+5)+' '+d[0]+' '+d[1]+'" fill="none" stroke="var(--rel)" stroke-width=".7" opacity=".8"/>'});
 const pr=(x,y,r)=>q.some(c=>Math.hypot(c[0]-x,c[1]-y)<r);
 const arbre=(x,y)=>'<g class="t" style="animation-delay:-'+f(R()*3)+'s" transform="translate('+f(x)+' '+f(y)+')"><rect x="-.3" y="-.7" width=".6" height="1.4" fill="var(--tro)"/><circle cy="-1.7" r="1.4" fill="var(--arb)"/></g>';
 for(let i=0;i<170;i++){const x=28+R()*160,y=14+R()*92;if(!pr(x,y,7)&&Math.hypot(x-160,y-92)>20&&!(y<34&&x>138&&x<170)&&Math.hypot(x-128,y-76)>7)h+=arbre(x,y)}
 for(let i=0;i<60;i++)h+=arbre(60+(R()-.5)*30,24+(R()-.5)*18);
 for(let i=0;i<90;i++){const x=26+R()*164,y=12+R()*96;if(!pr(x,y,5))h+='<circle cx="'+f(x)+'" cy="'+f(y)+'" r=".28" fill="'+['#d96a6a','#e6c84a','#b78ad6'][i%3]+'"/>'}
 for(let i=0;i<18;i++){const x=30+R()*156,y=16+R()*88;if(!pr(x,y,5))h+='<path d="M'+f(x)+' '+f(y)+'l1-1.3 1.2.2.6 1.1z" fill="var(--rel)"/>'}
 if(CARTE_URL)h+='<image href="'+CARTE_URL+'" x="0" y="0" width="200" height="120" preserveAspectRatio="xMidYMid slice"/>';
 q.forEach((c,i)=>{h+=ville(L[i],c[0],c[1])+'<circle cx="'+c[0]+'" cy="'+c[1]+'" r="1.2" fill="var(--a)" stroke="var(--e)" stroke-width=".25"/><text x="'+c[0]+'" y="'+(c[1]+7)+'">'+esc(L[i])+'</text>'});
 for(let i=0;i<5;i++){const x=40+R()*130,y=20+R()*80;h+='<g class="an" style="animation-duration:'+f(6+R()*6)+'s;animation-delay:-'+f(R()*6)+'s"><ellipse cx="'+f(x)+'" cy="'+f(y)+'" rx=".9" ry=".5" fill="var(--tro)"/><circle cx="'+f(x+.9)+'" cy="'+f(y-.4)+'" r=".35" fill="var(--tro)"/></g>'}
 h+='<g class="nu"><ellipse cx="-30" cy="30" rx="14" ry="3" fill="#fff" opacity=".35"/></g><g class="nu nu2"><ellipse cx="-20" cy="84" rx="12" ry="2.6" fill="#fff" opacity=".3"/></g>'
 +'<g class="bt"><path d="M8 66h5l-1 2h-3zM10 66v-4l2 3" fill="var(--tro)" stroke="var(--e)" stroke-width=".15"/></g><g class="bt b2"><path d="M6 96h5l-1 2h-3zM8 96v-4l2 3" fill="var(--tro)" stroke="var(--e)" stroke-width=".15"/></g>'
 +'<g class="oi"><path d="M0 20q1.2-1.5 2.4 0q1.2-1.5 2.4 0" fill="none" stroke="var(--e)" stroke-width=".3"/></g><g class="oi o2"><path d="M0 60q1.2-1.5 2.4 0q1.2-1.5 2.4 0" fill="none" stroke="var(--e)" stroke-width=".3"/></g>'
 +'<rect id="nuit" x="-300" y="-300" width="800" height="700" fill="#0b1b3a"/>'
 +'<rect class="pl" x="-300" y="-300" width="800" height="700"/><rect class="ne" x="-300" y="-300" width="800" height="700"/><rect class="br" x="-300" y="-300" width="800" height="700"/><g id="dyn"></g>';
 mp.innerHTML=h}
function dyn(from){let h='';C.trail.forEach(s=>{const a=pos(s[0]),b=pos(s[1]);h+='<line x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'" stroke="var(--a)" stroke-width=".5" stroke-dasharray="1.6 1.2"/>'});
 h+='<g id="pas"></g><g id="tk"><circle r="2.9" fill="var(--a)" stroke="var(--s)" stroke-width=".6"/><g transform="scale(.27)">'+icone(race())+'</g></g>';
 $('dyn').innerHTML=h;TP=pos(from||C.pos);mp.dataset.s=SAI[C.t%12];mp.dataset.w=C.meteo}
function ouvrirCarte(){if(!C.pos)return;monde();$('plein').hidden=false;$('mf').textContent='Fermer';dyn();const q=pos(C.pos);
 $('mt').textContent=(C.nom?C.nom+' : ':'')+C.pos+', '+pays(q)+' ('+cap(SAI[C.t%12])+')';vue(q[0],q[1],80*innerHeight/innerWidth)}
function voyage(ev,de,d){monde();const A=pos(de),B=pos(d),dist=Math.hypot(B[0]-A[0],B[1]-A[1]),h=Math.min(170,Math.max(60,dist*1.4+30))*innerHeight/innerWidth;
 $('plein').hidden=false;$('mf').textContent='Fermer';$('mt').textContent=ev+' : '+de+' vers '+d;
 C.trail.pop();dyn(de);C.trail.push([de,d]);vue(A[0],A[1],h);occ=true;let lx=A[0],ly=A[1];
 tw(3800,u=>{const x=A[0]+(B[0]-A[0])*u,y=A[1]+(B[1]-A[1])*u;tok(x,y);vue(x,y,h);
  if(Math.hypot(x-lx,y-ly)>2.2){lx=x;ly=y;$('pas').insertAdjacentHTML('beforeend','<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r=".45" fill="var(--a)" opacity=".8"/>')}},
  ()=>cam(B[0],B[1],24*innerHeight/innerWidth,1400,()=>{occ=false;$('mf').textContent='Continuer';$('mt').textContent=(C.fin==='mort'?'Fin du voyage : ':'Arrivée : ')+d+', '+pays(B);ui()}))}
/* Scène animée sur place : combat, marché, tempête, repos */
function scene(k,fin){monde();const q=pos(C.pos);$('plein').hidden=false;$('mf').textContent='Passer';$('mt').textContent=C.pos;dyn();vue(q[0],q[1],20*innerHeight/innerWidth);
 const e={combat:'<g class="fl"><path d="M-4-4L4 4M4-4L-4 4" stroke="#fff" stroke-width="1.8"/><path d="M-4-4L4 4M4-4L-4 4" stroke="#b02a2a" stroke-width=".8"/></g>',
  marche:[0,1,2,3,4].map(i=>'<circle class="pc" style="animation-delay:'+(i*.25)+'s" cx="'+((i-2)*2.4)+'" cy="0" r="1" fill="#e6c84a" stroke="#8a6d1a" stroke-width=".25"/>').join(''),
  tempete:'<path class="fl" d="M0-9L-2.5-2.5L.8-2.5L-1.5 6" fill="none" stroke="#ffe36b" stroke-width="1.1"/>',
  repos:'<text class="pc" font-size="4" y="-4" style="stroke:none;fill:var(--e)">Zzz</text>'}[k]||'';
 const g=document.createElementNS(NS,'g');g.setAttribute('transform','translate('+q[0]+' '+(q[1]-6*V.h/100)+') scale('+(V.h/100*1.6)+')');g.innerHTML=e;$('dyn').appendChild(g);
 if(k==='tempete')mp.dataset.w='Orage';let ok=false;const fermer=()=>{if(ok)return;ok=true;g.remove();$('plein').hidden=true;$('mf').onclick=fermerCarte;fin()};
 $('mf').onclick=fermer;setTimeout(fermer,2600)}
const fermerCarte=()=>{PLACE=null;$('plein').hidden=true;ui()};$('mf').onclick=fermerCarte;$('vc').onclick=ouvrirCarte;
document.querySelectorAll('.bas button').forEach(b=>b.onclick=()=>{const w=+b.dataset.w,h=w*innerHeight/innerWidth;w>150?cam(100,60,h,700):cam(TP[0],TP[1],h,700)});
addEventListener('resize',()=>vue(V.cx,V.cy,V.h));
mp.addEventListener('click',ev=>{if(!PLACE)return;const pt=mp.createSVGPoint();pt.x=ev.clientX;pt.y=ev.clientY;const q=pt.matrixTransform(mp.getScreenCTM().inverse()),
 x=Math.max(2,Math.min(198,+q.x.toFixed(1))),y=Math.max(2,Math.min(118,+q.y.toFixed(1))),n=PLACE.n;PLACE=null;
 PERSO.pos[n]=[x,y];P[n]=[x,y];const l=PERSO.lieux.find(z=>z.n===n);if(l){l.x=x;l.y=y}ecrire('perso',PERSO);built=false;$('plein').hidden=true;ui()});
