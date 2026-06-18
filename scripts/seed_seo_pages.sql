-- Script d'insertion des nouvelles pages SEO dans Supabase
-- Coller ce script dans l'éditeur SQL de Supabase (https://app.supabase.com > SQL Editor)
-- Utilise ON CONFLICT pour ne pas écraser les pages existantes

INSERT INTO seo_pages (slug, page_type, title, meta_description, h1, content, faq, is_published)
VALUES

-- VTC Saint-Raphaël
(
  'vtc-saint-raphael',
  'city',
  'VTC Saint-Raphaël – Chauffeur Privé 24h/24 | L''Ambassadeur des VTC',
  'Chauffeur VTC à Saint-Raphaël. Transferts vers Nice Aéroport, Cannes, Saint-Tropez et toute la Côte d''Azur. Service premium 24h/24 et 7j/7.',
  'VTC Saint-Raphaël – Chauffeur Privé Disponible 24h/24',
  'L''Ambassadeur des VTC assure votre transport à Saint-Raphaël et dans toute l''Estérel. Basés à Fréjus, nous intervenons à Saint-Raphaël pour vos transferts vers l''aéroport de Nice Côte d''Azur, la gare de Saint-Raphaël, Cannes, Monaco et Saint-Tropez.

Notre service de chauffeur privé VTC à Saint-Raphaël vous garantit ponctualité, confort et discrétion. Véhicules haut de gamme, chauffeurs professionnels et tarifs transparents sans surprise.

Que ce soit pour un déplacement professionnel, un transfert aéroport ou une sortie privée sur la Côte d''Azur, nous sommes disponibles 24h/24 et 7j/7.',
  '[
    {"q": "Quel est le prix d''un VTC de Saint-Raphaël à l''aéroport de Nice ?", "a": "Le tarif pour un transfert VTC Saint-Raphaël – Aéroport Nice Côte d''Azur est d''environ 90 à 110€ selon les horaires. Demandez un devis instantané sur notre site."},
    {"q": "Puis-je réserver un VTC à Saint-Raphaël à la dernière minute ?", "a": "Oui, notre service est disponible 24h/24 et 7j/7. Vous pouvez réserver en ligne en 2 minutes ou nous appeler directement."},
    {"q": "L''Ambassadeur des VTC couvre-t-il toute la région de Saint-Raphaël ?", "a": "Oui, nous couvrons Saint-Raphaël, Valescure, Boulouris, Agay, Anthéor, Le Dramont et toutes les communes environnantes."}
  ]'::jsonb,
  true
),

-- VTC Cannes
(
  'vtc-cannes',
  'city',
  'VTC Cannes – Chauffeur Privé Festival & Transferts | L''Ambassadeur des VTC',
  'Chauffeur VTC à Cannes. Transferts vers Nice Aéroport, Monaco, Saint-Tropez. Service premium pour particuliers et professionnels. Festival de Cannes.',
  'VTC Cannes – Chauffeur Privé Premium',
  'L''Ambassadeur des VTC propose un service de chauffeur privé haut de gamme à Cannes. Depuis notre base à Fréjus (Var), nous assurons vos transferts entre Cannes et l''aéroport de Nice Côte d''Azur, Monaco, Saint-Tropez, Toulon et toutes les grandes villes de la Côte d''Azur.

Que vous soyez à Cannes pour le Festival, pour affaires ou pour un séjour de luxe, notre équipe de chauffeurs professionnels vous offre discrétion, confort et ponctualité irréprochable. Véhicules premium : berlines haut de gamme et monospaces spacieux.

Réservation instantanée, confirmation par email et SMS, tarifs clairs sans supplément caché.',
  '[
    {"q": "Combien coûte un VTC de Cannes à l''aéroport de Nice ?", "a": "Le tarif pour un transfert VTC Cannes – Aéroport Nice est d''environ 70 à 90€ selon les horaires et le véhicule. Demandez un devis en ligne."},
    {"q": "Proposez-vous un service VTC pour le Festival de Cannes ?", "a": "Oui, nous proposons un service dédié pour le Festival de Cannes : transferts aéroport, navettes entre Cannes et Nice/Monaco, mise à disposition de chauffeur."},
    {"q": "Peut-on réserver un VTC Cannes 24h/24 ?", "a": "Absolument. Notre service est disponible 24 heures sur 24, 7 jours sur 7, y compris les jours fériés."}
  ]'::jsonb,
  true
),

-- Chauffeur Privé Fréjus (page ciblant "chauffeur privé Fréjus")
(
  'chauffeur-prive-frejus',
  'city',
  'Chauffeur Privé Fréjus – VTC Premium Var | L''Ambassadeur des VTC',
  'Chauffeur privé à Fréjus. Service VTC premium pour transferts aéroport, gare, affaires et loisirs. Disponible 24h/24. Réservation instantanée.',
  'Chauffeur Privé à Fréjus – Service VTC Premium',
  'Vous recherchez un chauffeur privé à Fréjus ? L''Ambassadeur des VTC est votre partenaire de confiance pour tous vos déplacements dans le Var et sur la Côte d''Azur. Société de VTC basée à Fréjus, nous proposons des transferts vers Nice Aéroport, Cannes, Saint-Tropez, Monaco et toute la région.

Notre service de chauffeur privé à Fréjus est idéal pour :
— Les transferts aéroport (Nice Côte d''Azur, Toulon-Hyères, Marseille-Provence)
— Les transferts gare (Saint-Raphaël, Toulon)
— Les déplacements professionnels et corporate
— Les sorties privées et événements (mariages, soirées, séminaires)
— Les mises à disposition de chauffeur à l''heure

Réservez en ligne en 2 minutes. Confirmation immédiate par email et SMS. Tarif fixe, pas de surprise.',
  '[
    {"q": "Qu''est-ce qu''un chauffeur privé VTC à Fréjus ?", "a": "Un chauffeur privé VTC est un professionnel du transport titulaire d''une carte VTC, qui vous transporte dans un véhicule haut de gamme avec confort et discrétion, à tarif fixe convenu à l''avance."},
    {"q": "Quelle est la différence entre un taxi et un chauffeur privé VTC à Fréjus ?", "a": "Contrairement au taxi, le VTC fonctionne uniquement sur réservation préalable. Le tarif est fixé avant la course, sans compteur. Le confort et le niveau de service sont généralement supérieurs."},
    {"q": "Fréjus à l''aéroport de Nice : combien de temps en VTC ?", "a": "Le trajet Fréjus – Aéroport Nice Côte d''Azur dure environ 50 à 70 minutes selon le trafic, pour un tarif d''environ 95 à 115€."}
  ]'::jsonb,
  true
),

-- VTC Roquebrune-sur-Argens
(
  'vtc-roquebrune-sur-argens',
  'city',
  'VTC Roquebrune-sur-Argens – Chauffeur Privé Var | L''Ambassadeur des VTC',
  'Service VTC à Roquebrune-sur-Argens. Transferts aéroport Nice, Fréjus, Saint-Raphaël, Saint-Tropez. Chauffeur privé disponible 24h/24.',
  'VTC Roquebrune-sur-Argens – Chauffeur Privé',
  'L''Ambassadeur des VTC assure votre transport depuis et vers Roquebrune-sur-Argens dans le Var. Que vous partiez de la plaine de l''Argens, du village perché ou de la zone de La Bouverie, notre chauffeur privé vient vous chercher à domicile.

Nous proposons des transferts vers l''aéroport de Nice Côte d''Azur, l''aéroport de Toulon-Hyères, la gare de Saint-Raphaël et Fréjus, Saint-Tropez, Cannes et Monaco.

Réservation simple en ligne ou par téléphone, tarif fixe, confort premium.',
  '[
    {"q": "Combien coûte un VTC de Roquebrune-sur-Argens à l''aéroport de Nice ?", "a": "Le tarif pour un transfert VTC Roquebrune-sur-Argens – Aéroport Nice est d''environ 100 à 120€. Demandez un devis gratuit en ligne."},
    {"q": "Intervenez-vous dans tout Roquebrune-sur-Argens ?", "a": "Oui, nous couvrons le village, La Bouverie, Les Issambres, Roquebrune-Plage et toutes les quartiers de la commune."},
    {"q": "Comment réserver un VTC à Roquebrune-sur-Argens ?", "a": "Réservez en ligne sur notre site en 2 minutes ou appelez-nous directement. Confirmation immédiate par email et SMS."}
  ]'::jsonb,
  true
),

-- VTC Puget-sur-Argens
(
  'vtc-puget-sur-argens',
  'city',
  'VTC Puget-sur-Argens – Chauffeur Privé Var | L''Ambassadeur des VTC',
  'Service VTC à Puget-sur-Argens. Transferts aéroport Nice, Fréjus, Saint-Raphaël. Chauffeur privé disponible 24h/24 dans le Var.',
  'VTC Puget-sur-Argens – Chauffeur Privé',
  'L''Ambassadeur des VTC propose un service de chauffeur privé à Puget-sur-Argens et dans tout le bassin de l''Argens. Situés à quelques minutes de Fréjus et Saint-Raphaël, nous assurons vos transferts vers les aéroports de Nice et Toulon-Hyères, les gares TGV et les destinations touristiques de la Côte d''Azur.

Service disponible 24h/24, réservation en ligne ou par téléphone, tarifs fixes transparents.',
  '[
    {"q": "Quel est le prix d''un VTC de Puget-sur-Argens à l''aéroport de Nice ?", "a": "Comptez environ 100 à 120€ pour un transfert VTC Puget-sur-Argens – Aéroport de Nice selon les horaires."},
    {"q": "Le VTC est-il disponible à Puget-sur-Argens la nuit ?", "a": "Oui, notre service fonctionne 24h/24 et 7j/7, y compris la nuit et les week-ends."},
    {"q": "Puis-je réserver un aller-retour depuis Puget-sur-Argens ?", "a": "Oui, nous proposons des réservations aller-retour avec tarif avantageux. Réservez les deux trajets en même temps."}
  ]'::jsonb,
  true
),

-- Transfert Fréjus – Aéroport Nice
(
  'transfert-frejus-aeroport-nice',
  'transfer',
  'Transfert VTC Fréjus – Aéroport Nice Côte d''Azur | L''Ambassadeur des VTC',
  'Transfert VTC Fréjus Aéroport Nice Côte d''Azur. Tarif fixe, suivi de vol, prise en charge garantie. Service disponible 24h/24 et 7j/7.',
  'Transfert VTC Fréjus → Aéroport de Nice Côte d''Azur',
  'L''Ambassadeur des VTC assure votre transfert entre Fréjus et l''Aéroport International de Nice Côte d''Azur (NCE), le 3ème aéroport de France. Un service fiable, ponctuel et confortable pour ne jamais rater votre vol.

VOTRE TRAJET :
Départ depuis votre domicile à Fréjus ou dans le secteur (Saint-Raphaël, Roquebrune-sur-Argens, Puget-sur-Argens, Les Issambres). Arrivée directement devant votre terminal à Nice Côte d''Azur. Durée estimée : 50 à 70 minutes selon le trafic.

POURQUOI CHOISIR L''AMBASSADEUR DES VTC ?
— Suivi de votre vol en temps réel
— Votre chauffeur vous attend même en cas de retard
— Tarif fixe réservé à l''avance, sans compteur
— Véhicule haut de gamme avec coffre spacieux
— Confirmation instantanée par email et SMS

Réservez votre transfert Fréjus – Nice Aéroport au moins 24h à l''avance pour garantir votre place.',
  '[
    {"q": "Quel est le tarif du transfert Fréjus – Aéroport de Nice ?", "a": "Le prix d''un transfert VTC Fréjus – Aéroport Nice Côte d''Azur est d''environ 95 à 115€ selon l''horaire et le type de véhicule. Tarif fixe, sans surprise."},
    {"q": "Combien de temps dure le trajet Fréjus – Nice Aéroport en VTC ?", "a": "Le trajet dure environ 50 à 70 minutes selon le trafic. Nous recommandons de prévoir au moins 2h30 avant votre vol."},
    {"q": "Mon chauffeur m''attend-il si mon vol est en retard ?", "a": "Oui. Nous suivons votre vol en temps réel. Si votre vol est retardé, votre chauffeur ajuste sa prise en charge automatiquement."},
    {"q": "Puis-je transporter des bagages volumineux ?", "a": "Oui, nos véhicules disposent d''un grand coffre. Précisez le nombre de bagages lors de la réservation si vous avez des valises nombreuses ou volumineuses."}
  ]'::jsonb,
  true
),

-- Transfert Fréjus – Saint-Tropez
(
  'transfert-frejus-saint-tropez',
  'transfer',
  'Transfert VTC Fréjus – Saint-Tropez | L''Ambassadeur des VTC',
  'Transfert VTC Fréjus Saint-Tropez. Chauffeur privé pour votre trajet vers le golfe de Saint-Tropez. Tarif fixe, confort premium, 24h/24.',
  'Transfert VTC Fréjus → Saint-Tropez',
  'L''Ambassadeur des VTC vous transporte depuis Fréjus jusqu''au cœur de Saint-Tropez et du golfe (Grimaud, Port-Grimaud, Sainte-Maxime, Ramatuelle, Gassin). Un chauffeur privé élégant pour rejoindre la destination la plus prisée de la Côte d''Azur.

Le trajet Fréjus – Saint-Tropez dure environ 30 à 60 minutes selon la saison (trafic estival plus dense). Notre chauffeur vous dépose à votre hôtel, villa, port ou restaurant.

Service disponible toute l''année, idéal en haute saison pour éviter les embouteillages et profiter du trajet.',
  '[
    {"q": "Quel est le prix d''un VTC de Fréjus à Saint-Tropez ?", "a": "Le tarif pour un transfert VTC Fréjus – Saint-Tropez est d''environ 60 à 80€. Tarif fixe, réservé à l''avance."},
    {"q": "Combien de temps dure le trajet Fréjus – Saint-Tropez ?", "a": "Environ 30 à 45 minutes hors saison. En juillet-août, comptez 45 à 75 minutes selon les embouteillages."},
    {"q": "Proposez-vous un aller-retour Fréjus – Saint-Tropez ?", "a": "Oui, avec un tarif préférentiel pour l''aller-retour. Idéal pour une soirée ou une journée dans le golfe."}
  ]'::jsonb,
  true
),

-- Transfert Saint-Raphaël – Aéroport Nice
(
  'transfert-saint-raphael-aeroport-nice',
  'transfer',
  'Transfert VTC Saint-Raphaël – Aéroport Nice Côte d''Azur | L''Ambassadeur des VTC',
  'Transfert VTC Saint-Raphaël Aéroport Nice. Tarif fixe, suivi de vol, prise en charge garantie. Chauffeur privé 24h/24 7j/7.',
  'Transfert VTC Saint-Raphaël → Aéroport de Nice Côte d''Azur',
  'L''Ambassadeur des VTC assure votre transfert entre Saint-Raphaël et l''Aéroport de Nice Côte d''Azur. Depuis votre domicile, hôtel ou résidence à Saint-Raphaël, votre chauffeur vous conduit directement à votre terminal à Nice.

Durée estimée : 45 à 65 minutes. Suivi de vol en temps réel inclus. Tarif fixe réservé à l''avance.

Un service fiable et confortable pour commencer ou terminer votre voyage dans les meilleures conditions.',
  '[
    {"q": "Quel est le prix du transfert Saint-Raphaël – Aéroport Nice ?", "a": "Le tarif est d''environ 85 à 105€ selon les horaires. Tarif fixe, confirmé à la réservation."},
    {"q": "Mon chauffeur vient-il me chercher à l''hôtel à Saint-Raphaël ?", "a": "Oui, la prise en charge se fait à l''adresse de votre choix : domicile, hôtel, résidence, port."},
    {"q": "Peut-on réserver la veille pour un transfert aéroport ?", "a": "Oui, la réservation est possible jusqu''à quelques heures avant le départ, sous réserve de disponibilité. Nous recommandons de réserver au moins 24h à l''avance."}
  ]'::jsonb,
  true
)

ON CONFLICT (slug) DO NOTHING;
