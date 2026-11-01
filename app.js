/* outils.js : petites fonctions communes (chargé en premier) */
const $=i=>document.getElementById(i),K='jdr7-';
const lire=(k,d)=>{try{const v=localStorage.getItem(K+k);return v===null?d:JSON.parse(v)}catch(e){return d}};
let NOSAVE=false;
const ecrire=(k,v)=>{if(NOSAVE)return;try{localStorage.setItem(K+k,JSON.stringify(v))}catch(e){}};
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);

/* Illustrations : image enregistrée dans l'appareil (atelier) ou fichier img/<type>-<nom>.jpg|png|webp */
const slug=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const IMC={};let illTok=0;
function imageFor(kind,nom){const key=kind+'-'+slug(nom);if(key in IMC)return Promise.resolve(IMC[key]);
 return idb('get','img-'+key).then(b=>{if(b)return IMC[key]=URL.createObjectURL(b);
  return new Promise(r=>{const ex=['jpg','png','webp'];let i=0;const t=()=>{if(i>=ex.length){IMC[key]=null;return r(null)}const u='img/'+key+'.'+ex[i++],im=new Image();im.onload=()=>{IMC[key]=u;r(u)};im.onerror=t;im.src=u};t()})})}
function illustrer(kind,nom){const el=$('mim');if(!el)return;el.innerHTML='';const tok=++illTok;imageFor(kind,nom).then(u=>{if(u&&tok===illTok&&!$('md').hidden)el.innerHTML='<img src="'+u+'" alt="">'})}
/* donnees.js : tout ce qui est « contenu » du jeu (tables, événements, effets, objets, quêtes, lieux) */
const S={For:'Force',Agi:'Agilité',Esp:'Esprit',Cha:'Charisme',End:'Endurance'};
const SB={'Elfe':{Agi:2,Esp:1,For:-1,End:-1},'Nain':{For:1,End:2,Agi:-1},'Orc':{For:2,Esp:-1,Cha:-1},'Halfelin':{Agi:2,For:-1,Cha:1},'Gnome':{Esp:2,For:-1,End:-1},'Démon':{Esp:1,Cha:1,End:-1,For:1},'Drakéen':{For:2,End:1,Agi:-1},'Félin':{Agi:2,Esp:0,For:-1,End:-1},'Sylvain':{End:2,Agi:1,Cha:-1},'Humain':{Cha:1},'Paysan':{End:1},'Noble déchu':{Cha:1,Esp:1},'Marchand':{Cha:1},'Orphelin des rues':{Agi:1,End:1},'Fils de soldat':{For:1},'Étranger exilé':{End:1},'Forgeron':{For:2},'Voleur':{Agi:2},'Soldat':{For:1,End:1},'Érudit':{Esp:2},'Guérisseur':{Esp:1,Cha:1},'Mercenaire':{For:1,Agi:1},'Aubergiste':{Cha:1,End:1},'Contrebandier':{Agi:1,Cha:1},'Curieux':{Esp:1},'Têtu':{End:1},'Généreux':{Cha:1},'Peureux':{Agi:1,For:-1},'Rancunier':{For:1},'Cupide':{Esp:1}};
/* Objets : bonus aux jets (For, Agi, Esp, Cha, End), prix d'achat (p), effet à l'utilisation automatique (use) */
const ITEMS={'Arc':{Agi:2,p:12},'Cheval':{mount:1},'Chien fidèle':{Agi:1},'Talisman béni':{For:1,Agi:1,Esp:1,Cha:1,End:1},'Épée bénie':{For:3},'Épée':{For:2,p:15},'Dague':{Agi:2,p:10},'Marteau':{For:1},'Livre':{Esp:2},'Bâton':{For:1},'Armure légère':{End:2,p:20},'Potion de soin':{use:'PV',n:4,p:5},'Ration':{use:'EN',n:4,p:2},'Carte au trésor':{},'Relique':{}};
const INV={'Forgeron':'Marteau','Voleur':'Dague','Soldat':'Épée','Érudit':'Livre','Guérisseur':'Potion de soin','Mercenaire':'Épée','Aubergiste':'Ration','Contrebandier':'Dague'};
const SAI=['hiver','hiver','printemps','printemps','printemps','été','été','été','automne','automne','automne','hiver'];
const P={'Cité portuaire':[36,80],'Village de montagne':[156,28],'Capitale en révolte':[96,52],'Forêt interdite':[60,24],'Désert aux ruines':[160,92],'Forteresse assiégée':[112,100]};
const VILLES=['Cité portuaire','Capitale en révolte'];   /* lieux où le personnage achète seul */
/* Quêtes : suite d'étapes [texte, condition, clé]. La clé sert de contexte (« Étape:Carte ») pour favoriser des événements. */
const QU={
'Retrouver la Relique':[['Obtenir la Carte au trésor',()=>C.inv.includes('Carte au trésor'),'Carte'],['Atteindre : Désert aux ruines',()=>atteint('Désert aux ruines'),'Ruines'],['Rapporter la Relique',()=>C.inv.includes('Relique'),'Relique']],
'Venger sa famille':[['Se faire un ennemi',()=>C.fl.includes('Ennemi juré')||C.vie.some(e=>e.t==='Vengeance de l\'ennemi'),'Ennemi'],['Survivre à sa vengeance',()=>C.vie.some(e=>e.t==='Vengeance de l\'ennemi'&&e.ok),'Vengeance']]};
const DEF0=[
{n:'Race',o:[['Humain',4],['Elfe',2],['Nain',2],['Orc',2],['Halfelin',2]]},
{n:'Origine',o:[['Noble déchu',1],['Paysan',4],['Marchand',3],['Orphelin des rues',3],['Fils de soldat',3],['Étranger exilé',2]]},
{n:'Métier',o:[['Forgeron',3,{'Paysan':2,'Marchand':1.5,'Noble déchu':.2,'Nain':3}],['Voleur',2,{'Orphelin des rues':4,'Noble déchu':.3,'Halfelin':2}],['Soldat',3,{'Fils de soldat':4,'Noble déchu':1.5,'Orc':2}],['Érudit',2,{'Noble déchu':4,'Paysan':.2,'Orphelin des rues':.2,'Elfe':2.5,'Orc':.3}],['Guérisseur',2,{'Paysan':1.5,'Étranger exilé':1.5,'Elfe':1.5}],['Mercenaire',2,{'Fils de soldat':2,'Étranger exilé':2,'Orc':2}],['Aubergiste',2,{'Marchand':3,'Paysan':1.2,'Halfelin':2}],['Contrebandier',1,{'Marchand':2,'Orphelin des rues':3}]]},
{n:'Trait de caractère',o:[['Loyal',3,{'Soldat':3,'Mercenaire':.3}],['Cupide',2,{'Voleur':3,'Contrebandier':3,'Mercenaire':2}],['Curieux',3,{'Érudit':4,'Guérisseur':2,'Elfe':1.5}],['Rancunier',2,{'Mercenaire':2,'Noble déchu':3,'Nain':1.5}],['Généreux',3,{'Guérisseur':3,'Aubergiste':2,'Voleur':.3}],['Peureux',2,{'Soldat':.1,'Mercenaire':.1,'Orc':.2}],['Têtu',3,{'Forgeron':3,'Paysan':1.5,'Nain':2}]]},
{n:'Défaut',o:[['Joueur',2,{'Cupide':3,'Curieux':1}],['Menteur',3,{'Voleur':3,'Cupide':2,'Loyal':.2}],['Colérique',3,{'Têtu':2,'Rancunier':3,'Généreux':.5,'Orc':2}],['Orgueilleux',3,{'Noble déchu':3,'Têtu':2,'Peureux':.2,'Elfe':2}],['Ivrogne',2,{'Aubergiste':3,'Soldat':2,'Mercenaire':2,'Nain':2}],['Naïf',3,{'Généreux':3,'Curieux':2,'Cupide':.3}]]},
{n:'Décor',o:[['Cité portuaire',3,{'Marchand':3,'Contrebandier':4,'Étranger exilé':2}],['Village de montagne',3,{'Paysan':3,'Forgeron':3,'Guérisseur':2,'Nain':3}],['Capitale en révolte',2,{'Érudit':3,'Noble déchu':3,'Voleur':2}],['Forêt interdite',2,{'Guérisseur':2,'Curieux':2,'Elfe':4}],['Désert aux ruines',1,{'Érudit':2,'Mercenaire':2,'Étranger exilé':3}],['Forteresse assiégée',2,{'Soldat':4,'Mercenaire':3,'Fils de soldat':3,'Orc':2}]]},
...Object.keys(S).map(k=>({n:S[k],stat:k,o:[]})),
{n:'Objectif',o:[['Retrouver la Relique',2,{'Érudit':3,'Curieux':2}],['Venger sa famille',2,{'Fils de soldat':2,'Rancunier':3}],['Atteindre : Désert aux ruines',1,{'Érudit':2,'Désert aux ruines':0}],['Atteindre : Capitale en révolte',2,{'Noble déchu':2,'Capitale en révolte':0}],['Atteindre : Forteresse assiégée',2,{'Soldat':2,'Forteresse assiégée':0}],['Survivre à 12 événements',2],['Réunir 30 pièces d\'or',3,{'Voleur':2,'Marchand':2,'Cupide':2}]]},
{n:'Événement de vie',vie:1,o:[
['Voyage lointain',3,{'Curieux':2,'Mercenaire':2,'Étranger exilé':2,'Contrebandier':2,'Un héritage inattendu':2,'Une rencontre décisive':1.5,'Un coup de chance':2,'Voyage lointain':.3,'Voyage forcé':.3,'Une maladie':.3,'Épuisé':.2,'Neige':.4,'Hiver':.6,'Printemps':1.5,'Étape:Ruines':4}],
['Voyage forcé',1,{'Voleur':2,'Contrebandier':2,'Capitale en révolte':3,'Forteresse assiégée':3,'Une trahison':4,'Une dette':3,'Une maladie':2,'Voyage forcé':.3,'Ennemi juré':3,'Épuisé':.2}],
['Une rencontre décisive',4,{'Voyage lointain':3,'Voyage forcé':2,'Une rencontre décisive':.4}],
['Une trahison',2,{'Cupide':2,'Voleur':2,'Loyal':.5,'Une rencontre décisive':1.5,'Une dette':2,'Un deuil':1.5,'Un coup de chance':.5,'Étape:Ennemi':5}],
['Un héritage inattendu',1,{'Noble déchu':3,'Orphelin des rues':.2,'Un deuil':3,'Une dette':.2}],
['Une maladie',2,{'Guérisseur':.3,'Ivrogne':2,'Un deuil':1.5,'Voyage forcé':1.5,'Épuisé':3,'Hiver':2,'Neige':1.5}],
['Un coup de chance',2,{'Voyage lointain':2,'Une dette':.2}],
['Une dette',2,{'Joueur':3,'Cupide':1.5,'Un coup de chance':.2,'Un héritage inattendu':0,'Une trahison':1.5}],
['Un deuil',2,{'Une maladie':3,'Une trahison':1.5}],
['Repos à l\'auberge',1,{'Épuisé':6,'Blessé':3,'Aubergiste':2,'Neige':2,'Hiver':1.5}],
['Soins d\'un guérisseur',1,{'Blessé':6,'Guérisseur':1.5}],
['Embuscade',2,{'Voyage lointain':2,'Voyage forcé':2.5,'Forêt interdite':2,'Désert aux ruines':2,'Brume':2}],
['Combat de rue',2,{'Capitale en révolte':3,'Soldat':1.5,'Mercenaire':1.5,'Orc':1.5,'Blessé':.4}],
['Vengeance de l\'ennemi',4,{'Épée':1.5,'Étape:Vengeance':3},'Ennemi juré'],
['Rencontre d\'un allié',2,{'Une rencontre décisive':3,'Généreux':2,'Étape:Carte':3}],
['Mission de l\'allié',4,{'Étape:Carte':3},'Allié'],
['Marché florissant',3,{'Marchand':2,'Contrebandier':1.5,'Étape:Or':3},'Cité portuaire'],
['Tempête en mer',2,{'Orage':3,'Pluie':1.5},'Cité portuaire'],
['Fouille des ruines',4,{'Érudit':2,'Livre':2,'Étape:Relique':3},'Désert aux ruines'],
['Piège des ruines',3,{'Voleur':.5},'Désert aux ruines'],
['Chasse au trésor',5,{'Étape:Or':2},'Carte au trésor'],
['Tournoi',3,{'Soldat':2,'Mercenaire':2,'Étape:Or':2},'Capitale en révolte'],
['Banquet',2,{'Noble déchu':2,'Épuisé':3,'Hiver':1.5},'Capitale en révolte'],
['Source dans la forêt',3,{'Elfe':3,'Épuisé':2},'Forêt interdite'],
['Sortie de la forteresse',2,{'Soldat':2},'Forteresse assiégée']]}];
/* Effets d'un événement. jet:[stat,difficulté] : jet automatique (2 dés + stat/2 + objets).
   Réussite : dégâts réduits de moitié et gains obtenus. Échec : dégâts complets, pas de gain.
   PV/EN = vie/énergie, or = pièces, it = objet, fl/uf = état gagné/perdu, sc = scène animée sur la carte. */
const EF={
'Voyage lointain':{Esp:1},'Voyage forcé':{Agi:1},'Une rencontre décisive':{Cha:1},'Une trahison':{Cha:-1,Esp:1,fl:'Ennemi juré'},'Un héritage inattendu':{or:12},'Une maladie':{PV:-3,EN:-2,jet:['End',10]},'Un coup de chance':{or:6},'Une dette':{Cha:-1,or:-6},'Un deuil':{Esp:1,PV:-1,EN:-1},
'Repos à l\'auberge':{EN:5,PV:2,or:-2,sc:'repos'},'Soins d\'un guérisseur':{PV:5,or:-3},
'Embuscade':{PV:-4,or:3,fl:'Ennemi juré',jet:['Agi',10],sc:'combat'},'Combat de rue':{PV:-3,or:4,jet:['For',7],sc:'combat'},'Vengeance de l\'ennemi':{PV:-5,For:1,uf:'Ennemi juré',jet:['For',8],sc:'combat'},
'Rencontre d\'un allié':{fl:'Allié',Cha:1},'Mission de l\'allié':{it:'Carte au trésor',EN:-2,uf:'Allié'},
'Marché florissant':{or:8,Cha:1,sc:'marche'},'Tempête en mer':{PV:-3,EN:-2,jet:['End',10],sc:'tempete'},
'Fouille des ruines':{it:'Relique',EN:-1,jet:['Esp',7]},'Piège des ruines':{PV:-4,jet:['Agi',10]},'Chasse au trésor':{or:15,EN:-2,jet:['Esp',8]},
'Tournoi':{For:1,or:10,PV:-2,jet:['For',6],sc:'combat'},'Banquet':{EN:4,Cha:1,or:-3,sc:'marche'},'Source dans la forêt':{EN:4,PV:1},'Sortie de la forteresse':{PV:-3,Agi:1,jet:['For',10],sc:'combat'}};

/* Textes affichés dans la « carte du destin » à chaque tirage */
const HIST={
'Humain':'Peuple jeune et ambitieux, présent partout : les humains bâtissent des royaumes et les perdent aussi vite.',
'Elfe':'Peuple des forêts anciennes, patient et fier. Les années passent lentement pour lui, et les rancunes plus encore.',
'Nain':'Gens des montagnes et des forges, têtus, fidèles à leur clan et à leur parole. Leur hydromel est célèbre.',
'Orc':'Peuple de guerriers aux clans rudes. On les craint, on les engage, rarement on les comprend.',
'Halfelin':'Petites gens des collines, malins, discrets et gourmands. Ils survivent là où les grands se font remarquer.',
'Noble déchu':'Un nom illustre, un titre perdu : la chute a laissé le goût du rang et un peu d\'amertume.',
'Paysan':'Né dans la terre et les saisons, il connaît le poids du travail et la valeur d\'un toit.',
'Marchand':'Élevé entre comptoirs et caravanes, il sait ce que chaque chose vaut, et chaque personne.',
'Orphelin des rues':'Personne pour l\'attendre le soir : il a appris seul à voir venir les coups.',
'Fils de soldat':'Bercé par les récits de guerre et la discipline, il porte l\'ombre de son père.',
'Étranger exilé':'Chassé de chez lui, il arrive sans rien, avec une langue qu\'on comprend mal.',
'Forgeron':'Le feu, le marteau, le métal : il façonne ce que les autres brandissent.',
'Voleur':'Les poches des autres sont son atelier, et la nuit son alliée.',
'Soldat':'Rangs, ordres et boucliers : il sait tenir une ligne.',
'Érudit':'Livres, cartes et questions : il préfère comprendre le monde que le traverser.',
'Guérisseur':'Herbes, bandages et patience : il recoud ce que les autres abîment.',
'Mercenaire':'Il vend son bras à qui paie, et parfois sa loyauté en prime.',
'Aubergiste':'Au comptoir, il entend tout : rumeurs, secrets et dettes.',
'Contrebandier':'Il fait passer ce qu\'on interdit, par les routes qu\'on ignore.',
'Voyage lointain':'Le chemin s\'allonge, les paysages changent : quelque chose l\'appelle au-delà de l\'horizon.',
'Voyage forcé':'Il n\'a pas le choix : il faut partir, vite, avant que le danger ne rattrape.',
'Une rencontre décisive':'Un visage croisé au bon moment. Rien ne sera tout à fait comme avant.',
'Une trahison':'Celui en qui il avait confiance a choisi son propre intérêt. La blessure est profonde.',
'Un héritage inattendu':'Un notaire, une lettre, un coffre : un parent lointain pensait à lui.',
'Une maladie':'La fièvre s\'installe. Il faudra du courage, du repos, ou beaucoup de chance.',
'Un coup de chance':'Le hasard sourit enfin : une pièce trouvée, une porte restée ouverte.',
'Une dette':'Quelqu\'un lui réclame ce qu\'il doit, et ne compte pas attendre.',
'Un deuil':'Une absence soudaine. Le monde continue, mais plus lentement.',
'Repos à l\'auberge':'Un lit, une soupe chaude, un feu qui crépite. Le corps reprend ses droits.',
'Soins d\'un guérisseur':'Des mains expertes, des onguents amers : les plaies se referment.',
'Embuscade':'Des silhouettes jaillissent des fourrés. La route n\'était pas aussi sûre qu\'elle en avait l\'air.',
'Combat de rue':'Une dispute, un cri, des poings : la ville réclame son tribut.',
'Vengeance de l\'ennemi':'Un vieil ennemi a retrouvé sa trace, et il n\'a rien oublié.',
'Rencontre d\'un allié':'Un inconnu tend la main au bon moment. Une amitié commence peut-être.',
'Mission de l\'allié':'L\'allié confie une tâche risquée en échange d\'un secret précieux.',
'Marché florissant':'Étals, cris et épices : le marché est en pleine effervescence.',
'Tempête en mer':'Le ciel noircit, les vagues se dressent : le port n\'a jamais semblé si loin.',
'Fouille des ruines':'Sous le sable, des pierres taillées. Quelqu\'un a vécu ici, et laissé des choses derrière lui.',
'Piège des ruines':'Un dallage qui cède, un déclic : les anciens gardaient leurs secrets.',
'Chasse au trésor':'La carte jaunie mène quelque part. Reste à savoir si le trésor l\'attend encore.',
'Tournoi':'Bannières, trompettes et foule : on se bat ici pour la gloire, et pour la bourse.',
'Banquet':'Une longue table, des chants, du vin : la capitale oublie un instant ses troubles.',
'Source dans la forêt':'Une eau claire sous les feuillages : la forêt, parfois, soigne ceux qui la respectent.',
'Sortie de la forteresse':'Les assiégeants guettent. Il faut forcer le passage pour porter un message.'};
/* Influence douce du caractère sur les événements (jamais nulle) */
const TR={
'Colérique':{'Combat de rue':1.8,'Tournoi':1.5,'Vengeance de l\'ennemi':1.3,'Une trahison':1.2},
'Peureux':{'Combat de rue':.5,'Embuscade':.75,'Voyage lointain':.6,'Tournoi':.5},
'Curieux':{'Fouille des ruines':1.6,'Voyage lointain':1.5,'Chasse au trésor':1.3},
'Cupide':{'Marché florissant':1.5,'Chasse au trésor':1.5,'Une dette':1.3},
'Généreux':{'Rencontre d\'un allié':1.6,'Soins d\'un guérisseur':1.3,'Une dette':1.2},
'Têtu':{'Voyage forcé':.7,'Vengeance de l\'ennemi':1.3},
'Loyal':{'Une trahison':.6,'Mission de l\'allié':1.4},
'Rancunier':{'Vengeance de l\'ennemi':1.5,'Une trahison':1.2},
'Joueur':{'Une dette':1.6,'Tournoi':1.3},
'Menteur':{'Une trahison':1.4,'Marché florissant':1.2},
'Orgueilleux':{'Tournoi':1.5,'Banquet':1.4},
'Ivrogne':{'Repos à l\'auberge':1.4,'Combat de rue':1.4},
'Naïf':{'Une trahison':1.5,'Une dette':1.3}};

/* ===================== V2 : races, archétypes, métiers, compétences, objectifs, cadeau divin ===================== */
const RACES=[['Humain',4],['Elfe',2],['Nain',2],['Orc',2],['Halfelin',2],['Gnome',1.5],['Démon',1.2],['Drakéen',1.2],['Félin',1.5],['Sylvain',1.2]];
Object.assign(SB,{'Gnome':{Esp:2,Agi:1,For:-2},'Démon':{For:1,Cha:1,End:1,Esp:-1},'Drakéen':{For:2,End:1,Agi:-1},'Félin':{Agi:2,Cha:1,End:-1},'Sylvain':{End:2,Esp:1,Agi:-1},
 'Combattant':{For:1,End:1},'Voyageur':{End:1,Agi:1},'Érudit':{Esp:1},'Artisan':{For:1,Esp:1},'Commerçant':{Cha:2},'Roublard':{Agi:2},'Soigneur':{Esp:1,Cha:1},'Mystique':{Esp:1,Cha:1}});
Object.assign(INV,{'Chasseur':'Arc','Pisteur':'Arc','Guide':'Bâton','Marin':'Dague','Apothicaire':'Potion de soin','Alchimiste':'Potion de soin','Prêtre':'Livre','Devin':'Livre','Scribe':'Livre','Cartographe':'Livre','Charpentier':'Marteau','Tisserand':'Ration','Gladiateur':'Épée','Garde de caravane':'Épée','Espion':'Dague','Changeur':'Ration','Marchand ambulant':'Ration','Messager':'Bâton'});
const ARCH={
'Combattant':[3,{'Orc':2.5,'Nain':1.5,'Drakéen':2,'Fils de soldat':3,'Noble déchu':1.3,'Gnome':.5}],
'Voyageur':[3,{'Elfe':1.8,'Félin':2,'Humain':1.2,'Étranger exilé':3,'Halfelin':1.3}],
'Érudit':[2,{'Elfe':1.5,'Gnome':2.5,'Noble déchu':2.5,'Orc':.4}],
'Artisan':[3,{'Nain':3,'Gnome':1.8,'Paysan':1.8,'Humain':1.1}],
'Commerçant':[3,{'Halfelin':2,'Marchand':4,'Gnome':1.3,'Humain':1.3}],
'Roublard':[2,{'Halfelin':1.8,'Félin':2,'Démon':1.5,'Orphelin des rues':4,'Noble déchu':.4}],
'Soigneur':[2,{'Elfe':1.5,'Sylvain':2.5,'Paysan':1.5,'Orc':.5}],
'Mystique':[2,{'Elfe':2,'Démon':2.5,'Sylvain':2,'Gnome':1.3,'Drakéen':1.3,'Orc':.7}]};
const MET={
'Combattant':[['Soldat',3],['Mercenaire',2],['Garde de caravane',2],['Gladiateur',1]],
'Voyageur':[['Chasseur',2],['Guide',2],['Marin',2],['Messager',2]],
'Érudit':[['Érudit',2],['Scribe',2],['Cartographe',1.5]],
'Artisan':[['Forgeron',3],['Charpentier',2],['Tisserand',2]],
'Commerçant':[['Marchand ambulant',2],['Aubergiste',2],['Changeur',1.5]],
'Roublard':[['Voleur',2],['Contrebandier',1.5],['Espion',1.5]],
'Soigneur':[['Guérisseur',2],['Apothicaire',2]],
'Mystique':[['Prêtre',2],['Alchimiste',1.5],['Devin',1.5]]};
const MX={'Chasseur':{'Félin':2,'Elfe':1.5,'Sylvain':1.5},'Marin':{'Cité portuaire':2},'Prêtre':{'Démon':.4,'Humain':1.3},'Alchimiste':{'Gnome':2.5,'Démon':1.5},'Charpentier':{'Nain':1.5,'Sylvain':1.5},'Devin':{'Démon':1.8,'Elfe':1.5},'Gladiateur':{'Orc':2,'Drakéen':2},'Cartographe':{'Gnome':1.5,'Elfe':1.3}};
const sk=s=>s.split(',').map(x=>x.split(':'));
const SKM={'Soldat':sk('Discipline:combat,Marche forcée:voyage'),'Mercenaire':sk('Escrime pragmatique:combat,Négociation de contrat:commerce'),'Garde de caravane':sk('Vigilance:survie,Bouclier:combat'),'Gladiateur':sk('Jeu d\'arène:combat,Charisme de foule:social'),
'Chasseur':sk('Pistage:survie,Tir précis:combat'),'Guide':sk('Lecture des routes:voyage,Camp de fortune:survie'),'Marin':sk('Nœuds et voiles:voyage,Gros temps:survie'),'Messager':sk('Course longue:voyage,Discrétion:ruse'),
'Érudit':sk('Recherche:savoir,Rhétorique:social'),'Scribe':sk('Calligraphie:savoir,Faux et usage de faux:ruse'),'Cartographe':sk('Relevés:savoir,Orientation:voyage'),
'Forgeron':sk('Forge:artisanat,Armes de qualité:combat'),'Charpentier':sk('Charpente:artisanat,Résistance:survie'),'Tisserand':sk('Tissage fin:artisanat,Marchandage de tissus:commerce'),
'Marchand ambulant':sk('Marchandage:commerce,Réseau de routes:voyage'),'Aubergiste':sk('Qualité des plats:hospitalité,Écoute des rumeurs:social'),'Changeur':sk('Évaluation:commerce,Calcul:savoir'),
'Voleur':sk('Crochetage:ruse,Fuite:survie'),'Contrebandier':sk('Cachettes:ruse,Corruption:commerce'),'Espion':sk('Déguisement:ruse,Interrogatoire:social'),
'Guérisseur':sk('Herboristerie:soin,Chirurgie de fortune:soin'),'Apothicaire':sk('Mélanges:soin,Poisons et antidotes:ruse'),
'Prêtre':sk('Rites:mystique,Réconfort:social'),'Alchimiste':sk('Transmutation:mystique,Distillation:artisanat'),'Devin':sk('Augures:mystique,Lecture des gens:social')};
const RSK={'Humain':['Ténacité humaine','survie'],'Elfe':['Sens de la forêt','voyage'],'Nain':['Œil du forgeron','artisanat'],'Orc':['Fureur tribale','combat'],'Halfelin':['Chance du petit peuple','ruse'],'Gnome':['Ingéniosité','savoir'],'Démon':['Regard infernal','social'],'Drakéen':['Souffle de feu','combat'],'Félin':['Pas de velours','ruse'],'Sylvain':['Racines profondes','survie']};
const ASK={'Combattant':['Art de la guerre','combat'],'Voyageur':['Sens de l\'orientation','voyage'],'Érudit':['Mémoire d\'archiviste','savoir'],'Artisan':['Main sûre','artisanat'],'Commerçant':['Sens des affaires','commerce'],'Roublard':['Doigts agiles','ruse'],'Soigneur':['Mains apaisantes','soin'],'Mystique':['Intuition','mystique']};
const GEN={combat:'Bagarre',voyage:'Pied sûr',social:'Bagout',commerce:'Marchandage de fortune',survie:'Système D',hospitalité:'Cuisine de campagne',soin:'Premiers secours',savoir:'Curiosité',ruse:'Débrouillardise',artisanat:'Bricolage',mystique:'Intuition naissante'};
/* Compétences débloquées par une situation : [événement, réussite exigée (true/false/undefined), nom, domaine] */
const UNL=[['Embuscade',true,'Instinct de survie','survie'],['Combat de rue',true,'Sens du duel','combat'],['Tournoi',true,'Gloire d\'arène','social'],['Fouille des ruines',true,'Lecture des ruines','savoir'],['Marché florissant',undefined,'Flair du marché','commerce'],['Tempête en mer',true,'Pied marin','voyage'],['Vengeance de l\'ennemi',true,'Haine froide','combat'],['Une maladie',true,'Constitution de fer','survie'],['Une trahison',undefined,'Méfiance','social']];
const ETAG={'Voyage lointain':'voyage','Voyage forcé':'voyage','Une rencontre décisive':'social','Une trahison':'social','Un héritage inattendu':'commerce','Une maladie':'survie','Un coup de chance':'ruse','Une dette':'commerce','Un deuil':'social','Repos à l\'auberge':'hospitalité','Soins d\'un guérisseur':'soin','Embuscade':'combat','Combat de rue':'combat','Vengeance de l\'ennemi':'combat','Rencontre d\'un allié':'social','Mission de l\'allié':'ruse','Marché florissant':'commerce','Tempête en mer':'survie','Fouille des ruines':'savoir','Piège des ruines':'ruse','Chasse au trésor':'savoir','Tournoi':'combat','Banquet':'hospitalité','Source dans la forêt':'soin','Sortie de la forteresse':'combat',
'Commande importante':'artisanat','Vision étrange':'mystique','Cours improvisé':'savoir','Concours de cuisine':'hospitalité','Chasse au gibier':'survie','Négociation tendue':'social','Cambriolage':'ruse','Épreuve d\'honneur':'combat'};
const EVN=[
['Commande importante',3,{'Artisan':4,'Nain':1.5,'Gnome':1.5}],
['Vision étrange',2,{'Mystique':4,'Démon':1.5,'Brume':1.5}],
['Cours improvisé',2,{'Érudit':4,'Gnome':1.5,'Capitale en révolte':1.5}],
['Concours de cuisine',2,{'Aubergiste':5,'Commerçant':2,'Halfelin':1.5,'Capitale en révolte':2}],
['Chasse au gibier',3,{'Voyageur':3,'Chasseur':3,'Forêt interdite':2,'Félin':1.5,'Épuisé':1.5}],
['Négociation tendue',2,{'Commerçant':2.5,'Noble déchu':2,'Capitale en révolte':1.5}],
['Cambriolage',2,{'Roublard':4,'Voleur':3,'Félin':1.5,'Cité portuaire':1.5}],
['Épreuve d\'honneur',2,{'Combattant':3,'Drakéen':1.5,'Orc':1.5}]];
Object.assign(EF,{'Commande importante':{or:10,Esp:1,jet:['Esp',6]},'Vision étrange':{Esp:1,EN:-1},'Cours improvisé':{or:6,Cha:1},'Concours de cuisine':{or:8,Cha:1,sc:'marche',jet:['Cha',9]},
 'Chasse au gibier':{EN:2,it:'Ration',jet:['Agi',9]},'Négociation tendue':{or:7,Cha:1,jet:['Cha',10]},'Cambriolage':{or:12,PV:-3,jet:['Agi',11]},'Épreuve d\'honneur':{For:1,or:5,PV:-2,jet:['For',10],sc:'combat'}});
Object.assign(HIST,{'Gnome':'Inventeurs minuscules aux idées immenses : ils réparent tout, et cassent parfois davantage.','Démon':'Sang d\'enfer et fierté ombrageuse : on les soupçonne de tous les maux, ils en tirent parti.','Drakéen':'Fiers descendants des dragons, couverts d\'écailles, d\'honneur et de colère contenue.','Félin':'Peuple souple et discret des toits et des steppes : curieux, indépendant, jamais domestiqué.','Sylvain':'Nés dans les bois anciens, plus proches des arbres que des villes : patients comme la sève.',
'Combattant':'La vie se règle par l\'acier, la discipline et le courage.','Voyageur':'Les routes sont sa maison et l\'horizon sa promesse.','Artisan':'Des mains qui façonnent : bois, métal, fil et patience.','Commerçant':'Offre, demande et bon sens : le monde est un grand marché.','Roublard':'Ruse, discrétion et opportunités : la loi est une suggestion.','Soigneur':'Il écoute les corps, les peines, et les plantes qui les apaisent.','Mystique':'Rêves, signes et puissances invisibles guident son pas.',
'Garde de caravane':'Il escorte marchandises et voyageurs sur des routes peu sûres.','Gladiateur':'Le sable de l\'arène lui a appris le goût du spectacle et du sang.','Chasseur':'Silence, patience et flèche : la forêt n\'a pas de secrets pour lui.','Guide':'Il connaît les raccourcis, les gués et les dangers du chemin.','Marin':'Le sel, les cordages et l\'horizon : un cœur de port.','Messager':'Il court avec des secrets cousus dans la doublure.','Scribe':'Plume rapide, mémoire fidèle : il consigne ce que les puissants veulent oublier.','Cartographe':'Il dessine le monde avant que d\'autres ne s\'y perdent.','Charpentier':'Il bâtit des toits, des ponts et des navires.','Tisserand':'Fils, métiers et motifs : il habille les gens et les murs.','Marchand ambulant':'Sa boutique est un chariot, son comptoir un sourire.','Changeur':'Il pèse l\'or, démasque les fausses pièces et connaît le prix de la confiance.','Espion':'Il écoute aux portes et vend ce qu\'il y entend.','Apothicaire':'Fioles, poudres et dosages : un grain de trop et tout change.','Prêtre':'Il porte la parole d\'une puissance, et la peine de ceux qui la prient.','Alchimiste':'Il cherche dans les cornues ce que la nature cache.','Devin':'Il lit les cartes, les os et les regards, et se trompe rarement.',
'Commande importante':'Un client exigeant, un délai serré : l\'atelier tourne jusqu\'à la nuit.','Vision étrange':'Le monde vacille un instant : une image qui n\'est pas à lui, mais qui le concerne.','Cours improvisé':'Une place, quelques curieux, une question : il explique, et les gens écoutent.','Concours de cuisine':'Fumets, casseroles et jury sévère : la réputation se joue à une cuillère.','Chasse au gibier':'Le silence des sous-bois, un bruissement : le dîner se décide en un instant.','Négociation tendue':'Deux camps, une table, des regards en coin : chaque mot compte.','Cambriolage':'Une serrure, une ombre, un coffre : la nuit appartient à ceux qui osent.','Épreuve d\'honneur':'On l\'a défié devant témoins. Reculer serait pire que perdre.'});
Object.assign(TR,{'Elfe':{'Source dans la forêt':1.5,'Banquet':1.2,'Vision étrange':1.2},'Nain':{'Commande importante':1.5,'Tournoi':1.3},'Orc':{'Combat de rue':1.5,'Tournoi':1.4},'Halfelin':{'Banquet':1.5,'Cambriolage':1.3,'Concours de cuisine':1.4},'Démon':{'Vision étrange':1.5,'Une trahison':1.3},'Gnome':{'Commande importante':1.4,'Fouille des ruines':1.3},'Drakéen':{'Combat de rue':1.3,'Tournoi':1.4},'Félin':{'Cambriolage':1.5,'Chasse au gibier':1.4},'Sylvain':{'Source dans la forêt':2,'Chasse au gibier':1.3}});
/* Objectifs : [nom, poids, multiplicateurs, étapes]. Les étapes (type : lieu, vie, or, ev, tag, comp, lieux, stat) sont évaluées automatiquement. */
const OBJ=[
['Retrouver la Relique',2,{'Érudit':3,'Curieux':2,'Gnome':1.5}],
['Venger sa famille',2,{'Fils de soldat':2,'Rancunier':3,'Démon':1.3}],
['Atteindre : Désert aux ruines',1,{'Érudit':2,'Cartographe':2,'Désert aux ruines':0},[{t:'lieu',v:'Désert aux ruines'}]],
['Atteindre : Capitale en révolte',2,{'Noble déchu':2,'Espion':2,'Capitale en révolte':0},[{t:'lieu',v:'Capitale en révolte'}]],
['Atteindre : Forteresse assiégée',2,{'Combattant':2,'Forteresse assiégée':0},[{t:'lieu',v:'Forteresse assiégée'}]],
['Atteindre : Village de montagne',1.5,{'Nain':2,'Artisan':1.5,'Village de montagne':0},[{t:'lieu',v:'Village de montagne'}]],
['Atteindre : Forêt interdite',1.5,{'Elfe':3,'Sylvain':3,'Mystique':2,'Forêt interdite':0},[{t:'lieu',v:'Forêt interdite'}]],
['Atteindre : Cité portuaire',1.5,{'Commerçant':2,'Marin':3,'Cité portuaire':0},[{t:'lieu',v:'Cité portuaire'}]],
['Survivre à 16 événements',2,{},[{t:'vie',n:16}]],
['Réunir 30 pièces d\'or',3,{'Commerçant':3,'Roublard':2,'Cupide':2,'Halfelin':1.5},[{t:'or',n:30}]],
['Maîtriser un art (niveau 3)',2,{'Artisan':3,'Érudit':2,'Mystique':2,'Gnome':1.5},[{t:'comp',n:3}]],
['Explorer le monde (4 lieux)',2,{'Voyageur':4,'Curieux':2,'Félin':1.5,'Elfe':1.3},[{t:'lieux',n:4}]],
['Remporter un tournoi',1.5,{'Combattant':3,'Orc':2,'Drakéen':2},[{t:'ev',v:'Tournoi',n:1}]],
['Conclure 3 marchés',1.5,{'Commerçant':4,'Halfelin':2,'Gnome':1.5},[{t:'ev',v:'Marché florissant',n:3}]],
['Devenir irrésistible (Charisme 9)',1.5,{'Noble déchu':2,'Démon':2,'Commerçant':1.5},[{t:'stat',k:'Cha',n:9}]],
['Devenir un colosse (Force 8)',1.5,{'Orc':2,'Nain':1.5,'Combattant':2,'Drakéen':1.5},[{t:'stat',k:'For',n:8}]],
['Gagner 2 combats',2,{'Combattant':3,'Mercenaire':1.5,'Orc':1.5},[{t:'tag',v:'combat',n:2}]],
['Recevoir 2 visions',1,{'Mystique':4,'Démon':2},[{t:'ev',v:'Vision étrange',n:2}]],
['Réussir 2 commandes',1,{'Artisan':4,'Nain':1.5},[{t:'ev',v:'Commande importante',n:2}]]];
const OBJD={};OBJ.forEach(o=>{if(o[3])OBJD[o[0]]=o[3]});
/* anciens noms (parties en cours) */
[['Maîtriser un art (niveau 4)','Maîtriser un art (niveau 3)'],['Remporter 2 tournois','Remporter un tournoi'],['Devenir un colosse (Force 10)','Devenir un colosse (Force 8)'],['Devenir un colosse (Force 9)','Devenir un colosse (Force 8)'],['Gagner 3 combats','Gagner 2 combats'],['Explorer le monde (5 lieux)','Explorer le monde (4 lieux)'],['Réunir 40 pièces d\'or','Réunir 30 pièces d\'or']].forEach(a=>OBJD[a[0]]=OBJD[a[1]]);
/* ===================== V6 : contenu supplémentaire ===================== */
RACES.push(["Gobelin",1.2],["Minotaure",1],["Lutin",1],["Revenant",.8]);
Object.assign(SB,{"Gobelin":{Agi:2,Esp:1,For:-2},"Minotaure":{For:2,End:2,Agi:-2,Cha:-1},"Lutin":{Agi:2,Cha:2,End:-2,For:-2},"Revenant":{End:2,Esp:1,Cha:-2}});
Object.assign(RSK,{"Gobelin":["Débrouille de bidonville","ruse"],"Minotaure":["Charge du labyrinthe","combat"],"Lutin":["Tour de passe-passe","social"],"Revenant":["Froid du tombeau","survie"]});
Object.assign(HIST,{
"Gobelin":"Petit, vif et sous-estimé : le gobelin survit là où d'autres se plaignent, et il sait toujours où se cacher.",
"Minotaure":"Une force colossale, un passé de labyrinthes et de cris. Les villes le regardent de travers avant de le laisser passer.",
"Lutin":"Léger comme une rumeur, taquin comme un mauvais présage. Le lutin charme avant de se faire prendre.",
"Revenant":"Mort une fois déjà, il est revenu sans savoir pourquoi. Il ne ressent plus le froid, ni tout à fait le reste."});
Object.assign(ARCH.Roublard[1],{"Gobelin":3,"Lutin":2.5});Object.assign(ARCH.Combattant[1],{"Minotaure":3,"Gobelin":.7,"Lutin":.3});
Object.assign(ARCH.Mystique[1],{"Revenant":3,"Lutin":1.5});Object.assign(ARCH.Artisan[1],{"Gobelin":1.5,"Minotaure":.8});
Object.assign(ARCH.Voyageur[1],{"Lutin":1.5,"Revenant":1.3});Object.assign(ARCH.Érudit[1],{"Minotaure":.4});Object.assign(ARCH.Soigneur[1],{"Lutin":1.5,"Minotaure":.5});
MET.Combattant.push(["Archer",2],["Chevalier errant",1]);
MET.Voyageur.push(["Éclaireur",1.5],["Caravanier",1.5]);
MET.Érudit.push(["Bibliothécaire",1.5]);
MET.Artisan.push(["Boulanger",1.5],["Bijoutier",1]);
MET.Commerçant.push(["Cuisinier",1.5],["Éleveur",1.5]);
MET.Roublard.push(["Chasseur de primes",1]);
MET.Soigneur.push(["Sage-femme",1.5],["Herboriste",1.5]);
MET.Mystique.push(["Médium",1],["Druide",1.5],["Moine",1.5]);
Object.assign(MX,{"Archer":{"Elfe":2,"Sylvain":1.5},"Druide":{"Sylvain":3,"Elfe":1.5},"Cuisinier":{"Halfelin":2},"Chevalier errant":{"Humain":1.5,"Noble déchu":3},"Médium":{"Revenant":3},"Chasseur de primes":{"Orc":1.5,"Minotaure":1.5},"Bijoutier":{"Nain":2,"Gnome":1.5},"Éclaireur":{"Félin":1.5,"Elfe":1.5}});
Object.assign(INV,{"Archer":"Arc","Chevalier errant":"Épée","Éclaireur":"Arc","Caravanier":"Ration","Bibliothécaire":"Livre","Boulanger":"Ration","Bijoutier":"Marteau","Cuisinier":"Ration","Éleveur":"Bâton","Chasseur de primes":"Dague","Sage-femme":"Potion de soin","Herboriste":"Potion de soin","Médium":"Livre","Druide":"Bâton","Moine":"Bâton"});
Object.assign(SKM,{
"Archer":sk("Tir à longue portée:combat,Œil de lynx:survie"),"Chevalier errant":sk("Chevalerie:combat,Éloquence de cour:social"),
"Éclaireur":sk("Reconnaissance:voyage,Embuscade tendue:ruse"),"Caravanier":sk("Conduite d'attelage:voyage,Troc de route:commerce"),
"Bibliothécaire":sk("Classement:savoir,Mémoire des textes:savoir"),"Boulanger":sk("Pétrissage:artisanat,Fournée du matin:hospitalité"),
"Bijoutier":sk("Sertissage:artisanat,Œil de joaillier:commerce"),"Cuisinier":sk("Cuisine:hospitalité,Épices rares:commerce"),
"Éleveur":sk("Dressage:survie,Soin des bêtes:soin"),"Chasseur de primes":sk("Traque:survie,Cordes et menottes:combat"),
"Sage-femme":sk("Accouchement:soin,Parole rassurante:social"),"Herboriste":sk("Cueillette:soin,Teintures:artisanat"),
"Médium":sk("Voix des morts:mystique,Lecture des gens:social"),"Druide":sk("Langue des bêtes:mystique,Cycles de la nature:survie"),
"Moine":sk("Méditation:mystique,Arts martiaux:combat")});

/* Cadeau divin : un seul tirage, à la création */
const CAD0=[['Une bourse bénie',3,{'Commerçant':2}],['Un don d\'expérience',3,{'Érudit':1.5,'Mystique':1.5}],['Un souffle de vigueur',3],['Une grâce d\'endurance',2,{'Voyageur':1.5}],['La force des ancêtres',2,{'Combattant':2,'Nain':1.5}],['Une parole d\'or',2,{'Commerçant':1.5,'Noble déchu':1.5}],['Un esprit éveillé',2,{'Érudit':2,'Gnome':1.5}],['Un cheval fidèle',2,{'Voyageur':2}],['Un compagnon à quatre pattes',2,{'Chasseur':2,'Félin':1.5}],['Un talisman béni',1.5,{'Mystique':2}],['Une arme bénie',1.5,{'Combattant':2}],['Une amitié précieuse',2,{'Généreux':2}]];
const CAD={'Une bourse bénie':{or:25},'Un don d\'expérience':{xp:4},'Un souffle de vigueur':{pvm:3},'Une grâce d\'endurance':{End:1,enm:2},'La force des ancêtres':{For:1},'Une parole d\'or':{Cha:1},'Un esprit éveillé':{Esp:1},'Un cheval fidèle':{it:'Cheval'},'Un compagnon à quatre pattes':{it:'Chien fidèle'},'Un talisman béni':{it:'Talisman béni'},'Une arme bénie':{it:'Épée bénie'},'Une amitié précieuse':{fl:'Allié'}};
Object.assign(HIST,{'Un don d\'expérience':'Un souvenir qui n\'est pas à lui : des gestes appris sans les avoir jamais faits.','Un cheval fidèle':'Un cheval s\'approche, calme, comme s\'il l\'attendait depuis toujours.','Un talisman béni':'Un pendentif tiède : il protège un peu de tout.'});
const DESTIN0=[['Aucun destin',12],['Béni des dieux',1],['Maudit',1],['Marqué du sceau',1],['Étoile du berger',1]];
/* ===================== V11 : race hybride, pays étrangers ===================== */
RACES.push(["Sang-mêlé",1.2]);SB["Sang-mêlé"]={};
const PAYS=[
{n:'Terres du Givre',x0:10,y0:-185,x1:190,y1:-12,col:'#e3ecf2',L:[['Havre de glace',70,-140,{'Nain':3,'Revenant':2}],['Citadelle du Givre',140,-80,{'Nain':2,'Orc':2,'Soldat':2}]]},
{n:'Archipel d\u2019Ysmir',x0:-125,y0:0,x1:-12,y1:170,col:'#d9e6c9',L:[['Port d\'Ysmir',-70,40,{'Marin':3,'Lutin':3,'Elfe':2}],['Île des brumes',-90,120,{'Sylvain':3,'Lutin':3,'Elfe':3}]]},
{n:'Empire de Karzhad',x0:212,y0:-25,x1:328,y1:165,col:'#e6d3b0',L:[['Capitale de Karzhad',275,50,{'Orc':3,'Minotaure':3,'Démon':2}],['Camp des caravanes',250,110,{'Gobelin':3,'Orc':2,'Marchand':2}],['Forge impériale',290,6,{'Nain':2,'Minotaure':3,'Forgeron':3}]]},
{n:'Sables d\u2019Orne',x0:22,y0:132,x1:198,y1:232,col:'#ecd9a0',L:[['Oasis d\'Orne',60,190,{'Félin':3,'Drakéen':3}],['Cité des sables',150,205,{'Drakéen':3,'Félin':2,'Marchand':2}]]},
{n:'Marais de Vael',x0:212,y0:178,x1:328,y1:308,col:'#c9d8bd',L:[['Marais de Vael',255,230,{'Gobelin':3,'Revenant':2,'Halfelin':2}],['Ville sur pilotis',290,285,{'Halfelin':3,'Gobelin':2,'Marchand':2}]]},
{n:'Confins de Brume',x0:-125,y0:188,x1:12,y1:308,col:'#d4d8e6',L:[['Temple des Confins',-50,245,{'Gnome':3,'Sylvain':3,'Mystique':3}],['Hameau de la brume',-85,285,{'Revenant':3,'Lutin':2,'Gnome':2}]]}];
const ETR=[];PAYS.forEach(p=>p.L.forEach(l=>{ETR.push(l[0]);P[l[0]]=[l[1],l[2]]}));
{const d=DEF0.find(t=>t.n==='Décor');PAYS.forEach(p=>p.L.forEach(l=>d.o.push([l[0],.2,l[3]])))}
const paysDe=q=>{const f=PAYS.find(p=>q[0]>=p.x0&&q[0]<=p.x1&&q[1]>=p.y0&&q[1]<=p.y1);return f?f.n:(q[1]<41?'Royaume du Nord':q[1]>80?'Marches du Sud':'Terres du Centre')};
const paysObj=n=>PAYS.find(p=>p.n===n);
function construire(){
 const old=DEF0.find(t=>t.n==='Métier').o,om={};old.forEach(x=>om[x[0]]=x);
 const arcs=Object.keys(MET),mt=[];
 arcs.forEach(a=>MET[a].forEach(m=>{const x=om[m[0]],mu=Object.assign({},x?x[2]:{},MX[m[0]]||{});arcs.forEach(b=>{mu[b]=b===a?5:.25});mt.push([m[0],x?x[1]:m[1],mu])}));
 const out=[];
 DEF0.forEach(t=>{
  if(t.n==='Race')out.push({n:'Race',o:RACES.map(r=>[r[0],r[1]])});
  else if(t.n==='Métier')out.push({n:'Métier',o:mt});
  else if(t.n==='Objectif')out.push({n:'Objectif',o:OBJ.map(o=>[o[0],o[1],o[2]||{}])},{n:'Destin',o:DESTIN0},{n:'Cadeau divin',o:CAD0});
  else if(t.vie){const v=t.o.find(x=>x[0]==='Voyage lointain')[2];v['Étape:Lieu']=2.5;v['Étape:Explorer']=3;t.o.push(...EVN);t.o.forEach(x=>{x[2]=x[2]||{};const g=ETAG[x[0]];if(g)x[2]['Étape:Tag:'+g]=1.8});OBJ.forEach(o=>(o[3]||[]).forEach(s=>{if(s.t==='ev'){const e=t.o.find(x=>x[0]===s.v);if(e)e[2]['Étape:Ev:'+s.v]=4}}));out.push(t)}
  else out.push(t);
  if(t.n==='Origine')out.push({n:'Archétype',o:Object.keys(ARCH).map(a=>[a,ARCH[a][0],ARCH[a][1]])})});
 return out}
const DEF=construire();

/* ===================== V3 : difficulté, relations, ennemis nommés, événements du monde ===================== */
const DUR={'Épée':9,'Dague':8,'Arc':8,'Marteau':12,'Bâton':14,'Armure légère':10};   /* nombre de jets avant de se briser */
ITEMS['Potion de soin'].p=14;
const RELF=['Marchands','Couronne','Pègre','Peuple'];
const REL={'Marché florissant':{Marchands:1},'Négociation tendue':{Marchands:1,Couronne:1},'Tournoi':{Couronne:1,Peuple:1},'Banquet':{Couronne:1},'Cambriolage':{Pègre:1,Peuple:-1,Marchands:-1},'Combat de rue':{Peuple:-1,Pègre:1},'Embuscade':{Pègre:-1},
 'Rencontre d\'un allié':{Peuple:1},'Soins d\'un guérisseur':{Peuple:1},'Repos à l\'auberge':{Peuple:1},'Une dette':{Marchands:-1},'Mission de l\'allié':{Pègre:1},'Sortie de la forteresse':{Couronne:1},'Épreuve d\'honneur':{Couronne:1},'Concours de cuisine':{Peuple:1,Marchands:1},'Commande importante':{Marchands:1},'Duel avec le rival':{Peuple:1}};
const RELW={'Rel:Marchands+':{'Marché florissant':1.5,'Négociation tendue':1.4,'Une dette':.6},'Rel:Marchands-':{'Une dette':1.5,'Marché florissant':.7},
 'Rel:Couronne+':{'Tournoi':1.6,'Banquet':1.5,'Épreuve d\'honneur':1.4},'Rel:Couronne-':{'Combat de rue':1.4,'Embuscade':1.3,'Tournoi':.6},
 'Rel:Pègre+':{'Cambriolage':1.5,'Mission de l\'allié':1.3},'Rel:Pègre-':{'Embuscade':1.5,'Combat de rue':1.3},
 'Rel:Peuple+':{'Repos à l\'auberge':1.4,'Rencontre d\'un allié':1.4,'Banquet':1.2},'Rel:Peuple-':{'Combat de rue':1.4,'Une trahison':1.3,'Repos à l\'auberge':.7}};
const MONDE={
'Guerre':{t:'Les armées se mettent en marche : routes dangereuses, armes chères.',w:{'Embuscade':1.6,'Combat de rue':1.4,'Sortie de la forteresse':1.8,'Voyage forcé':1.5,'Tournoi':.4,'Marché florissant':.6}},
'Épidémie':{t:'Une fièvre court les villes : on soigne, on se barricade.',w:{'Une maladie':2.5,'Soins d\'un guérisseur':2,'Repos à l\'auberge':.7,'Marché florissant':.7,'Banquet':.5}},
'Famine':{t:'Les récoltes ont échoué : les vivres sont chers, les ventres vides.',w:{'Une dette':1.6,'Chasse au gibier':1.8,'Banquet':.3,'Concours de cuisine':.3,'Marché florissant':.7}},
'Festival':{t:'Les villes sont en fête : musique, concours et bourses mal gardées.',w:{'Banquet':2,'Tournoi':1.6,'Concours de cuisine':1.6,'Marché florissant':1.5,'Cambriolage':1.3}}};
const NOMS1=['Karg','Veyra','Morlen','Sivaï','Dunmar','Ysolde','Brannoc','Tessa','Ulric','Nahel','Orsa','Kael'];
const NOMS2=['le Borgne','la Louve','aux Mains Rouges','l\'Implacable','de la Brume','le Vieux','la Cendre','sans Nom','du Marais','le Doux'];
DEF.find(t=>t.vie).o.push(['Un rival entre en scène',2,{'Étape:Carte':2,'Étape:Ruines':2,'Étape:Ev:Tournoi':3,'Étape:Tag:combat':2}],['Duel avec le rival',4,{},'Rival']);
Object.assign(EF,{'Un rival entre en scène':{fl:'Rival',Cha:-1},'Duel avec le rival':{PV:-4,or:8,uf:'Rival',jet:['For',11],sc:'combat'}});
Object.assign(ETAG,{'Un rival entre en scène':'social','Duel avec le rival':'combat'});
Object.assign(HIST,{'Un rival entre en scène':'Quelqu\'un vise le même but que lui, et ne compte pas partager.','Duel avec le rival':'Le rival le provoque en public : il faudra régler cela maintenant.'});

/* ===================== V4 : lignées, succès, lieux découverts et exploration ===================== */
const SITES=['Grotte','Forteresse en ruines','Temple englouti','Tour oubliée','Mine abandonnée','Cimetière des anciens rois'];
const SNOMS=['de Brannoc','des Murmures','du Corbeau','de l\'Ombre','des Trois Vents','de la Dernière Lune','du Roi Pâle','des Cendres'];
/* Succès : [nom, condition(C), gain immédiat (transmis aux héritiers si la lignée est fondée)] */
const SUCC=[
["Premier vainqueur",c=>c.fin==='victoire',{or:15},"Le premier de tous les personnages à atteindre son objectif."],
["Première âme perdue",c=>c.fin==='mort',{xp:2},"Le premier de tous à mourir."],
["Mort-né",c=>c.fin==='mort'&&c.vie.length<=1,{st:{End:1}},"Mort dès la toute première action."],
["Chanceux insolent",c=>c.fin==='victoire'&&c.vie.length<=2,{or:20},"Objectif atteint en deux actions ou moins."],
["Première bourse pleine",c=>c.or>=50,{st:{Cha:1}},"Le premier à posséder plus de 50 pièces d'or."],
["Fortune de roi",c=>c.or>=120,{or:20},"Le premier à posséder plus de 120 pièces d'or."],
["Découvreur",c=>c.dec>0,{st:{Esp:1}},"Le premier à découvrir un lieu oublié."],
["Tueur de gardien",c=>c.boss>0,{st:{For:1}},"Le premier à vaincre un gardien."],
["Premier maître",c=>c.comp.some(k=>Math.floor(Math.sqrt(k.xp))>=5),{xp:2},"Le premier à porter une compétence au niveau 5."],
["Vétéran",c=>c.vie.length>=25,{st:{End:1}},"Le premier à vivre 25 événements."],
["Mille lieues",c=>c.vis.length>=6,{st:{End:1}},"Le premier à visiter 6 lieux différents."],
["Vieux sage",c=>c.fin==='mort'&&age()>=70,{st:{Esp:1}},"Le premier à mourir de vieillesse."],
["Ami du monde",c=>Math.max(c.rel.Peuple,c.rel.Marchands,c.rel.Couronne)>=4,{or:10},"Le premier à gagner une confiance complète d'un groupe."],
["Haï de tous",c=>Math.min(c.rel.Peuple,c.rel.Marchands,c.rel.Couronne,c.rel.Pègre)<=-4,{st:{Cha:-1,Agi:1}},"Le premier à être détesté par tout un groupe."],
["Marqué à vie",c=>(c.cic||[]).length>=2,{pvm:2},"Le premier à porter deux cicatrices."],
["Vengeance accomplie",c=>c.vie.some(e=>e.t==="Vengeance de l'ennemi"&&e.ok),{st:{For:1}},"Le premier à triompher de son ennemi juré."],
["Colosse",c=>Object.values(c.st).some(v=>v>=10),{xp:1},"Le premier à atteindre 10 dans une caractéristique."],
["Victoire à l'arraché",c=>c.fin==='victoire'&&c.pv<=2,{or:15},"Victoire avec 2 points de vie ou moins."]];
DEF.find(t=>t.vie).o.push(['Piste d\'un lieu oublié',2,{'Voyageur':2,'Érudit':1.5,'Curieux':2,'Étape:Explorer':2}],['Explorer le site',8,{},'Site']);
Object.assign(ETAG,{'Piste d\'un lieu oublié':'savoir','Explorer le site':'savoir'});
Object.assign(HIST,{'Piste d\'un lieu oublié':'Un vieux récit, une carte effacée : un lieu oublié se dessine enfin.','Explorer le site':'Entre les pierres et l\'ombre, quelque chose attend d\'être trouvé.'});

/* ----- V6 : logique des événements, descriptions, combinaisons, récit ----- */
const EREQ={
"Commande importante":["Artisan","Forgeron","Charpentier","Tisserand","Boulanger","Bijoutier","Alchimiste","Apothicaire","Herboriste","tag:artisanat"],
"Vision étrange":["Mystique","Prêtre","Devin","Médium","Druide","Moine","Démon","Revenant","Curieux","tag:mystique"],
"Cours improvisé":["Érudit","Scribe","Bibliothécaire","Cartographe","Prêtre","Moine","Guérisseur","Chevalier errant"],
"Concours de cuisine":["Aubergiste","Cuisinier","Boulanger","Marchand ambulant","Généreux","tag:hospitalité"],
"Chasse au gibier":["Chasseur","Archer","Éclaireur","Guide","Éleveur","Druide","Chasseur de primes","obj:Arc"],
"Négociation tendue":["Commerçant","Marchand","Noble déchu","Changeur","Aubergiste","Mercenaire","Espion","Caravanier","Marchand ambulant","Cupide"],
"Cambriolage":["Roublard","Voleur","Contrebandier","Espion","Orphelin des rues","Cupide","Menteur","Gobelin"],
"Épreuve d'honneur":["Combattant","Soldat","Gladiateur","Garde de caravane","Chevalier errant","Mercenaire","Fils de soldat","Loyal","Orc","Drakéen","Minotaure"]};
/* Compétences éveillées par une situation + un profil : [événement, réussite exigée, profil (tout est requis), nom, domaine, description] */
const UNL2=[
["Concours de cuisine",true,["Orc","Aubergiste"],"Festin de guerre","hospitalité","Des plats pour des tablées entières, copieux et bruyants."],
["Concours de cuisine",true,["Cuisinier"],"Palais d'or","hospitalité","Un goût sûr : doser, assaisonner, impressionner."],
["Concours de cuisine",true,["Halfelin"],"Gourmandise sacrée","hospitalité","Un art de la table transmis de génération en génération."],
["Chasse au gibier",true,["Elfe"],"Tir silencieux","survie","Abattre sans bruit, sans effrayer le reste de la forêt."],
["Chasse au gibier",true,["Orc"],"Traque brutale","survie","Poursuivre une proie jusqu'à l'épuisement."],
["Chasse au gibier",true,["Félin"],"Bond du prédateur","survie","Une attaque soudaine, venue de nulle part."],
["Commande importante",true,["Nain","Forgeron"],"Maître de forge naine","artisanat","Un travail du métal que seuls les nains osent signer."],
["Commande importante",true,["Gnome"],"Mécanisme ingénieux","artisanat","Ajouter un rouage là où personne n'y aurait pensé."],
["Commande importante",true,["Orc"],"Forge brutale","artisanat","Solide avant d'être beau."],
["Cambriolage",true,["Halfelin"],"Pas de souris","ruse","Ne jamais faire grincer une lame de parquet."],
["Cambriolage",true,["Gobelin"],"Instinct de rat","ruse","Trouver la sortie avant d'entrer."],
["Négociation tendue",true,["Démon"],"Marché infernal","social","Un contrat dont chaque clause est un piège poli."],
["Négociation tendue",true,["Cupide"],"Âpreté au gain","commerce","Ne jamais lâcher une pièce sans en reprendre deux."],
["Épreuve d'honneur",true,["Drakéen"],"Fierté draconique","combat","Ne pas reculer devant un défi."],
["Épreuve d'honneur",true,["Minotaure"],"Charge aveugle","combat","Foncer, cornes en avant."],
["Vision étrange",true,["Elfe"],"Songe des anciens","mystique","Entrevoir la mémoire des forêts."],
["Vision étrange",true,["Revenant"],"Murmure des morts","mystique","Entendre ce que les défunts n'ont pas fini de dire."],
["Cours improvisé",true,["Orc"],"Pédagogie rugueuse","social","Enseigner par l'exemple, et parfois par le choc."],
["Cours improvisé",true,["Gnome"],"Savoir bavard","savoir","Expliquer trois fois plus que nécessaire."],
["Une maladie",true,["Guérisseur"],"Immunité acquise","soin","Avoir déjà vu pire, et en être revenu."],
["Embuscade",true,["Éclaireur"],"Œil de faucon","survie","Repérer l'ennemi avant qu'il ne bouge."],
["Tournoi",true,["Chevalier errant"],"Lance de justice","combat","Un coup franc, une cause défendue."],
["Voyage lointain",true,["Caravanier"],"Chemins de commerçant","voyage","Connaître les bons relais et les bons prix."],
["Marché florissant",true,["Cuisinier"],"Étal réputé","commerce","Un nom qui attire les clients."],
["Tempête en mer",true,["Marin"],"Loup de mer","voyage","Garder le cap quand tout le monde vomit."],
["Fouille des ruines",true,["Gnome"],"Œil d'archéologue","savoir","Voir une histoire dans trois cailloux."],
["Fouille des ruines",true,["Cartographe"],"Relevé des ruines","savoir","Dessiner ce qu'on a vu avant de l'oublier."],
["Un deuil",undefined,["Prêtre"],"Parole de consolation","social","Trouver le mot qui apaise sans mentir."],
["Une trahison",undefined,["Rancunier"],"Mémoire des offenses","social","Ne rien oublier, ni personne."],
["Repos à l'auberge",true,["Aubergiste"],"Œil de l'hôte","hospitalité","Savoir ce dont chaque client a besoin."],
["Repos à l'auberge",true,["Orc"],"Chants de taverne","social","Chanter fort, chanter faux, chanter ensemble."]];
const TAGD={combat:"Aide aux jets de combat : frapper, parer, tenir.",voyage:"Aide aux jets de voyage : routes, rythme, orientation.",social:"Aide aux jets sociaux : parler, convaincre, plaire.",commerce:"Aide aux jets de commerce : prix, contrats, flair.",survie:"Aide aux jets de survie : endurer, se cacher, s'en sortir.",hospitalité:"Aide aux jets d'accueil et de cuisine.",soin:"Aide aux jets de soin : plantes, pansements, remèdes.",savoir:"Aide aux jets de savoir : recherche, mémoire, étude.",ruse:"Aide aux jets de ruse : discrétion, tromperie, agilité.",artisanat:"Aide aux jets d'artisanat : fabriquer, réparer, bâtir.",mystique:"Aide aux jets mystiques : rites, visions, présages."};
const SKD={"Discipline":"La rigueur du soldat : tenir sa position et obéir sous la pression.","Marche forcée":"Avancer longtemps sans s'épuiser.","Escrime pragmatique":"Se battre pour gagner, pas pour la beauté du geste.","Négociation de contrat":"Obtenir de meilleures conditions sur chaque engagement.","Vigilance":"Repérer le danger avant qu'il ne frappe.","Bouclier":"Parer et protéger.","Jeu d'arène":"Se battre devant du public, au rythme de la foule.","Charisme de foule":"Se faire acclamer.","Pistage":"Suivre une trace, un gibier, un fuyard.","Tir précis":"Toucher sa cible à distance.","Lecture des routes":"Choisir le bon chemin selon le terrain.","Camp de fortune":"Passer la nuit dehors sans trop souffrir.","Nœuds et voiles":"Manœuvrer sur l'eau.","Gros temps":"Tenir bon quand la mer se fâche.","Course longue":"Courir loin, vite, longtemps.","Discrétion":"Passer inaperçu.","Recherche":"Trouver l'information dans les livres et les archives.","Rhétorique":"Convaincre par la parole.","Calligraphie":"Écrire proprement et vite.","Faux et usage de faux":"Imiter une écriture, un sceau.","Relevés":"Cartographier un terrain.","Orientation":"Ne pas se perdre.","Forge":"Travailler le métal.","Armes de qualité":"Fabriquer des armes qui durent.","Charpente":"Bâtir en bois.","Résistance":"Encaisser les efforts.","Tissage fin":"Tisser des étoffes de qualité.","Marchandage de tissus":"Vendre du tissu au meilleur prix.","Marchandage":"Discuter chaque prix.","Réseau de routes":"Connaître les relais et ceux qui y vivent.","Qualité des plats":"Cuisiner des plats appréciés.","Écoute des rumeurs":"Entendre ce qui se dit dans les coins.","Évaluation":"Estimer la valeur d'un objet d'un coup d'œil.","Calcul":"Compter juste et vite.","Crochetage":"Ouvrir ce qui est fermé.","Fuite":"Disparaître au bon moment.","Cachettes":"Dissimuler un objet, un colis, soi-même.","Corruption":"Graisser la bonne patte.","Déguisement":"Prendre une autre identité.","Interrogatoire":"Faire parler quelqu'un.","Herboristerie":"Connaître les plantes qui soignent.","Chirurgie de fortune":"Soigner une blessure avec presque rien.","Mélanges":"Préparer des remèdes.","Poisons et antidotes":"Savoir ce qui tue et ce qui sauve.","Rites":"Accomplir des cérémonies.","Réconfort":"Apaiser les autres.","Transmutation":"Transformer la matière.","Distillation":"Extraire l'essence des choses.","Augures":"Lire l'avenir.","Lecture des gens":"Deviner les intentions des autres.","Ténacité humaine":"Continuer quand tout invite à s'arrêter.","Sens de la forêt":"Se mouvoir dans les bois comme chez soi.","Œil du forgeron":"Juger la qualité d'un métal à sa couleur.","Fureur tribale":"Une rage de clan, qui monte dans le combat.","Chance du petit peuple":"Passer entre les gouttes.","Ingéniosité":"Trouver une solution là où il n'y en a pas.","Regard infernal":"Un regard qui fait réfléchir avant de répondre.","Souffle de feu":"L'héritage d'un sang de dragon.","Pas de velours":"Se déplacer sans bruit.","Racines profondes":"Une endurance qui vient de la terre.","Débrouille de bidonville":"Vivre de peu et de ruse.","Charge du labyrinthe":"Foncer tête baissée.","Tour de passe-passe":"Tromper l'œil, charmer l'esprit.","Froid du tombeau":"Ne plus craindre ni la fatigue ni le froid.","Art de la guerre":"Penser un combat comme une manœuvre.","Sens de l'orientation":"Savoir toujours où l'on est.","Mémoire d'archiviste":"Retenir ce que l'on a lu.","Main sûre":"Une main qui ne tremble pas.","Sens des affaires":"Flairer le bon coup.","Doigts agiles":"Une dextérité rare.","Mains apaisantes":"Des gestes qui soulagent.","Intuition":"Sentir ce qui se prépare.","Bagarre":"Savoir se battre, sans plus.","Pied sûr":"Marcher sans trébucher.","Bagout":"Parler pour s'en sortir.","Marchandage de fortune":"Obtenir un meilleur prix à l'instinct.","Système D":"S'en sortir avec ce qu'on a.","Cuisine de campagne":"Un repas honnête avec peu.","Premiers secours":"Les gestes qui évitent le pire.","Curiosité":"Aller voir de plus près.","Débrouillardise":"Se tirer de situations délicates.","Bricolage":"Réparer, ajuster, bricoler.","Intuition naissante":"Une impression qu'il ne sait pas expliquer.","Instinct de survie":"Des réflexes appris dans la douleur.","Sens du duel":"Lire l'adversaire.","Gloire d'arène":"Un nom connu des gradins.","Lecture des ruines":"Comprendre ce que les pierres racontent.","Flair du marché":"Sentir quand acheter, quand vendre.","Pied marin":"Rester debout sur le pont.","Haine froide":"Une colère maîtrisée, durable.","Constitution de fer":"Un corps qui encaisse les maladies.","Méfiance":"Ne plus se fier au premier venu.","Tir à longue portée":"Tirer loin et juste.","Œil de lynx":"Voir ce que les autres ne voient pas.","Chevalerie":"Se battre selon un code.","Éloquence de cour":"Parler avec les puissants.","Reconnaissance":"Explorer avant les autres.","Embuscade tendue":"Préparer un piège.","Conduite d'attelage":"Mener bêtes et chariots.","Troc de route":"Échanger sur le chemin.","Classement":"Ranger pour retrouver.","Mémoire des textes":"Citer de mémoire.","Pétrissage":"Travailler la pâte.","Fournée du matin":"Nourrir tout un village avant l'aube.","Sertissage":"Monter une pierre sur un bijou.","Œil de joaillier":"Reconnaître un faux au premier regard.","Cuisine":"Préparer de bons plats.","Épices rares":"Savoir où trouver le goût.","Dressage":"Se faire obéir des bêtes.","Soin des bêtes":"Soigner les animaux.","Traque":"Retrouver quelqu'un qui se cache.","Cordes et menottes":"Maîtriser sans tuer.","Accouchement":"Aider à mettre au monde.","Parole rassurante":"Calmer ceux qui paniquent.","Cueillette":"Cueillir les bonnes plantes.","Teintures":"Colorer étoffes et peaux.","Voix des morts":"Parler aux défunts.","Langue des bêtes":"Se faire comprendre des animaux.","Cycles de la nature":"Lire les saisons.","Méditation":"Rester calme au cœur du chaos.","Arts martiaux":"Se battre sans arme."};
const REC={
"Voyage forcé":["Chassé de {de}, {n} gagne {vers} et s'y installe tant bien que mal.","Contraint de quitter {de}, {n} arrive à {vers} épuisé."],
"Une rencontre décisive":["{n} fait une rencontre qui change le cours de sa vie.","{n} croise la mauvaise personne au mauvais moment."],
"Une trahison":["{n} est trahi par quelqu'un de proche, mais en tire une leçon.","{n} est trahi par quelqu'un de proche et en sort durement touché."],
"Un héritage inattendu":["Un héritage inattendu tombe dans les mains de {n}.","L'héritage promis à {n} se réduit à presque rien."],
"Une maladie":["{n} tombe malade mais finit par se rétablir.","{n} tombe malade et n'en sort pas indemne."],
"Un coup de chance":["La chance sourit enfin à {n}.","Un coup de chance tourne court pour {n}."],
"Une dette":["{n} rembourse une vieille dette sans y laisser sa chemise.","Une vieille dette rattrape {n}, qui doit payer le prix fort."],
"Un deuil":["{n} perd un proche et trouve la force de continuer.","{n} perd un proche et peine à s'en relever."],
"Repos à l'auberge":["{n} fait halte à l'auberge et reprend des forces.","{n} passe une nuit agitée à l'auberge."],
"Soins d'un guérisseur":["Un guérisseur soigne {n} et le remet sur pied.","Les soins d'un guérisseur ne suffisent pas à soulager {n}."],
"Embuscade":["{n} déjoue une embuscade et s'en sort vainqueur.","{n} tombe dans une embuscade et s'en sort blessé."],
"Combat de rue":["{n} sort vainqueur d'une bagarre de rue.","{n} perd une bagarre de rue."],
"Vengeance de l'ennemi":["Son ennemi jure de se venger ; {n} lui tient tête et l'emporte.","Son ennemi se venge, et {n} en paie le prix."],
"Rencontre d'un allié":["{n} se lie d'amitié avec un allié précieux.","{n} croit trouver un allié, mais l'alliance ne tient pas."],
"Mission de l'allié":["{n} accomplit une mission pour son allié.","La mission confiée par son allié échoue."],
"Marché florissant":["{n} profite d'un marché florissant pour faire de bonnes affaires.","{n} arrive trop tard sur un marché florissant."],
"Tempête en mer":["{n} traverse une tempête en mer et en réchappe.","{n} essuie une tempête en mer et y laisse des plumes."],
"Fouille des ruines":["{n} fouille des ruines et en rapporte quelque chose.","{n} fouille des ruines sans rien trouver d'utile."],
"Piège des ruines":["{n} évite de justesse un piège des ruines.","{n} tombe dans un piège des ruines."],
"Chasse au trésor":["Guidé par une carte, {n} met la main sur un trésor.","{n} suit une carte au trésor, mais la piste est fausse."],
"Tournoi":["{n} remporte un tournoi.","{n} est éliminé lors d'un tournoi."],
"Banquet":["{n} est convié à un banquet et s'y fait des relations.","Un banquet tourne mal pour {n}."],
"Source dans la forêt":["{n} trouve une source dans la forêt et s'y ressource.","{n} cherche une source dans la forêt et s'y perd."],
"Sortie de la forteresse":["{n} mène une sortie hors de la forteresse et repousse l'assaillant.","La sortie hors de la forteresse tourne mal pour {n}."],
"Commande importante":["{n} honore une commande importante, à la satisfaction du client.","{n} manque une commande importante."],
"Vision étrange":["{n} a une vision étrange dont il garde le souvenir.","Une vision étrange laisse {n} troublé."],
"Cours improvisé":["{n} improvise un cours et transmet un peu de son savoir.","{n} improvise un cours qui tourne à la confusion."],
"Concours de cuisine":["{n} participe à un concours de cuisine et épate les juges.","{n} participe à un concours de cuisine et rate son plat."],
"Chasse au gibier":["{n} part à la chasse et rapporte du gibier.","{n} rentre bredouille d'une chasse."],
"Négociation tendue":["{n} mène une négociation tendue à son avantage.","Une négociation tendue tourne mal pour {n}."],
"Cambriolage":["{n} réussit un cambriolage sans se faire prendre.","{n} se fait presque prendre lors d'un cambriolage."],
"Épreuve d'honneur":["{n} relève une épreuve d'honneur et en sort grandi.","{n} échoue à une épreuve d'honneur."],
"Un rival entre en scène":["Un rival entre en scène ; {n} garde la tête froide.","Un rival entre en scène et prend l'avantage sur {n}."],
"Duel avec le rival":["{n} affronte son rival en duel et l'emporte.","{n} perd son duel contre son rival."],
"Piste d'un lieu oublié":["{n} suit la piste d'un lieu oublié et le découvre.","{n} suit une piste, mais elle s'efface."],
"Explorer le site":["{n} explore le site découvert et en tire profit.","{n} explore le site et y laisse des forces."]};
const RDESC={"Humain":"Taille moyenne, peau et cheveux de toutes teintes : on lui trouve toujours un air de famille avec quelqu'un.","Elfe":"Grand et fin, les oreilles pointues, le regard clair. Il bouge sans bruit.","Nain":"Petit, large, barbu, les mains marquées par le travail du métal.","Orc":"Grand, massif, la peau verte, des crocs qui dépassent. Il se tient droit, comme pour se faire respecter.","Halfelin":"Petit, rond, pieds nus et cheveux bouclés. Un sourire tranquille.","Gnome":"Minuscule, coiffé d'un bonnet pointu, toujours en train de bricoler quelque chose.","Démon":"Peau rouge sombre, petites cornes, regard perçant. On ne sait jamais s'il plaisante.","Drakéen":"Écailles vertes, crête osseuse, une fierté de dragon dans le regard.","Félin":"Oreilles de chat, moustaches fines, démarche souple, yeux qui captent la lumière.","Sylvain":"Peau mêlée d'écorce, feuilles dans les cheveux : on le croirait né d'un arbre.","Gobelin":"Petit, vert, les oreilles larges, les yeux qui ne s'arrêtent jamais.","Minotaure":"Immense, tête de taureau, cornes recourbées. Il baisse la tête pour passer les portes.","Lutin":"Minuscule, pointu, un éclat malicieux dans l'œil. Il flotte plus qu'il ne marche.","Revenant":"Pâle, froid au toucher, le regard vide de ceux qui ont déjà vu l'autre côté."};

/* ===================== V7 : famille, rumeurs, commandement ===================== */
DEF.find(t=>t.vie).o.push(["Rumeur entendue",2.2,{"Repos à l'auberge":3,"Aubergiste":2,"Marchand ambulant":1.5,"Cité portuaire":1.5,"Banquet":2}],
["Rencontre amoureuse",1.6,{"Généreux":1.5,"Banquet":2.5,"Repos à l'auberge":1.5,"Noble déchu":1.3}],
["Mariage",4,{"Banquet":1.5},"Amoureux"],
["Naissance d'un enfant",3,{},"Marié"],
["Commandement",3,{"Combattant":1.5,"Commerçant":1.3},"Gradé"]);
Object.assign(EF,{"Rumeur entendue":{},"Rencontre amoureuse":{fl:"Amoureux",Cha:1},"Mariage":{fl:"Marié",uf:"Amoureux",or:-5,sc:"marche"},"Naissance d'un enfant":{or:-3,EN:-1},"Commandement":{or:8,Cha:1,jet:["Cha",9]}});
Object.assign(ETAG,{"Rumeur entendue":"social","Rencontre amoureuse":"social","Mariage":"hospitalité","Naissance d'un enfant":"social","Commandement":"social"});
Object.assign(REL,{"Commandement":{Peuple:1},"Mariage":{Peuple:1}});
Object.assign(HIST,{
"Rumeur entendue":"Au détour d'une conversation, quelqu'un parle d'un lieu, d'un secret, d'un service à rendre.",
"Rencontre amoureuse":"Un regard, un sourire : quelque chose se noue sans que personne ne l'ait décidé.",
"Mariage":"Une cérémonie modeste, quelques amis, et une nouvelle vie à deux.",
"Naissance d'un enfant":"Un cri dans la maison : la vie continue autrement.",
"Commandement":"On attend de lui des ordres, et il apprend à les donner.",
"Héritage familial":"Un parent a laissé quelques affaires, un savoir-faire et un peu d'or.",
"Brouillé avec les siens":"Il part sans rien demander et sans rien emporter."});
Object.assign(REC,{
"Rumeur entendue":["{n} tend l'oreille et recueille une rumeur qui pourrait rapporter.","{n} écoute une rumeur, mais personne ne sait rien de précis."],
"Rencontre amoureuse":["{n} fait une rencontre qui lui fait battre le cœur.","{n} s'éprend de quelqu'un qui ne le remarque pas."],
"Mariage":["{n} se marie.","{n} se marie dans la tristesse."],
"Naissance d'un enfant":["{n} devient parent.","{n} devient parent dans des conditions difficiles."],
"Commandement":["{n} prend la tête d'un groupe et se fait obéir.","{n} prend un commandement, mais perd le contrôle."]});

/* ===================== V8 : variété (race, métier, chaînes, saisons) ===================== */
DEF.find(t=>t.vie).o.push(
["Journée de travail",3,{"Voyage lointain":.5,"Épuisé":.4,"Blessé":.5}],
["Chant des anciens",1.8,{"Forêt interdite":2}],["Concours de force",1.8,{"Village de montagne":1.5,"Forteresse assiégée":1.5}],
["Soirée de taverne",1.8,{"Cité portuaire":1.5,"Ivrogne":2,"Banquet":1.5}],["Gadget instable",1.5,{}],
["Pacte dans l'ombre",1.2,{"Capitale en révolte":2}],["Chasse en meute",1.6,{"Forêt interdite":2}],["Mémoire des défunts",1.2,{}],
["Embrouille de ruelle",1.8,{"Capitale en révolte":2,"Cité portuaire":1.5}],["Cercle des herbes",1.6,{"Forêt interdite":2}],
["Tour de passe-passe",1.6,{"Banquet":1.5,"Marché florissant":1.5}],
["Client difficile",2,{"Cité portuaire":1.5}],["Livraison urgente",1.8,{}],["Patrouille",1.8,{"Forteresse assiégée":2,"Capitale en révolte":1.5}],
["Épidémie au village",1.4,{"Village de montagne":2}],["Manuscrit rare",1.5,{"Capitale en révolte":1.5,"Désert aux ruines":1.5}],
["Pièce d'orfèvrerie",1.4,{}],["Cérémonie",1.6,{}],["Dressage d'une bête",1.4,{"Forêt interdite":1.5}],["Contrat de prime",1.4,{}],["Partie de dés",1.5,{"Cité portuaire":1.5}],
["Lettre mystérieuse",1.2,{}],["Lettre déchiffrée",4,{},"Lettre"],["Dette de jeu",.9,{"Joueur":3,"Cupide":1.5}],["Le créancier revient",4,{},"Créancier"],
["Un disciple se présente",3,{},"Gradé"],["Succès de l'élève",4,{},"Élève"],
["Fête des récoltes",.3,{"Automne":8,"Village de montagne":1.5}],["Hiver rigoureux",.3,{"Hiver":8}],["Pluie torrentielle",.3,{"Pluie":8,"Orage":6}],["Incendie",1,{}]);
Object.assign(EF,{
"Journée de travail":{or:4},"Chant des anciens":{EN:3,PV:1},"Concours de force":{or:8,jet:["For",10],EN:-1},"Soirée de taverne":{EN:3,PV:1,or:-2,sc:"marche"},
"Gadget instable":{or:10,jet:["Esp",10],PV:-2},"Pacte dans l'ombre":{or:12,jet:["Cha",10],PV:-3},"Chasse en meute":{it:"Ration",EN:2,jet:["Agi",9]},
"Mémoire des défunts":{Esp:1,EN:-1},"Embrouille de ruelle":{or:8,jet:["Agi",10],PV:-2},"Cercle des herbes":{PV:3,EN:3},"Tour de passe-passe":{or:6,jet:["Cha",9]},
"Client difficile":{or:8,jet:["Cha",9],EN:-1},"Livraison urgente":{or:10,EN:-2,jet:["End",9]},"Patrouille":{or:5,jet:["Esp",9],PV:-2},
"Épidémie au village":{or:10,jet:["Esp",10],PV:-3},"Manuscrit rare":{or:6,jet:["Esp",9],it:"Livre"},"Pièce d'orfèvrerie":{or:14,jet:["Esp",10],EN:-1},
"Cérémonie":{EN:2,PV:1},"Dressage d'une bête":{jet:["Cha",9],EN:-1},"Contrat de prime":{or:14,jet:["For",10],PV:-3},"Partie de dés":{or:10,jet:["Cha",9]},
"Lettre mystérieuse":{fl:"Lettre"},"Lettre déchiffrée":{jet:["Esp",9],uf:"Lettre",it:"Carte au trésor",or:5},"Dette de jeu":{fl:"Créancier",or:6},
"Le créancier revient":{jet:["Cha",10],uf:"Créancier",or:-8,PV:-3},"Un disciple se présente":{fl:"Élève",Cha:1},"Succès de l'élève":{or:10,uf:"Élève",Cha:1},
"Fête des récoltes":{EN:3,or:3,PV:1,sc:"marche"},"Hiver rigoureux":{PV:-2,EN:-2,jet:["End",9]},"Pluie torrentielle":{EN:-2,jet:["Agi",8]},"Incendie":{PV:-3,or:-4,jet:["End",10]}});
Object.assign(ETAG,{"Chant des anciens":"mystique","Concours de force":"combat","Soirée de taverne":"hospitalité","Gadget instable":"artisanat","Pacte dans l'ombre":"ruse","Chasse en meute":"survie","Mémoire des défunts":"mystique","Embrouille de ruelle":"ruse","Cercle des herbes":"soin","Tour de passe-passe":"social","Client difficile":"commerce","Livraison urgente":"voyage","Patrouille":"combat","Épidémie au village":"soin","Manuscrit rare":"savoir","Pièce d'orfèvrerie":"artisanat","Cérémonie":"mystique","Dressage d'une bête":"survie","Contrat de prime":"combat","Partie de dés":"ruse","Lettre mystérieuse":"savoir","Lettre déchiffrée":"savoir","Dette de jeu":"commerce","Le créancier revient":"social","Fête des récoltes":"hospitalité","Hiver rigoureux":"survie","Pluie torrentielle":"voyage","Incendie":"survie"});
Object.assign(REL,{"Épidémie au village":{Peuple:2},"Cérémonie":{Peuple:1},"Succès de l'élève":{Peuple:1},"Patrouille":{Couronne:1},"Livraison urgente":{Marchands:1},"Client difficile":{Marchands:1},"Contrat de prime":{Pègre:-1},"Partie de dés":{Pègre:1},"Embrouille de ruelle":{Pègre:1}});
Object.assign(EREQ,{
"Chant des anciens":["Elfe","Sylvain","Druide"],"Concours de force":["Orc","Minotaure","Drakéen","Nain","Forgeron","Gladiateur","Soldat"],
"Soirée de taverne":["Nain","Gnome","Halfelin","Aubergiste","Ivrogne","Orc"],"Gadget instable":["Gnome","Lutin","Alchimiste","Bijoutier","Charpentier"],
"Pacte dans l'ombre":["Démon","Revenant","Contrebandier","Menteur","Cupide"],"Chasse en meute":["Félin","Orc","Gobelin","Chasseur","Éclaireur"],
"Mémoire des défunts":["Revenant","Démon","Médium","Prêtre"],"Embrouille de ruelle":["Gobelin","Halfelin","Lutin","Voleur","Orphelin des rues"],
"Cercle des herbes":["Sylvain","Elfe","Druide","Herboriste","Guérisseur","Sage-femme"],"Tour de passe-passe":["Lutin","Halfelin","Gobelin","Voleur","Marchand ambulant"],
"Client difficile":["Commerçant","Artisan","Aubergiste","Cuisinier","Boulanger","Marchand ambulant","Changeur"],"Livraison urgente":["Messager","Caravanier","Marchand ambulant","Éclaireur","Garde de caravane","Guide"],
"Patrouille":["Soldat","Mercenaire","Garde de caravane","Chevalier errant","Archer"],"Épidémie au village":["Guérisseur","Apothicaire","Herboriste","Sage-femme","Soigneur"],
"Manuscrit rare":["Érudit","Scribe","Bibliothécaire","Cartographe","Mystique"],"Pièce d'orfèvrerie":["Bijoutier","Forgeron","Charpentier","Tisserand"],
"Cérémonie":["Prêtre","Moine","Druide","Médium"],"Dressage d'une bête":["Éleveur","Chasseur","Archer","Druide","Éclaireur"],
"Contrat de prime":["Chasseur de primes","Mercenaire","Espion","Gladiateur"],"Partie de dés":["Joueur","Cupide","Contrebandier","Voleur","Mercenaire","Gladiateur"]});
Object.assign(HIST,{
"Journée de travail":"Un métier, ce sont d'abord des journées ordinaires, bien remplies.",
"Chant des anciens":"Un chant très vieux monte du sous-bois ; il le reconnaît sans l'avoir jamais appris.","Concours de force":"On aligne les costauds sur la place : bras de fer, pierres à soulever, paris.",
"Soirée de taverne":"Chopes, chants, histoires qui grossissent à chaque tour.","Gadget instable":"Un rouage de trop, un ressort mal réglé : l'invention est prête, ou presque.",
"Pacte dans l'ombre":"Une proposition glissée à voix basse : on offre beaucoup, en échange d'un détail.","Chasse en meute":"On chasse mieux à plusieurs, surtout quand chacun a des crocs.",
"Mémoire des défunts":"Des voix anciennes remontent : des noms, des dettes, des adieux.","Embrouille de ruelle":"Une ruelle, un badaud pressé, une bourse qui change de main.",
"Cercle des herbes":"Autour d'un feu d'herbes, on partage tisanes et savoirs.","Tour de passe-passe":"Une pièce disparaît, puis revient d'une oreille : la foule applaudit.",
"Client difficile":"Un client trouve tout trop cher, trop lent, pas assez bien.","Livraison urgente":"Un colis, une échéance, un chemin boueux.",
"Patrouille":"Nuit froide sur les remparts, et quelqu'un qui remue dans le noir.","Épidémie au village":"La fièvre court de maison en maison ; on attend quelqu'un qui sache.",
"Manuscrit rare":"Un manuscrit qu'on croyait perdu, et dont chaque ligne a du prix.","Pièce d'orfèvrerie":"Une commande de prix : chaque détail compte.",
"Cérémonie":"Les fidèles attendent, et il faut dire les mots justes.","Dressage d'une bête":"Une bête méfiante, de la patience, un peu de nourriture.",
"Contrat de prime":"Un nom, une récompense, une piste froide à réchauffer.","Partie de dés":"Les dés roulent, les mises montent, les visages se ferment.",
"Lettre mystérieuse":"Une lettre sans signature, écrite dans un code étrange.","Lettre déchiffrée":"Les signes se mettent en place : le message a un sens.",
"Dette de jeu":"Une soirée de trop : la dette est lourde et le créancier patient.","Le créancier revient":"Le créancier est là, poli et inflexible.",
"Un disciple se présente":"Quelqu'un frappe à la porte : on voudrait apprendre de lui.","Succès de l'élève":"L'élève réussit seul ce qu'on lui a appris.",
"Fête des récoltes":"Les granges sont pleines, les tables dressées, la danse commence.","Hiver rigoureux":"Le gel mord, les routes se ferment, il faut tenir.",
"Pluie torrentielle":"Le ciel se vide : les chemins deviennent des ruisseaux.","Incendie":"De la fumée, des cris : la maison voisine brûle."});
Object.assign(REC,{
"Journée de travail":["{n} exerce son métier de {job} et la journée est bonne.","{n} exerce son métier de {job}, mais la journée est mauvaise."],
"Chant des anciens":["{n} entend le chant des anciens et s'y ressource.","{n} entend le chant des anciens et s'en trouve troublé."],
"Concours de force":["{n} remporte un concours de force.","{n} perd un concours de force."],"Soirée de taverne":["{n} passe une joyeuse soirée de taverne.","{n} passe une soirée de taverne qui tourne mal."],
"Gadget instable":["Le gadget de {n} fonctionne, contre toute attente.","Le gadget de {n} explose."],"Pacte dans l'ombre":["{n} conclut un pacte dans l'ombre, et en tire profit.","{n} conclut un pacte dans l'ombre, et le regrette."],
"Chasse en meute":["{n} chasse en meute et rapporte du gibier.","{n} chasse en meute, mais la proie s'échappe."],"Mémoire des défunts":["{n} écoute la mémoire des défunts et en garde un enseignement.","{n} écoute la mémoire des défunts et en sort bouleversé."],
"Embrouille de ruelle":["{n} réussit une embrouille de ruelle.","{n} se fait repérer lors d'une embrouille de ruelle."],"Cercle des herbes":["{n} rejoint un cercle des herbes et en revient régénéré.","{n} rejoint un cercle des herbes, sans grand effet."],
"Tour de passe-passe":["{n} épate la foule avec un tour de passe-passe.","{n} rate un tour de passe-passe devant la foule."],"Client difficile":["{n} vient à bout d'un client difficile.","{n} perd patience face à un client difficile."],
"Livraison urgente":["{n} livre un colis à temps.","{n} arrive trop tard avec un colis."],"Patrouille":["{n} fait sa patrouille sans incident.","{n} est surpris pendant sa patrouille."],
"Épidémie au village":["{n} aide un village frappé par la fièvre.","{n} ne parvient pas à endiguer la fièvre."],"Manuscrit rare":["{n} met la main sur un manuscrit rare.","{n} laisse filer un manuscrit rare."],
"Pièce d'orfèvrerie":["{n} réalise une pièce d'orfèvrerie remarquable.","{n} abîme une pièce d'orfèvrerie."],"Cérémonie":["{n} conduit une cérémonie qui touche les fidèles.","{n} trébuche pendant une cérémonie."],
"Dressage d'une bête":["{n} apprivoise une bête.","{n} échoue à dresser une bête."],"Contrat de prime":["{n} remplit un contrat de prime.","{n} échoue à remplir un contrat de prime."],
"Partie de dés":["{n} gagne une partie de dés.","{n} perd une partie de dés."],"Lettre mystérieuse":["{n} reçoit une lettre mystérieuse.","{n} reçoit une lettre mystérieuse."],
"Lettre déchiffrée":["{n} déchiffre la lettre mystérieuse.","{n} ne parvient pas à déchiffrer la lettre."],"Dette de jeu":["{n} s'endette au jeu.","{n} s'endette au jeu."],
"Le créancier revient":["{n} règle sa dette de jeu.","{n} ne peut pas rembourser son créancier."],"Un disciple se présente":["Un disciple se présente et {n} le prend sous son aile.","Un disciple se présente et {n} le prend sous son aile."],
"Succès de l'élève":["L'élève de {n} réussit brillamment.","L'élève de {n} réussit brillamment."],"Fête des récoltes":["{n} profite de la fête des récoltes.","{n} profite de la fête des récoltes."],
"Hiver rigoureux":["{n} traverse un hiver rigoureux.","{n} souffre d'un hiver rigoureux."],"Pluie torrentielle":["{n} traverse une pluie torrentielle.","{n} est trempé par une pluie torrentielle."],
"Incendie":["{n} aide à éteindre un incendie.","{n} est brûlé en voulant éteindre un incendie."]});
/* lieu atteint : une fois arrivé quelque part par un voyage, c'est acquis */
const atteint=v=>((C.arr||C.vis.slice(1)).includes(v));

/* ===================== V10 ===================== */
DEF.find(t=>t.vie).o.push(
["Retour du rival",3,{},"Rival"],["Leçon du mentor",3,{},"Mentor"],["Lettre de l'être aimé",3,{},"Amoureux"],
["Querelle de lignées",3,{},"Lignée rivale"],["Soutien de la lignée alliée",3,{},"Lignée alliée"],
["Faiblesse de l'âge",3,{},"Âgé"],["Testament",2,{},"Âgé"],["Conseil aux jeunes",2,{},"Âgé"],
["Chanson de taverne",2,{"Cité portuaire":1.5,"Soirée de taverne":3},"Légende"],["Fantôme croisé",1.5,{"Désert aux ruines":2,"Forêt interdite":1.5},"Légende"],["Épée célèbre aperçue",1.5,{"Forteresse assiégée":1.5},"Légende"],
["Épreuve de maîtrise",3,{},"Gradé"],["Chef-d'œuvre",2,{},"Maître"],
["Réconciliation tardive",.1,{}],["Le prêteur patient",.1,{}],["Écho d'un ancien ami",.1,{}],["Visite du convalescent",.1,{}],["Retour des brigands",.1,{}],["Veillée de souvenirs",.1,{}],["Le voisin soupçonneux",.1,{}]);
Object.assign(EF,{
"Retour du rival":{jet:["Agi",9],or:6,PV:-2,sc:"combat"},"Leçon du mentor":{xp:1,EN:1,Esp:1},"Lettre de l'être aimé":{EN:2,PV:1,Cha:1},
"Querelle de lignées":{jet:["Cha",9],PV:-1,or:-2},"Soutien de la lignée alliée":{or:6,EN:1},
"Faiblesse de l'âge":{PV:-2,EN:-2,jet:["End",8]},"Testament":{EN:1},"Conseil aux jeunes":{Cha:1,EN:1},
"Chanson de taverne":{EN:2,Cha:1,or:2},"Fantôme croisé":{Esp:1,EN:-1,jet:["Esp",8]},"Épée célèbre aperçue":{or:5,Esp:1},
"Épreuve de maîtrise":{jet:["Esp",8],or:8,xp:1},"Chef-d'œuvre":{or:20,Cha:1},
"Réconciliation tardive":{Cha:1,EN:2},"Le prêteur patient":{or:-5,jet:["Cha",8]},"Écho d'un ancien ami":{or:4,EN:2},"Visite du convalescent":{PV:2,or:3},
"Retour des brigands":{PV:-3,or:5,jet:["Agi",9],sc:"combat"},"Veillée de souvenirs":{EN:2,Esp:1},"Le voisin soupçonneux":{or:-3,jet:["Cha",8]}});
Object.assign(ETAG,{"Retour du rival":"combat","Leçon du mentor":"savoir","Épreuve de maîtrise":"savoir","Chef-d'œuvre":"artisanat","Chanson de taverne":"hospitalité","Fantôme croisé":"mystique","Le prêteur patient":"commerce","Retour des brigands":"combat"});
Object.assign(HIST,{
"Retour du rival":"Un visage connu, un sourire sans chaleur : le rival est de retour.","Leçon du mentor":"Le mentor est là, et il a encore quelque chose à apprendre à son élève.",
"Lettre de l'être aimé":"Une lettre au papier froissé, écrite d'une main qu'on reconnaît entre toutes.","Querelle de lignées":"Deux lignées se croisent, et les vieilles rancunes aussi.",
"Soutien de la lignée alliée":"Une main se tend, celle d'une lignée amie de longue date.","Faiblesse de l'âge":"Le corps proteste : il n'a plus vingt ans.",
"Testament":"On pense à ce qu'on laissera, et à qui.","Conseil aux jeunes":"Les jeunes écoutent, parfois, ce que l'âge a appris.",
"Chanson de taverne":"Au fond de la salle, quelqu'un entonne une chanson sur un héros disparu.","Fantôme croisé":"Une silhouette pâle, un nom murmuré : une légende ne dort jamais tout à fait.",
"Épée célèbre aperçue":"Une lame dont on parle depuis des générations, enfin sous les yeux.","Épreuve de maîtrise":"Les pairs observent : il faut prouver que le rang est mérité.",
"Chef-d'œuvre":"Des années de gestes, résumées en une seule pièce.","Réconciliation tardive":"Une vieille querelle s'éteint enfin, faute de combattants.",
"Le prêteur patient":"La dette n'était pas oubliée, seulement mise de côté.","Écho d'un ancien ami":"Une voix du passé, comme si les années n'avaient pas compté.",
"Visite du convalescent":"Celui qu'on a aidé revient, debout, avec un panier.","Retour des brigands":"Ils sont revenus, plus nombreux, et rancuniers.",
"Veillée de souvenirs":"Autour d'un feu, on se rappelle ceux qui ne sont plus là.","Le voisin soupçonneux":"Un regard en coin, une porte qui se ferme trop vite."});
Object.assign(REC,{
"Retour du rival":["{n} tient tête au rival qui reparaît.","{n} perd la manche contre son rival."],"Leçon du mentor":["{n} reçoit une leçon de son mentor.","{n} reçoit une leçon de son mentor."],
"Lettre de l'être aimé":["{n} reçoit une lettre de l'être aimé.","{n} reçoit une lettre de l'être aimé."],"Querelle de lignées":["{n} apaise une querelle entre lignées.","{n} se heurte à une lignée rivale."],
"Soutien de la lignée alliée":["{n} reçoit l'aide d'une lignée alliée.","{n} reçoit l'aide d'une lignée alliée."],"Faiblesse de l'âge":["{n} sent l'âge peser, mais tient bon.","{n} cède un instant à la faiblesse de l'âge."],
"Testament":["{n} met ses affaires en ordre.","{n} met ses affaires en ordre."],"Conseil aux jeunes":["{n} conseille les plus jeunes.","{n} conseille les plus jeunes."],
"Chanson de taverne":["{n} entend une chanson sur un héros d'autrefois.","{n} entend une chanson sur un héros d'autrefois."],"Fantôme croisé":["{n} croise un fantôme sans trembler.","{n} s'enfuit devant un fantôme."],
"Épée célèbre aperçue":["{n} aperçoit une épée célèbre.","{n} aperçoit une épée célèbre."],"Épreuve de maîtrise":["{n} réussit l'épreuve de maîtrise.","{n} échoue à l'épreuve de maîtrise."],
"Chef-d'œuvre":["{n} achève son chef-d'œuvre.","{n} achève son chef-d'œuvre."],"Réconciliation tardive":["{n} se réconcilie enfin.","{n} se réconcilie enfin."],
"Le prêteur patient":["{n} règle ce qu'il doit au prêteur.","{n} ne peut payer le prêteur."],"Écho d'un ancien ami":["{n} retrouve un ancien ami.","{n} retrouve un ancien ami."],
"Visite du convalescent":["{n} reçoit la visite de celui qu'il a aidé.","{n} reçoit la visite de celui qu'il a aidé."],"Retour des brigands":["{n} repousse les brigands revenus.","{n} subit le retour des brigands."],
"Veillée de souvenirs":["{n} veille et se souvient.","{n} veille et se souvient."],"Le voisin soupçonneux":["{n} calme un voisin soupçonneux.","{n} se brouille avec un voisin soupçonneux."]});
Object.assign(MONDE,{
'Grande foire':{t:'Les marchands affluent : étals, spectacles et bonnes affaires.',w:{'Marché florissant':2.2,'Tour de passe-passe':2,'Client difficile':1.6,'Embuscade':.7}},
'Éclipse':{t:'Le soleil s\u2019éteint en plein jour : superstitions et visions.',w:{'Vision étrange':2.5,'Cérémonie':2,'Mémoire des défunts':2,'Fantôme croisé':2}},
'Paix des rois':{t:'Les couronnes s\u2019accordent : routes sûres, tournois et fêtes.',w:{'Tournoi':2.2,'Banquet':1.8,'Embuscade':.5,'Patrouille':.6}},
'Brigandage':{t:'Les routes ne sont plus sûres, les bourses encore moins.',w:{'Embuscade':2,'Cambriolage':1.8,'Retour des brigands':3,'Livraison urgente':.7}}});
const CHAIN={'Une trahison':['Réconciliation tardive'],'Une dette':['Le prêteur patient'],'Une rencontre décisive':["Écho d'un ancien ami"],'Une maladie':['Visite du convalescent'],'Embuscade':['Retour des brigands'],'Un deuil':['Veillée de souvenirs'],'Cambriolage':['Le voisin soupçonneux']};

/* ===================== V11 : événements ===================== */
DEF.find(t=>t.vie).o.push(
["Nouvelles d'un proche",3,{},"Proche"],["Visite d'une tombe",4,{},"Tombe ici"],["Bien abandonné retrouvé",3,{},"Bien ici"],["Écho d'une fondation",3,{},"Fondation ici"],
["Souvenirs de la crise",3,{},"Séquelles"],["Orphelins recueillis",2,{},"Séquelles"],["Reconstruction",2.5,{},"Séquelles"],
["Passage de la frontière",3,{},"Étranger"],["Barrière de la langue",3,{},"Étranger"],["Guilde étrangère",2,{},"Étranger"],
["Marché lointain",.05,Object.fromEntries(ETR.map(n=>[n,12]))],["Caravane en route",.05,Object.fromEntries(ETR.map(n=>[n,8]))]);
Object.assign(EF,{
"Nouvelles d'un proche":{EN:2,Cha:1},"Visite d'une tombe":{Esp:1,EN:1},"Bien abandonné retrouvé":{or:3},"Écho d'une fondation":{or:4,Cha:1},
"Souvenirs de la crise":{Esp:1,EN:-1},"Orphelins recueillis":{Cha:1,or:-2},"Reconstruction":{or:6,EN:-1,jet:["End",8]},
"Passage de la frontière":{jet:["Cha",8],or:-2},"Barrière de la langue":{jet:["Esp",8],EN:-1},"Guilde étrangère":{or:8,jet:["Cha",9]},
"Marché lointain":{or:7,jet:["Cha",8]},"Caravane en route":{or:5,EN:1}});
Object.assign(ETAG,{"Marché lointain":"commerce","Guilde étrangère":"commerce","Barrière de la langue":"savoir","Passage de la frontière":"ruse","Reconstruction":"survie"});
Object.assign(HIST,{
"Nouvelles d'un proche":"Un message de la famille, passé de main en main jusqu'ici.","Visite d'une tombe":"Une pierre usée, un nom qu'on lit à voix basse.",
"Bien abandonné retrouvé":"Une porte close depuis des années, et une clé qui tourne encore.","Écho d'une fondation":"Quelqu'un a bâti ici avant vous, et le lieu s'en souvient.",
"Souvenirs de la crise":"On parle encore de la crise, à mots couverts.","Orphelins recueillis":"Des enfants sans foyer, et une place à table.",
"Reconstruction":"Les murs se relèvent, pierre après pierre.","Passage de la frontière":"Un poste, des gardes, des questions en une langue qu'on devine.",
"Barrière de la langue":"On se comprend à moitié, par gestes et par sourires.","Guilde étrangère":"Une guilde du pays, curieuse de l'étranger.",
"Marché lointain":"Des étals inconnus, des épices dont on ignore le nom.","Caravane en route":"Une caravane s'étire sur la piste ; on vous fait une place."});
Object.assign(REC,{
"Nouvelles d'un proche":["{n} reçoit des nouvelles d'un proche.","{n} reçoit des nouvelles d'un proche."],"Visite d'une tombe":["{n} se recueille sur une tombe.","{n} se recueille sur une tombe."],
"Bien abandonné retrouvé":["{n} retrouve un bien abandonné.","{n} retrouve un bien abandonné."],"Écho d'une fondation":["{n} découvre ce que d'autres ont bâti ici.","{n} découvre ce que d'autres ont bâti ici."],
"Souvenirs de la crise":["{n} entend les souvenirs de la crise.","{n} entend les souvenirs de la crise."],"Orphelins recueillis":["{n} recueille des orphelins.","{n} recueille des orphelins."],
"Reconstruction":["{n} participe à la reconstruction.","{n} s'épuise à la reconstruction."],"Passage de la frontière":["{n} passe la frontière sans encombre.","{n} se heurte aux gardes de la frontière."],
"Barrière de la langue":["{n} se fait comprendre malgré la langue.","{n} se heurte à la barrière de la langue."],"Guilde étrangère":["{n} gagne la confiance d'une guilde étrangère.","{n} déplaît à une guilde étrangère."],
"Marché lointain":["{n} fait de bonnes affaires sur un marché lointain.","{n} se fait avoir sur un marché lointain."],"Caravane en route":["{n} voyage avec une caravane.","{n} voyage avec une caravane."]});

RDESC["Sang-mêlé"]="Né de deux peuples, il garde un peu de chacun : ni tout à fait d'ici, ni tout à fait d'ailleurs.";
/* carte.js : icônes de race, carte plein écran (monde, pays, ville), voyages et scènes animées */
const NS='http://www.w3.org/2000/svg';
const RC={Humain:'#e0b48a',Elfe:'#ecd6bd',Nain:'#d9a273',Orc:'#7fa650',Halfelin:'#e8c19a',Gnome:'#e6b89a',Démon:'#c0504d',Drakéen:'#5fa68a',Félin:'#d9a35c',Sylvain:'#8aa05a',Gobelin:'#8fb04a',Minotaure:'#a8794f',Lutin:'#e9c9d8',Revenant:'#b9c7cf'};
function icone(r){
 if(r==='Sang-mêlé'){let p=[];try{p=parents()}catch(e){}return '<defs><clipPath id="hl"><rect x="-14" y="-14" width="14" height="28"/></clipPath><clipPath id="hr"><rect x="0" y="-14" width="14" height="28"/></clipPath></defs><g clip-path="url(#hl)">'+icone(p[0]||'Humain')+'</g><g clip-path="url(#hr)">'+icone(p[1]||'Orc')+'</g>'}
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
 else if(r==='Gobelin'){ar='<path d="M-5.5 -.5l-6-3.5 1.2 5.4zM5.5 -.5l6-3.5-1.2 5.4z" fill="'+c+'" stroke="#3b2a1a" stroke-width=".4"/>';av='<path d="M-1.6 3.4l.6-1.6.6 1.6zM1 3.4l.6-1.6.6 1.6z" fill="#fff"/>'}
 else if(r==='Minotaure'){ar='<path d="M-4.6 -4q-2.5-4.5-6.2-3.6M4.6 -4q2.5-4.5 6.2-3.6" stroke="#efe6d2" stroke-width="1.5" fill="none" stroke-linecap="round"/>';av='<ellipse cx="0" cy="2.5" rx="2.8" ry="2" fill="#c99a76"/><circle cx="-1" cy="2.6" r=".4" fill="#222"/><circle cx="1" cy="2.6" r=".4" fill="#222"/>'}
 else if(r==='Lutin'){ar='<path d="M-5.5 0q-8-7-6 1.5 1.5 3 6-.5zM5.5 0q8-7 6 1.5-1.5 3-6-.5z" fill="#cdeaf7" stroke="#7aa9c2" stroke-width=".3" opacity=".85"/><path d="M-5 -3l-3-3 4.5 1zM5 -3l3-3-4.5 1z" fill="'+c+'"/>';av='<path d="M-5.5 -3.2L0 -9.5l5.5 6.3q-5.5-2.3-11 0z" fill="#7a5ac0"/>'}
 else if(r==='Revenant'){av='<circle cx="-2.2" cy="-.4" r="1.2" fill="#0e1418"/><circle cx="2.2" cy="-.4" r="1.2" fill="#0e1418"/><path d="M-2.2 3.4h4.4M-1 3v.8M1 3v.8" stroke="#334" stroke-width=".35"/><path d="M-6 -1.4a6 6 0 0 1 12 0q-6-2-12 0z" fill="#59656c"/>'}
 else av='<path d="M-6.2 -1a6.2 6.2 0 0 1 12.4 0q-6.2-3.5-12.4 0z" fill="#6b4a2b"/>';
 return ar+'<circle r="6" fill="'+c+'" stroke="#3b2a1a" stroke-width=".5"/>'+yeux+av}
const iconeSVG=(r,px)=>'<svg viewBox="-11 -11 22 22" width="'+px+'" height="'+px+'" aria-hidden="true">'+icone(r)+'</svg>';
const race=()=>(C.rep.find(r=>r[0]==='Race')||[])[1]||'Humain';
const pos=n=>P[n]||(()=>{let h=0;for(const c of n)h=(h*31+c.charCodeAt(0))>>>0;return[28+h%150,16+(h>>8)%88]})();
const pays=q=>paysDe(q);
const WB={x0:-130,y0:-190,x1:330,y1:310},fitH=()=>Math.max(500,460*innerHeight/innerWidth);
const TH=['g','f','m','s','w','f'];
const mp=$('mp');let V={cx:100,cy:60,h:120},TP=[0,0],built=false,CARTE_URL='',PLACE=null;
let RS=7;const R=()=>(RS=RS*16807%2147483647)/2147483647;
function vue(cx,cy,h){const hmin=12*innerHeight/innerWidth,hmax=fitH()*1.05;h=Math.max(hmin,Math.min(hmax,h));const w=h*innerWidth/innerHeight;cx=Math.max(WB.x0,Math.min(WB.x1,cx));cy=Math.max(WB.y0,Math.min(WB.y1,cy));V={cx,cy,h};mp.setAttribute('viewBox',(cx-w/2)+' '+(cy-h/2)+' '+w+' '+h);
 mp.style.setProperty('--k',h*.018*(REG.cm||1));mp.style.setProperty('--sc',h/100);['plu','nei'].forEach(i=>{const e=$(i);if(e)e.setAttribute('patternTransform','scale('+h/100+')')});mp.dataset.z=w>300?'m':w>45?'p':'v';tok(TP[0],TP[1])}
function tok(x,y){TP=[x,y];const k=$('tk');if(k)k.setAttribute('transform','translate('+x+' '+y+') scale('+Math.min(V.h/100,3.2)+')')}
function tw(ms,f,fin){const t0=performance.now(),g=n=>{let u=Math.min(1,(n-t0)/ms);u=u*u*(3-2*u);f(u);u<1?requestAnimationFrame(g):fin&&fin()};requestAnimationFrame(g)}
function cam(cx,cy,h,ms,fin){const a=V;tw(ms,u=>vue(a.cx+(cx-a.cx)*u,a.cy+(cy-a.cy)*u,a.h+(h-a.h)*u),fin)}
/* Un bâtiment ou un repère propre à chaque lieu (visible aux zooms Pays et Ville) */
function ville(n,x,y){const f=v=>v.toFixed(1),r=(a,b,w,h,c)=>'<rect class="mai" x="'+f(x+a)+'" y="'+f(y+b)+'" width="'+w+'" height="'+h+'" fill="'+(c||'var(--rel)')+'" stroke="var(--e)" stroke-width=".12"/>';
 const F0=WORLD.fond.find(z=>z.n===n);if(F0){const t=F0.ty,cl={Auberge:'#b9824a',Forge:'#6b6b73',Camp:'#c9b38a',Chapelle:'#cfd6e0',Boutique:'#c26a4a'}[t]||'#a89d8f';return r(-2.4,-2,4.8,3.6,cl)+'<path class="mai" d="M'+f(x-3)+' '+f(y-2)+'L'+f(x)+' '+f(y-4.6)+'L'+f(x+3)+' '+f(y-2)+'Z" fill="#7a3b2e"/>'+(t==='Forge'?'<circle class="fu" cx="'+f(x+3.2)+'" cy="'+f(y+.6)+'" r=".6"/>':'')}
 const S0=WORLD.sites.find(z=>z.n===n);if(S0){const t=S0.ty;if(t==='Grotte')return '<ellipse class="mai" cx="'+x+'" cy="'+y+'" rx="3" ry="2" fill="#4a4a4a"/>';if(t.startsWith('Temple'))return r(-3,-2,.9,3.5,'#9fb7c4')+r(0,-3,.9,4.5,'#9fb7c4')+r(3,-1,.9,2.5,'#9fb7c4');if(t.startsWith('Tour'))return r(-1,-6,2,7,'#a89d8f');if(t.startsWith('Mine'))return r(-3,-1,6,3,'#6b5a3a');if(t.startsWith('Cimetière'))return r(-3,-1,.6,2.5,'#bbb')+r(0,-2,.6,3.5,'#bbb')+r(3,-1,.6,2.5,'#bbb');return r(-4,-3,8,6,'#a89d8f')}
 if(n==='Capitale en révolte')return r(-4,-3.5,8,5,'#b9aea0')+r(-5.2,-6,2,4.5,'#a89d8f')+r(3.2,-6,2,4.5,'#a89d8f')+r(-1,-7,2,5,'#a89d8f')+'<path class="mai" d="M0 -7v-2.6l2.2.7-2.2.7" fill="#b02a2a"/>';
 if(n==='Cité portuaire')return r(-14,3,11,1.3,'#7a5a3a')+r(-12,4.3,.5,2,'#7a5a3a')+r(-7,4.3,.5,2,'#7a5a3a')+r(6,-5,1.6,6,'#eee')+'<path class="mai" d="M5.6 -5h2.4l-1.2-2z" fill="#b02a2a"/>';
 if(n==='Forteresse assiégée')return '<path class="mai" d="M'+f(x-5)+' '+f(y-4)+'h10v8h-10z" fill="none" stroke="var(--e)" stroke-width=".5"/>'+r(-6,-5,2.4,3,'#a89d8f')+r(3.6,-5,2.4,3,'#a89d8f')+r(-6,3,2.4,3,'#a89d8f')+r(3.6,3,2.4,3,'#a89d8f')+'<path class="mai" d="M0 -4v-3l2.2.8-2.2.8" fill="#b02a2a"/>';
 if(n==='Désert aux ruines')return r(-4,-2,.9,3.5,'#cdbf9a')+r(-1,-3,.9,4.5,'#cdbf9a')+r(2,-1,.9,2.5,'#cdbf9a')+r(-5,1.5,10,.7,'#cdbf9a');
 if(n==='Forêt interdite')return '<circle class="mai" cx="'+f(x)+'" cy="'+f(y)+'" r="4" fill="none" stroke="var(--rel)" stroke-width=".5" stroke-dasharray=".8 1"/>'+r(-.5,-2.5,1,2.4,'#8c8f96');
 let h='';for(let k=0;k<8;k++)h+=r((R()-.5)*9-.7,(R()-.5)*7,1.5,1.1)+(k<3?'<circle class="fu" style="animation-delay:-'+(R()*4).toFixed(1)+'s" cx="'+f(x+(R()-.5)*8)+'" cy="'+f(y+(R()-.5)*6)+'" r=".45"/>':'');return h}
function monde(){
 if(built)return;built=true;RS=7;W10();
 const L=tous(),f=n=>n.toFixed(1),disc=n=>!ETR.includes(n)||WORLD.pays.some(pn=>{const p=paysObj(pn);return p&&p.L.some(l=>l[0]===n)});
 const Lv=L.filter(disc),Lc=Lv.filter(n=>!ETR.includes(n)),q=Lv.map(pos),qc=Lc.map(pos);
 let h='<defs><pattern id="plu" width="5" height="6" patternUnits="userSpaceOnUse"><path d="M2 0l-.8 3" stroke="#6d8fb5" stroke-width=".25"/></pattern><pattern id="nei" width="6" height="8" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".35" fill="#fff"/><circle cx="5" cy="6" r=".3" fill="#fff"/></pattern></defs>'
 +'<path class="vg" d="M4 14q3-2 6 0t6 0M2 40q3-2 6 0t6 0M3 66q3-2 6 0t6 0M4 92q3-2 6 0t6 0"/><path d="M20 10L70 4L130 8L186 14L196 50L190 100L150 114L90 110L40 106L18 80L24 40Z" fill="var(--terre)" stroke="var(--rel)" stroke-width=".6"/>'
 +'<path d="M24 41H194M20 80H192" stroke="var(--rel)" stroke-width=".4" stroke-dasharray="2 1.5" fill="none"/>'
 +'<path d="M150 34C130 50 110 46 96 62S60 80 40 84" fill="none" stroke="var(--mer)" stroke-width="1.6"/>'
 +'<ellipse cx="160" cy="92" rx="22" ry="12" fill="#d9c58f" opacity=".55"/><ellipse cx="128" cy="76" rx="6" ry="3" fill="var(--mer)"/><ellipse cx="76" cy="52" rx="4" ry="2.4" fill="var(--mer)"/>'
 +'<path d="M140 30l6-12 6 12zM150 30l7-15 7 15zM162 30l5-10 5 10z" fill="var(--rel)"/>'
 +'<text class="pa sr" x="105" y="22">Royaume du Nord</text><text class="pa sr" x="105" y="74">Terres du Centre</text><text class="pa sr" x="105" y="104">Marches du Sud</text>'
 +'<text class="pa ar" x="100" y="-6">Ancien Royaume</text>';
 qc.forEach((c,i)=>{const d=qc[(i+1)%qc.length];h+='<path d="M'+c[0]+' '+c[1]+'Q'+f((c[0]+d[0])/2+(i%2?6:-6))+' '+f((c[1]+d[1])/2+5)+' '+d[0]+' '+d[1]+'" fill="none" stroke="var(--rel)" stroke-width=".7" opacity=".8"/>'});
 const pr=(x,y,r)=>q.some(c=>Math.hypot(c[0]-x,c[1]-y)<r);
 const arbre=(x,y)=>'<g class="t" style="animation-delay:-'+f(R()*3)+'s" transform="translate('+f(x)+' '+f(y)+')"><rect x="-.3" y="-.7" width=".6" height="1.4" fill="var(--tro)"/><circle cy="-1.7" r="1.4" fill="var(--arb)"/></g>';
 for(let i=0;i<170;i++){const x=28+R()*160,y=14+R()*92;if(!pr(x,y,7)&&Math.hypot(x-160,y-92)>20&&!(y<34&&x>138&&x<170)&&Math.hypot(x-128,y-76)>7)h+=arbre(x,y)}
 for(let i=0;i<60;i++)h+=arbre(60+(R()-.5)*30,24+(R()-.5)*18);
 for(let i=0;i<90;i++){const x=26+R()*164,y=12+R()*96;if(!pr(x,y,5))h+='<circle cx="'+f(x)+'" cy="'+f(y)+'" r=".28" fill="'+['#d96a6a','#e6c84a','#b78ad6'][i%3]+'"/>'}
 for(let i=0;i<18;i++){const x=30+R()*156,y=16+R()*88;if(!pr(x,y,5))h+='<path d="M'+f(x)+' '+f(y)+'l1-1.3 1.2.2.6 1.1z" fill="var(--rel)"/>'}
 /* autres pays */
 const m2=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];
 PAYS.forEach((p,pi)=>{const cx=(p.x0+p.x1)/2,cy=(p.y0+p.y1)/2,rx=(p.x1-p.x0)/2,ry=(p.y1-p.y0)/2,pt=[];
  for(let i=0;i<14;i++){const a=i/14*6.283,k=.8+R()*.2;pt.push([cx+Math.cos(a)*rx*k,cy+Math.sin(a)*ry*k])}
  const m0=m2(pt[0],pt[1]);let d='M'+f(m0[0])+' '+f(m0[1]);for(let i=1;i<=14;i++){const a=pt[i%14],b=pt[(i+1)%14],mm=m2(a,b);d+='Q'+f(a[0])+' '+f(a[1])+' '+f(mm[0])+' '+f(mm[1])}d+='Z';
  const dc=WORLD.pays.includes(p.n);
  h+='<path d="'+d+'" fill="'+(dc?p.col:'#cfd6e0')+'" stroke="var(--rel)" stroke-width=".6" '+(dc?'':'opacity=".6" stroke-dasharray="2 1.5"')+'/>';
  if(!dc){h+='<text class="pa inc" x="'+f(cx)+'" y="'+f(cy)+'">Terres inconnues</text>';return}
  h+='<text class="pa" x="'+f(cx)+'" y="'+f(p.y0+10)+'">'+esc(p.n)+'</text>';
  const t=TH[pi],N=Math.round(rx*ry/420);
  for(let i=0;i<N;i++){const x=cx+(R()*2-1)*rx*.78,y=cy+(R()*2-1)*ry*.78;if(pr(x,y,7))continue;
   if(t==='f')h+=arbre(x,y);else if(t==='g')h+='<path d="M'+f(x)+' '+f(y)+'l2.6-5.5 2.6 5.5z" fill="#fff" stroke="#9fb7c4" stroke-width=".2"/>';
   else if(t==='s')h+='<path d="M'+f(x)+' '+f(y)+'q4-3 8 0" fill="none" stroke="#c9a96a" stroke-width=".5"/>';
   else if(t==='w')h+=(i%2?'<ellipse cx="'+f(x)+'" cy="'+f(y)+'" rx="3.4" ry="1.7" fill="var(--mer)" opacity=".65"/>':arbre(x,y));
   else h+='<path d="M'+f(x)+' '+f(y)+'l3.6-8 3.6 8z" fill="var(--rel)" stroke="var(--e)" stroke-width=".12"/>'}
  const E=WORLD.pe[p.n];const l0=pos(p.L[0][0]),cn=Lc.map(pos).reduce((b,c)=>Math.hypot(c[0]-l0[0],c[1]-l0[1])<Math.hypot(b[0]-l0[0],b[1]-l0[1])?c:b,[100,60]);
  h+='<path d="M'+l0[0]+' '+l0[1]+'L'+cn[0]+' '+cn[1]+'" fill="none" stroke="'+(E&&E.h==='prospère'?'#d9a441':'var(--rel)')+'" stroke-width="'+(E&&E.h==='prospère'?'.9':'.5')+'" stroke-dasharray="'+(E&&E.h==='prospère'?'none':'1.4 1.6')+'" opacity=".75"/>'});
 if(CARTE_URL)h+='<image href="'+CARTE_URL+'" x="0" y="0" width="200" height="120" preserveAspectRatio="xMidYMid slice"/>';
 q.forEach((c,i)=>{const n=Lv[i],vu=!ETR.includes(n)||WORLD.vus.includes(n),F=WORLD.fond.some(z=>z.n===n);
  const vd='<g class="vd"><circle cx="'+f(c[0])+'" cy="'+f(c[1])+'" r="7" fill="none" stroke="var(--rel)" stroke-width=".35" stroke-dasharray="1 .8"/><path d="M'+f(c[0]-7)+' '+f(c[1])+'H'+f(c[0]+7)+'M'+f(c[0])+' '+f(c[1]-7)+'V'+f(c[1]+7)+'M'+f(c[0]-5)+' '+f(c[1]-5)+'L'+f(c[0]+5)+' '+f(c[1]+5)+'" stroke="var(--rel)" stroke-width=".25" fill="none"/><rect x="'+f(c[0]-1.5)+'" y="'+f(c[1]-1.5)+'" width="3" height="3" fill="var(--terre)" stroke="var(--rel)" stroke-width=".2"/></g>';
  const v=ville(n,c[0],c[1]);h+=vd+(F?'<g class="c-f">'+v+'</g>':v)+'<circle cx="'+c[0]+'" cy="'+c[1]+'" r="1.2" fill="var(--a)" stroke="var(--e)" stroke-width=".25"/><text '+(vu?'':'opacity=".55" ')+'x="'+c[0]+'" y="'+(c[1]+7)+'">'+(vu?'':'? ')+esc(n)+'</text>'});
 for(let i=0;i<5;i++){const x=40+R()*130,y=20+R()*80;h+='<g class="an" style="animation-duration:'+f(6+R()*6)+'s;animation-delay:-'+f(R()*6)+'s"><ellipse cx="'+f(x)+'" cy="'+f(y)+'" rx=".9" ry=".5" fill="var(--tro)"/><circle cx="'+f(x+.9)+'" cy="'+f(y-.4)+'" r=".35" fill="var(--tro)"/></g>'}
 h+='<g class="nu"><ellipse cx="-30" cy="30" rx="14" ry="3" fill="#fff" opacity=".35"/></g><g class="nu nu2"><ellipse cx="-20" cy="84" rx="12" ry="2.6" fill="#fff" opacity=".3"/></g>'
 +'<g class="bt"><path d="M8 66h5l-1 2h-3zM10 66v-4l2 3" fill="var(--tro)" stroke="var(--e)" stroke-width=".15"/></g><g class="bt b2"><path d="M6 96h5l-1 2h-3zM8 96v-4l2 3" fill="var(--tro)" stroke="var(--e)" stroke-width=".15"/></g>'
 +'<g class="oi"><path d="M0 20q1.2-1.5 2.4 0q1.2-1.5 2.4 0" fill="none" stroke="var(--e)" stroke-width=".3"/></g><g class="oi o2"><path d="M0 60q1.2-1.5 2.4 0q1.2-1.5 2.4 0" fill="none" stroke="var(--e)" stroke-width=".3"/></g>'
 +'<rect id="nuit" x="-300" y="-300" width="1000" height="1000" fill="#0b1b3a"/>'
 +'<rect class="pl" x="-300" y="-300" width="1000" height="1000"/><rect class="ne" x="-300" y="-300" width="1000" height="1000"/><rect class="br" x="-300" y="-300" width="1000" height="1000"/><g id="dyn"></g>';
 mp.innerHTML=h}
function sentiers(){let h='<g class="c-s">';const T=tous();Object.keys(WORLD.sent||{}).forEach(k=>{const [a,b]=k.split('|');if(!T.includes(a)||!T.includes(b))return;const A=pos(a),B=pos(b);h+='<line x1="'+A[0]+'" y1="'+A[1]+'" x2="'+B[0]+'" y2="'+B[1]+'" stroke="var(--a)" stroke-width="'+Math.min(1.4,.25+WORLD.sent[k]*.08).toFixed(2)+'" opacity=".28"/>'});return h+'</g>'}
function humeursSVG(){let h='<g class="c-h">';tous().forEach(n=>{const u=humeur(n);if(!u)return;if(ETR.includes(n)&&!WORLD.vus.includes(n))return;const p=pos(n);h+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="5.5" fill="none" stroke="'+({'prospère':'#d9a441','en guerre':'#c0504d','en deuil':'#6b7585','en fête':'#d98ac0'}[u]||'#999')+'" stroke-width=".6" stroke-dasharray="1 .8"><title>'+esc(n+' : '+u)+'</title></circle>'});return h+'</g>'}
function marqueurs(){let h='';if(C.tr){const p=pos(C.tr);h+='<g transform="translate('+p[0]+' '+p[1]+')"><path d="M-2 -2L2 2M2 -2L-2 2" stroke="#b02a2a" stroke-width=".8"/><title>La carte au trésor désigne ce lieu</title></g>'}
 (C.biens||[]).forEach((b,i)=>{const p=pos(b.lieu||C.pos);h+='<g class="vd" transform="translate('+(p[0]-3+i*6)+' '+(p[1]+4.5)+')"><rect x="-1.2" y="-1" width="2.4" height="2" fill="#c9a36a" stroke="#4a3320" stroke-width=".15"/><path d="M-1.6 -1L0 -2.4 1.6 -1z" fill="#7a3b2e"/><text y="3.2" style="font-size:calc(var(--k)*.55px)">'+esc(b.n)+'</text></g>'});return h}
function dyn(from){let h=sentiers();C.trail.forEach(s=>{const a=pos(s[0]),b=pos(s[1]);h+='<line x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'" stroke="var(--a)" stroke-width=".5" stroke-dasharray="1.6 1.2"/>'});
 h+=humeursSVG()+marqueurs()+couches()+'<g id="pas"></g><g id="tk"><circle r="2.9" fill="var(--a)" stroke="var(--s)" stroke-width=".6"/><g transform="scale(.27)">'+icone(race())+'</g></g>';
 $('dyn').innerHTML=h;TP=pos(from||C.pos);mp.dataset.s=SAI[C.t%12];mp.dataset.w=C.meteo}
function ouvrirCarte(){if(!C.pos)return;monde();$('plein').hidden=false;$('mf').textContent='Fermer';dyn();const q=pos(C.pos);
 $('mt').textContent=(C.nom?C.nom+' : ':'')+C.pos+', '+pays(q)+' ('+cap(SAI[C.t%12])+')';vue(q[0],q[1],80*innerHeight/innerWidth)}
function voyage(ev,de,d){monde();const A=pos(de),B=pos(d),dist=Math.hypot(B[0]-A[0],B[1]-A[1]),h=Math.min(430,Math.max(60,dist*1.4+30))*innerHeight/innerWidth;
 $('plein').hidden=false;$('mf').textContent='Fermer';$('mt').textContent=ev+' : '+de+' vers '+d;
 C.trail.pop();dyn(de);C.trail.push([de,d]);vue(A[0],A[1],h);occ=true;let lx=A[0],ly=A[1];
 tw(3800*vcf(),u=>{const x=A[0]+(B[0]-A[0])*u,y=A[1]+(B[1]-A[1])*u;tok(x,y);vue(x,y,h);
  if(Math.hypot(x-lx,y-ly)>2.2){lx=x;ly=y;$('pas').insertAdjacentHTML('beforeend','<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r=".45" fill="var(--a)" opacity=".8"/>')}},
  ()=>cam(B[0],B[1],24*innerHeight/innerWidth,1400*vcf(),()=>{occ=false;$('mf').textContent='Continuer';$('mt').textContent=(C.fin==='mort'?'Fin du voyage : ':'Arrivée : ')+d+', '+pays(B);ui()}))}
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
const paysTP=()=>PAYS.find(p=>TP[0]>=p.x0&&TP[0]<=p.x1&&TP[1]>=p.y0&&TP[1]<=p.y1);
document.querySelectorAll('.bas button[data-m]').forEach(b=>b.onclick=()=>{const m=b.dataset.m,H=innerHeight/innerWidth;
 if(m==='m')cam(100,60,fitH(),700);else if(m==='p'){const p=paysTP();p?cam((p.x0+p.x1)/2,(p.y0+p.y1)/2,(p.x1-p.x0+30)*H,700):cam(100,60,222*H,700)}else cam(TP[0],TP[1],24*H,700)});
$('zp').onclick=()=>cam(V.cx,V.cy,V.h/1.5,250);$('zm').onclick=()=>cam(V.cx,V.cy,V.h*1.5,250);
addEventListener('resize',()=>vue(V.cx,V.cy,V.h));
const pts=new Map();let g0=null,mv=false,p0=null,lastTap=0;
const gest=()=>{const a=[...pts.values()];return{n:a.length,x:a.reduce((t,p)=>t+p[0],0)/a.length,y:a.reduce((t,p)=>t+p[1],0)/a.length,d:a.length>1?Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]):0,cx:V.cx,cy:V.cy,h:V.h}};
mp.addEventListener('pointerdown',e=>{if(occ)return;try{mp.setPointerCapture(e.pointerId)}catch(x){}pts.set(e.pointerId,[e.clientX,e.clientY]);if(pts.size===1){mv=false;p0=[e.clientX,e.clientY]}g0=gest()});
mp.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId)||occ||!g0)return;pts.set(e.pointerId,[e.clientX,e.clientY]);if(p0&&Math.hypot(e.clientX-p0[0],e.clientY-p0[1])>7)mv=true;if(!mv&&pts.size<2)return;const g=gest();if(g.n!==g0.n){g0=g;return}
 const h2=g0.d&&g.d?g0.h*g0.d/g.d:g0.h,u=g0.h/innerHeight;vue(g0.cx-(g.x-g0.x)*u,g0.cy-(g.y-g0.y)*u,h2)});
const fin2=e=>{pts.delete(e.pointerId);g0=pts.size?gest():null;if(!pts.size&&!mv&&!PLACE){const n=Date.now();if(n-lastTap<320){cam(TP[0],TP[1],40*innerHeight/innerWidth,400);lastTap=0}else lastTap=n}};
mp.addEventListener('pointerup',fin2);mp.addEventListener('pointercancel',fin2);
mp.addEventListener('wheel',e=>{e.preventDefault();vue(V.cx,V.cy,V.h*(e.deltaY>0?1.15:.87))},{passive:false});
function ficheLieu(n){const q=pos(n),L=[];L.push('Pays : '+pays(q));const hu=humeur(n);if(hu)L.push('Ambiance : '+hu);L.push((C.vis.includes(n)||C.pos===n)?'Ce personnage y est passé.':(WORLD.vus.includes(n)?'D\u2019autres y sont passés.':'Personne n\u2019y est encore allé.'));
 WORLD.tombes.filter(t=>t.lieu===n).forEach(t=>L.push('Tombe de '+t.nom+(t.leg?' (légende)':'')+', an '+t.an));
 const F=WORLD.fond.find(z=>z.n===n);if(F)L.push(F.ty+' fondé(e) par '+F.par+', an '+F.an);
 const S0=WORLD.sites.find(z=>z.n===n);if(S0)L.push(S0.ty+' découvert par '+S0.par+', an '+S0.an);
 (C.biens||[]).filter(b=>b.lieu===n).forEach(b=>L.push('Votre bien : '+b.n));if(C.tr===n)L.push('La carte au trésor désigne ce lieu.');
 modal('Lieu',n,'',L,null)}
mp.addEventListener('click',ev=>{if(mv)return;const pt=mp.createSVGPoint();pt.x=ev.clientX;pt.y=ev.clientY;const q=pt.matrixTransform(mp.getScreenCTM().inverse());
 if(!PLACE){const T=tous().filter(n=>!ETR.includes(n)||WORLD.vus.includes(n)),r=Math.max(4,V.h/100*7);let b=null,bd=r;T.forEach(n=>{const p=pos(n),d=Math.hypot(p[0]-q.x,p[1]-q.y);if(d<bd){bd=d;b=n}});if(b)ficheLieu(b);return}
 const x=Math.max(2,Math.min(198,+q.x.toFixed(1))),y=Math.max(2,Math.min(118,+q.y.toFixed(1))),n=PLACE.n;PLACE=null;
 PERSO.pos[n]=[x,y];P[n]=[x,y];const l=PERSO.lieux.find(z=>z.n===n);if(l){l.x=x;l.y=y}ecrire('perso',PERSO);built=false;$('plein').hidden=true;ui()});
/* v7.js : mécaniques de la V7 (chargé avant jeu.js ; tout ce qui touche C / WORLD n'est lu qu'à l'exécution) */
const REG=Object.assign({fs:1,vit:1,anim:1,j:0,auto:0},lire('reg',{}));
let STAT=Object.assign({n:0,v:0,races:{},jobs:{},morts:{},maxAge:0},lire('stats',{}));
const DIFF={a:6,b:9,c:3,d:2};
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
 if(r>(C.rang||0)){C.rang=r;tx.push('Promotion : '+titreRang());C.pvm++;C.pv++;C.or+=5*r;if(!C.fl.includes('Gradé'))C.fl.push('Gradé');if(r>=2&&!C.fl.includes('Maître'))C.fl.push('Maître')}}
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
if(v==="Dressage d'une bête"&&ok&&!C.cmp){const an=['Loup apprivoisé','Faucon dressé','Cheval rétif','Chat des ruines','Ours orphelin','Renard rusé'][rnd(6)];C.cmp={n:an,ty:'Animal',niv:1,ag:rnd(4)};tx.push('Compagnon : '+an+' vous suit désormais')}
 if(v==="Partie de dés"&&!ok){const m=Math.min(6,C.or);if(m){C.or-=m;tx.push('Mise perdue : or -'+m)}}
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
function couches(){const f=n=>n.toFixed(1),L=tous().filter(n=>!ETR.includes(n)),q=L.map(pos);let h='<defs><radialGradient id="fogg"><stop offset="0" stop-color="#cfd6e0" stop-opacity=".97"/><stop offset=".72" stop-color="#cfd6e0" stop-opacity=".88"/><stop offset="1" stop-color="#cfd6e0" stop-opacity="0"/></radialGradient></defs>';
 const compte={};C.vie.forEach(e=>{if(e.p){const c=compte[e.p]=compte[e.p]||[];if(c.length<14)c.push(e)}});
 Object.keys(compte).forEach(n=>{const p=pos(n);compte[n].forEach((e,i)=>{const a=i*.9+1,r=3.6+(i>6?1.2:0);h+='<circle cx="'+f(p[0]+Math.cos(a)*r)+'" cy="'+f(p[1]+Math.sin(a)*r)+'" r=".45" fill="'+(e.ok===false?'#d9534f':'#6bbf59')+'" stroke="#fff" stroke-width=".12"><title>'+esc(e.t)+'</title></circle>'})});
 h+='<g class="c-t">';WORLD.tombes.forEach((t,i)=>{const p=pos(t.lieu);h+='<g transform="translate('+f(p[0]-4.2-(i%3)*1.4)+' '+f(p[1]+3)+')"><path d="M-.5 -2h1v1.2h1v1h-1v2.4h-1v-2.4h-1v-1h1z" fill="'+(t.leg?'#f0d77a':'#d4d4d4')+'" stroke="#555" stroke-width=".12"/><title>'+esc(t.nom)+'</title></g>'});h+='</g>';
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
function initReg(){const s=(id,k)=>{const e=$(id);if(!e)return;e.value=String(REG[k]);e.onchange=()=>{REG[k]=+e.value;sauverReg()}};s('rg-fs','fs');s('rg-vit','vit');if(REG.vc===undefined)REG.vc=1;s('rg-anim','anim');s('rg-vc','vc');
 if($('jt'))$('jt').onclick=()=>{REG.j=REG.j?0:1;sauverReg()};if($('au'))$('au').onclick=()=>{REG.auto=REG.auto?0:1;sauverReg()};
 if($('pt'))$('pt').onclick=partagerTexte;if($('pi'))$('pi').onclick=partagerImage;appliquerReg()}
let autoDepuis=0;
setInterval(()=>{if(!REG.auto||typeof C==='undefined')return;const md=!$('md').hidden,pl=!$('plein').hidden,n=Date.now();
 if(md){autoDepuis=autoDepuis||n;if(n-autoDepuis>3200*(REG.pa||1)){autoDepuis=0;$('mok').click()}return}
 if(pl){autoDepuis=autoDepuis||n;if(n-autoDepuis>3000*(REG.pa||1)&&!occ&&!PLACE){autoDepuis=0;$('mf').click()}return}
 autoDepuis=0;if(!occ&&!C.fin&&cur.length&&!$('go').disabled)$('go').click()},900);
initReg();
/* v8.js : debug, contrôle des objectifs, biens et métier, annulation, sauvegarde auto (chargé avant jeu.js) */
let UNDO=[];
const vcf=()=>REG.vc===undefined?1:REG.vc;

/* ---------- À faire : lisible pour l'objectif en cours ---------- */
function afaire(e){if(!e)return '';const s=e[3];if(!s)return e[0];const p=progres(s);
 const L={lieu:'atteindre '+s.v+(atteint(s.v)?' (atteint : il faut encore y vivre un événement)':' (pas encore atteint)'),vie:'vivre '+s.n+' événements',or:'réunir '+s.n+' pièces d’or',ev:'réussir « '+s.v+' » '+s.n+' fois',tag:'réussir '+s.n+' actions de type '+s.v,comp:'porter une compétence au niveau '+s.n,lieux:'visiter '+s.n+' lieux',stat:'atteindre '+s.n+' en '+(S[s.k]||s.k)}[s.t]||e[0];
 return L+(p&&s.t!=='lieu'?' ('+p[0]+'/'+p[1]+')':'')}

/* ---------- Coup de pouce de l'étape en cours (tous objectifs) ---------- */
const OB={a:5,b:5,c:2,d:2.4};
function objBoost(n){if(!C.obj||C.fin)return 1;const q=etq(),e=q[C.qs],s=e&&e[3],k=e&&e[2];let m=1;
 if(k==='Ennemi'&&n==='Une trahison')m=4;
 if(k==='Vengeance'&&n==='Vengeance de l\u2019ennemi'.replace('\u2019',"'"))m=6;
 if(k==='Relique'&&n==='Fouille des ruines')m=6;
 if(k==='Carte'&&['Rencontre d\'un allié','Mission de l\'allié','Lettre mystérieuse','Lettre déchiffrée'].includes(n))m=5;
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
function snapUndo(){try{UNDO.push(snapAll());if(UNDO.length>3)UNDO.shift()}catch(e){UNDO=[]}}
function annuler(){if(!UNDO.length||occ)return;restoreAll(UNDO.pop(),null);ecrire('c',C);ecrire('monde',WORLD);ecrire('lig',LIG);ecrire('raceh',RH);ecrire('stats',STAT);ecrire('pan',PAN);
 $('res').textContent='';$('act').textContent='';$('plein').hidden=true;$('md').hidden=true;ui()}

/* ---------- Sauvegarde automatique et rappel ---------- */
function autoSauve(){try{autoS()}catch(e){}}
function autoS(){if(typeof idb!=='function'||typeof exporter!=='function')return;const n=Date.now();if(n-(REG.la||0)<45000)return;REG.la=n;ecrire('reg',REG);idb('set','auto',exporter())}
function banniere(){try{banR()}catch(e){}}
function banR(){const b=$('bk');if(!b)return;const n=Date.now(),l=REG.lb||0,util=STAT.n>0||C.vie.length>5;b.hidden=!((n-l)>7*864e5&&util);
 if(!b.hidden){b.innerHTML='<b>Sauvegarde de sécurité</b><br>'+(l?'Dernière : il y a '+Math.floor((n-l)/864e5)+' jours.':'Aucune sauvegarde téléchargée.')+'<br><button id="bk-b">Télécharger maintenant</button>';
  $('bk-b').onclick=()=>{telecharger();REG.lb=Date.now();ecrire('reg',REG);banniere()}}}
if($('un'))$("un").onclick=annuler;
if($('pan'))$('pan').addEventListener('click',e=>{const li=e.target.closest&&e.target.closest('li[data-p]');if(!li)return;const x=PAN[+li.dataset.p];if(!x)return;
 modal('Panthéon',x.nom,'',[],null);$('mtx').textContent=(x.note?'Notes : '+x.note+'\n\n':'')+(x.rec||x.bio||'');$('mtx').className='long'});
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
/* v10.js : destin, relations, chaînes, humeurs, roue truquée, coups du sort, bilan, records, livre d'or, thèmes, export, transfert, test auto */
const W10=()=>{['pnj','biens','desc','aban','chro','deces','pays'].forEach(k=>WORLD[k]=WORLD[k]||[]);WORLD.hu=WORLD.hu||{};WORLD.pe=WORLD.pe||{};WORLD.sent=WORLD.sent||{};WORLD.vus=WORLD.vus||[]};
const humeur=l=>{if(!l)return '';const h=(WORLD.hu||{})[l];if(h&&C.an0&&anCourant()-h.an<30)return h.h;const e=(WORLD.pe||{})[paysDe(pos(l))];return e&&C.an0&&anCourant()-e.an<30?e.h:''};
const HUM=['prospère','en guerre','en deuil','en fête'];
const PNJR={rival:'Rival',mentor:'Mentor',proche:'Proche'};
const PNJT={rival:p=>'Un rival hérité : '+p.n+', qui s\u2019opposait à '+p.de+' (rencontré à '+(p.lieu||'?')+', an '+p.an+')',mentor:p=>'Un mentor : '+p.n+', qui avait guidé '+p.de+' (rencontré à '+(p.lieu||'?')+', an '+p.an+')',proche:p=>p.n+(p.fam?' '+p.fam:'')+', '+(p.rel||'proche')+' (enfant de '+p.de+'), fait partie de la famille'};
const QUETES=[['Retrouver la relique perdue d\u2019un ancêtre','Fouille des ruines',2],['Venger l\u2019honneur de la lignée',"Vengeance de l'ennemi",2],['Bâtir la fortune de la lignée','Marché florissant',3],['Gagner la gloire de la lignée','Tournoi',2],['Honorer les anciens','Cérémonie',3],['Retrouver le savoir perdu','Manuscrit rare',2]];
const nouvQuete=()=>{const q=QUETES[rnd(QUETES.length)];return{txt:q[0],ev:q[1],need:q[2],prog:0}};
const famCourt=()=>C.lig?C.lig.nom.replace(/^Lignée /,''):'';

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
 const lq=C.lig&&C.lig.quete;if(lq&&lq.ev===n)m*=3;
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
 const pi=WORLD.pnj.findIndex(p=>(C.lig&&p.lig===C.lig.nom)||(C.famOk&&p.fam));
 if(pi>=0&&Math.random()<.6){const p=WORLD.pnj.splice(pi,1)[0];
  if(p.role==='mentor'&&anCourant()-p.an>40){WORLD.deces.push({n:p.n,an:anCourant(),txt:'mentor de '+p.de});WORLD.deces=WORLD.deces.slice(-20);C.comp.forEach(k=>k.xp+=1);C.famTx.push('Le mentor '+p.n+' (de '+p.de+') est mort depuis longtemps, mais son enseignement demeure (compétences +1)')}
  else{C.pnj=p;C.fl.push(PNJR[p.role]);C.famTx.push(PNJT[p.role](p))}}
 const di=WORLD.desc.findIndex(d=>d.race===race()&&(race()!=='Sang-mêlé'||(d.par||[]).slice().sort().join('|')===parents().slice().sort().join('|')));
 if(di>=0&&Math.random()<.5){const d=WORLD.desc.splice(di,1)[0];C.descend=d;if(!C.nom){C.nom=d.n+(d.fam?' '+d.fam:'');if($('nom'))$('nom').value=C.nom}
  C.famTx.push('Descendant : '+d.n+(d.fam?' '+d.fam:'')+', '+(d.parent||'')+(d.union?'':''));if((d.biens||[]).length&&!(C.biens||[]).length){C.biens=[d.biens[0]];C.famTx.push('Bien familial : '+d.biens[0].n)}}
 if(C.lig){const r=C.lig.rep||0;if(r>=2){C.rel.Peuple=Math.min(5,C.rel.Peuple+1);C.rel.Marchands=Math.min(5,C.rel.Marchands+1);C.famTx.push('Réputation de la lignée : honorée (Peuple +1, Marchands +1)')}else if(r<=-2){C.rel.Pègre=Math.min(5,C.rel.Pègre+1);C.rel.Peuple=Math.max(-5,C.rel.Peuple-1);C.famTx.push('Réputation de la lignée : redoutée (Pègre +1, Peuple -1)')}
  if(!C.lig.quete)C.lig.quete=nouvQuete();C.famTx.push('Quête de lignée : '+C.lig.quete.txt+' ('+C.lig.quete.prog+'/'+C.lig.quete.need+')')}
 const RV=PAYS.find(p=>p.L.some(l=>l[0]===C.pos));if(RV)revele(RV.n,[]);
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
 if(C.pnj&&{'Retour du rival':'rival','Leçon du mentor':'mentor',"Nouvelles d'un proche":'proche'}[v]===C.pnj.role)tx.push('Avec '+C.pnj.n);
 if(v==='Rencontre amoureuse'&&!C.amour){C.amour=nomPropre();tx.push('Avec '+C.amour)}
 if(v==="Lettre de l'être aimé"&&C.amour)tx.push('De '+C.amour);
 const lq=C.lig&&C.lig.quete;if(lq&&v===lq.ev&&ok){lq.prog++;tx.push('Quête de lignée : '+lq.prog+'/'+lq.need);if(lq.prog>=lq.need){const l=LIG.find(x=>x.nom===C.lig.nom);C.or+=20;tx.push('Quête de lignée accomplie : '+lq.txt+' (or +20)');if(l){l.rep=Math.min(3,(l.rep||0)+1);l.quete=nouvQuete();l.faits=(l.faits||[]).concat([lq.txt]).slice(-6)}WORLD.chro.push({an:anCourant(),txt:'La '+C.lig.nom+' accomplit : '+lq.txt});ecrire('lig',LIG)}else ecrire('lig',LIG)}
 ['Tombe ici','Bien ici','Fondation ici','Séquelles'].forEach(f=>{C.fl=C.fl.filter(x=>x!==f)});
 if(WORLD.tombes.some(t=>t.lieu===C.pos))C.fl.push('Tombe ici');if(WORLD.aban.some(b=>b.lieu===C.pos))C.fl.push('Bien ici');if(WORLD.fond.some(f=>f.n===C.pos))C.fl.push('Fondation ici');if(WORLD.seq&&anCourant()<WORLD.seq.fin)C.fl.push('Séquelles');
 if(v==='Visite d\'une tombe'){const t=WORLD.tombes.filter(z=>z.lieu===C.pos);if(t.length)tx.push('Sur la tombe de '+t[rnd(t.length)].nom)}
 if(v==='Bien abandonné retrouvé'){const k=WORLD.aban.findIndex(b=>b.lieu===C.pos);if(k>=0&&(C.biens||[]).length<2){const b=WORLD.aban.splice(k,1)[0];C.biens=(C.biens||[]).concat([b]);tx.push('Repris : '+b.n)}}
 if(v==='Écho d\'une fondation'){const f=WORLD.fond.find(z=>z.n===C.pos);if(f)tx.push(f.ty+' fondé(e) par '+f.par)}
 if(C.enf)C.enf.forEach(e=>{if(!e.fam&&C.lig)e.fam=famCourt()});
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
 if(WORLD.pnj.length<6&&Math.random()<.45){const r=['rival','mentor'][rnd(2)];WORLD.pnj.push({n:NOMS1[rnd(NOMS1.length)],role:r,de:nom,an:anCourant(),lieu:C.pos,lig:C.lig?C.lig.nom:null,fam:Math.random()<.6})}
 if((C.enf||[]).length&&WORLD.pnj.length<8&&Math.random()<.7){const e=C.enf[rnd(C.enf.length)];WORLD.pnj.push({n:e.n,fam:e.fam||'',role:'proche',rel:['frère','sœur','cousin'][rnd(3)],de:nom,an:anCourant(),lieu:C.pos,lig:C.lig?C.lig.nom:null,fam2:1});WORLD.pnj[WORLD.pnj.length-1].fam=true;WORLD.pnj[WORLD.pnj.length-1].nomF=e.fam||''}
 if((C.enf||[]).length&&WORLD.desc.length<6){const e=C.enf[0];WORLD.desc.push({n:e.n,fam:e.fam||'',parent:'enfant de '+nom,race:race(),par:parents(),biens:(C.biens||[]).slice(0,1)})}
 if(C.lig){const l=LIG.find(x=>x.nom===C.lig.nom);if(l){l.rep=Math.max(-3,Math.min(3,(l.rep||0)+(C.fin==='victoire'?1:0)+((C.mortT==='Mort en légende'||C.mortT==='Mort en héros')?1:0)-((C.fin==='mort'&&C.mortT!=='Mort en légende'&&C.mortT!=='Mort en héros')?1:0)));(l.membres=l.membres||[]).push({nom,age:a,fin:C.fin,exp:(C.succ[0]||C.obj||''),or:o});l.membres=l.membres.slice(-12);ecrire('lig',LIG)}}
 if((C.biens||[]).length&&!(C.enf||[]).length)WORLD.aban.push(Object.assign({},C.biens[0]));WORLD.aban=WORLD.aban.slice(-6);
 unions();
 if(C.pnj&&Math.random()<.4&&WORLD.pnj.length<6)WORLD.pnj.push(C.pnj);
 if(C.mortT==='Mort en légende'||C.mortT==='Mort en héros'){if(C.pos)WORLD.hu[C.pos]={h:'en deuil',an:anCourant()}}
 else if(C.fin==='victoire'&&C.pos&&Math.random()<.5)WORLD.hu[C.pos]={h:'en fête',an:anCourant()};
 if(Math.random()<.35){const l=lieux();if(l.length)WORLD.hu[l[rnd(l.length)]]={h:HUM[rnd(4)],an:anCourant()}}
 if((C.biens||[]).length&&(C.enf||[]).length){WORLD.biens=WORLD.biens.concat(C.biens.slice(0,1)).slice(-3);WORLD.fam=WORLD.fam||{de:nom,it:[],or:0}}
 if(C.fonde){const l=LIG.find(x=>x.nom===C.fonde),o2=LIG.filter(x=>x!==l);if(l&&o2.length&&Math.random()<.4){const b=o2[rnd(o2.length)],ty=Math.random()<.5?'rivale':'alliée';l.rel={avec:b.nom,ty};if(!b.rel)b.rel={avec:l.nom,ty};ecrire('lig',LIG)}}
 STAT.rj=STAT.rj||{};{const rr=race(),jb=(C.rep.find(x=>x[0]==='Métier')||[])[1];if(jb){STAT.rj[rr]=STAT.rj[rr]||{};STAT.rj[rr][jb]=(STAT.rj[rr][jb]||0)+1}}
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
 if(V.length>=6){const k=Math.ceil(V.length/3),P=[['Sa jeunesse est faite de',V.slice(0,k)],['Son âge mûr est fait de',V.slice(k,2*k)],['Ses dernières années sont faites de',V.slice(2*k)]];
  P.forEach(([t,a])=>{if(!a.length)return;const f={};a.forEach(e=>f[e.t]=(f[e.t]||0)+1);const top=Object.keys(f).sort((x,y)=>f[y]-f[x]).slice(0,2).map(x=>x.toLowerCase());o.push(t+' '+top.join(' et ')+(a.filter(e=>!e.ok).length>a.length/2?', et de bien des revers.':', plutôt heureusement.'))})}
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
   try{debugTxt();hist();hist10();hist11();fiche10()}catch(e){note('affichage',e)}
   try{coherence().forEach(m=>note('cohérence',new Error(m)))}catch(e){note('cohérence',e)}
   if(C.fin==='victoire')v++;else m++;if(i%3===2)await new Promise(r=>setTimeout(r,0))}
  try{ui()}catch(e){note('ui',e)}
  const k=Object.keys(err);sortie(k.length?'Erreurs détectées :\n'+k.map(x=>'- '+x+' (×'+err[x]+')').join('\n'):'Aucune erreur sur '+n+' vies ('+v+' victoires, '+m+' morts).')}
 catch(e){sortie('Échec du test : '+e.message)}
 finally{restoreAll(snap,pk);NOSAVE=false;ui()}}
function bilan10(){const V=C.vie;return V.length}

/* ---- Unions entre lignées alliées ---- */
function unions(){W10();LIG.forEach(l=>{if(l.rel&&l.rel.ty==='alliée'&&!l.union&&Math.random()<.2){const b=LIG.find(x=>x.nom===l.rel.avec);if(!b||b.union)return;l.union=b.nom;b.union=l.nom;
  if(l.race&&b.race&&l.race!==b.race&&l.race!=='Sang-mêlé'&&b.race!=='Sang-mêlé'&&WORLD.desc.length<6)WORLD.desc.push({n:NOMS1[rnd(NOMS1.length)],fam:l.nom.replace(/^Lignée /,''),parent:'né de l\u2019union des lignées '+l.nom.replace(/^Lignée /,'')+' et '+b.nom.replace(/^Lignée /,''),race:'Sang-mêlé',par:[l.race,b.race].sort(),biens:[]});
  l.rep=Math.min(3,(l.rep||0)+1);b.rep=Math.min(3,(b.rep||0)+1);WORLD.chro.push({an:anCourant(),txt:'Union des lignées : '+l.nom+' et '+b.nom})}});paysDrift();WORLD.chro=WORLD.chro.slice(-40);ecrire('lig',LIG)}
/* v11.js : pays étrangers, voyages, cohérence, journal et arbre des lignées, fiche de race, notes, nouveautés, calques */
function revele(n,tx){W10();if(WORLD.pays.includes(n))return;WORLD.pays.push(n);built=false;WORLD.chro.push({an:anCourant(),txt:'Contrée découverte : '+n+' (par '+nomS()+')'});ecrire('monde',WORLD);tx.push('Nouvelle contrée découverte : '+n)}
const MERS=['Archipel d’Ysmir','Confins de Brume','Marais de Vael'];
function v11Apres(v,ok,tx){W10();const etr=ETR.includes(C.pos);
 C.fl=C.fl.filter(x=>x!=='Étranger');if(etr){C.fl.push('Étranger');const p=PAYS.find(z=>z.L.some(l=>l[0]===C.pos));if(p)revele(p.n,tx)}
 if(!WORLD.vus.includes(C.pos))WORLD.vus.push(C.pos);
 if(/^voyage/i.test(v)&&C.trail.length){const t=C.trail[C.trail.length-1],k=t[0]+'|'+t[1];WORLD.sent[k]=(WORLD.sent[k]||0)+1;
  const a=paysDe(pos(t[0])),b=paysDe(pos(t[1]));
  if(a!==b&&(PAYS.some(p=>p.n===a)||PAYS.some(p=>p.n===b))){const nav=MERS.includes(a)||MERS.includes(b),c=Math.min(C.or,nav?3:2);C.or-=c;C.en=Math.min(C.enm,C.en+1);tx.push((nav?'Traversée en navire':'Voyage en caravane')+(c?' (or -'+c+')':'')+', Énergie +1')}}
 if(C.inv.includes('Carte au trésor')&&!C.tr&&!C.trDone){const c=tous().filter(x=>x!==C.pos);if(c.length){C.tr=c[rnd(c.length)];tx.push('La carte au trésor désigne : '+C.tr)}}
 if(v==='Chasse au trésor'&&ok&&C.tr&&C.pos===C.tr){C.or+=20;tx.push('Le trésor désigné par la carte ! Or +20');C.tr=null;C.trDone=true}
 if(C.tr&&C.pos===C.tr&&v!=='Chasse au trésor')tx.push('Le trésor de la carte doit être ici')}
function paysDrift(){W10();if(Math.random()<.35){const p=PAYS[rnd(PAYS.length)],h=['en guerre','prospère','en fête'][rnd(3)];WORLD.pe[p.n]={h,an:anCourant()};if(WORLD.pays.includes(p.n))WORLD.chro.push({an:anCourant(),txt:p.n+' : '+({'en guerre':'la guerre éclate','prospère':'une période de prospérité s’ouvre','en fête':'on y célèbre de grandes fêtes'}[h])});built=false}}

/* ---- Cohérence ---- */
function coherence(){const o=[],rc=(C.rep[0]||[])[1];
 if(C.lig){const l=C.lig;if(l.race&&rc!=='Sang-mêlé'&&l.race!==rc)o.push('Lignée '+l.nom+' ('+l.race+') pour un personnage '+rc);if(rc==='Sang-mêlé'&&l.race!=='Sang-mêlé'&&!parents().includes(l.race))o.push('Lignée étrangère aux parents du sang-mêlé');if(rc==='Sang-mêlé'&&l.race==='Sang-mêlé'&&(l.par||[]).join('|')!==parents().slice().sort().join('|'))o.push('Lignée de sang-mêlé avec d’autres parents')}
 if(C.pnj){if(!C.pnj.lieu||!C.pnj.an)o.push('Proche sans origine');if(C.pnj.role==='amour')o.push('Amour hérité d’un autre personnage');if(C.pnj.role==='mentor'&&anCourant()-C.pnj.an>40)o.push('Mentor mort toujours présent');if(!(C.famOk||(C.lig&&C.pnj.lig===C.lig.nom)))o.push('Lien hérité sans lien familial')}
 if(C.cmp&&C.cmp.ag>(C.cmp.ty==='Animal'?15:80)+1)o.push('Compagnon trop âgé');
 if(C.lrel&&!LIG.some(x=>x.nom===C.lrel.avec))o.push('Lignée liée à une lignée inconnue');
 if(rc==='Sang-mêlé'&&parents().length<2)o.push('Sang-mêlé sans deux parents');
 if(C.descend&&C.descend.race!==rc)o.push('Descendant d’une autre race');
 if(ETR.includes(C.pos)&&!WORLD.pays.length)o.push('Contrée étrangère non révélée');
 (C.enf||[]).forEach(e=>{if(!e.n)o.push('Enfant sans nom')});
 return o}

/* ---- Journal, arbre, fiche de race ---- */
const repTxt=r=>r>=2?'honorée':r<=-2?'redoutée':r>0?'respectée':r<0?'discutée':'ordinaire';
function arbreHTML(parent,niv){const K=LIG.filter(l=>parent?l.parent===parent:(!l.parent||!LIG.some(x=>x.nom===l.parent)));if(!K.length)return '';
 return '<ul>'+K.map(l=>'<li><b>'+esc(l.nom)+'</b> '+esc(l.race||'')+(l.rel?' · '+(l.rel.ty==='rivale'?'rivale de ':'alliée de ')+esc(l.rel.avec):'')+(l.union?' · unie à '+esc(l.union):'')+arbreHTML(l.nom,niv+1)+'</li>').join('')+'</ul>'}
function hist11(){W10();
 const jl=$('jl');if(jl)jl.innerHTML=LIG.length?LIG.map(l=>'<li><b>'+esc(l.nom)+'</b>'+esc(l.race||'')+(l.par?' ('+l.par.map(esc).join(' / ')+')':'')+' · réputation '+repTxt(l.rep||0)+(l.rel?' · '+l.rel.ty+' de '+esc(l.rel.avec):'')+(l.union?' · unie à '+esc(l.union):'')
  +(l.quete?'<br><small>Quête : '+esc(l.quete.txt)+' ('+l.quete.prog+'/'+l.quete.need+')</small>':'')+((l.faits||[]).length?'<br><small>Accompli : '+l.faits.map(esc).join(' ; ')+'</small>':'')
  +((l.membres||[]).length?'<br><small>'+l.membres.map(m=>esc(m.nom)+' ('+m.age+' ans, '+(m.fin==='mort'?'mort':'victoire')+(m.exp?', '+esc(m.exp):'')+')').join('<br>')+'</small>':'')+'</li>').join(''):'<li>Aucune lignée pour l’instant.</li>';
 const ar=$('ar');if(ar)ar.innerHTML=LIG.length?arbreHTML(null,0):'<p>Aucune lignée pour l’instant.</p>';
 const fr=$('fr');if(fr)fr.innerHTML=RACES.map(r=>{const n=r[0],b=SB[n]||{},bs=Object.keys(S).filter(k=>b[k]).map(k=>S[k]+' '+(b[k]>0?'+':'')+b[k]).join(', ')||'aucun bonus',h=RH[n]||{},j=(STAT.rj||{})[n]||{},top=Object.keys(j).sort((x,y)=>j[y]-j[x]).slice(0,3).map(k=>k+' ×'+j[k]).join(', '),nl=LIG.filter(l=>l.race===n).length;
  return '<li><b>'+esc(n)+'</b>'+esc(bs)+'<br><small>'+(h.v||0)+' victoire(s), '+(h.m||0)+' mort(s), '+nl+' lignée(s)'+(top?' · métiers : '+esc(top):'')+'</small></li>'}).join('');
 const nt=$('nt');if(nt&&document.activeElement!==nt&&nt.value!==(C.note||''))nt.value=C.note||'';
 const hm=$('hm');if(hm&&(WORLD.chro.length||WORLD.deces.length)){const E=WORLD.chro.map(e=>[e.an,e.txt]).concat(WORLD.deces.map(e=>[e.an,'Décès : '+e.n+' ('+e.txt+')']));E.sort((a,b)=>b[0]-a[0]);hm.insertAdjacentHTML('beforeend',E.slice(0,25).map(e=>'<li><b>An '+e[0]+'</b> '+esc(e[1])+'</li>').join(''))}}
if($('nt'))$('nt').oninput=e=>{C.note=e.target.value;ecrire('c',C)};

/* ---- Calques et taille de la carte ---- */
const CAL=()=>REG.cal||{t:1,f:1,h:1,s:1};
function appliquerCal(){const c=CAL();mp.classList.toggle('noT',!c.t);mp.classList.toggle('noF',!c.f);mp.classList.toggle('noH',!c.h);mp.classList.toggle('noS',!c.s)}
if($('cl'))$('cl').onclick=()=>{const p=$('clp');p.hidden=!p.hidden;const c=CAL();p.innerHTML=[['t','Tombes'],['f','Fondations'],['h','Ambiances des lieux'],['s','Sentiers']].map(([k,t])=>'<label><input type="checkbox" data-k="'+k+'" '+(c[k]?'checked':'')+'> '+t+'</label>').join('')};
if($('clp'))$('clp').addEventListener('change',e=>{const c=Object.assign({},CAL());c[e.target.dataset.k]=e.target.checked?1:0;REG.cal=c;ecrire('reg',REG);appliquerCal()});
setInterval(appliquerCal,800);
if($('rg-cm')){$('rg-cm').value=String(REG.cm||1);$('rg-cm').onchange=e=>{REG.cm=+e.target.value;ecrire('reg',REG);if(typeof vue==='function')vue(V.cx,V.cy,V.h)}}

/* ---- Nouveautés ---- */
const NEWS=['Carte du monde à trois niveaux : Monde (six pays), Pays, Ville ; zoom au doigt, boutons + et -, double toucher pour recentrer','Pays lointains dans la brume : ils se dévoilent quand un personnage s’y rend','Toucher un lieu sur la carte ouvre sa fiche ; calques : tombes, fondations, ambiances, sentiers','Nouvelle race : le Sang-mêlé (deux parents tirés à la roue)','Lignées réservées à la même race ; unions entre lignées alliées ; quêtes et réputation de lignée','Proches cohérents : famille, mentor, rival ; l’amour se rencontre dans la vie','Descendants d’un personnage précédent','Voyages lointains : frontière, langue, caravanes et navires ; carte au trésor réelle','Journal et arbre des lignées, fiche de race, notes, annuler jusqu’à 3 tirages'];
setTimeout(()=>{try{if(REG.vu!=='11'&&typeof modal==='function'){REG.vu='11';ecrire('reg',REG);modal('Nouveautés','Version 11','',NEWS,null)}}catch(e){}},1500);
/* jeu.js : état du personnage, roulette, jets, objets, boutique, saisons, quêtes, fin de partie, interface */
const nouveau=()=>({nom:'',rep:[],vie:[],pos:null,trail:[],st:{},pv:0,pvm:0,en:0,enm:0,inv:[],or:0,fl:[],comp:[],vis:[],rel:{Marchands:0,Couronne:0,Pègre:0,Peuple:0},cic:[],us:{},fat:0,cd:0,nem:'',ally:'',mnd:null,succ:[],expl:[],dec:0,boss:0,an0:0,lig:null,ligTrait:'',ligTx:[],fonde:'',obj:'',qs:0,t:0,age0:20,meteo:'Clair',fin:null,arch:0,lat:[],sur:'',cmp:null,bl:[],rang:0,enf:[],sq:null,sqn:0,mortT:'',vl:[],famOk:false,arr:[],biens:[]});
let PERSO=lire('perso',{tables:{},ev:[],efx:{},hist:{},etag:{},lieux:[],pos:{},extra:[]}),T=null,C=lire('c',nouveau()),PAN=lire('pan',[]),rot=0,occ=false,cur=[];
let WORLD=lire('monde',{annee:1200,sites:[]}),LIG=lire('lig',[]),RH=lire('raceh',{});WORLD.succ=WORLD.succ||{};['fond','tombes','reliques','ennemis'].forEach(k=>WORLD[k]=WORLD[k]||[]);WORLD.rep=WORLD.rep||{};WORLD.prix=WORLD.prix||1;WORLD.mnd=WORLD.mnd||null;WORLD.fam=WORLD.fam||null;WORLD.fond.forEach(f=>P[f.n]=[f.x,f.y]);WORLD.sites.forEach(s=>P[s.n]=[s.x,s.y]);
const SB0=JSON.parse(JSON.stringify(SB));
const parents=()=>[(C.rep.find(r=>r[0]==='Parent 1')||[])[1],(C.rep.find(r=>r[0]==='Parent 2')||[])[1]].filter(Boolean);
const ligOk=l=>{const rc=(C.rep[0]||[])[1];if(!l.race)return 1.5;const pr=parents().slice().sort().join('|');if(rc==='Sang-mêlé'){if(l.race==='Sang-mêlé')return(l.par||[]).join('|')===pr?3:0;return parents().includes(l.race)?1.5:0}return l.race===rc?3:0};
function appliquerPerso(){Object.keys(SB).forEach(k=>{if(!SB0[k])delete SB[k]});Object.keys(SB0).forEach(k=>{SB[k]=JSON.parse(JSON.stringify(SB0[k]))});Object.assign(SB,PERSO.sb||{});Object.assign(EF,PERSO.efx);Object.assign(HIST,PERSO.hist);Object.assign(ETAG,PERSO.etag);PERSO.lieux.forEach(l=>{P[l.n]=[l.x,l.y]});Object.keys(PERSO.pos).forEach(n=>{P[n]=PERSO.pos[n]})}
function construireT(){const t=JSON.parse(JSON.stringify(DEF));t.forEach(x=>{if(PERSO.tables[x.n])x.o=PERSO.tables[x.n]});
 const v=t.find(x=>x.vie);PERSO.ev.forEach(e=>{if(!v.o.some(y=>y[0]===e[0]))v.o.push(e)});
 const d=t.find(x=>x.n==='Décor');PERSO.lieux.forEach(l=>{if(!d.o.some(y=>y[0]===l.n))d.o.push([l.n,l.poids||1,{}])});
 const i=t.findIndex(x=>x.n==='Objectif');PERSO.extra.forEach((x,k)=>t.splice(i+k,0,JSON.parse(JSON.stringify(x))));return t}
appliquerPerso();T=construireT();
const ligTable=()=>({n:'Lignée',o:[['Sans lignée',8]].concat(LIG.map(l=>[l.nom,ligOk(l)]).filter(x=>x[1]>0))}),famTable=()=>({n:'Famille',o:[['Héritage familial',3],['Brouillé avec les siens',1]]}),
 etapes=()=>{const b=T.filter(t=>!t.vie),ins=[];if(((C.rep[0]||[])[1])==='Sang-mêlé'){const R0=RACES.map(x=>[x[0],x[1]]).filter(x=>x[0]!=='Sang-mêlé');ins.push({n:'Parent 1',o:R0});const p1=(C.rep[1]||[])[1];ins.push({n:'Parent 2',o:R0.filter(x=>x[0]!==p1)})}if(LIG.length)ins.push(ligTable());if(WORLD.fam)ins.push(famTable());return b.slice(0,1).concat(ins,b.slice(1))},
 tous=()=>lieux().concat(WORLD.sites.map(s=>s.n),WORLD.fond.map(f=>f.n)),anCourant=()=>C.an0+Math.floor(C.t/12),tv=()=>T.find(t=>t.vie),lieux=()=>((T.find(t=>t.n==='Décor')||{o:[]}).o).map(x=>x[0]);
const table=()=>C.rep.length<etapes().length?etapes()[C.rep.length]:tv();
const age=()=>C.age0+Math.floor(C.t/12),sai=()=>SAI[C.t%12],rnd=n=>Math.floor(Math.random()*n);
function meteo(){const s=sai(),r=Math.random();C.meteo=s==='hiver'?(r<.4?'Neige':r<.6?'Brume':'Clair'):s==='automne'?(r<.4?'Pluie':r<.55?'Orage':r<.7?'Brume':'Clair'):s==='printemps'?(r<.3?'Pluie':'Clair'):(r<.15?'Orage':'Clair')}
/* ----- Quêtes ----- */
const niv=k=>Math.floor(Math.sqrt(k.xp)),cnt=f=>C.vie.filter(f).length;
const okS=s=>({lieu:()=>atteint(s.v)&&cnt(e=>e.p===s.v)>=2,vie:()=>C.vie.length>=s.n,or:()=>C.or>=s.n,ev:()=>cnt(e=>e.t===s.v&&e.ok)>=s.n,tag:()=>cnt(e=>ETAG[e.t]===s.v&&e.ok)>=s.n,comp:()=>C.comp.some(k=>niv(k)>=s.n),lieux:()=>C.vis.length>=s.n,stat:()=>C.st[s.k]>=s.n}[s.t]());
const etq=()=>{const o=C.obj;if(QU[o])return QU[o];const d=OBJD[o];return d?d.map(s=>[o,()=>okS(s),s.t==='ev'?'Ev:'+s.v:s.t==='tag'?'Tag:'+s.v:{lieu:'Lieu',or:'Or',lieux:'Explorer',comp:'Art'}[s.t]||'But',s]):[]};
function avancer(){const q=etq();while(C.qs<q.length&&q[C.qs][1]())C.qs++;return q.length>0&&C.qs>=q.length&&C.vie.length>0}
/* ----- Tirage pondéré : réponses précédentes, deux derniers événements, objets, états, lieu, météo, saison, étape de quête ----- */
function poids(t){
 if(t.stat){const b=C.rep.reduce((s,r)=>s+((SB[r[1]]||{})[t.stat]||0)*(/^Parent/.test(r[0])?.5:1),0);return[2,3,4,5,6,7,8,9].map(v=>({t:String(v),w:Math.exp(-((v-5.5)**2)/6)*Math.exp(.4*b*(v-5.5))}))}
 const ev=t.vie?C.vie.filter(e=>e.t!=='Objet').slice(-2).map(e=>e.t):[],a=C.rep.map(r=>r[1]);let cx=[];
 if(t.vie){cx=ev.concat(C.fl,C.inv,[C.pos,C.meteo,cap(sai())],WORLD.sites.some(s=>s.n===C.pos)?['Site']:[]);if(C.en<=3)cx.push('Épuisé');if(C.pv<=4)cx.push('Blessé');const q=etq();if(C.qs<q.length)cx.push('Étape:'+q[C.qs][2])}
 a.push(...cx);const rw=cx.slice().reverse();
 const permis=g=>{const a=C.rep.map(r=>r[1]);return g.some(x=>x.startsWith('tag:')?C.comp.some(s=>s.tag===x.slice(4)):x.startsWith('obj:')?C.inv.includes(x.slice(4)):a.includes(x)||x===C.ligTrait)};
 const l=t.o.filter(x=>(!x[3]||a.includes(x[3]))&&!(x[0]==='Vengeance de l\'ennemi'&&C.cd>0)&&!(x[0]==='Explorer le site'&&C.expl.includes(C.pos))&&!(x[0]==='Piste d\'un lieu oublié'&&WORLD.sites.length>=12)).map(x=>{let w=x[1];a.forEach(k=>{if(x[2]&&x[2][k]!==undefined)w*=x[2][k]});if(t.vie){if(EREQ[x[0]]&&!permis(EREQ[x[0]]))w*=.03;w*=repMult(x[0])*objBoost(x[0])*v10Boost(x[0]);C.rep.concat(C.ligTrait?[['L',C.ligTrait]]:[]).forEach(r=>{const m=TR[r[1]];if(m&&m[x[0]])w*=m[x[0]]});RELF.forEach(f=>{const v=C.rel[f],k=v>=2?'Rel:'+f+'+':v<=-2?'Rel:'+f+'-':'',m=RELW[k];if(m&&m[x[0]])w*=m[x[0]]});const mo=C.mnd&&MONDE[C.mnd.n].w[x[0]];if(mo)w*=mo}
  const why=rw.find(k=>x[2]&&x[2][k]!==undefined&&x[2][k]!==1&&k!==C.pos&&!SAI.includes(k.toLowerCase()))||(x[3]&&x[3]!==C.pos?x[3]:'');return{t:x[0],w,why:why.startsWith('Étape:')?'son objectif':why}}).filter(x=>x.w>0);
 return l.length?l:t.o.filter(x=>!x[3]).map(x=>({t:x[0],w:x[1]}))}
function dessiner(w){
 const t=table();if(!t||C.fin){cur=[];$('g').innerHTML='';$('leg').innerHTML='';return}
 cur=truquer(poids(t),t);const s=cur.reduce((a,x)=>a+x.w,0);let a=-Math.PI/2,h='',leg=[];
 const p=(r,u)=>(150+r*Math.cos(u)).toFixed(1)+' '+(150+r*Math.sin(u)).toFixed(1);
 cur.forEach((x,i)=>{const d=x.w/s*2*Math.PI,b=a+d,c='hsl('+(i*47%360)+' 36% '+(i%2?38:46)+'%)',m=a+d/2;
  h+=cur.length>1?'<path d="M150 150L'+p(140,a)+'A140 140 0 '+(d>Math.PI?1:0)+' 1 '+p(140,b)+'Z" fill="'+c+'" stroke="'+(w===i?'#fff':'var(--s)')+'" stroke-width="'+(w===i?5:2)+'" opacity="'+(w!==undefined&&w!==i?.3:1)+'"/>':'<circle cx="150" cy="150" r="140" fill="'+c+'"/>';
  const L=x.t.length,fs=Math.min(12,88/(.56*L),d*80/1.2);
  if(fs>=7)h+='<text transform="translate('+p(88,m)+') rotate('+(m*180/Math.PI)+')" text-anchor="middle" dominant-baseline="middle" font-size="'+fs.toFixed(1)+'" fill="#fff" opacity="'+(w!==undefined&&w!==i?.3:1)+'">'+esc(x.t)+'</text>';a=b});
 $('g').innerHTML=h;
}
/* ----- Jets, effets, objets, boutique ----- */
function usure(k){const c=[];C.inv.filter((x,i,a)=>a.indexOf(x)===i).forEach(x=>{if(((ITEMS[x]||{})[k])&&DUR[x]){C.us[x]=(C.us[x]||0)+1;if(C.us[x]>=DUR[x]){C.inv.splice(C.inv.indexOf(x),1);C.us[x]=0;c.push(x)}}});return c}
function jet(k,d,tag){d+=DIFF.a+Math.min(DIFF.b,Math.floor(C.vie.length/DIFF.c));const b=C.inv.reduce((s,x)=>s+((ITEMS[x]||{})[k]||0),0),cp=tag?bonusComp(tag):0,r=2+rnd(6)+rnd(6),st=Math.floor(C.st[k]/2),ml=(C.bl||[]).reduce((s,x)=>s+((x.s||{})[k]||0),0),cm=C.cmp?Math.min(2,C.cmp.niv):0,tot=r+st+b+cp+ml+cm;
 const casses=usure(k);return{ok:tot>=d,casses,txt:(/^[AEIOUÉ]/.test(S[k])?'Jet d\u2019':'Jet de ')+S[k]+' : '+tot+' (dés '+r+' + stat '+st+(b?' + objets '+b:'')+(cp?' + compétence '+cp:'')+(cm?' + compagnon '+cm:'')+(ml?' - blessure '+(-ml):'')+') contre '+d}}
let LASTOK=true;
function initComp(){const g=k=>(C.rep.find(r=>r[0]===k)||[])[1],L=[];
 (SKM[g('Métier')]||[]).forEach(s=>L.push(s));if(RSK[g('Race')])L.push(RSK[g('Race')]);if(ASK[g('Archétype')])L.push(ASK[g('Archétype')]);
 const U=L.filter((s,i,a)=>a.findIndex(x=>x[0]===s[0])===i);C.comp=U.slice(0,1).map(s=>({n:s[0],tag:s[1],xp:1,rate:1}));C.lat=U.slice(1);C.vis=[C.pos]}
function bonusComp(tag){return Math.min(3,C.comp.filter(k=>k.tag===tag).reduce((m,k)=>Math.max(m,Math.ceil(niv(k)/2)),0))}
function gagner(v,ok,tx){const tag=ETAG[v]||(v==='Journée de travail'?(C.comp[0]||{}).tag:undefined);if(!tag)return;const ar=C.rep.map(r=>r[1]);
 if(ok&&(C.lat||[]).length){C.lat.filter(s=>s[1]===tag).forEach(s=>{C.comp.push({n:s[0],tag:s[1],xp:1,rate:1});tx.push('Compétence éveillée : '+s[0])});C.lat=C.lat.filter(s=>s[1]!==tag)}
 let k=C.comp.filter(s=>s.tag===tag);
 if(!k.length&&ok&&GEN[tag]){const n={n:GEN[tag],tag,xp:.5,rate:.5};C.comp.push(n);k=[n];tx.push('Nouvelle compétence : '+n.n)}
 k.forEach(s=>{const a=niv(s);s.xp+=s.rate*(ok?1.2:.8);if(niv(s)>a)tx.push(s.n+' niveau '+niv(s))});
 UNL.forEach(u=>{if(u[0]===v&&(u[1]===undefined||u[1]===ok)&&!C.comp.some(s=>s.n===u[2])){C.comp.push({n:u[2],tag:u[3],xp:1,rate:.8});tx.push('Compétence débloquée : '+u[2])}});
 UNL2.forEach(u=>{if(u[0]===v&&(u[1]===undefined||u[1]===ok)&&u[2].every(x=>ar.includes(x))&&!C.comp.some(s=>s.n===u[3])){C.comp.push({n:u[3],tag:u[4],xp:1,rate:1});tx.push('Compétence débloquée : '+u[3]+' ('+u[2].join(' + ')+')')}})}
function donner(v){const e=CAD[v]||{},tx=[];
 Object.keys(S).forEach(k=>{if(e[k]){C.st[k]+=e[k];tx.push(S[k]+' +'+e[k])}});
 if(e.pvm){C.pvm+=e.pvm;C.pv+=e.pvm;tx.push('Vie max +'+e.pvm)}if(e.or){C.or=Math.max(0,C.or+e.or);tx.push('Or '+(e.or>0?'+':'')+e.or)}if(e.pvm){C.pvm+=e.pvm;C.pv+=e.pvm;tx.push('Vie max +'+e.pvm)}if(e.enm){C.enm+=e.enm;C.en+=e.enm;tx.push('Énergie max +'+e.enm)}
 if(e.xp){C.comp.forEach(s=>s.xp+=e.xp);tx.push('Toutes les compétences progressent')}if(e.it){C.inv.push(e.it);tx.push('+ '+e.it)}if(e.fl){C.fl.push(e.fl);tx.push(e.fl)}return tx}
const CIC=['au bras','à la jambe','au visage','au flanc'],nomPropre=()=>NOMS1[rnd(NOMS1.length)]+' '+NOMS2[rnd(NOMS2.length)];
function cicatrice(tx){const k=Object.keys(S)[rnd(5)];C.st[k]=Math.max(1,C.st[k]-1);C.pvm=Math.max(5,C.pvm-1);C.pv=Math.min(C.pv,C.pvm);const t='Cicatrice '+CIC[rnd(4)]+' ('+S[k]+' -1)';C.cic.push(t);tx.push(t)}
function evMonde(tx){const m=C.mnd;if(m&&C.t>=m.fin){tx.push('Fin : '+m.n);WORLD.seq={n:m.n,fin:anCourant()+12};C.mnd=null;if(WORLD.mnd&&WORLD.mnd.n===m.n)WORLD.mnd=null;return}
 if(!m&&!WORLD.mnd&&C.vie.length>=3&&Math.random()<.12){const k=Object.keys(MONDE),n=k[rnd(k.length)],y=3+rnd(8);C.mnd={n,fin:C.t+y*12};WORLD.mnd={n,fin:anCourant()+y};tx.push('Le monde change : '+n+' (environ '+y+' ans). '+MONDE[n].t)}}
const vieChere=tx=>{if(VILLES.includes(C.pos)&&C.or>0){C.or--;tx.push('Vie chère : or -1')}};
const etats=()=>C.fl.map(f=>f==='Ennemi juré'&&C.nem?'Ennemi juré : '+C.nem:f==='Allié'&&C.ally?'Allié : '+C.ally:f).concat(C.cic,(C.bl||[]).map(b=>b.n+' ('+b.t+' actions)'));
function appliquer(v){const e=EF[v]||{},tx=[];let ok=true;if(v==='Piste d\'un lieu oublié')decouvrir(tx);if(v==='Explorer le site')explorer(tx);
 if(e.jet){const j=jet(e.jet[0],e.jet[1],ETAG[v]);ok=j.ok;tx.push(j.txt+' : '+(ok?'réussi':'raté'));j.casses.forEach(x=>tx.push(x+' se brise'))}
 Object.keys(S).forEach(k=>{if(e[k]){C.st[k]=Math.max(1,C.st[k]+e[k]);tx.push(S[k]+(e[k]>0?' +':' ')+e[k])}});
 if(e.PV){let d=e.PV;if(d<0&&e.jet&&ok)d=Math.min(-1,Math.ceil(d/2));else if(d<0&&e.jet&&!ok)d-=DIFF.d;C.pv=Math.min(C.pvm,C.pv+d);tx.push('Vie '+(d>0?'+':'')+d);if(d<0&&e.jet&&!ok&&Math.random()<.5)cicatrice(tx)}
 if(e.EN){C.en=Math.max(0,Math.min(C.enm,C.en+e.EN));tx.push('Énergie '+(e.EN>0?'+':'')+e.EN)}
 if(e.or&&(e.or<0||ok)){C.or=Math.max(0,C.or+e.or);tx.push('Or '+(e.or>0?'+':'')+e.or)}
 if(e.it&&ok){C.inv.push(e.it);tx.push('+ '+e.it)}
 if(e.fl&&!C.fl.includes(e.fl)){C.fl.push(e.fl);tx.push(e.fl);if(e.fl==='Ennemi juré'&&!C.nem)C.nem=nomPropre();if(e.fl==='Allié'&&!C.ally)C.ally=nomPropre()}
 if(e.uf&&(ok||!e.jet)){C.fl=C.fl.filter(f=>f!==e.uf);if(e.uf==='Ennemi juré')C.nem=''}
 const rl=REL[v];if(rl&&ok)Object.keys(rl).forEach(f=>{C.rel[f]=Math.max(-5,Math.min(5,C.rel[f]+rl[f]));tx.push(f+(rl[f]>0?' +':' ')+rl[f])});LASTOK=ok;gagner(v,ok,tx);return tx}
function auto(tx){ /* objets utilisés seuls */
 let k;while(C.pv>0&&C.pv<=4&&(k=C.inv.indexOf('Potion de soin'))>=0){C.inv.splice(k,1);C.pv=Math.min(C.pvm,C.pv+ITEMS['Potion de soin'].n);tx.push('boit une Potion de soin')}
 while(C.pv>0&&C.en<=2&&(k=C.inv.indexOf('Ration'))>=0){C.inv.splice(k,1);C.en=Math.min(C.enm,C.en+ITEMS['Ration'].n);tx.push('mange une Ration')}}
const px=x=>Math.round(ITEMS[x].p*(WORLD.prix||1)*(C.rel.Marchands>=2?.75:C.rel.Marchands<=-2?1.25:1)*(C.mnd&&C.mnd.n==='Famine'&&x==='Ration'?2:1)*(C.mnd&&C.mnd.n==='Guerre'&&['Épée','Dague','Arc','Armure légère'].includes(x)?1.5:1));
function boutique(tx){ /* achats seuls en ville */
 if(!VILLES.includes(C.pos)||C.pv<=0)return;const a=x=>{const p=px(x);C.or-=p;C.inv.push(x);tx.push('achète : '+x+' ('+p+' or)')},n=x=>C.inv.filter(y=>y===x).length;
 if(!n('Potion de soin')&&C.or>=px('Potion de soin')+3)a('Potion de soin');if(n('Ration')<2&&C.or>=px('Ration'))a('Ration');
 if(!C.inv.some(x=>['Épée','Dague','Marteau','Arc'].includes(x))&&C.or>=px('Épée'))a('Épée');if(!n('Armure légère')&&C.or>=px('Armure légère')+5)a('Armure légère')}
function verifier(){
 if(C.en<=0){C.fat++;if(C.fat%2===0&&C.enm>3)C.enm--;if(C.pv>0)C.pv--}
 if(C.pv<=0){C.pv=0;C.fin='mort';return}
 if(age()>=70){C.fin='mort';return}
 if(avancer())C.fin='victoire'}
function cible(c){if(C.tr&&c.includes(C.tr)&&Math.random()<.5)return C.tr;if(Math.random()>.3){const n=c.filter(x=>!ETR.includes(x));if(n.length)c=n}if(C.sq&&c.includes(C.sq.lieu)&&Math.random()<.45)return C.sq.lieu;const o=C.obj,q=etq();let tg=null;if(C.qs<q.length){const d=OBJD[o]&&OBJD[o][C.qs];if(d){if(d.t==='lieu')tg=d.v;else if(d.t==='ev'){const e=tv().o.find(x=>x[0]===d.v);tg=e&&e[3]}}else if(o==='Retrouver la Relique'&&C.qs>=1)tg='Désert aux ruines'}
 return tg&&c.includes(tg)&&Math.random()<.5?tg:c[rnd(c.length)]}
function agir(v,why){
 const nm=v==='Vengeance de l\'ennemi'?C.nem:'',d0=cap(sai())+', '+age()+' ans',pv0=C.pv,ch=choix(v),tx=appliquer(v),sc=(EF[v]||{}).sc;const perte=pv0-C.pv;if(ch)ch.fin(tx);let txt=v,vers=null,de=C.pos,dt=1+rnd(2);
 if(/^voyage/i.test(v)){const c=tous().filter(x=>x!==C.pos);if(c.length&&C.pos){vers=cible(c);txt=v+' : '+de+' vers '+vers;C.trail.push([de,vers]);C.pos=vers;if(!C.vis.includes(vers))C.vis.push(vers);C.arr=C.arr||[];if(!C.arr.includes(vers))C.arr.push(vers);const cf=(C.inv.includes('Cheval')?1:2)+((C.bl||[]).some(b=>b.n==='Jambe brisée')?1:0);C.en=Math.max(0,C.en-cf);tx.push('Énergie -'+cf);dt=3}}
 else txt+=(C.pos?' à '+C.pos:'');
 if(sai()==='hiver'){C.en=Math.max(0,C.en-1);tx.push('Froid : Énergie -1')}
 C.t+=dt;meteo();if(C.cd>0)C.cd--;if(v==='Vengeance de l\'ennemi')C.cd=4;evMonde(tx);vieChere(tx);auto(tx);boutique(tx);apresAction(v,LASTOK,perte,dt,tx);lieuEffets(tx);immoAuto(tx);revenus(tx,v);v10Apres(v,LASTOK,tx);v11Apres(v,LASTOK,tx);
 if(tx.includes('Ennemi juré')&&C.nem)txt+=' (ennemi : '+C.nem+')';if(nm)txt=v+' : '+nm;if(/allié/i.test(v)&&C.ally)txt+=' : '+C.ally;
 const ent={t:v,ok:LASTOK,p:C.pos,txt:''};C.vie.push(ent);verifier();succes(tx);{const e0=etq()[C.qs];if(e0&&e0[3]&&!C.fin&&e0[3].t!=='lieu'){const p=progres(e0[3]);if(p)tx.push('Objectif : '+p[0]+'/'+p[1])}}if(C.en<=0&&!C.fin)tx.push('épuisé');
 ent.txt=(d0+' : '+txt+(why?' (suite à : '+why+')':'')+(tx.length?' ['+tx.join(', ')+']':'')+(C.fin==='mort'?' : mort'+(age()>=70?' de vieillesse':''):''));
 $('act').textContent=ent.txt;ecrire('c',C);return{tx,vers,de,sc}}
function fin(){C.pvm=C.pv=8+C.st.End;C.enm=C.en=6+Math.floor(C.st.End/2);C.or=5;C.age0=17+rnd(14);C.t=rnd(12);meteo();
 const g=k=>(C.rep.find(r=>r[0]===k)||[])[1];C.inv=[INV[g('Métier')]||'Bâton','Ration'];C.obj=g('Objectif')||'';initComp();C.an0=WORLD.annee+1+rnd(20);applyLig();applyRH();heritages();v10Debut()}
function applyRH(){C.rhTx=[];const rc=race(),h=RH[rc];if(!h)return;const v=Math.min(3,h.v||0),m=Math.min(3,h.m||0),bs=Object.keys(S).sort((a,b)=>((SB[rc]||{})[b]||0)-((SB[rc]||{})[a]||0));
 if(v){const st={};bs.slice(0,v).forEach(k=>st[k]=1);effet({st,or:3*v},C.rhTx);C.rhTx.unshift('Gloire des '+rc.toLowerCase()+'s ('+h.v+' victoire'+(h.v>1?'s':'')+')')}
 if(m){effet({pvm:m},C.rhTx);C.rhTx.unshift('Leçon des disparus ('+h.m+' mort'+(h.m>1?'s':'')+' parmi les '+rc.toLowerCase()+'s)')}}
/* ----- Fin de partie ----- */
function bio(){const g=k=>((C.rep.find(r=>r[0]===k)||[])[1]||'').toLowerCase(),ev=C.vie.filter(x=>x.t!=='Objet').map(x=>x.t.toLowerCase()).slice(0,5).join(', ');
 return nomS()+', '+g('Race')+' '+g('Métier')+' ('+g('Origine')+', '+g('Trait de caractère')+' et '+g('Défaut')+'). '+(ev?'Sa vie : '+ev+'. ':'')
  +(C.fin==='mort'?'Fin : mort à '+age()+' ans.':'Fin : objectif accompli (« '+C.obj+' ») à '+age()+' ans.')+' Fortune : '+C.or+' pièces d\u2019or.'+(C.lig?' Lignée : '+C.lig.nom+'.':'')+(C.fonde?' Il fonde la '+C.fonde+'.':'')+(C.mortT?' '+C.mortT+'.':'')+(C.fondL?' Il laisse derrière lui : '+C.fondL+'.':'')+(C.succ.length?' Succès : '+C.succ.join(', ')+'.':'')+(C.fonde?'':C.lg?' '+C.lg:'')}
function effet(e,tx){if(!e)return;Object.keys(e.st||{}).forEach(k=>{C.st[k]=Math.max(1,C.st[k]+e.st[k]);tx.push(S[k]+' +'+e.st[k])});
 if(e.or){C.or+=e.or;tx.push('Or +'+e.or)}if(e.it){C.inv.push(e.it);tx.push('+ '+e.it)}if(e.xp){C.comp.forEach(s=>s.xp+=e.xp);tx.push('Compétences +'+e.xp)}
 if(e.comp&&!C.comp.some(s=>s.n===e.comp[0])){C.comp.push({n:e.comp[0],tag:e.comp[1],xp:4,rate:1});tx.push('Compétence héritée : '+e.comp[0])}
 if(e.trait){C.ligTrait=e.trait;tx.push('Trait de lignée : '+e.trait)}}
function applyLig(){C.ligTx=[];if(!C.lig)return;effet(C.lig.heri.eff,C.ligTx);(C.lig.gains||[]).forEach(g=>effet(g.eff,C.ligTx))}
function succes(tx){if(C.succ.length>=1)return;const rc=race();const L=SUCC.slice();if(rc)L.push(['Premier '+rc.toLowerCase()+' victorieux',c=>c.fin==='victoire',{or:10},'Le premier '+rc.toLowerCase()+' à atteindre son objectif.']);
 L.some(s=>{if(WORLD.succ[s[0]]||C.succ.includes(s[0])||!s[1](C))return false;WORLD.succ[s[0]]={par:C.nom||'Un inconnu',an:anCourant(),ag:age(),race:rc,obj:C.obj};C.succ.push(s[0]);majSurnom();ecrire('monde',WORLD);const t2=[];effet(s[2],t2);tx.push('Succès mondial, premier à l\u2019obtenir : '+s[0]+(t2.length?' ('+t2.join(', ')+')':'')+(C.sur?'. Surnom : '+nomS():''));return true})}
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
 const gains=C.succ.slice(0,2).map(n=>({txt:n,eff:(SUCC.find(x=>x[0]===n)||[0,0,{or:10}])[2]})),l={nom,fond:C.nom||'Sans nom',race:g('Race'),txt:(C.nom||'Un ancêtre')+', '+g('Race').toLowerCase()+' '+g('Métier').toLowerCase()+', a fondé cette lignée. '+heri.txt+(gains.length?'. Succès transmis : '+gains.map(x=>x.txt).join(', '):'')+'.',heri,gains};
 if(l.race==='Sang-mêlé')l.par=[g('Parent 1'),g('Parent 2')].sort();l.parent=C.lig?C.lig.nom:null;l.rep=0;LIG.push(l);ecrire('lig',LIG);C.fonde=nom;return l}
function archiver(){if(!C.fin||C.arch)return;C.arch=1;WORLD.annee=Math.max(WORLD.annee,anCourant());ecrire('monde',WORLD);
 traceMonde();const marq=C.fin==='victoire'||C.succ.length>=1||(C.dec>0&&C.boss>0)||C.mortT==='Mort en légende'||C.mortT==='Mort en héros';const rc=race();RH[rc]=RH[rc]||{v:0,m:0};if(C.fin==='victoire')RH[rc].v++;else RH[rc].m++;ecrire('raceh',RH);
 if(marq&&Math.random()<.08+.92/(1+.6*LIG.length))fonder();C.lg=C.fonde?'':marq?'Une lignée était possible, mais le hasard ne l\u2019a pas retenue.':'Pas assez marquant pour fonder une lignée (il faut une victoire, un succès mondial, ou une découverte avec un gardien vaincu).';
 PAN.unshift({nom:C.nom?nomS():'Sans nom',race:race(),metier:((C.rep.find(r=>r[0]==='Métier')||[])[1]||''),fin:C.fin,age:age(),bio:bio(),lig:C.lig?C.lig.nom:'',nouvelle:C.fonde,or:C.or,vie:C.vie.length,note:C.note||'',rec:(typeof recit==='function'?recit():''),succ:C.succ.slice(),obj:C.obj,mortT:C.mortT||'',biens:(C.biens||[]).map(b=>b.n)});PAN=PAN.slice(0,30);v10Fin();ecrire('pan',PAN);ecrire('c',C)}
/* ----- Interface ----- */
const jauge=(n,v,m)=>'<li class="st"><span>'+n+'</span><i style="--v:'+Math.max(0,Math.min(100,v/m*100))+'%"></i><b>'+v+'/'+m+'</b></li>';
const libItem=x=>{const i=ITEMS[x]||{},b=Object.keys(S).filter(k=>i[k]).map(k=>'+'+i[k]+' '+S[k]);return esc(x)+(b.length?' <small>('+b.join(', ')+' aux jets)</small>':i.use?' <small>(utilisé seul si besoin)</small>':'')};
function ui(){
 const t=table(),n=etapes().length,f=C.fin;archiver();feedback();document.body.dataset.s=C.pvm?sai():'';
 $('et').textContent=f?'':C.rep.length<n?'Création, étape '+(C.rep.length+1)+'/'+n+' : '+t.n:(C.nom?nomS():'Votre personnage')+' : '+cap(sai())+', '+age()+' ans, '+C.meteo.toLowerCase()+(C.mnd?', '+C.mnd.n.toLowerCase()+' en cours':'')+'. Tirez un événement';
 $('ico').innerHTML=C.rep.length?portrait(race(),58,true):'';
 const nomsS=Object.values(S),q=etq();
 $('fi').innerHTML=(C.pvm?jauge('Vie',C.pv,C.pvm)+jauge('Énergie',C.en,C.enm)+'<li class="st"><span>Or</span><i></i><b>'+C.or+'</b></li>'+RELF.map(f=>'<li class="st"><span>'+f+'</span><i style="--v:'+((C.rel[f]+5)*10)+'%"></i><b>'+(C.rel[f]>0?'+':'')+C.rel[f]+'</b></li>').join(''):'')+Object.keys(C.st).map(k=>'<li class="st"><span>'+S[k]+'</span><i style="--v:'+Math.min(100,C.st[k]/12*100)+'%"></i><b>'+C.st[k]+'</b></li>').join('')
  +(C.rep.filter(r=>!nomsS.includes(r[0])&&r[0]!=='Objectif').map(r=>'<li><b>'+esc(r[0])+'</b>'+esc(r[1])+'</li>').join('')||'<li>Pas encore de réponse.</li>')
  +(C.comp.length?'<li><b>Compétences</b>'+C.comp.map((k,i)=>'<button class="sk" data-i="'+i+'">'+esc(k.n)+' <small>niv. '+niv(k)+'</small></button>').join('<br>')+((C.lat||[]).length?'<br><small>+ '+C.lat.length+' talent'+(C.lat.length>1?'s':'')+' endormi'+(C.lat.length>1?'s':'')+'</small>':'')+'</li>':'')
  +(C.sur?'<li><b>Surnom</b>'+esc(nomS())+'</li>':'')+(titreRang()?'<li><b>Rang</b>'+esc(titreRang())+'</li>':'')+(C.cmp?'<li><b>Compagnon</b>'+esc(C.cmp.n)+' <small>('+C.cmp.ty.toLowerCase()+', niv. '+C.cmp.niv+', '+Math.floor(C.cmp.ag)+' ans)</small></li>':'')+((C.biens||[]).length?'<li><b>Biens</b>'+C.biens.map(b=>esc(b.n)).join('<br>')+'</li>':'')+fiche10()+(C.sq?'<li><b>Quête secondaire</b>'+esc(C.sq.txt)+'</li>':'')+(C.enf&&C.enf.length?'<li><b>Enfants</b>'+C.enf.map(e=>esc(e.n+(e.fam?' '+e.fam:''))).join(', ')+'</li>':'')+((WORLD.rep[C.pos]||0)?'<li><b>Réputation ici</b>'+(WORLD.rep[C.pos]>0?'+':'')+WORLD.rep[C.pos]+'</li>':'')
  +(etats().length?'<li><b>États</b>'+etats().map(esc).join('<br>')+'</li>':'')+(C.succ.length?'<li><b>Succès obtenus</b>'+C.succ.map(esc).join('<br>')+'</li>':'')+'<li><details><summary><b>Succès du monde</b> <small>'+Object.keys(WORLD.succ).length+' pris sur '+SUCC.length+'</small></summary>'+SUCC.map(x=>WORLD.succ[x[0]]?'<small>'+(C.succ.includes(x[0])?'\u2605 ':'')+esc(x[0])+' : '+esc(x[3]||'')+' <i>Pris par '+esc(WORLD.succ[x[0]].par)+' (an '+WORLD.succ[x[0]].an+')</i></small>':'<small>'+esc(x[0])+' : libre. '+esc(x[3]||'')+'</small>').join('<br>')+'</details></li>'
  +(C.obj?'<li data-ob="1" style="cursor:pointer"><b>Objectif <small>(toucher pour le détail)</small></b>'+esc(C.obj)+(q.length===1?progTxt(q[0]):'')+(q[C.qs]?'<br><small>À faire : '+esc(afaire(q[C.qs]))+'</small>':'')+(q.length>1?'<br><small>'+q.map((e,i)=>(i<C.qs?'fait : ':i===C.qs?'en cours : ':'à venir : ')+esc(e[0])+(i===C.qs?progTxt(e):'')).join('<br>')+'</small>':'')+'</li>':'');
 $('inv').innerHTML=C.inv.map(x=>'<li>'+libItem(x)+'</li>').join('')||'<li>Inventaire vide.</li>';
 $('mn').innerHTML=WORLD.sites.map(s=>'<li><b>'+esc(s.ty)+' : '+esc(s.n)+'</b>découvert par '+esc(s.par)+' (an '+s.an+'), '+s.expl+' exploration'+(s.expl>1?'s':'')+(s.expl>0&&(C.an0?anCourant():WORLD.annee)-s.an<100?', déjà pillé':', intact')+'</li>').join('')||'<li>Aucun lieu découvert.</li>';
 $('j').hidden=!REG.j;$('j').innerHTML=C.vie.map(x=>{const p=x.txt.split(' [');return '<li><b>'+esc(p[0])+'</b>'+esc(p[1]?p[1].replace(/\]$/,'').replace(/, /g,' · '):'')+'</li>'}).join('')||'<li>Aucun événement pour l\u2019instant.</li>';
 $('pan').innerHTML=PAN.map((x,i)=>!panOK(x)?'':'<li data-p="'+i+'"><span class="pi">'+iconeSVG(x.race,30)+'</span><span><b>'+esc(x.nom)+' : '+(x.fin==='mort'?'mort':'victoire')+' à '+x.age+' ans</b>'+esc(x.race+' '+x.metier+(x.succ&&x.succ.length?', '+x.succ[0]:'')+(x.lig?', '+x.lig:'')+(x.nouvelle?', fonde la '+x.nouvelle:''))+'</span></li>').join('')||'<li>Aucun personnage terminé pour l\u2019instant.</li>';if(PAN.length&&!$('pan').innerHTML.trim())$('pan').innerHTML='<li>Aucun personnage ne correspond au filtre.</li>';hist();
 $('fin').hidden=!f;if(f)$('fin').innerHTML='<b>'+(f==='mort'?esc(nomS())+' est mort.':'Objectif accompli !')+'</b><br>'+esc(bio())+'<br><button id="bl">Bilan de vie</button>';
 $('go').disabled=!t||occ||!!f;if($('un'))$('un').hidden=!(UNDO&&UNDO.length)||!C.pvm;banniere();autoSauve();majPanF();majSv();hist10();hist11();if($('un'))$('un').textContent='Annuler ('+UNDO.length+')';if($('rp'))$('rp').hidden=!C.pvm||!!C.fin||C.rep.length<etapes().length;$('vc').hidden=!C.pos;rendreStats();dessiner()}
/* ----- Son, tirage synchronisé, carte du destin ----- */
let AC=null,MUET=lire('muet',false);
function bip(f,d,v,t){if(MUET)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain();o.type=t||'triangle';o.frequency.value=f;const T0=AC.currentTime;g.gain.setValueAtTime(.0001,T0);g.gain.linearRampToValueAtTime(v||.05,T0+.006);g.gain.exponentialRampToValueAtTime(.0001,T0+d);o.connect(g);g.connect(AC.destination);o.start(T0);o.stop(T0+d+.02)}catch(e){}}
const ding=()=>{bip(660,.5,.07,'sine');setTimeout(()=>bip(990,.7,.06,'sine'),90)};
let TIC=0;const tic=k=>{const n=performance.now();if(n-TIC<90)return;TIC=n;bip(380+20*(k%6),.04,.012,'sine')};
$('son').textContent='Son : '+(MUET?'non':'oui');$('son').onclick=()=>{MUET=!MUET;ecrire('muet',MUET);$('son').textContent='Son : '+(MUET?'non':'oui')};
const STORY=(t,v)=>(t.n==='Lignée'?(v==='Sans lignée'?'Aucun grand nom derrière lui : tout reste à écrire.':(LIG.find(l=>l.nom===v)||{}).txt):'')||HIST[v]||({'Trait de caractère':'Un trait qui marquera ses choix : '+v.toLowerCase()+'.','Défaut':'Son défaut, '+v.toLowerCase()+', lui jouera des tours.','Décor':'Sa vie commence ici : '+v+'.','Objectif':'Son but : '+v.toLowerCase()+'.'}[t.n]||'');
function modal(cat,titre,texte,liste,ok,img){const m=$('md');$('mca').textContent=cat;$('mti').textContent=titre;$('mtx').className='';$('mtx').textContent=texte;$('mli').innerHTML=(liste||[]).map(x=>'<li>'+esc(x)+'</li>').join('');
 if($('mim'))$('mim').innerHTML='';$('mem').innerHTML=cat==='Race'?portrait(titre,120):'<div class="gl">'+esc(titre.charAt(0))+'</div>';m.hidden=false;if(img)illustrer(img[0],img[1]);$('mok').onclick=()=>{m.hidden=true;ok&&ok()};$('mok').focus()}
function resume(){const k=Object.keys(S).sort((a,b)=>C.st[b]-C.st[a]);modal('Caractéristiques','Votre personnage',S[k[0]]+' est son point fort, '+S[k[4]]+' son point faible.',Object.keys(S).map(x=>{const rb=((SB[(C.rep.find(r=>r[0]==='Race')||[])[1]]||{})[x]||0);return S[x]+' : '+C.st[x]+(rb?' (race '+(rb>0?'+':'')+rb+')':'')}),()=>ui())}
$('go').onclick=()=>{
 if(occ||!cur.length)return;if(AC&&AC.state==='suspended')AC.resume();const t=table(),s=cur.reduce((a,x)=>a+x.w,0);let r=Math.random()*s,i=0,c=0;
 for(;i<cur.length-1;i++){if(r<c+cur[i].w)break;c+=cur[i].w}
 const r0=rot,d=(((-r/s*360-r0)%360)+360)%360,r1=r0+1800+d,t0=performance.now();let last=-1;occ=true;$('go').disabled=true;$('res').className='';$('act').textContent='';
 const f=()=>{const u=Math.min(1,(performance.now()-t0)/(4300*REG.vit)),a=r0+(r1-r0)*(1-Math.pow(1-u,3));$('g').style.transform='rotate('+a+'deg)';
  const th=(((-a%360)+360)%360)/360*s;let k=0,cc=0;for(;k<cur.length-1;k++){if(th<cc+cur[k].w)break;cc+=cur[k].w}
  if(k!==last){last=k;tic(k);$('res').textContent=cur[k].t}
  if(u<1)requestAnimationFrame(f);else{rot=r1;arret(t,i)}};requestAnimationFrame(f)};
function arret(t,i){const v=cur[i].t,why=cur[i].why;$('res').textContent=v;$('res').className='pop';dessiner(i);ding();try{navigator.vibrate&&navigator.vibrate(40)}catch(e){}
 setTimeout(()=>{occ=false;suite(t,v,why)},1000)}
function suite(t,v,why){
 if(t.vie){snapUndo();const o=agir(v,why);ui();modal(t.n,v,STORY(t,v),o.tx,()=>{o.vers?voyage(v,o.de,o.vers):o.sc?scene(o.sc,ui):ui()},['ev',v]);return}
 C.rep.push([t.n,v]);if(t.n==='Lignée')C.lig=LIG.find(l=>l.nom===v)||null;if(t.n==='Famille')C.famOk=(v==='Héritage familial');if(t.n==='Décor')C.pos=v;if(t.stat)C.st[t.stat]=+v;let extra=[];if(C.rep.length===etapes().length){fin();if(t.n==='Cadeau divin')extra=donner(v).concat(C.ligTx||[],C.rhTx||[],C.famTx||[]);chienCmp()}ecrire('c',C);ui();
 if(t.stat){const nx=etapes()[C.rep.length];if(!nx||!nx.stat)resume();return}
 modal(t.n,v,STORY(t,v)+(t.n==='Race'&&RDESC[v]?' Apparence : '+RDESC[v]:''),extra,ui,t.n==='Race'?['race',v]:null)}
/* ----- Retours visuels : dégâts, gains, confettis ----- */
let PV0=null,OR0=null,FETE=false;
const num=(t,c)=>{const e=document.createElement('div');e.className='num';e.textContent=t;e.style.color=c;document.body.appendChild(e);setTimeout(()=>e.remove(),1300)};
function feedback(){if(!C.pvm){PV0=OR0=null;return}
 if(PV0!==null){const d=C.pv-PV0,o=C.or-OR0;if(d<0){$('fx').className='';void $('fx').offsetWidth;$('fx').className='rouge';num(d+' Vie','#d33')}else if(d>0)num('+'+d+' Vie','#2a8');if(o>0)num('+'+o+' or','#b8862d')}
 PV0=C.pv;OR0=C.or;
 if(C.fin==='victoire'&&!FETE){FETE=true;for(let i=0;i<40;i++){const e=document.createElement('div');e.className='cf';e.style.left=Math.random()*100+'vw';e.style.background=['#d9a441','#d33','#2a8','#47a'][i%4];e.style.animationDelay=Math.random()*.8+'s';document.body.appendChild(e);setTimeout(()=>e.remove(),3600)}}}
$('nom').value=C.nom;$('nom').oninput=e=>{C.nom=e.target.value;ecrire('c',C)};
$('cop').onclick=()=>{const s=(C.nom||'Personnage')+'\n\n'+Object.keys(C.st).map(k=>S[k]+' : '+C.st[k]).join('\n')+'\n\n'+C.rep.filter(r=>!Object.values(S).includes(r[0])).map(r=>r[0]+' : '+r[1]).join('\n')+'\n\nInventaire : '+C.inv.join(', ')+' ; or : '+C.or+'\n\n'+C.vie.map(x=>x.txt).join('\n')+(C.fin?'\n\n'+bio():'');try{navigator.clipboard.writeText(s);$('cop').textContent='Copié'}catch(e){}setTimeout(()=>$('cop').textContent='Copier',1500)};
$('raz').onclick=()=>{if(occ||!confirm('Commencer un nouveau personnage ?'))return;FETE=false;UNDO=[];C=nouveau();$('nom').value='';ecrire('c',C);$('res').textContent='';$('act').textContent='';ui()};
const edt=()=>T.filter(t=>!t.stat);
function menu(){$('sl').innerHTML=edt().map((x,i)=>'<option value="'+i+'">'+esc(x.n)+'</option>').join('');edit()}
function edit(){const t=edt()[+$('sl').value||0];$('ed').value=t.o.map(x=>{const m=x[2]||{},k=Object.keys(m);return x[0]+' | '+x[1]+(k.length||x[3]?' | '+k.map(y=>y+'='+m[y]).join('; '):'')+(x[3]?' | '+x[3]:'')}).join('\n')}
$('sl').onchange=edit;
$('sv').onclick=()=>{const o=$('ed').value.split('\n').map(l=>{const p=l.split('|').map(s=>s.trim()),w=parseFloat((p[1]||'').replace(',','.')),m={};
 (p[2]||'').split(';').forEach(s=>{const k=s.lastIndexOf('=');if(k>0){const v=parseFloat(s.slice(k+1).replace(',','.'));if(!isNaN(v))m[s.slice(0,k).trim()]=v}});const x=[p[0],w>0?w:1,m];if(p[3])x.push(p[3]);return x}).filter(x=>x[0]);
 if(!o.length)return alert('Ajoutez au moins une option.');const tb=edt()[+$('sl').value||0];tb.o=o;const ex=PERSO.extra.find(x=>x.n===tb.n);if(ex)ex.o=o;else PERSO.tables[tb.n]=o;built=false;ecrire('perso',PERSO);ui()};
$('rd').onclick=()=>{if(confirm('Remettre toutes les tables d\u2019origine ?')){PERSO.tables={};ecrire('perso',PERSO);T=construireT();built=false;menu();ui()}};
menu();ui();
function descComp(k){const n=niv(k),nx=(n+1)*(n+1),tg=k.tag,bn=Math.min(3,Math.ceil(n/2));
 return {txt:(SKD[k.n]||UNL2.concat([]).filter(u=>u[3]===k.n).map(u=>u[5])[0]||TAGD[tg]||'')+' '+(TAGD[tg]||''),
 li:['Domaine : '+tg,'Niveau '+n+' ('+Math.round(k.xp*10)/10+' / '+nx+' points pour le suivant)','Bonus actuel aux jets de ce domaine : +'+bn+' (maximum +3)','Progresse à chaque événement du domaine '+tg+(k.rate<1?', plus lentement':'')]}}
$('fi').addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.sk');if(!b)return;const k=C.comp[+b.dataset.i];if(!k)return;const d=descComp(k);modal('Compétence',k.n,d.txt,d.li,null)});
/* admin.js : récit, sauvegardes, atelier d'édition (événements, tables, lieux, carte personnelle), mode hors ligne */
const TAGS=['combat','voyage','social','commerce','survie','hospitalité','soin','savoir','ruse','artisanat','mystique'];
const lo=s=>s?s.charAt(0).toLowerCase()+s.slice(1):'';

/* ----- Récit rédigé à partir de la vie du personnage ----- */
function recit(){
 const g=k=>(C.rep.find(r=>r[0]===k)||[])[1]||'',nom=C.nom||'Le personnage';
 if(!C.rep.length)return 'Aucune histoire à raconter pour l\u2019instant.';
 const sa={printemps:'au printemps',été:'en été',automne:'en automne',hiver:'en hiver'};
 const t=[nomS()+', '+lo(g('Race'))+' '+lo(g('Métier'))+'.',
  [HIST[g('Origine')],HIST[g('Race')],HIST[g('Archétype')],HIST[g('Métier')]].filter(Boolean).join(' '),
  (g('Trait de caractère')?nom+' est '+lo(g('Trait de caractère'))+(g('Défaut')?', mais '+lo(g('Défaut')):'')+'.':'')+(g('Décor')?' Son histoire commence ici : '+g('Décor')+'.':''),
  C.lig?nom+' porte l\u2019héritage de la '+C.lig.nom+'.':''];
 C.vie.filter(e=>e.t!=='Objet').forEach(e=>{
  const m=e.txt.match(/^([^,]+), (\d+) ans : (.*)$/);if(!m)return;const r=m[3],o=[],ok=e.ok!==false;
  const vg=r.match(/: (.+?) vers (.+?)(?: \(| \[|$)/),de=vg?vg[1]:'',vers=vg?vg[2]:'';
  let ph=(REC[e.t]||[])[ok?0:1];
  if(!ph&&/^voyage lointain/i.test(e.t)&&vg)ph=ok?'{n} part de {de} et rejoint {vers}.':'{n} part de {de} pour {vers}, mais le chemin l\u2019éprouve.';
  ph=ph?ph.replace(/\{n\}/g,nom).replace(/\{de\}/g,de).replace(/\{vers\}/g,vers):(HIST[e.t]||e.t+'.');
  let x=r.match(/Vie (-\d+)/);if(x)o.push('Il perd '+(-x[1])+' point'+(x[1]<-1?'s':'')+' de vie dans l\u2019affaire.');
  x=r.match(/Or \+(\d+)/);if(x)o.push('La bourse gagne '+x[1]+' pièces d\u2019or.');
  x=r.match(/Succès mondial[^:]*: ([^(\],]+)/);if(x)o.push('Cet exploit lui vaut un titre, que personne avant lui n\u2019avait porté : « '+x[1].trim()+' ».');
  x=r.match(/Compétence (?:éveillée|débloquée) : ([^,\]\(]+)/);if(x)o.push('Il y gagne un nouveau savoir-faire : '+x[1].trim()+'.');
  x=r.match(/Nouvelle compétence : ([^,\]]+)/);if(x)o.push('Il y apprend : '+x[1].trim()+'.');
  x=r.match(/Découverte : ([^(]+)\(/);if(x)o.push(nom+' découvre : '+x[1].trim()+'.');
  x=r.match(/Le monde change : ([^ (]+)/);if(x)o.push('Le monde bascule : '+x[1].toLowerCase()+'.');
  const ph2=ph.startsWith(nom)?ph:ph.charAt(0).toLowerCase()+ph.slice(1);
  t.push('À '+m[2]+' ans, '+(sa[m[1].toLowerCase()]||'')+', '+ph2+' '+o.join(' '))});
 const d=C.vie[C.vie.length-1];
 recitPlus().forEach(x=>t.push(x));
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
 const a=$('adm'),ed=document.querySelector('main > details:not(#reg)');if(ed)a.appendChild(ed);
 const sec=(t,h)=>{const d=document.createElement('details');d.innerHTML='<summary>'+t+'</summary>'+h;a.appendChild(d)};
 const sel=(id,l)=>'<select id="'+id+'">'+l.map(x=>'<option>'+x+'</option>').join('')+'</select>';
 sec('Nouvel événement','<input id="e-n" placeholder="Nom"><textarea id="e-t" placeholder="Histoire (une ou deux phrases)" style="min-height:70px"></textarea><div class="l"><input id="e-w" type="number" value="2" step="0.5" aria-label="Poids">'+sel('e-g',TAGS)+'</div><input id="e-m" placeholder="Réponse=multiplicateur; …"><input id="e-r" placeholder="Requis (état, lieu, objet…)"><div class="l"><input id="e-pv" type="number" placeholder="Vie ±"><input id="e-en" type="number" placeholder="Énergie ±"><input id="e-or" type="number" placeholder="Or ±"></div><div class="l">'+sel('e-s',['Aucun jet'].concat(Object.values(S)))+'<input id="e-d" type="number" value="10" aria-label="Difficulté du jet"></div><input id="e-i" placeholder="Objet gagné (facultatif)"><button class="go" id="e-ok">Ajouter l\u2019événement</button>');
 sec('Nouvelle table de création','<input id="t-n" placeholder="Nom (par exemple Passion)"><button class="go" id="t-ok">Créer la table</button><p style="color:var(--m);font-size:14px">Elle s\u2019insère avant « Objectif ». Modifiez ensuite ses options dans « Modifier les tables ».</p>');
 sec('Ma carte et mes lieux','<p style="color:var(--m);font-size:14px">Importez votre propre carte (PNG, JPG, WebP ou SVG). Elle remplace le décor dessiné ; les lieux, les voyages et les animations restent par-dessus.</p><input id="c-f" type="file" accept="image/*"><div class="l"><button id="c-x">Retirer l\u2019image</button></div><h2>Placer un lieu</h2><select id="c-l"></select><button class="go" id="c-p">Placer sur la carte</button><h2>Nouveau lieu</h2><input id="c-n" placeholder="Nom du lieu"><button class="go" id="c-a">Ajouter puis placer</button>');
 sec('Illustrations','<p style="color:var(--m);font-size:14px">Associez une image à un événement ou à une race. Elle s\u2019affiche à chaque tirage. Stockée sur cet appareil. Ou bien déposez sur GitHub un fichier <b>img/ev-nom.jpg</b> ou <b>img/race-nom.jpg</b> (nom indiqué ci-dessous).</p><select id="i-n"></select><p id="i-s" style="font-size:13px;color:var(--m)"></p><input id="i-f" type="file" accept="image/*"><div class="l"><button id="i-x">Retirer l\u2019image</button></div>');
 const inoms=()=>RACES.map(r=>['race',r[0]]).concat((T.find(x=>x.vie)||{o:[]}).o.map(o=>['ev',o[0]]));
 $('i-n').innerHTML=inoms().map((x,i)=>'<option value="'+i+'">'+(x[0]==='race'?'Race : ':'Événement : ')+esc(x[1])+'</option>').join('');
 const icur=()=>inoms()[+$('i-n').value||0],ikey=()=>icur()[0]+'-'+slug(icur()[1]);
 const ishow=()=>{$('i-s').textContent='Nom de fichier GitHub : img/'+ikey()+'.jpg'};$('i-n').onchange=ishow;ishow();
 $('i-f').onchange=e=>{const f=e.target.files[0];if(!f)return;const key=ikey(),im=new Image();im.onload=()=>{const k=Math.min(1,900/im.width),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);c.toBlob(b=>idb('set','img-'+key,b).then(()=>{delete IMC[key];alert('Image enregistrée.')}),'image/jpeg',.85)};im.src=URL.createObjectURL(f)};
 $('i-x').onclick=()=>idb('del','img-'+ikey()).then(()=>{delete IMC[ikey()];alert('Image retirée.')});
 sec('Monde','<p style="color:var(--m);font-size:14px">Remet à zéro les succès mondiaux (les titres redeviennent libres) et l\u2019héritage des races. Les lieux découverts et les lignées sont conservés.</p><button id="w-r">Réinitialiser succès et héritages</button>');
 $('w-r').onclick=()=>{if(!confirm('Libérer tous les succès mondiaux et effacer l\u2019héritage des races ?'))return;WORLD.succ={};ecrire('monde',WORLD);Object.keys(RH).forEach(k=>delete RH[k]);ecrire('raceh',RH);ui();alert('Fait.')};
 sec('Sauvegarde','<div class="l"><button id="s-d">Télécharger</button><button id="s-c">Copier</button></div><input id="s-f" type="file" accept=".json,application/json"><textarea id="s-t" placeholder="Ou collez ici une sauvegarde" style="min-height:70px"></textarea><button id="s-i">Importer le texte collé</button>');
 $('s-d').onclick=()=>{telecharger();REG.lb=Date.now();ecrire('reg',REG);banniere()};
 sec('Debug','<p style="color:var(--m);font-size:14px">État de la partie en cours : objectif, étape, pourquoi il n\u2019est pas validé, probabilités du prochain tirage. Vous pouvez aussi forcer un événement.</p><div class="l"><button id="d-r">Actualiser</button><button id="d-c">Copier</button></div><pre id="d-t" style="white-space:pre-wrap;font-size:12px;max-height:340px;overflow:auto"></pre><select id="d-e"></select><button id="d-f">Forcer cet événement</button>');
 const dr=()=>{try{$('d-t').textContent=debugTxt()}catch(x){$('d-t').textContent='Erreur : '+x.message}};
 $('d-r').onclick=()=>{dr();$('d-e').innerHTML=tv().o.map(x=>'<option>'+esc(x[0])+'</option>').join('')};$('d-r').click();
 $('d-c').onclick=()=>{try{navigator.clipboard.writeText($('d-t').textContent);$('d-c').textContent='Copié'}catch(x){}setTimeout(()=>$('d-c').textContent='Copier',1500)};
 $('d-f').onclick=()=>{debugForcer($('d-e').value);dr()};
 sec('Contrôle des objectifs','<p style="color:var(--m);font-size:14px">Fait vivre des personnages fictifs pour chaque objectif et affiche le taux de victoire. Votre partie, le monde et le panthéon ne sont pas touchés. Compter 20 à 40 secondes.</p><div class="l"><button id="a-5">Rapide (6 vies)</button><button id="a-2">Complet (20 vies)</button></div><pre id="a-t" style="white-space:pre-wrap;font-size:12px"></pre>');
 [['a-5',6],['a-2',20]].forEach(([i,n])=>$(i).onclick=()=>{$('a-t').textContent='Calcul...';audit(n,t=>{$('a-t').textContent=t})});
 sec('Aide aux illustrations','<p style="color:var(--m);font-size:14px">Voyez ce qui a déjà une image (\u2713) ou non (\u2717).</p><button id="v-b">Afficher la liste</button><pre id="v-t" style="white-space:pre-wrap;font-size:12px;max-height:340px;overflow:auto"></pre>');
 $('v-b').onclick=async()=>{const L=[];const noms=[['ev',tv().o.map(x=>x[0])],['race',(T.find(t=>t.n==='Race')||{o:[]}).o.map(x=>x[0])]];let m=0,tot=0;
  for(const [k,ls] of noms){L.push(k==='ev'?'ÉVÉNEMENTS':'RACES');for(const n of ls){let ok=!!IMC[k+'-'+slug(n)];if(!ok){const b=await idb('get','img-'+k+'-'+slug(n));ok=!!b}tot++;if(ok)m++;L.push((ok?'\u2713 ':'\u2717 ')+n+(ok?'':'   img/'+k+'-'+slug(n)+'.jpg'))}L.push('')}
  $('v-t').textContent=(tot-m)+' sans image sur '+tot+'\n\n'+L.join('\n')};
 sec('Sauvegarde automatique','<p style="color:var(--m);font-size:14px">Une copie est gardée automatiquement sur cet appareil pendant que vous jouez. Utile si une manipulation efface les données.</p><button id="x-r">Restaurer la sauvegarde automatique</button>');
 $('x-r').onclick=async()=>{const t=await idb('get','auto');if(!t)return alert('Aucune sauvegarde automatique pour l\u2019instant.');importer(t)};
 $('sv-r').onclick=()=>$('x-r').click();
 sec('Code de transfert (autre appareil)','<p style="color:var(--m);font-size:14px">Copiez un code court sur cet appareil, collez-le sur l\u2019autre dans la zone ci-dessous, puis importez.</p><div class="l"><button id="t-c">Copier mon code</button></div><textarea id="t-t" placeholder="Collez ici un code de transfert" style="min-height:70px"></textarea><button id="t-i">Importer ce code</button>');
 $('t-c').onclick=async()=>{try{const c=await codeTransfert();await navigator.clipboard.writeText(c);$('t-c').textContent='Copié ('+Math.round(c.length/1000)+' ko)'}catch(x){alert('Copie impossible : '+x.message)}setTimeout(()=>$('t-c').textContent='Copier mon code',2500)};
 $('t-i').onclick=async()=>{try{importer(await lireCode($('t-t').value))}catch(x){alert('Code illisible.')}};
 sec('Test automatique','<p style="color:var(--m);font-size:14px">Fait vivre 30 personnages fictifs et signale toute erreur du jeu (création, vie, mort, récit, affichage). Ta partie n\u2019est pas touchée.</p><button id="z-b">Lancer le test</button><pre id="z-t" style="white-space:pre-wrap;font-size:12px"></pre>');
 $('z-b').onclick=()=>{$('z-t').textContent='Test en cours...';autotest(30,t=>{$('z-t').textContent=t})};
 const vb=$('v-b');if(vb){const cp=document.createElement('button');cp.textContent='Copier la liste des manquants';cp.onclick=()=>{const t=($('v-t').textContent||'').split('\n').filter(x=>x.startsWith('\u2717')).map(x=>x.replace(/^\u2717 /,'')).join('\n');if(!t)return alert('Affichez d\u2019abord la liste.');try{navigator.clipboard.writeText(t);cp.textContent='Copié'}catch(x){}setTimeout(()=>cp.textContent='Copier la liste des manquants',1500)};vb.parentNode.insertBefore(cp,vb.nextSibling)}
 sec('Caractéristiques (bonus)','<p style="color:var(--m);font-size:14px">Bonus ou malus appliqués aux tirages de Force, Agilité… selon la race, l\u2019archétype, l\u2019origine, le métier ou le trait. +1 décale la moyenne d\u2019environ 1,3 point ; 0 = aucun effet.</p><select id="b-n"></select><div class="l" id="b-s"></div><div class="l"><button class="go" id="b-ok">Enregistrer</button><button id="b-rz">Valeur d\u2019origine</button></div>');
 const bnoms=()=>{const r=[];['Race','Archétype','Origine','Métier','Trait de caractère'].forEach(n=>{const t=T.find(x=>x.n===n);if(t)t.o.forEach(o=>{if(!r.includes(o[0]))r.push(o[0])})});Object.keys(SB).forEach(k=>{if(!r.includes(k))r.push(k)});return r};
 const bfill=()=>{const n=$('b-n').value,b=SB[n]||{};$('b-s').innerHTML=Object.keys(S).map(k=>'<label style="font-size:14px">'+S[k]+'<input type="number" step="1" min="-3" max="3" id="b-'+k+'" value="'+(b[k]||0)+'"></label>').join('')};
 $('b-n').innerHTML=bnoms().map(x=>'<option>'+esc(x)+'</option>').join('');$('b-n').onchange=bfill;bfill();
 $('b-ok').onclick=()=>{const n=$('b-n').value,b={};Object.keys(S).forEach(k=>{const v=parseInt($('b-'+k).value)||0;if(v)b[k]=v});PERSO.sb=PERSO.sb||{};PERSO.sb[n]=b;ecrire('perso',PERSO);appliquerPerso();alert('Bonus enregistrés pour '+n+'.')};
 $('b-rz').onclick=()=>{const n=$('b-n').value;if(PERSO.sb)delete PERSO.sb[n];ecrire('perso',PERSO);appliquerPerso();bfill()};
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
const voirAtelier=()=>{$('adm').hidden=false;$('adm').scrollIntoView()};const hAdmin=()=>{if(/^#admin$/i.test(location.hash))voirAtelier()};hAdmin();addEventListener('hashchange',hAdmin);
let tp=0,tt=0;document.querySelector('h1').onclick=()=>{const n=Date.now();tp=n-tt<700?tp+1:1;tt=n;if(tp>=5){if($('adm').hidden)voirAtelier();else $('adm').hidden=true;tp=0}};
/* ----- Hors ligne ----- */
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
