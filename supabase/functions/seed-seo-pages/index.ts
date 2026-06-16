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
    slug: 'vtc-toulon', page_type: 'city', is_published: true,
    title: "Chauffeur VTC à Toulon — Service Premium 24h/24 | L'Ambassadeur des VTC",
    meta_description: "Service VTC premium à Toulon. Chauffeur privé, transferts aéroport et gare, mise à disposition. Réservation instantanée, tarif fixe.",
    h1: "Chauffeur VTC à Toulon",
    content: "L'Ambassadeur des VTC est votre chauffeur privé de référence à Toulon et dans toute son agglomération. Que vous ayez besoin d'un transfert vers l'aéroport de Toulon-Hyères, la gare SNCF, ou un déplacement professionnel dans le centre-ville, notre service premium vous garantit ponctualité et confort à bord d'une Tesla Model Y 2026.\n\nNous desservons tous les quartiers de Toulon : le centre-ville, le Mourillon, Sainte-Anne, La Rode, ainsi que les communes limitrophes comme La Valette-du-Var, La Garde et Le Pradet. Nos chauffeurs connaissent parfaitement la ville et ses axes pour vous garantir le trajet le plus rapide.\n\nQue ce soit pour un aller simple, un aller-retour ou une mise à disposition à l'heure, obtenez un tarif fixe instantané et réservez votre course en moins de deux minutes, sans frais cachés.",
    faq: faqFor('un trajet à Toulon', '25€'),
  },
  {
    slug: 'vtc-hyeres', page_type: 'city', is_published: true,
    title: "Chauffeur VTC à Hyères — Transferts Premium | L'Ambassadeur des VTC",
    meta_description: "VTC premium à Hyères. Transfert aéroport Toulon-Hyères, presqu'île de Giens, centre-ville. Chauffeur privé disponible 24h/24.",
    h1: "Chauffeur VTC à Hyères",
    content: "Hyères et sa célèbre presqu'île de Giens méritent un service de transport à la hauteur. L'Ambassadeur des VTC assure vos trajets vers l'aéroport de Toulon-Hyères, situé à quelques minutes seulement, ainsi que vers les plages, le centre historique et les îles d'Or.\n\nNotre chauffeur vous prend en charge où vous le souhaitez à Hyères : votre domicile, votre hôtel, ou directement à l'aéroport avec suivi de vol en temps réel. Le trajet entre le centre d'Hyères et l'aéroport prend généralement moins de 10 minutes.\n\nProfitez d'un véhicule premium, silencieux et climatisé pour tous vos déplacements à Hyères, avec un tarif annoncé avant la réservation.",
    faq: faqFor('un trajet à Hyères', '20€'),
  },
  {
    slug: 'vtc-saint-tropez', page_type: 'city', is_published: true,
    title: "Chauffeur VTC à Saint-Tropez — Service Haut de Gamme | L'Ambassadeur des VTC",
    meta_description: "Chauffeur privé premium à Saint-Tropez. Transferts vers Nice, Toulon, événements et soirées. Discrétion et ponctualité garanties.",
    h1: "Chauffeur VTC à Saint-Tropez",
    content: "Saint-Tropez exige un service à la hauteur de sa réputation. L'Ambassadeur des VTC propose un chauffeur privé haut de gamme pour tous vos déplacements dans la ville et ses environs : Port de Saint-Tropez, Pampelonne, Ramatuelle, Gassin.\n\nNous assurons également vos transferts longue distance vers l'aéroport de Nice Côte d'Azur (environ 1h45), l'aéroport de Toulon-Hyères, ou pour vos soirées et événements privés. Discrétion, ponctualité et véhicule premium sont les piliers de notre service à Saint-Tropez.\n\nQue vous soyez en villégiature ou en déplacement professionnel, réservez votre trajet en quelques clics et bénéficiez d'un service sans compromis.",
    faq: faqFor('un trajet à Saint-Tropez', '35€'),
  },
  {
    slug: 'vtc-frejus', page_type: 'city', is_published: true,
    title: "Chauffeur VTC à Fréjus — Réservation Instantanée | L'Ambassadeur des VTC",
    meta_description: "VTC premium à Fréjus. Transferts vers Cannes, Nice, Saint-Raphaël. Chauffeur professionnel, tarif fixe, réservation en ligne.",
    h1: "Chauffeur VTC à Fréjus",
    content: "Fréjus, porte d'entrée vers la Côte d'Azur, bénéficie du service premium de L'Ambassadeur des VTC. Nous couvrons l'ensemble de la commune — du centre historique romain à Fréjus-Plage — ainsi que les liaisons vers Saint-Raphaël, Cannes et Nice.\n\nNotre service est particulièrement prisé pour les transferts vers les aéroports de Nice et de Cannes-Mandelieu, ainsi que pour les déplacements professionnels vers les zones d'activité environnantes.\n\nRéservez votre chauffeur à Fréjus en deux minutes : adresse de départ, destination, date et heure — votre tarif s'affiche instantanément.",
    faq: faqFor('un trajet à Fréjus', '25€'),
  },
  {
    slug: 'vtc-draguignan', page_type: 'city', is_published: true,
    title: "Chauffeur VTC à Draguignan — Transferts Premium | L'Ambassadeur des VTC",
    meta_description: "Service VTC à Draguignan et dans le Haut-Var. Transferts aéroport Nice, Toulon, gare. Chauffeur disponible 24h/24.",
    h1: "Chauffeur VTC à Draguignan",
    content: "Draguignan et le Haut-Var sont desservis par L'Ambassadeur des VTC pour tous vos déplacements, qu'ils soient personnels ou professionnels. Notre chauffeur vous emmène vers les aéroports de Nice ou Toulon-Hyères, les gares de la région, ou directement à votre destination dans le Var.\n\nLes liaisons vers Draguignan sont particulièrement demandées par les militaires et professionnels de la base de Draguignan, ainsi que par les visiteurs du Haut-Var en villégiature.\n\nObtenez votre tarif fixe instantanément et réservez votre trajet vers ou depuis Draguignan sans avoir besoin de créer de compte.",
    faq: faqFor('un trajet à Draguignan', '25€'),
  },
  {
    slug: 'vtc-la-seyne-sur-mer', page_type: 'city', is_published: true,
    title: "Chauffeur VTC à La Seyne-sur-Mer | L'Ambassadeur des VTC",
    meta_description: "VTC premium à La Seyne-sur-Mer. Transferts aéroport, gare, déplacements professionnels. Réservation instantanée.",
    h1: "Chauffeur VTC à La Seyne-sur-Mer",
    content: "La Seyne-sur-Mer, deuxième ville du Var par sa population, bénéficie du même niveau de service premium que Toulon avec L'Ambassadeur des VTC. Nous couvrons l'ensemble de la commune : centre-ville, Les Sablettes, Mar Vivo, Tamaris.\n\nIdéalement située près de Toulon, La Seyne-sur-Mer profite de transferts rapides vers l'aéroport de Toulon-Hyères et la gare SNCF de Toulon, à environ 15 minutes.\n\nRéservez votre chauffeur VTC à La Seyne-sur-Mer pour vos trajets du quotidien ou vos transferts longue distance.",
    faq: faqFor('un trajet à La Seyne-sur-Mer', '25€'),
  },
  {
    slug: 'vtc-six-fours-les-plages', page_type: 'city', is_published: true,
    title: "Chauffeur VTC à Six-Fours-les-Plages | L'Ambassadeur des VTC",
    meta_description: "Service VTC à Six-Fours-les-Plages. Transferts aéroport Toulon-Hyères, gare, plages du Brusc. Chauffeur premium 24h/24.",
    h1: "Chauffeur VTC à Six-Fours-les-Plages",
    content: "Six-Fours-les-Plages et ses célèbres plages du Brusc sont accessibles avec le service premium de L'Ambassadeur des VTC. Idéal pour vos vacances ou vos déplacements professionnels dans l'ouest toulonnais.\n\nNous assurons vos transferts vers l'aéroport de Toulon-Hyères (environ 25 minutes), la gare de Toulon, ainsi que tous vos déplacements vers les communes voisines de Sanary-sur-Mer et La Seyne-sur-Mer.\n\nVéhicule premium, chauffeur professionnel et tarif annoncé avant réservation : tout pour un trajet sans stress.",
    faq: faqFor('un trajet à Six-Fours-les-Plages', '25€'),
  },
  {
    slug: 'vtc-sanary-sur-mer', page_type: 'city', is_published: true,
    title: "Chauffeur VTC à Sanary-sur-Mer | L'Ambassadeur des VTC",
    meta_description: "VTC premium à Sanary-sur-Mer. Transferts aéroport, gare, déplacements touristiques. Réservation en ligne instantanée.",
    h1: "Chauffeur VTC à Sanary-sur-Mer",
    content: "Le charmant port de pêche de Sanary-sur-Mer est desservi par L'Ambassadeur des VTC pour tous vos trajets vers l'aéroport de Toulon-Hyères, la gare de Toulon ou n'importe quelle destination dans le Var et la Côte d'Azur.\n\nNotre service est apprécié des résidents et des touristes pour sa fiabilité et son confort, notamment pour les transferts liés aux vols en haute saison touristique.\n\nRéservez votre chauffeur à Sanary-sur-Mer en deux minutes et profitez d'un trajet serein, quelle que soit votre destination.",
    faq: faqFor('un trajet à Sanary-sur-Mer', '25€'),
  },

  // ── AIRPORT PAGES ───────────────────────────────────────────
  {
    slug: 'vtc-aeroport-nice-cote-dazur', page_type: 'airport', is_published: true,
    title: "Transfert VTC Aéroport Nice Côte d'Azur | L'Ambassadeur des VTC",
    meta_description: "Transfert VTC vers/depuis l'aéroport de Nice Côte d'Azur. Suivi de vol en temps réel, prise en charge garantie. Réservation instantanée.",
    h1: "Transfert VTC Aéroport Nice Côte d'Azur",
    content: "L'Ambassadeur des VTC assure vos transferts vers et depuis l'aéroport de Nice Côte d'Azur, le deuxième plus grand aéroport de France, depuis n'importe quelle ville du Var ou de la Côte d'Azur : Toulon, Hyères, Saint-Tropez, Fréjus, Draguignan.\n\nNous suivons votre vol en temps réel pour ajuster automatiquement l'heure de prise en charge en cas de retard, sans frais supplémentaires. Votre chauffeur vous attend avec une pancarte à votre nom au terminal d'arrivée, ou vient vous chercher à l'adresse de votre choix pour un départ.\n\nLe trajet entre Toulon et l'aéroport de Nice prend environ 1h20, contre 1h45 depuis Saint-Tropez. Réservez votre transfert aéroport Nice dès maintenant et obtenez un tarif fixe instantané.",
    faq: faqFor("un transfert vers l'aéroport de Nice", '120€'),
  },
  {
    slug: 'vtc-aeroport-toulon-hyeres', page_type: 'airport', is_published: true,
    title: "Transfert VTC Aéroport Toulon-Hyères | L'Ambassadeur des VTC",
    meta_description: "Transfert VTC aéroport Toulon-Hyères. Prise en charge rapide, chauffeur ponctuel, tarif fixe dès 20€.",
    h1: "Transfert VTC Aéroport Toulon-Hyères",
    content: "L'aéroport de Toulon-Hyères est notre terrain de jeu privilégié. L'Ambassadeur des VTC y assure des transferts rapides depuis Toulon, Hyères, La Seyne-sur-Mer, Six-Fours et l'ensemble de l'agglomération toulonnaise.\n\nGrâce à sa proximité avec le centre-ville de Toulon (environ 20 minutes) et d'Hyères (10 minutes), ce transfert est l'un des plus demandés de notre service. Nous suivons votre vol en temps réel pour une prise en charge sans attente.\n\nQue vous arriviez d'un vol intérieur ou international, votre chauffeur vous attend avec une pancarte personnalisée à la sortie du terminal.",
    faq: faqFor("un transfert vers l'aéroport de Toulon-Hyères", '20€'),
  },
  {
    slug: 'vtc-aeroport-marseille-provence', page_type: 'airport', is_published: true,
    title: "Transfert VTC Aéroport Marseille Provence | L'Ambassadeur des VTC",
    meta_description: "Transfert VTC vers l'aéroport de Marseille Provence depuis le Var. Suivi de vol, chauffeur ponctuel, réservation instantanée.",
    h1: "Transfert VTC Aéroport Marseille Provence",
    content: "L'Ambassadeur des VTC vous accompagne vers l'aéroport de Marseille Provence depuis Toulon, Fréjus, Hyères et tout le Var. Comptez environ 1h15 de trajet depuis Toulon pour rejoindre ce hub majeur du sud de la France.\n\nNotre service de suivi de vol en temps réel s'applique également à ce trajet : en cas de vol retardé ou avancé, l'heure de prise en charge est automatiquement ajustée.\n\nIdéal pour les voyageurs d'affaires comme pour les vacanciers, ce transfert combine confort, ponctualité et tarif fixe annoncé à l'avance.",
    faq: faqFor("un transfert vers l'aéroport de Marseille", '110€'),
  },

  // ── STATION PAGES ───────────────────────────────────────────
  {
    slug: 'vtc-gare-de-toulon', page_type: 'station', is_published: true,
    title: "VTC Gare de Toulon — Chauffeur Privé | L'Ambassadeur des VTC",
    meta_description: "Chauffeur VTC à la gare de Toulon. Prise en charge directe en sortie de gare, accueil personnalisé, réservation instantanée.",
    h1: "Chauffeur VTC à la Gare de Toulon",
    content: "La gare SNCF de Toulon, desservie par TGV et trains régionaux, est l'un des points de prise en charge les plus fréquents de L'Ambassadeur des VTC. Notre chauffeur vous attend directement à la sortie de la gare avec une pancarte à votre nom, pour vous conduire où vous le souhaitez dans le Var ou la Côte d'Azur.\n\nQue vous arriviez d'un déplacement professionnel ou personnel, profitez d'un accueil personnalisé et d'un trajet confortable à bord de notre Tesla Model Y 2026.\n\nRéservez votre chauffeur à l'avance pour une prise en charge garantie à votre arrivée, ou à la dernière minute selon disponibilité.",
    faq: faqFor('un trajet depuis la gare de Toulon', '20€'),
  },
  {
    slug: 'vtc-gare-de-saint-raphael', page_type: 'station', is_published: true,
    title: "VTC Gare de Saint-Raphaël-Valescure | L'Ambassadeur des VTC",
    meta_description: "Chauffeur VTC à la gare de Saint-Raphaël-Valescure. Transferts vers Fréjus, Cannes, Saint-Tropez. Réservation en ligne.",
    h1: "Chauffeur VTC à la Gare de Saint-Raphaël-Valescure",
    content: "La gare de Saint-Raphaël-Valescure, porte d'entrée vers l'Estérel et la Côte d'Azur, est desservie par L'Ambassadeur des VTC pour tous vos transferts vers Fréjus, Cannes, Saint-Tropez ou plus loin sur la Côte d'Azur.\n\nNotre chauffeur vous accueille à la sortie de la gare avec une pancarte personnalisée, prêt à vous conduire vers votre hôtel, votre résidence ou votre prochain rendez-vous professionnel.\n\nProfitez d'un service fiable et confortable pour transformer votre arrivée en train en un trajet sans stress.",
    faq: faqFor('un trajet depuis la gare de Saint-Raphaël', '25€'),
  },

  // ── TRANSFER (point-to-point) PAGES ─────────────────────────
  {
    slug: 'transfert-toulon-aeroport-nice', page_type: 'transfer', is_published: true,
    title: "Transfert VTC Toulon → Aéroport Nice | L'Ambassadeur des VTC",
    meta_description: "Transfert VTC Toulon - Aéroport Nice Côte d'Azur. 1h20 de trajet, tarif fixe dès 120€, suivi de vol inclus.",
    h1: "Transfert VTC Toulon → Aéroport Nice",
    content: "Le trajet entre Toulon et l'aéroport de Nice Côte d'Azur est l'une des liaisons les plus demandées de L'Ambassadeur des VTC. Comptez environ 1h20 par l'autoroute A8, avec un tarif fixe annoncé dès la réservation — aucune surprise à l'arrivée.\n\nNotre chauffeur vous prend en charge à votre domicile, votre hôtel ou votre lieu de travail à Toulon, pour vous conduire directement au terminal de votre choix à l'aéroport de Nice. Pour les départs, nous calculons votre heure de prise en charge en fonction de l'heure de votre vol afin de vous garantir une arrivée confortable, sans stress.\n\nPour les arrivées, le suivi de vol en temps réel nous permet d'ajuster automatiquement l'heure de prise en charge en cas de retard.",
    faq: faqFor('le trajet Toulon - Aéroport Nice', '120€'),
  },
  {
    slug: 'transfert-hyeres-aeroport-nice', page_type: 'transfer', is_published: true,
    title: "Transfert VTC Hyères → Aéroport Nice | L'Ambassadeur des VTC",
    meta_description: "Transfert VTC Hyères - Aéroport Nice Côte d'Azur. Tarif fixe, suivi de vol, chauffeur ponctuel.",
    h1: "Transfert VTC Hyères → Aéroport Nice",
    content: "Depuis Hyères, rejoignez l'aéroport de Nice Côte d'Azur en toute sérénité avec L'Ambassadeur des VTC. Le trajet dure environ 1h30 et bénéficie d'un tarif fixe annoncé avant la réservation.\n\nNotre chauffeur vous prend en charge où vous le souhaitez à Hyères — domicile, hôtel, presqu'île de Giens — pour un transfert direct et confortable vers le terminal de votre choix.\n\nLe suivi de vol en temps réel garantit une prise en charge ajustée à l'heure réelle de votre vol, à l'aller comme au retour.",
    faq: faqFor('le trajet Hyères - Aéroport Nice', '130€'),
  },
  {
    slug: 'transfert-saint-tropez-aeroport-nice', page_type: 'transfer', is_published: true,
    title: "Transfert VTC Saint-Tropez → Aéroport Nice | L'Ambassadeur des VTC",
    meta_description: "Transfert VTC Saint-Tropez - Aéroport Nice Côte d'Azur. Service haut de gamme, 1h45 de trajet, tarif fixe dès 180€.",
    h1: "Transfert VTC Saint-Tropez → Aéroport Nice",
    content: "Le transfert entre Saint-Tropez et l'aéroport de Nice Côte d'Azur est l'un des trajets emblématiques de L'Ambassadeur des VTC. Comptez environ 1h45 pour ce trajet le long de la Côte d'Azur, à bord d'un véhicule premium silencieux et confortable.\n\nNotre service haut de gamme est particulièrement apprécié des voyageurs internationaux et des résidents saisonniers de Saint-Tropez, qui exigent ponctualité et discrétion pour leurs déplacements vers l'aéroport.\n\nRéservez à l'avance pour garantir votre créneau en haute saison, ou profitez de notre disponibilité 24h/24 pour une réservation de dernière minute.",
    faq: faqFor('le trajet Saint-Tropez - Aéroport Nice', '180€'),
  },
  {
    slug: 'transfert-toulon-aeroport-marseille', page_type: 'transfer', is_published: true,
    title: "Transfert VTC Toulon → Aéroport Marseille | L'Ambassadeur des VTC",
    meta_description: "Transfert VTC Toulon - Aéroport Marseille Provence. 1h15 de trajet, tarif fixe dès 110€, suivi de vol inclus.",
    h1: "Transfert VTC Toulon → Aéroport Marseille",
    content: "Pour rejoindre l'aéroport de Marseille Provence depuis Toulon, L'Ambassadeur des VTC propose un service de transfert direct d'environ 1h15 par l'autoroute. Le tarif est fixé à l'avance, sans supplément pour les bagages ou le trafic.\n\nNotre chauffeur vous prend en charge à l'adresse de votre choix à Toulon et vous dépose directement au terminal correspondant à votre vol, avec un timing calculé pour vous éviter tout stress.\n\nCe trajet est particulièrement prisé par les voyageurs d'affaires toulonnais empruntant les vols internationaux depuis Marseille.",
    faq: faqFor('le trajet Toulon - Aéroport Marseille', '110€'),
  },
  {
    slug: 'transfert-toulon-monaco', page_type: 'transfer', is_published: true,
    title: "Transfert VTC Toulon → Monaco | L'Ambassadeur des VTC",
    meta_description: "Transfert VTC Toulon - Monaco. Service premium, 1h30 de trajet, tarif fixe dès 160€.",
    h1: "Transfert VTC Toulon → Monaco",
    content: "Rejoignez la Principauté de Monaco depuis Toulon avec le service premium de L'Ambassadeur des VTC. Ce trajet d'environ 1h30 le long de la Côte d'Azur est idéal pour vos déplacements d'affaires, vos soirées au casino ou vos événements à Monaco.\n\nNotre véhicule Tesla Model Y 2026, silencieux et élégant, s'accorde parfaitement avec l'image de la Principauté. Le chauffeur peut également vous attendre sur place pour le trajet retour, sur demande.\n\nObtenez votre tarif fixe instantanément et réservez votre transfert Toulon-Monaco en quelques clics.",
    faq: faqFor('le trajet Toulon - Monaco', '160€'),
  },
  {
    slug: 'transfert-frejus-cannes', page_type: 'transfer', is_published: true,
    title: "Transfert VTC Fréjus → Cannes | L'Ambassadeur des VTC",
    meta_description: "Transfert VTC Fréjus - Cannes. Trajet rapide, tarif fixe, chauffeur professionnel disponible 24h/24.",
    h1: "Transfert VTC Fréjus → Cannes",
    content: "Le trajet entre Fréjus et Cannes, environ 30 minutes par l'autoroute, est l'un des transferts les plus courts mais aussi les plus demandés de notre service, notamment pendant le Festival de Cannes et les événements du Palais des Festivals.\n\nL'Ambassadeur des VTC vous garantit ponctualité et discrétion pour vos déplacements professionnels ou événementiels vers Cannes, avec un tarif fixe annoncé avant la réservation.\n\nRéservez votre transfert Fréjus-Cannes à l'avance pendant les périodes de forte demande pour garantir votre créneau.",
    faq: faqFor('le trajet Fréjus - Cannes', '70€'),
  },
  {
    slug: 'transfert-toulon-saint-tropez', page_type: 'transfer', is_published: true,
    title: "Transfert VTC Toulon → Saint-Tropez | L'Ambassadeur des VTC",
    meta_description: "Transfert VTC Toulon - Saint-Tropez. Service premium, environ 1h de trajet, tarif fixe dès 90€.",
    h1: "Transfert VTC Toulon → Saint-Tropez",
    content: "Reliez Toulon à Saint-Tropez en toute tranquillité avec L'Ambassadeur des VTC. Ce trajet d'environ 1 heure le long du littoral varois est très demandé en saison estivale, pour rejoindre les plages, le port ou les événements de Saint-Tropez.\n\nNotre chauffeur vous prend en charge où vous le souhaitez à Toulon — domicile, hôtel, aéroport ou gare — pour un transfert direct et confortable vers Saint-Tropez.\n\nRéservez votre trajet à l'avance, particulièrement recommandé en juillet et août lorsque la circulation sur la presqu'île est dense.",
    faq: faqFor('le trajet Toulon - Saint-Tropez', '90€'),
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
