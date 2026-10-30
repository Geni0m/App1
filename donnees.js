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
["Retour du rival",3,{},"Rival"],["Leçon du mentor",3,{},"Mentor"],["Lettre de l'être aimé",3,{},"Amour"],
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
