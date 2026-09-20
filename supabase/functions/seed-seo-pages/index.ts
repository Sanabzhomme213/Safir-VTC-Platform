import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Page = {
  slug: string;
  page_type: 'city' | 'airport' | 'station' | 'transfer';
  title: string;
  meta_description: string;
  h1: string;
  content: string;
  faq: { q: string; a: string }[];
  is_published: boolean;
};

const faqFor = (name: string, priceFrom: string) => [
  { q: `Quel est le prix d'un VTC pour ${name} ?`, a: `Nos tarifs pour ${name} démarrent à ${priceFrom}. Le prix exact dépend de la distance, de l'heure et du type de trajet — obtenez un devis instantané sur notre page de réservation.` },
  { q: `Comment réserver mon chauffeur ?`, a: `Réservez en ligne en 2 minutes : indiquez votre trajet, choisissez la date et l'heure, puis confirmez avec vos coordonnées. Aucune création de compte n'est nécessaire.` },
  { q: `Le service est-il disponible 24h/24 ?`, a: `Oui, L'Ambassadeur des VTC est disponible 24h/24 et 7j/7, y compris les jours fériés, pour tous vos trajets vers ou depuis cette destination.` },
  { q: `Suivez-vous les vols en cas de retard ?`, a: `Oui, pour tous les transferts liés à un aéroport, nous suivons votre vol en temps réel et ajustons automatiquement l'heure de prise en charge sans frais supplémentaires.` },
];

const PAGES: Page[] = [
  // ── CITY PAGES ──────────────────────────────────────────────
  {
    slug: 'vtc-calais', page_type: 'city', is_published: true,
    title: "Chauffeur VTC à Calais — Service Premium 24h/24 | L'Ambassadeur des VTC",
    meta_description: "Service VTC premium à Calais. Chauffeur privé, transferts aéroport et gare, mise à disposition. Réservation instantanée, tarif fixe.",
    h1: "Chauffeur VTC à Calais",
    content: "L'Ambassadeur des VTC est votre chauffeur privé de référence à Calais et dans toute son agglomération. Que vous ayez besoin d'un transfert vers l'aéroport de Calais-Dunkerque, la gare SNCF, le terminal Eurotunnel, ou un déplacement professionnel dans le centre-ville, notre service premium vous garantit ponctualité et confort à bord d'une Tesla Model Y 2026.\n\nNous desservons tous les quartiers de Calais : le centre-ville, le Courgain Maritime, Beau-Marais, ainsi que les communes limitrophes comme Coquelles, Sangatte et Marck-en-Calaisis. Nos chauffeurs connaissent parfaitement la ville et ses axes pour vous garantir le trajet le plus rapide.\n\nQue ce soit pour un aller simple, un aller-retour ou une mise à disposition à l'heure, obtenez un tarif fixe instantané et réservez votre course en moins de deux minutes, sans frais cachés.",
    faq: faqFor('un trajet à Calais', '25€'),
  },
  {
    slug: 'vtc-boulogne-sur-mer', page_type: 'city', is_published: true,
    title: "Chauffeur VTC à Boulogne-sur-Mer — Transferts Premium | L'Ambassadeur des VTC",
    meta_description: "VTC premium à Boulogne-sur-Mer. Transfert aéroport Calais-Dunkerque, Nausicaá, centre-ville. Chauffeur privé disponible 24h/24.",
    h1: "Chauffeur VTC à Boulogne-sur-Mer",
    content: "Boulogne-sur-Mer, premier port de pêche de France, mérite un service de transport à la hauteur. L'Ambassadeur des VTC assure vos trajets vers l'aéroport de Calais-Dunkerque, situé à une trentaine de minutes, ainsi que vers la citadelle, Nausicaá et la vieille ville fortifiée.\n\nNotre chauffeur vous prend en charge où vous le souhaitez à Boulogne-sur-Mer : votre domicile, votre hôtel, ou directement à la gare avec suivi en temps réel des correspondances. Le trajet entre le centre de Boulogne et Calais prend généralement une trentaine de minutes.\n\nProfitez d'un véhicule premium, silencieux et climatisé pour tous vos déplacements à Boulogne-sur-Mer, avec un tarif annoncé avant la réservation.",
    faq: faqFor('un trajet à Boulogne-sur-Mer', '25€'),
  },
  {
    slug: 'vtc-le-touquet', page_type: 'city', is_published: true,
    title: "Chauffeur VTC au Touquet-Paris-Plage — Service Haut de Gamme | L'Ambassadeur des VTC",
    meta_description: "Chauffeur privé premium au Touquet-Paris-Plage. Transferts vers Lille, Calais, événements et soirées. Discrétion et ponctualité garanties.",
    h1: "Chauffeur VTC au Touquet-Paris-Plage",
    content: "Le Touquet-Paris-Plage exige un service à la hauteur de sa réputation. L'Ambassadeur des VTC propose un chauffeur privé haut de gamme pour tous vos déplacements dans la ville et ses environs : hippodrome, casino, golf, aérodrome, forêt du Touquet.\n\nNous assurons également vos transferts longue distance vers l'aéroport de Lille-Lesquin (environ 1h45), l'aéroport de Calais-Dunkerque, ou pour vos soirées et événements privés. Discrétion, ponctualité et véhicule premium sont les piliers de notre service au Touquet.\n\nQue vous soyez en villégiature ou en déplacement professionnel, réservez votre trajet en quelques clics et bénéficiez d'un service sans compromis.",
    faq: faqFor('un trajet au Touquet-Paris-Plage', '35€'),
  },
  {
    slug: 'vtc-berck-sur-mer', page_type: 'city', is_published: true,
    title: "Chauffeur VTC à Berck-sur-Mer — Réservation Instantanée | L'Ambassadeur des VTC",
    meta_description: "VTC premium à Berck-sur-Mer. Transferts vers Le Touquet, Boulogne, Arras. Chauffeur professionnel, tarif fixe, réservation en ligne.",
    h1: "Chauffeur VTC à Berck-sur-Mer",
    content: "Berck-sur-Mer, célèbre station balnéaire et capitale française du char à voile, bénéficie du service premium de L'Ambassadeur des VTC. Nous couvrons l'ensemble de la commune — du front de mer au centre historique — ainsi que les liaisons vers Le Touquet-Paris-Plage, Boulogne-sur-Mer et Arras.\n\nNotre service est particulièrement prisé pour les transferts vers l'aéroport de Lille-Lesquin, ainsi que pour les déplacements professionnels vers les zones d'activité environnantes.\n\nRéservez votre chauffeur à Berck-sur-Mer en deux minutes : adresse de départ, destination, date et heure — votre tarif s'affiche instantanément.",
    faq: faqFor('un trajet à Berck-sur-Mer', '25€'),
  },
  {
    slug: 'vtc-saint-omer', page_type: 'city', is_published: true,
    title: "Chauffeur VTC à Saint-Omer — Transferts Premium | L'Ambassadeur des VTC",
    meta_description: "Service VTC à Saint-Omer et dans l'Audomarois. Transferts aéroport Lille, Calais, gare. Chauffeur disponible 24h/24.",
    h1: "Chauffeur VTC à Saint-Omer",
    content: "Saint-Omer et le marais audomarois sont desservis par L'Ambassadeur des VTC pour tous vos déplacements, qu'ils soient personnels ou professionnels. Notre chauffeur vous emmène vers les aéroports de Lille-Lesquin ou Calais-Dunkerque, les gares de la région, ou directement à votre destination dans le Pas-de-Calais.\n\nLes liaisons vers Saint-Omer sont particulièrement demandées par les visiteurs de La Coupole et du marais audomarois, ainsi que par les professionnels de la région.\n\nObtenez votre tarif fixe instantanément et réservez votre trajet vers ou depuis Saint-Omer sans avoir besoin de créer de compte.",
    faq: faqFor('un trajet à Saint-Omer', '25€'),
  },
  {
    slug: 'vtc-coquelles', page_type: 'city', is_published: true,
    title: "Chauffeur VTC à Coquelles | L'Ambassadeur des VTC",
    meta_description: "VTC premium à Coquelles. Transferts terminal Eurotunnel, aéroport, Cité Europe. Réservation instantanée.",
    h1: "Chauffeur VTC à Coquelles",
    content: "Coquelles, porte d'entrée du tunnel sous la Manche, bénéficie du même niveau de service premium que Calais avec L'Ambassadeur des VTC. Nous couvrons l'ensemble de la commune : terminal Eurotunnel, Cité Europe, zone commerciale.\n\nIdéalement située près de Calais, Coquelles profite de transferts rapides vers l'aéroport de Calais-Dunkerque et la gare de Calais-Ville, à environ 15 minutes.\n\nRéservez votre chauffeur VTC à Coquelles pour vos trajets du quotidien ou vos transferts longue distance.",
    faq: faqFor('un trajet à Coquelles', '20€'),
  },
  {
    slug: 'vtc-wimereux', page_type: 'city', is_published: true,
    title: "Chauffeur VTC à Wimereux | L'Ambassadeur des VTC",
    meta_description: "Service VTC à Wimereux. Transferts aéroport Calais-Dunkerque, gare, digue-promenade. Chauffeur premium 24h/24.",
    h1: "Chauffeur VTC à Wimereux",
    content: "Wimereux et sa célèbre digue-promenade sont accessibles avec le service premium de L'Ambassadeur des VTC. Idéal pour vos vacances ou vos déplacements professionnels au nord de Boulogne-sur-Mer.\n\nNous assurons vos transferts vers l'aéroport de Calais-Dunkerque (environ 25 minutes), la gare de Boulogne-Ville, ainsi que tous vos déplacements vers les communes voisines d'Ambleteuse et Boulogne-sur-Mer.\n\nVéhicule premium, chauffeur professionnel et tarif annoncé avant réservation : tout pour un trajet sans stress.",
    faq: faqFor('un trajet à Wimereux', '25€'),
  },
  {
    slug: 'vtc-wissant', page_type: 'city', is_published: true,
    title: "Chauffeur VTC à Wissant | L'Ambassadeur des VTC",
    meta_description: "VTC premium à Wissant. Transferts aéroport, gare, déplacements touristiques entre les caps. Réservation en ligne instantanée.",
    h1: "Chauffeur VTC à Wissant",
    content: "Le charmant village de Wissant, niché entre le Cap Blanc-Nez et le Cap Gris-Nez, est desservi par L'Ambassadeur des VTC pour tous vos trajets vers l'aéroport de Calais-Dunkerque, la gare de Calais-Ville ou n'importe quelle destination dans le Pas-de-Calais et le Nord.\n\nNotre service est apprécié des résidents et des touristes pour sa fiabilité et son confort, notamment pour les transferts liés aux activités de char à voile et de randonnée entre les caps.\n\nRéservez votre chauffeur à Wissant en deux minutes et profitez d'un trajet serein, quelle que soit votre destination.",
    faq: faqFor('un trajet à Wissant', '25€'),
  },

  // ── AIRPORT PAGES ───────────────────────────────────────────
  {
    slug: 'vtc-aeroport-lille-lesquin', page_type: 'airport', is_published: true,
    title: "Transfert VTC Aéroport de Lille-Lesquin | L'Ambassadeur des VTC",
    meta_description: "Transfert VTC vers/depuis l'aéroport de Lille-Lesquin. Suivi de vol en temps réel, prise en charge garantie. Réservation instantanée.",
    h1: "Transfert VTC Aéroport de Lille-Lesquin",
    content: "L'Ambassadeur des VTC assure vos transferts vers et depuis l'aéroport de Lille-Lesquin, le principal aéroport des Hauts-de-France, depuis n'importe quelle ville du Pas-de-Calais ou du Nord : Calais, Boulogne-sur-Mer, Le Touquet-Paris-Plage, Berck-sur-Mer, Saint-Omer.\n\nNous suivons votre vol en temps réel pour ajuster automatiquement l'heure de prise en charge en cas de retard, sans frais supplémentaires. Votre chauffeur vous attend avec une pancarte à votre nom au terminal d'arrivée, ou vient vous chercher à l'adresse de votre choix pour un départ.\n\nLe trajet entre Calais et l'aéroport de Lille prend environ 1h20, contre 1h45 depuis Le Touquet-Paris-Plage. Réservez votre transfert aéroport Lille dès maintenant et obtenez un tarif fixe instantané.",
    faq: faqFor("un transfert vers l'aéroport de Lille", '120€'),
  },
  {
    slug: 'vtc-aeroport-calais-dunkerque', page_type: 'airport', is_published: true,
    title: "Transfert VTC Aéroport de Calais-Dunkerque | L'Ambassadeur des VTC",
    meta_description: "Transfert VTC aéroport de Calais-Dunkerque. Prise en charge rapide, chauffeur ponctuel, tarif fixe dès 20€.",
    h1: "Transfert VTC Aéroport de Calais-Dunkerque",
    content: "L'aéroport de Calais-Dunkerque (Calais-Marck) est notre terrain de jeu privilégié. L'Ambassadeur des VTC y assure des transferts rapides depuis Calais, Coquelles, Sangatte et l'ensemble de l'agglomération calaisienne.\n\nGrâce à sa proximité avec le centre-ville de Calais (environ 15 minutes), ce transfert est l'un des plus demandés de notre service. Nous suivons votre vol en temps réel pour une prise en charge sans attente.\n\nQue vous arriviez d'un vol intérieur ou international, votre chauffeur vous attend avec une pancarte personnalisée à la sortie du terminal.",
    faq: faqFor("un transfert vers l'aéroport de Calais-Dunkerque", '20€'),
  },
  {
    slug: 'vtc-aeroport-paris-beauvais', page_type: 'airport', is_published: true,
    title: "Transfert VTC Aéroport Paris-Beauvais | L'Ambassadeur des VTC",
    meta_description: "Transfert VTC vers l'aéroport de Paris-Beauvais depuis le Pas-de-Calais. Suivi de vol, chauffeur ponctuel, réservation instantanée.",
    h1: "Transfert VTC Aéroport Paris-Beauvais",
    content: "L'Ambassadeur des VTC vous accompagne vers l'aéroport de Paris-Beauvais depuis Calais, Boulogne-sur-Mer, Saint-Omer et tout le Pas-de-Calais. Comptez environ 2h de trajet depuis Calais pour rejoindre ce hub majeur des compagnies low-cost.\n\nNotre service de suivi de vol en temps réel s'applique également à ce trajet : en cas de vol retardé ou avancé, l'heure de prise en charge est automatiquement ajustée.\n\nIdéal pour les voyageurs d'affaires comme pour les vacanciers, ce transfert combine confort, ponctualité et tarif fixe annoncé à l'avance.",
    faq: faqFor("un transfert vers l'aéroport de Paris-Beauvais", '180€'),
  },

  // ── STATION PAGES ───────────────────────────────────────────
  {
    slug: 'vtc-gare-de-calais', page_type: 'station', is_published: true,
    title: "VTC Gare de Calais-Ville — Chauffeur Privé | L'Ambassadeur des VTC",
    meta_description: "Chauffeur VTC à la gare de Calais-Ville. Prise en charge directe en sortie de gare, accueil personnalisé, réservation instantanée.",
    h1: "Chauffeur VTC à la Gare de Calais-Ville",
    content: "La gare de Calais-Ville, desservie par TGV et trains régionaux, est l'un des points de prise en charge les plus fréquents de L'Ambassadeur des VTC. Notre chauffeur vous attend directement à la sortie de la gare avec une pancarte à votre nom, pour vous conduire où vous le souhaitez dans le Pas-de-Calais ou le Nord.\n\nQue vous arriviez d'un déplacement professionnel ou personnel, profitez d'un accueil personnalisé et d'un trajet confortable à bord de notre Tesla Model Y 2026.\n\nRéservez votre chauffeur à l'avance pour une prise en charge garantie à votre arrivée, ou à la dernière minute selon disponibilité.",
    faq: faqFor('un trajet depuis la gare de Calais-Ville', '20€'),
  },
  {
    slug: 'vtc-gare-de-boulogne', page_type: 'station', is_published: true,
    title: "VTC Gare de Boulogne-Ville | L'Ambassadeur des VTC",
    meta_description: "Chauffeur VTC à la gare de Boulogne-Ville. Transferts vers Le Touquet, Wimereux, Calais. Réservation en ligne.",
    h1: "Chauffeur VTC à la Gare de Boulogne-Ville",
    content: "La gare de Boulogne-Ville, porte d'entrée vers la Côte d'Opale, est desservie par L'Ambassadeur des VTC pour tous vos transferts vers Le Touquet-Paris-Plage, Wimereux, Calais ou plus loin sur la Côte d'Opale.\n\nNotre chauffeur vous accueille à la sortie de la gare avec une pancarte personnalisée, prêt à vous conduire vers votre hôtel, votre résidence ou votre prochain rendez-vous professionnel.\n\nProfitez d'un service fiable et confortable pour transformer votre arrivée en train en un trajet sans stress.",
    faq: faqFor('un trajet depuis la gare de Boulogne-Ville', '25€'),
  },

  // ── TRANSFER (point-to-point) PAGES ─────────────────────────
  {
    slug: 'transfert-calais-aeroport-lille', page_type: 'transfer', is_published: true,
    title: "Transfert VTC Calais → Aéroport Lille | L'Ambassadeur des VTC",
    meta_description: "Transfert VTC Calais - Aéroport de Lille-Lesquin. 1h20 de trajet, tarif fixe dès 120€, suivi de vol inclus.",
    h1: "Transfert VTC Calais → Aéroport Lille",
    content: "Le trajet entre Calais et l'aéroport de Lille-Lesquin est l'une des liaisons les plus demandées de L'Ambassadeur des VTC. Comptez environ 1h20 par l'autoroute A26, avec un tarif fixe annoncé dès la réservation — aucune surprise à l'arrivée.\n\nNotre chauffeur vous prend en charge à votre domicile, votre hôtel ou votre lieu de travail à Calais, pour vous conduire directement au terminal de votre choix à l'aéroport de Lille. Pour les départs, nous calculons votre heure de prise en charge en fonction de l'heure de votre vol afin de vous garantir une arrivée confortable, sans stress.\n\nPour les arrivées, le suivi de vol en temps réel nous permet d'ajuster automatiquement l'heure de prise en charge en cas de retard.",
    faq: faqFor('le trajet Calais - Aéroport Lille', '120€'),
  },
  {
    slug: 'transfert-boulogne-aeroport-lille', page_type: 'transfer', is_published: true,
    title: "Transfert VTC Boulogne-sur-Mer → Aéroport Lille | L'Ambassadeur des VTC",
    meta_description: "Transfert VTC Boulogne-sur-Mer - Aéroport de Lille-Lesquin. Tarif fixe, suivi de vol, chauffeur ponctuel.",
    h1: "Transfert VTC Boulogne-sur-Mer → Aéroport Lille",
    content: "Depuis Boulogne-sur-Mer, rejoignez l'aéroport de Lille-Lesquin en toute sérénité avec L'Ambassadeur des VTC. Le trajet dure environ 1h30 et bénéficie d'un tarif fixe annoncé avant la réservation.\n\nNotre chauffeur vous prend en charge où vous le souhaitez à Boulogne-sur-Mer — domicile, hôtel, citadelle — pour un transfert direct et confortable vers le terminal de votre choix.\n\nLe suivi de vol en temps réel garantit une prise en charge ajustée à l'heure réelle de votre vol, à l'aller comme au retour.",
    faq: faqFor('le trajet Boulogne-sur-Mer - Aéroport Lille', '130€'),
  },
  {
    slug: 'transfert-le-touquet-aeroport-lille', page_type: 'transfer', is_published: true,
    title: "Transfert VTC Le Touquet → Aéroport Lille | L'Ambassadeur des VTC",
    meta_description: "Transfert VTC Le Touquet-Paris-Plage - Aéroport de Lille-Lesquin. Service haut de gamme, 1h45 de trajet, tarif fixe dès 180€.",
    h1: "Transfert VTC Le Touquet → Aéroport Lille",
    content: "Le transfert entre Le Touquet-Paris-Plage et l'aéroport de Lille-Lesquin est l'un des trajets emblématiques de L'Ambassadeur des VTC. Comptez environ 1h45 pour ce trajet à travers le Pas-de-Calais, à bord d'un véhicule premium silencieux et confortable.\n\nNotre service haut de gamme est particulièrement apprécié des voyageurs internationaux et des résidents saisonniers du Touquet, qui exigent ponctualité et discrétion pour leurs déplacements vers l'aéroport.\n\nRéservez à l'avance pour garantir votre créneau en haute saison, ou profitez de notre disponibilité 24h/24 pour une réservation de dernière minute.",
    faq: faqFor('le trajet Le Touquet - Aéroport Lille', '180€'),
  },
  {
    slug: 'transfert-calais-aeroport-beauvais', page_type: 'transfer', is_published: true,
    title: "Transfert VTC Calais → Aéroport Paris-Beauvais | L'Ambassadeur des VTC",
    meta_description: "Transfert VTC Calais - Aéroport Paris-Beauvais. 2h de trajet, tarif fixe dès 180€, suivi de vol inclus.",
    h1: "Transfert VTC Calais → Aéroport Paris-Beauvais",
    content: "Pour rejoindre l'aéroport de Paris-Beauvais depuis Calais, L'Ambassadeur des VTC propose un service de transfert direct d'environ 2h par l'autoroute. Le tarif est fixé à l'avance, sans supplément pour les bagages ou le trafic.\n\nNotre chauffeur vous prend en charge à l'adresse de votre choix à Calais et vous dépose directement au terminal correspondant à votre vol, avec un timing calculé pour vous éviter tout stress.\n\nCe trajet est particulièrement prisé par les voyageurs empruntant les vols low-cost internationaux depuis Beauvais.",
    faq: faqFor('le trajet Calais - Aéroport Paris-Beauvais', '180€'),
  },
  {
    slug: 'transfert-calais-bruxelles', page_type: 'transfer', is_published: true,
    title: "Transfert VTC Calais → Bruxelles | L'Ambassadeur des VTC",
    meta_description: "Transfert VTC Calais - Bruxelles. Service premium, 1h30 de trajet, tarif fixe dès 160€.",
    h1: "Transfert VTC Calais → Bruxelles",
    content: "Rejoignez la capitale belge depuis Calais avec le service premium de L'Ambassadeur des VTC. Ce trajet d'environ 1h30 par l'autoroute est idéal pour vos déplacements d'affaires, vos soirées ou vos événements à Bruxelles.\n\nNotre véhicule Tesla Model Y 2026, silencieux et élégant, s'accorde parfaitement avec l'image de la capitale européenne. Le chauffeur peut également vous attendre sur place pour le trajet retour, sur demande.\n\nObtenez votre tarif fixe instantanément et réservez votre transfert Calais-Bruxelles en quelques clics.",
    faq: faqFor('le trajet Calais - Bruxelles', '160€'),
  },
  {
    slug: 'transfert-berck-le-touquet', page_type: 'transfer', is_published: true,
    title: "Transfert VTC Berck-sur-Mer → Le Touquet | L'Ambassadeur des VTC",
    meta_description: "Transfert VTC Berck-sur-Mer - Le Touquet-Paris-Plage. Trajet rapide, tarif fixe, chauffeur professionnel disponible 24h/24.",
    h1: "Transfert VTC Berck-sur-Mer → Le Touquet",
    content: "Le trajet entre Berck-sur-Mer et Le Touquet-Paris-Plage, environ 25 minutes le long de la côte, est l'un des transferts les plus courts mais aussi les plus demandés de notre service, notamment pendant les événements hippiques et l'Enduropale.\n\nL'Ambassadeur des VTC vous garantit ponctualité et discrétion pour vos déplacements professionnels ou événementiels vers Le Touquet, avec un tarif fixe annoncé avant la réservation.\n\nRéservez votre transfert Berck-Le Touquet à l'avance pendant les périodes de forte demande pour garantir votre créneau.",
    faq: faqFor('le trajet Berck-sur-Mer - Le Touquet', '45€'),
  },
  {
    slug: 'transfert-calais-le-touquet', page_type: 'transfer', is_published: true,
    title: "Transfert VTC Calais → Le Touquet | L'Ambassadeur des VTC",
    meta_description: "Transfert VTC Calais - Le Touquet-Paris-Plage. Service premium, environ 1h de trajet, tarif fixe dès 90€.",
    h1: "Transfert VTC Calais → Le Touquet",
    content: "Reliez Calais au Touquet-Paris-Plage en toute tranquillité avec L'Ambassadeur des VTC. Ce trajet d'environ 1 heure le long de la Côte d'Opale est très demandé en saison estivale, pour rejoindre les plages, le golf ou les événements du Touquet.\n\nNotre chauffeur vous prend en charge où vous le souhaitez à Calais — domicile, hôtel, aéroport ou gare — pour un transfert direct et confortable vers Le Touquet.\n\nRéservez votre trajet à l'avance, particulièrement recommandé en juillet et août lorsque la circulation sur la Côte d'Opale est dense.",
    faq: faqFor('le trajet Calais - Le Touquet', '90€'),
  },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('Supabase service credentials not configured');

    const headers = {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/seo_pages?on_conflict=slug`, {
      method: 'POST',
      headers,
      body: JSON.stringify(PAGES),
    });
    const rows = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(rows));

    return new Response(JSON.stringify({ ok: true, count: Array.isArray(rows) ? rows.length : 0 }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
