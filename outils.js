/* outils.js : petites fonctions communes (chargé en premier) */
const $=i=>document.getElementById(i),K='jdr7-';
const lire=(k,d)=>{try{const v=localStorage.getItem(K+k);return v===null?d:JSON.parse(v)}catch(e){return d}};
const ecrire=(k,v)=>{try{localStorage.setItem(K+k,JSON.stringify(v))}catch(e){}};
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);

/* Illustrations : image enregistrée dans l'appareil (atelier) ou fichier img/<type>-<nom>.jpg|png|webp */
const slug=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const IMC={};let illTok=0;
function imageFor(kind,nom){const key=kind+'-'+slug(nom);if(key in IMC)return Promise.resolve(IMC[key]);
 return idb('get','img-'+key).then(b=>{if(b)return IMC[key]=URL.createObjectURL(b);
  return new Promise(r=>{const ex=['jpg','png','webp'];let i=0;const t=()=>{if(i>=ex.length){IMC[key]=null;return r(null)}const u='img/'+key+'.'+ex[i++],im=new Image();im.onload=()=>{IMC[key]=u;r(u)};im.onerror=t;im.src=u};t()})})}
function illustrer(kind,nom){const el=$('mim');if(!el)return;el.innerHTML='';const tok=++illTok;imageFor(kind,nom).then(u=>{if(u&&tok===illTok&&!$('md').hidden)el.innerHTML='<img src="'+u+'" alt="">'})}
