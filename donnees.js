/* donnees.js : tout ce qui est « contenu » du jeu (tables, événements, effets, objets, quêtes, lieux) */
const S={For:'Force',Agi:'Agilité',Esp:'Esprit',Cha:'Charisme',End:'Endurance'};
const SB={'Elfe':{Agi:1,Esp:1,For:-1},'Nain':{For:1,End:1,Agi:-1},'Orc':{For:2,Esp:-1,Cha:-1},'Halfelin':{Agi:2,For:-1,Cha:1},'Paysan':{End:1},'Noble déchu':{Cha:1,Esp:1},'Marchand':{Cha:1},'Orphelin des rues':{Agi:1,End:1},'Fils de soldat':{For:1},'Étranger exilé':{End:1},'Forgeron':{For:2},'Voleur':{Agi:2},'Soldat':{For:1,End:1},'Érudit':{Esp:2},'Guérisseur':{Esp:1,Cha:1},'Mercenaire':{For:1,Agi:1},'Aubergiste':{Cha:1,End:1},'Contrebandier':{Agi:1,Cha:1},'Curieux':{Esp:1},'Têtu':{End:1},'Généreux':{Cha:1},'Peureux':{Agi:1,For:-1},'Rancunier':{For:1},'Cupide':{Esp:1}};
/* Objets : bonus aux jets (For, Agi, Esp, Cha, End), prix d'achat (p), effet à l'utilisation automatique (use) */
const ITEMS={'Arc':{Agi:2,p:12},'Cheval':{mount:1},'Chien fidèle':{Agi:1},'Talisman béni':{For:1,Agi:1,Esp:1,Cha:1,End:1},'Épée bénie':{For:3},'Épée':{For:2,p:15},'Dague':{Agi:2,p:10},'Marteau':{For:1},'Livre':{Esp:2},'Bâton':{For:1},'Armure légère':{End:2,p:20},'Potion de soin':{use:'PV',n:4,p:5},'Ration':{use:'EN',n:4,p:2},'Carte au trésor':{},'Relique':{}};
const INV={'Forgeron':'Marteau','Voleur':'Dague','Soldat':'Épée','Érudit':'Livre','Guérisseur':'Potion de soin','Mercenaire':'Épée','Aubergiste':'Ration','Contrebandier':'Dague'};
const SAI=['hiver','hiver','printemps','printemps','printemps','été','été','été','automne','automne','automne','hiver'];
const P={'Cité portuaire':[36,80],'Village de montagne':[156,28],'Capitale en révolte':[96,52],'Forêt interdite':[60,24],'Désert aux ruines':[160,92],'Forteresse assiégée':[112,100]};
const VILLES=['Cité portuaire','Capitale en révolte'];   /* lieux où le personnage achète seul */
/* Quêtes : suite d'étapes [texte, condition, clé]. La clé sert de contexte (« Étape:Carte ») pour favoriser des événements. */
const QU={
'Retrouver la Relique':[['Obtenir la Carte au trésor',()=>C.inv.includes('Carte au trésor'),'Carte'],['Atteindre : Désert aux ruines',()=>C.pos==='Désert aux ruines','Ruines'],['Rapporter la Relique',()=>C.inv.includes('Relique'),'Relique']],
'Venger sa famille':[['Se faire un ennemi',()=>C.fl.includes('Ennemi juré')||C.vie.some(e=>e.t==='Vengeance de l\'ennemi'),'Ennemi'],['Survivre à sa vengeance',()=>C.vie.some(e=>e.t==='Vengeance de l\'ennemi'&&e.ok),'Vengeance']]};
const DEF0=[
{n:'Race',o:[['Humain',4],['Elfe',2],['Nain',2],['Orc',2],['Halfelin',2]]},
{n:'Origine',o:[['Noble déchu',1],['Paysan',4],['Marchand',3],['Orphelin des rues',3],['Fils de soldat',3],['Étranger exilé',2]]},
{n:'Métier',o:[['Forgeron',3,{'Paysan':2,'Marchand':1.5,'Noble déchu':.2,'Nain':3}],['Voleur',2,{'Orphelin des rues':4,'Noble déchu':.3,'Halfelin':2}],['Soldat',3,{'Fils de soldat':4,'Noble déchu':1.5,'Orc':2}],['Érudit',2,{'Noble déchu':4,'Paysan':.2,'Orphelin des rues':.2,'Elfe':2.5,'Orc':.3}],['Guérisseur',2,{'Paysan':1.5,'Étranger exilé':1.5,'Elfe':1.5}],['Mercenaire',2,{'Fils de soldat':2,'Étranger exilé':2,'Orc':2}],['Aubergiste',2,{'Marchand':3,'Paysan':1.2,'Halfelin':2}],['Contrebandier',1,{'Marchand':2,'Orphelin des rues':3}]]},
{n:'Trait de caractère',o:[['Loyal',3,{'Soldat':3,'Mercenaire':.3}],['Cupide',2,{'Voleur':3,'Contrebandier':3,'Mercenaire':2}],['Curieux',3,{'Érudit':4,'Guérisseur':2,'Elfe':1.5}],['Rancunier',2,{'Mercenaire':2,'Noble déchu':3,'Nain':1.5}],['Généreux',3,{'Guérisseur':3,'Aubergiste':2,'Voleur':.3}],['Peureux',2,{'Soldat':.1,'Mercenaire':.1,'Orc':.2}],['Têtu',3,{'Forgeron':3,'Paysan':1.5,'Nain':2}]]},
{n:'Défaut',o:[['Joueur',2,{'Cupide':3,'Curieux':1}],['Menteur',3,{'Voleur':3,'Cupide':2,'Loyal':.2}],['Colérique',3,{'Têtu':2,'Rancunier':3,'Généreux':.5,'Orc':2}],['Orgueilleux',3,{'Noble déchu':3,'Têtu':2,'Peureux':.2,'Elfe':2}],['Ivrogne',2,{'Aubergiste':3,'Soldat':2,'Mercenaire':2,'Nain':2}],['Naïf',3,{'Généreux':3,'Curieux':2,'Cupide':.3}]]},
{n:'Décor',o:[['Cité portuaire',3,{'Marchand':3,'Contrebandier':4,'Étranger exilé':2}],['Village de montagne',3,{'Paysan':3,'Forgeron':3,'Guérisseur':2,'Nain':3}],['Capitale en révolte',2,{'Érudit':3,'Noble déchu':3,'Voleur':2}],['Forêt interdite',2,{'Guérisseur':2,'Curieux':2,'Elfe':4}],['Désert aux ruines',1,{'Érudit':2,'Mercenaire':2,'Étranger exilé':3}],['Forteresse assiégée',2,{'Soldat':4,'Mercenaire':3,'Fils de soldat':3,'Orc':2}]]},
...Object.keys(S).map(k=>({n:S[k],stat:k,o:[]})),
{n:'Objectif',o:[['Retrouver la Relique',2,{'Érudit':3,'Curieux':2}],['Venger sa famille',2,{'Fils de soldat':2,'Rancunier':3}],['Atteindre : Désert aux ruines',1,{'Érudit':2}],['Atteindre : Capitale en révolte',2,{'Noble déchu':2}],['Atteindre : Forteresse assiégée',2,{'Soldat':2}],['Survivre à 12 événements',2],['Réunir 40 pièces d\'or',3,{'Voleur':2,'Marchand':2,'Cupide':2}]]},
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
'Embuscade':{PV:-4,or:3,fl:'Ennemi juré',jet:['Agi',10],sc:'combat'},'Combat de rue':{PV:-3,or:4,jet:['For',10],sc:'combat'},'Vengeance de l\'ennemi':{PV:-5,For:1,uf:'Ennemi juré',jet:['For',11],sc:'combat'},
'Rencontre d\'un allié':{fl:'Allié',Cha:1},'Mission de l\'allié':{it:'Carte au trésor',EN:-2,uf:'Allié'},
'Marché florissant':{or:8,Cha:1,sc:'marche'},'Tempête en mer':{PV:-3,EN:-2,jet:['End',10],sc:'tempete'},
'Fouille des ruines':{it:'Relique',EN:-1,jet:['Esp',9]},'Piège des ruines':{PV:-4,jet:['Agi',10]},'Chasse au trésor':{or:15,EN:-2,jet:['Esp',8]},
'Tournoi':{For:1,or:10,PV:-2,jet:['For',11],sc:'combat'},'Banquet':{EN:4,Cha:1,or:-3,sc:'marche'},'Source dans la forêt':{EN:4,PV:1},'Sortie de la forteresse':{PV:-3,Agi:1,jet:['For',10],sc:'combat'}};

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
Object.assign(EF,{'Commande importante':{or:10,Esp:1,jet:['Esp',9]},'Vision étrange':{Esp:1,EN:-1},'Cours improvisé':{or:6,Cha:1},'Concours de cuisine':{or:8,Cha:1,sc:'marche',jet:['Cha',9]},
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
['Atteindre : Désert aux ruines',1,{'Érudit':2,'Cartographe':2},[{t:'lieu',v:'Désert aux ruines'}]],
['Atteindre : Capitale en révolte',2,{'Noble déchu':2,'Espion':2},[{t:'lieu',v:'Capitale en révolte'}]],
['Atteindre : Forteresse assiégée',2,{'Combattant':2},[{t:'lieu',v:'Forteresse assiégée'}]],
['Atteindre : Village de montagne',1.5,{'Nain':2,'Artisan':1.5},[{t:'lieu',v:'Village de montagne'}]],
['Atteindre : Forêt interdite',1.5,{'Elfe':3,'Sylvain':3,'Mystique':2},[{t:'lieu',v:'Forêt interdite'}]],
['Atteindre : Cité portuaire',1.5,{'Commerçant':2,'Marin':3},[{t:'lieu',v:'Cité portuaire'}]],
['Survivre à 16 événements',2,{},[{t:'vie',n:16}]],
['Réunir 40 pièces d\'or',3,{'Commerçant':3,'Roublard':2,'Cupide':2,'Halfelin':1.5},[{t:'or',n:40}]],
['Maîtriser un art (niveau 4)',2,{'Artisan':3,'Érudit':2,'Mystique':2,'Gnome':1.5},[{t:'comp',n:4}]],
['Explorer le monde (5 lieux)',2,{'Voyageur':4,'Curieux':2,'Félin':1.5,'Elfe':1.3},[{t:'lieux',n:5}]],
['Remporter 2 tournois',1.5,{'Combattant':3,'Orc':2,'Drakéen':2},[{t:'ev',v:'Tournoi',n:2}]],
['Conclure 3 marchés',1.5,{'Commerçant':4,'Halfelin':2,'Gnome':1.5},[{t:'ev',v:'Marché florissant',n:3}]],
['Devenir irrésistible (Charisme 9)',1.5,{'Noble déchu':2,'Démon':2,'Commerçant':1.5},[{t:'stat',k:'Cha',n:9}]],
['Devenir un colosse (Force 10)',1.5,{'Orc':2,'Nain':1.5,'Combattant':2,'Drakéen':1.5},[{t:'stat',k:'For',n:10}]],
['Gagner 3 combats',2,{'Combattant':3,'Mercenaire':1.5,'Orc':1.5},[{t:'tag',v:'combat',n:3}]],
['Recevoir 2 visions',1,{'Mystique':4,'Démon':2},[{t:'ev',v:'Vision étrange',n:2}]],
['Réussir 2 commandes',1,{'Artisan':4,'Nain':1.5},[{t:'ev',v:'Commande importante',n:2}]]];
const OBJD={};OBJ.forEach(o=>{if(o[3])OBJD[o[0]]=o[3]});
/* Cadeau divin : un seul tirage, à la création */
const CAD0=[['Une bourse bénie',3,{'Commerçant':2}],['Un don d\'expérience',3,{'Érudit':1.5,'Mystique':1.5}],['Un souffle de vigueur',3],['Une grâce d\'endurance',2,{'Voyageur':1.5}],['La force des ancêtres',2,{'Combattant':2,'Nain':1.5}],['Une parole d\'or',2,{'Commerçant':1.5,'Noble déchu':1.5}],['Un esprit éveillé',2,{'Érudit':2,'Gnome':1.5}],['Un cheval fidèle',2,{'Voyageur':2}],['Un compagnon à quatre pattes',2,{'Chasseur':2,'Félin':1.5}],['Un talisman béni',1.5,{'Mystique':2}],['Une arme bénie',1.5,{'Combattant':2}],['Une amitié précieuse',2,{'Généreux':2}]];
const CAD={'Une bourse bénie':{or:25},'Un don d\'expérience':{xp:4},'Un souffle de vigueur':{pvm:3},'Une grâce d\'endurance':{End:1,enm:2},'La force des ancêtres':{For:1},'Une parole d\'or':{Cha:1},'Un esprit éveillé':{Esp:1},'Un cheval fidèle':{it:'Cheval'},'Un compagnon à quatre pattes':{it:'Chien fidèle'},'Un talisman béni':{it:'Talisman béni'},'Une arme bénie':{it:'Épée bénie'},'Une amitié précieuse':{fl:'Allié'}};
Object.assign(HIST,{'Un don d\'expérience':'Un souvenir qui n\'est pas à lui : des gestes appris sans les avoir jamais faits.','Un cheval fidèle':'Un cheval s\'approche, calme, comme s\'il l\'attendait depuis toujours.','Un talisman béni':'Un pendentif tiède : il protège un peu de tout.'});
function construire(){
 const old=DEF0.find(t=>t.n==='Métier').o,om={};old.forEach(x=>om[x[0]]=x);
 const arcs=Object.keys(MET),mt=[];
 arcs.forEach(a=>MET[a].forEach(m=>{const x=om[m[0]],mu=Object.assign({},x?x[2]:{},MX[m[0]]||{});arcs.forEach(b=>{mu[b]=b===a?5:.25});mt.push([m[0],x?x[1]:m[1],mu])}));
 const out=[];
 DEF0.forEach(t=>{
  if(t.n==='Race')out.push({n:'Race',o:RACES.map(r=>[r[0],r[1]])});
  else if(t.n==='Métier')out.push({n:'Métier',o:mt});
  else if(t.n==='Objectif')out.push({n:'Objectif',o:OBJ.map(o=>[o[0],o[1],o[2]||{}])},{n:'Cadeau divin',o:CAD0});
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
