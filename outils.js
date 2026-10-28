/* outils.js : petites fonctions communes (chargé en premier) */
const $=i=>document.getElementById(i),K='jdr6-';
const lire=(k,d)=>{try{const v=localStorage.getItem(K+k);return v===null?d:JSON.parse(v)}catch(e){return d}};
const ecrire=(k,v)=>{try{localStorage.setItem(K+k,JSON.stringify(v))}catch(e){}};
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
