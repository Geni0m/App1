/* donnees.js : tout ce qui est « contenu » du jeu (tables, événements, effets, objets, quêtes, lieux) */
const S={For:'Force',Agi:'Agilité',Esp:'Esprit',Cha:'Charisme',End:'Endurance'};
const SB={'Elfe':{Agi:1,Esp:1,For:-1},'Nain':{For:1,End:1,Agi:-1},'Orc':{For:2,Esp:-1,Cha:-1},'Halfelin':{Agi:2,For:-1,Cha:1},'Paysan':{End:1},'Noble déchu':{Cha:1,Esp:1},'Marchand':{Cha:1},'Orphelin des rues':{Agi:1,End:1},'Fils de soldat':{For:1},'Étranger exilé':{End:1},'Forgeron':{For:2},'Voleur':{Agi:2},'Soldat':{For:1,End:1},'Érudit':{Esp:2},'Guérisseur':{Esp:1,Cha:1},'Mercenaire':{For:1,Agi:1},'Aubergiste':{Cha:1,End:1},'Contrebandier':{Agi:1,Cha:1},'Curieux':{Esp:1},'Têtu':{End:1},'Généreux':{Cha:1},'Peureux':{Agi:1,For:-1},'Rancunier':{For:1},'Cupide':{Esp:1}};
/* Objets : bonus aux jets (For, Agi, Esp, Cha, End), prix d'achat (p), effet à l'utilisation automatique (use) */
const ITEMS={'Épée':{For:2,p:15},'Dague':{Agi:2,p:10},'Marteau':{For:1},'Livre':{Esp:2},'Bâton':{For:1},'Armure légère':{End:2,p:20},'Potion de soin':{use:'PV',n:4,p:5},'Ration':{use:'EN',n:4,p:2},'Carte au trésor':{},'Relique':{}};
const INV={'Forgeron':'Marteau','Voleur':'Dague','Soldat':'Épée','Érudit':'Livre','Guérisseur':'Potion de soin','Mercenaire':'Épée','Aubergiste':'Ration','Contrebandier':'Dague'};
const SAI=['hiver','hiver','printemps','printemps','printemps','été','été','été','automne','automne','automne','hiver'];
const P={'Cité portuaire':[36,80],'Village de montagne':[156,28],'Capitale en révolte':[96,52],'Forêt interdite':[60,24],'Désert aux ruines':[160,92],'Forteresse assiégée':[112,100]};
const VILLES=['Cité portuaire','Capitale en révolte'];   /* lieux où le personnage achète seul */
/* Quêtes : suite d'étapes [texte, condition, clé]. La clé sert de contexte (« Étape:Carte ») pour favoriser des événements. */
const QU={
'Retrouver la Relique':[['Obtenir la Carte au trésor',()=>C.inv.includes('Carte au trésor'),'Carte'],['Atteindre : Désert aux ruines',()=>C.pos==='Désert aux ruines','Ruines'],['Rapporter la Relique',()=>C.inv.includes('Relique'),'Relique']],
'Venger sa famille':[['Se faire un ennemi',()=>C.fl.includes('Ennemi juré')||C.vie.some(e=>e.t==='Vengeance de l\'ennemi'),'Ennemi'],['Survivre à sa vengeance',()=>C.vie.some(e=>e.t==='Vengeance de l\'ennemi'),'Vengeance']]};
const DEF=[
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
