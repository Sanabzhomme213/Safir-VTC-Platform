-- ============================================================
-- SCRIPT SEO v2 — Couverture maximale Var & Côte d'Azur
-- Coller dans Supabase > SQL Editor > Run
-- ON CONFLICT DO NOTHING = sans risque si page déjà existante
-- ============================================================

INSERT INTO seo_pages (slug, page_type, title, meta_description, h1, content, faq, is_published) VALUES

-- ============================================================
-- VILLES — CÔTE D'AZUR
-- ============================================================

('vtc-nice', 'city',
 'VTC Nice – Chauffeur Privé Nice Côte d''Azur | L''Ambassadeur des VTC',
 'Chauffeur VTC à Nice. Transferts aéroport, gare Thiers, Cannes, Monaco, Saint-Tropez. Service premium 24h/24 dans les Alpes-Maritimes.',
 'VTC Nice – Chauffeur Privé Disponible 24h/24',
 'L''Ambassadeur des VTC assure vos transferts à Nice et dans toute la région des Alpes-Maritimes. Depuis notre base dans le Var, nous intervenons à Nice pour vos trajets vers l''aéroport Nice Côte d''Azur, la gare de Nice-Ville, Monaco, Cannes, Antibes et Saint-Tropez.

Ponctualité, discrétion et confort premium sont notre engagement à chaque trajet. Nos chauffeurs professionnels connaissent parfaitement les axes de la Côte d''Azur et optimisent chaque itinéraire.',
 '[{"q":"Quel est le tarif d''un VTC de Nice à l''aéroport ?","a":"Le tarif d''un VTC Nice centre – Aéroport Nice Côte d''Azur est d''environ 35 à 50€ selon la zone. Pour un trajet depuis le Var, comptez 90 à 120€."},{"q":"Proposez-vous un VTC Nice – Monaco ?","a":"Oui, nous assurons le trajet Nice – Monaco en environ 30 minutes, pour un tarif d''environ 60 à 80€."},{"q":"VTC disponible la nuit à Nice ?","a":"Oui, service 24h/24 et 7j/7 incluant les vols de nuit et les départs matinaux."}]'::jsonb,
 true),

('vtc-antibes', 'city',
 'VTC Antibes – Chauffeur Privé Juan-les-Pins | L''Ambassadeur des VTC',
 'Service VTC à Antibes et Juan-les-Pins. Transferts aéroport Nice, Cannes, Monaco. Chauffeur privé premium 24h/24.',
 'VTC Antibes & Juan-les-Pins – Chauffeur Privé',
 'L''Ambassadeur des VTC propose un service de chauffeur privé à Antibes, Juan-les-Pins, Cap d''Antibes et toute la commune. Idéalement situé entre Nice et Cannes, nous assurons vos transferts vers l''aéroport de Nice (20 min), Cannes (15 min), Monaco (45 min) et Saint-Tropez.

Que vous séjourniez dans un hôtel du Cap d''Antibes, dans une villa ou pour un événement professionnel, votre chauffeur est disponible à toute heure.',
 '[{"q":"Combien coûte un VTC d''Antibes à l''aéroport de Nice ?","a":"Environ 45 à 65€ selon le lieu de prise en charge à Antibes et l''horaire."},{"q":"Intervenez-vous à Juan-les-Pins ?","a":"Oui, nous couvrons Juan-les-Pins, Cap d''Antibes, Sophia Antipolis et toute la commune d''Antibes."},{"q":"VTC Antibes – Cannes : quel délai ?","a":"Environ 15 à 20 minutes selon le trafic, pour un tarif d''environ 35 à 50€."}]'::jsonb,
 true),

('vtc-grasse', 'city',
 'VTC Grasse – Chauffeur Privé Alpes-Maritimes | L''Ambassadeur des VTC',
 'VTC Grasse et arrière-pays. Transferts aéroport Nice, Cannes, Sophia Antipolis. Chauffeur privé disponible 24h/24.',
 'VTC Grasse – Chauffeur Privé',
 'L''Ambassadeur des VTC assure vos déplacements depuis Grasse, capitale mondiale du parfum, vers tous les grands pôles de la Côte d''Azur. Transferts vers l''aéroport de Nice (45 min), Cannes (25 min), Sophia Antipolis (20 min) et Toulon.

Service premium avec prise en charge à domicile, hôtel ou entreprise. Véhicules haut de gamme, chauffeurs en costume, confidentialité garantie.',
 '[{"q":"VTC Grasse – Nice Aéroport : quel tarif ?","a":"Environ 70 à 90€ pour un transfert Grasse – Aéroport Nice Côte d''Azur."},{"q":"Couvrez-vous Mougins, Mouans-Sartoux et Valbonne ?","a":"Oui, nous intervenons dans tout l''arrière-pays grassois : Mougins, Valbonne, Sophia Antipolis, Mouans-Sartoux."},{"q":"VTC disponible pour les séminaires d''entreprise à Sophia Antipolis ?","a":"Oui, nous proposons un service corporate avec facturation entreprise disponible."}]'::jsonb,
 true),

('vtc-mandelieu', 'city',
 'VTC Mandelieu-la-Napoule – Chauffeur Privé | L''Ambassadeur des VTC',
 'VTC à Mandelieu-la-Napoule. Transferts aéroport Nice, Cannes, Saint-Tropez. Chauffeur privé disponible 24h/24.',
 'VTC Mandelieu-la-Napoule – Chauffeur Privé',
 'L''Ambassadeur des VTC assure vos transferts à Mandelieu-la-Napoule, entre Cannes et l''Estérel. Transferts vers l''aéroport de Cannes-Mandelieu, Nice Côte d''Azur, Saint-Tropez et Fréjus.

Service de qualité premium, idéal pour les résidents et les vacanciers des résidences et hôtels de Mandelieu.',
 '[{"q":"VTC Mandelieu – Nice Aéroport : quel prix ?","a":"Environ 60 à 80€ pour un transfert Mandelieu – Nice Aéroport."},{"q":"Intervenez-vous au port de la Napoule ?","a":"Oui, prise en charge possible au port, à la marina, en hôtel ou à domicile."},{"q":"VTC Mandelieu – Cannes disponible la nuit ?","a":"Oui, disponible 24h/24 pour tous vos transferts depuis Mandelieu."}]'::jsonb,
 true),

('vtc-menton', 'city',
 'VTC Menton – Chauffeur Privé Côte d''Azur | L''Ambassadeur des VTC',
 'VTC à Menton, frontière franco-italienne. Transferts Nice Aéroport, Monaco, Cannes. Chauffeur privé 24h/24.',
 'VTC Menton – Chauffeur Privé',
 'L''Ambassadeur des VTC assure vos déplacements depuis Menton, la perle de la Côte d''Azur. Proche de la frontière italienne, nous assurons vos transferts vers Nice Aéroport (45 min), Monaco (20 min), Cannes (1h) et Vintimille.

Idéal pour les résidents frontaliers, les touristes et les hommes d''affaires se déplaçant entre France et Italie.',
 '[{"q":"VTC Menton – Monaco : quel tarif ?","a":"Environ 40 à 60€ pour un transfert Menton – Monaco en VTC premium."},{"q":"Faites-vous des trajets vers l''Italie ?","a":"Nous pouvons vous déposer à Vintimille et dans les villes italiennes proches sur demande."},{"q":"VTC Menton – Nice Aéroport : combien de temps ?","a":"Environ 45 à 60 minutes selon le trafic, pour un tarif d''environ 80 à 100€."}]'::jsonb,
 true),

('vtc-monaco', 'city',
 'VTC Monaco – Chauffeur Privé Principauté | L''Ambassadeur des VTC',
 'VTC Monaco. Transferts Nice Aéroport, Cannes, Saint-Tropez, Fréjus. Chauffeur privé discret et premium pour la Principauté.',
 'VTC Monaco – Chauffeur Privé Premium',
 'L''Ambassadeur des VTC propose un service de chauffeur privé haut de gamme pour vos déplacements à destination ou depuis Monaco. Que vous arriviez à l''aéroport de Nice ou à la gare de Monaco, notre chauffeur vous accueille et vous conduit en toute discrétion.

Transferts disponibles : Monaco – Nice Aéroport, Monaco – Cannes, Monaco – Saint-Tropez, Monaco – Fréjus, Monaco – Toulon.

Service adapté aux exigences de la Principauté : véhicules premium, chauffeurs en costume, totale confidentialité.',
 '[{"q":"Quel est le tarif d''un VTC Monaco – Nice Aéroport ?","a":"Environ 80 à 100€ pour un transfert direct Monaco – Aéroport Nice Côte d''Azur."},{"q":"Proposez-vous un service de mise à disposition à Monaco ?","a":"Oui, mise à disposition de chauffeur à l''heure ou à la journée disponible pour Monaco et la région."},{"q":"VTC Monaco – Cannes pour le Festival ?","a":"Oui, nous proposons un service dédié événementiel pour le Festival de Cannes depuis Monaco."}]'::jsonb,
 true),

-- ============================================================
-- VILLES — VAR CÔTIER (Golfe de Saint-Tropez & environs)
-- ============================================================

('vtc-sainte-maxime', 'city',
 'VTC Sainte-Maxime – Chauffeur Privé Golfe | L''Ambassadeur des VTC',
 'VTC à Sainte-Maxime. Transferts Nice Aéroport, Saint-Tropez, Fréjus. Chauffeur privé disponible 24h/24 dans le Var.',
 'VTC Sainte-Maxime – Chauffeur Privé',
 'L''Ambassadeur des VTC assure vos transferts à Sainte-Maxime, face à Saint-Tropez. Depuis votre villa, hôtel ou résidence, nous vous conduisons à l''aéroport de Nice (1h15), Saint-Tropez (20 min via bac ou 30 min par la route), Fréjus et toute la Côte d''Azur.

Service disponible toute l''année, ponctuel et discret.',
 '[{"q":"VTC Sainte-Maxime – Nice Aéroport : quel tarif ?","a":"Environ 110 à 130€ pour un transfert Sainte-Maxime – Nice Aéroport."},{"q":"Puis-je rejoindre Saint-Tropez en VTC depuis Sainte-Maxime ?","a":"Oui, trajet d''environ 20 à 30 minutes pour un tarif d''environ 35 à 50€."},{"q":"Service disponible en haute saison (juillet-août) ?","a":"Oui, disponible 24h/24, réservation conseillée 48h à l''avance en haute saison."}]'::jsonb,
 true),

('vtc-grimaud', 'city',
 'VTC Grimaud – Port Grimaud – Chauffeur Privé | L''Ambassadeur des VTC',
 'VTC à Grimaud et Port Grimaud. Transferts Nice Aéroport, Saint-Tropez, Fréjus. Chauffeur privé premium dans le Var.',
 'VTC Grimaud & Port Grimaud – Chauffeur Privé',
 'L''Ambassadeur des VTC intervient à Grimaud, Port Grimaud et dans tout le golfe de Saint-Tropez. Nous assurons vos transferts vers l''aéroport de Nice, la gare de Saint-Raphaël, Saint-Tropez, Cannes et Monaco.

Port Grimaud, surnommée la "Venise provençale", est l''une des destinations les plus prisées. Notre service VTC vous permet d''en profiter pleinement sans contrainte de transport.',
 '[{"q":"VTC Port Grimaud – Nice Aéroport : combien ?","a":"Environ 120 à 140€ pour un transfert Port Grimaud – Nice Aéroport."},{"q":"Intervenez-vous dans les hameau du golfe de Saint-Tropez ?","a":"Oui, nous couvrons Cogolin, La Croix-Valmer, Gassin, Ramatuelle, Cavalaire et tout le golfe."},{"q":"VTC disponible pour rejoindre Saint-Tropez depuis Port Grimaud ?","a":"Oui, environ 10 à 15 minutes, pour un tarif d''environ 25 à 40€."}]'::jsonb,
 true),

('vtc-cavalaire-sur-mer', 'city',
 'VTC Cavalaire-sur-Mer – Chauffeur Privé Var | L''Ambassadeur des VTC',
 'VTC à Cavalaire-sur-Mer. Transferts Nice Aéroport, Saint-Tropez, Toulon. Chauffeur privé disponible 24h/24.',
 'VTC Cavalaire-sur-Mer – Chauffeur Privé',
 'L''Ambassadeur des VTC propose un service de transport privé à Cavalaire-sur-Mer. Depuis cette station balnéaire du Var, nous assurons vos transferts vers l''aéroport de Nice (1h30), Toulon-Hyères (45 min), Saint-Tropez (25 min) et Marseille.

Idéal pour les vacanciers souhaitant rejoindre l''aéroport sans stress.',
 '[{"q":"VTC Cavalaire – Nice Aéroport : quel prix ?","a":"Environ 130 à 150€ pour un transfert Cavalaire-sur-Mer – Nice Aéroport."},{"q":"VTC Cavalaire – Toulon-Hyères Aéroport ?","a":"Environ 55 à 70€ pour un transfert Cavalaire – Aéroport Toulon-Hyères."},{"q":"Couvrez-vous La Croix-Valmer et Ramatuelle ?","a":"Oui, nous intervenons à La Croix-Valmer, Ramatuelle, Gassin et dans tout le golfe de Saint-Tropez."}]'::jsonb,
 true),

('vtc-le-lavandou', 'city',
 'VTC Le Lavandou – Chauffeur Privé Var | L''Ambassadeur des VTC',
 'VTC au Lavandou et Bormes-les-Mimosas. Transferts Nice Aéroport, Toulon, Saint-Tropez. Chauffeur privé 24h/24.',
 'VTC Le Lavandou – Chauffeur Privé',
 'L''Ambassadeur des VTC assure vos déplacements depuis Le Lavandou et les villages des Maures. Nous couvrons Le Lavandou, Bormes-les-Mimosas, La Londe-les-Maures et toute la côte des Maures pour vos transferts aéroport, gare et longue distance.

Service premium avec suivi de vol et prise en charge à domicile ou à l''hôtel.',
 '[{"q":"VTC Le Lavandou – Nice Aéroport : quel tarif ?","a":"Environ 140 à 160€ pour un transfert Le Lavandou – Nice Aéroport."},{"q":"VTC Lavandou – Toulon-Hyères : combien ?","a":"Environ 50 à 65€ pour un transfert Le Lavandou – Aéroport Toulon-Hyères."},{"q":"Couvrez-vous Bormes-les-Mimosas et La Londe ?","a":"Oui, nous intervenons dans tout le secteur des Maures."}]'::jsonb,
 true),

('vtc-ramatuelle', 'city',
 'VTC Ramatuelle – Pampelonne – Chauffeur Privé | L''Ambassadeur des VTC',
 'VTC à Ramatuelle et Pampelonne. Chauffeur privé pour la plage et Saint-Tropez. Transferts Nice Aéroport disponibles 24h/24.',
 'VTC Ramatuelle & Pampelonne – Chauffeur Privé',
 'L''Ambassadeur des VTC assure vos transferts à Ramatuelle, Pampelonne et dans les hameaux du Cap Camarat. Que vous arriviez à la plage de Pampelonne, dans une villa ou un mas provençal, notre chauffeur vous prend en charge directement.

Transferts disponibles vers l''aéroport de Nice, Saint-Tropez, Fréjus et toute la Côte d''Azur.',
 '[{"q":"VTC Ramatuelle – Nice Aéroport : quel tarif ?","a":"Environ 130 à 150€ pour un transfert Ramatuelle – Nice Aéroport."},{"q":"Prise en charge possible à la plage de Pampelonne ?","a":"Oui, nous pouvons vous rejoindre au parking de Pampelonne ou à l''entrée des plages."},{"q":"VTC Ramatuelle – Saint-Tropez : combien de temps ?","a":"Environ 10 à 20 minutes selon la saison, pour un tarif d''environ 25 à 40€."}]'::jsonb,
 true),

('vtc-cogolin', 'city',
 'VTC Cogolin – Chauffeur Privé Golfe de Saint-Tropez | L''Ambassadeur des VTC',
 'VTC à Cogolin. Transferts Nice Aéroport, Saint-Tropez, Fréjus, Toulon. Chauffeur privé 24h/24 dans le Var.',
 'VTC Cogolin – Chauffeur Privé',
 'L''Ambassadeur des VTC intervient à Cogolin et dans la communauté du golfe de Saint-Tropez. Depuis votre domicile ou lieu de séjour à Cogolin, nous vous transportons vers l''aéroport de Nice, la gare de Saint-Raphaël, Fréjus, Toulon et Marseille.

Service ponctuel, tarifé à l''avance, disponible toute l''année.',
 '[{"q":"VTC Cogolin – Nice Aéroport : quel prix ?","a":"Environ 120 à 140€ pour un transfert Cogolin – Nice Aéroport."},{"q":"VTC Cogolin – Saint-Tropez : tarif ?","a":"Environ 20 à 35€ pour un transfert Cogolin – Saint-Tropez."},{"q":"Couvrez-vous la zone de la marine de Cogolin ?","a":"Oui, prise en charge possible à la marine, au port et dans toute la commune."}]'::jsonb,
 true),

('vtc-la-croix-valmer', 'city',
 'VTC La Croix-Valmer – Chauffeur Privé | L''Ambassadeur des VTC',
 'VTC à La Croix-Valmer. Transferts Nice Aéroport, Saint-Tropez, Toulon. Chauffeur privé premium 24h/24.',
 'VTC La Croix-Valmer – Chauffeur Privé',
 'L''Ambassadeur des VTC assure vos transferts depuis La Croix-Valmer, porte du golfe de Saint-Tropez. Service disponible pour vos trajets vers l''aéroport de Nice, de Toulon-Hyères, Saint-Tropez, Cannes et Monaco.',
 '[{"q":"VTC La Croix-Valmer – Nice Aéroport ?","a":"Environ 130 à 150€ pour un transfert La Croix-Valmer – Nice Aéroport."},{"q":"Trajet La Croix-Valmer – Saint-Tropez ?","a":"Environ 20 à 30 minutes pour un tarif d''environ 35 à 50€."},{"q":"Service disponible tôt le matin ?","a":"Oui, disponible 24h/24 incluant les départs très matinaux."}]'::jsonb,
 true),

-- ============================================================
-- VILLES — VAR INTÉRIEUR
-- ============================================================

('vtc-brignoles', 'city',
 'VTC Brignoles – Chauffeur Privé Var Intérieur | L''Ambassadeur des VTC',
 'VTC à Brignoles et Val d''Issole. Transferts aéroport Marseille, Nice, Toulon. Chauffeur privé disponible 24h/24.',
 'VTC Brignoles – Chauffeur Privé',
 'L''Ambassadeur des VTC assure vos transferts depuis Brignoles, sous-préfecture du Var. Idéalement situé entre Toulon, Marseille et Draguignan, nous couvrons tout le Val d''Issole pour vos trajets vers les aéroports de Marseille-Provence, Toulon-Hyères et Nice Côte d''Azur.',
 '[{"q":"VTC Brignoles – Marseille Aéroport ?","a":"Environ 70 à 90€ pour un transfert Brignoles – Aéroport Marseille-Provence."},{"q":"VTC Brignoles – Nice Aéroport ?","a":"Environ 130 à 150€ pour un transfert Brignoles – Aéroport Nice Côte d''Azur."},{"q":"Couvrez-vous le Val d''Issole ?","a":"Oui, nous intervenons à Brignoles, Saint-Maximin, Besse-sur-Issole et toute la région."}]'::jsonb,
 true),

('vtc-le-muy', 'city',
 'VTC Le Muy – Chauffeur Privé Var | L''Ambassadeur des VTC',
 'VTC au Muy. Transferts aéroport Nice, Fréjus, Saint-Raphaël, Saint-Tropez. Chauffeur privé 24h/24 dans le Var.',
 'VTC Le Muy – Chauffeur Privé',
 'L''Ambassadeur des VTC intervient au Muy, carrefour du Var entre Fréjus, Draguignan et les Maures. Prise en charge à domicile, en hôtel ou sur la nationale, avec transfert vers Nice Aéroport, Saint-Raphaël et toute la côte.',
 '[{"q":"VTC Le Muy – Nice Aéroport ?","a":"Environ 100 à 120€ depuis Le Muy jusqu''à l''aéroport de Nice."},{"q":"Trajet Le Muy – Fréjus ?","a":"Environ 15 minutes, tarif d''environ 25 à 35€."},{"q":"VTC Le Muy – Saint-Tropez ?","a":"Environ 30 à 40 minutes selon la saison, tarif d''environ 55 à 75€."}]'::jsonb,
 true),

('vtc-vidauban', 'city',
 'VTC Vidauban – Chauffeur Privé Var | L''Ambassadeur des VTC',
 'VTC à Vidauban dans le Var. Transferts aéroport Nice, Toulon, Saint-Raphaël. Chauffeur privé 24h/24.',
 'VTC Vidauban – Chauffeur Privé',
 'L''Ambassadeur des VTC propose un service VTC à Vidauban et dans l''arrière-pays varois. Nous assurons vos transferts vers l''aéroport de Nice, Toulon-Hyères, la gare de Saint-Raphaël et les principales destinations de la Côte d''Azur.',
 '[{"q":"VTC Vidauban – Nice Aéroport ?","a":"Environ 110 à 130€ pour un transfert depuis Vidauban."},{"q":"VTC Vidauban – Saint-Raphaël ?","a":"Environ 30 minutes, tarif d''environ 40 à 55€."},{"q":"Couvrez-vous Les Arcs et Taradeau ?","a":"Oui, nous intervenons dans tout le secteur Vidauban, Les Arcs, Taradeau."}]'::jsonb,
 true),

('vtc-les-arcs-sur-argens', 'city',
 'VTC Les Arcs-sur-Argens – Chauffeur Privé Var | L''Ambassadeur des VTC',
 'VTC aux Arcs-sur-Argens. Transferts Nice Aéroport, Fréjus, Saint-Raphaël, Saint-Tropez. Chauffeur privé 24h/24.',
 'VTC Les Arcs-sur-Argens – Chauffeur Privé',
 'L''Ambassadeur des VTC assure vos déplacements depuis Les Arcs-sur-Argens, commune viticole du Var. Transferts vers l''aéroport de Nice, la gare TGV de Les Arcs-Draguignan, Fréjus, Saint-Raphaël et Saint-Tropez.',
 '[{"q":"VTC Les Arcs – Nice Aéroport ?","a":"Environ 100 à 120€ pour un transfert depuis Les Arcs-sur-Argens."},{"q":"VTC Les Arcs – gare TGV ?","a":"Nous assurons les prises en charge et déposes à la gare TGV Les Arcs-Draguignan."},{"q":"Tarif Les Arcs – Saint-Raphaël ?","a":"Environ 35 à 50€ pour un transfert Les Arcs – Saint-Raphaël."}]'::jsonb,
 true),

('vtc-lorgues', 'city',
 'VTC Lorgues – Chauffeur Privé Var | L''Ambassadeur des VTC',
 'VTC à Lorgues dans le Var. Transferts aéroport Nice, Toulon, Saint-Raphaël, Draguignan. Chauffeur privé 24h/24.',
 'VTC Lorgues – Chauffeur Privé',
 'L''Ambassadeur des VTC intervient à Lorgues et dans les villages de l''arrière-pays varois. Depuis votre domicile ou votre mas provençal, nous vous transportons vers les aéroports, gares et destinations touristiques de la région.',
 '[{"q":"VTC Lorgues – Nice Aéroport ?","a":"Environ 120 à 140€ pour un transfert Lorgues – Nice Aéroport."},{"q":"VTC Lorgues – Draguignan ?","a":"Environ 15 minutes, tarif d''environ 25 à 35€."},{"q":"Couvrez-vous Salernes et Cotignac ?","a":"Oui, nous intervenons dans tout l''arrière-pays varois."}]'::jsonb,
 true),

-- ============================================================
-- VILLES — BOUCHES-DU-RHÔNE
-- ============================================================

('vtc-marseille', 'city',
 'VTC Marseille – Chauffeur Privé depuis le Var | L''Ambassadeur des VTC',
 'VTC Marseille depuis le Var. Transferts aéroport Marseille, gare Saint-Charles, Toulon, Fréjus. Chauffeur privé 24h/24.',
 'VTC Marseille – Transfert depuis le Var',
 'L''Ambassadeur des VTC assure vos transferts entre le Var et Marseille. Depuis Fréjus, Saint-Raphaël, Toulon ou toute la côte varoise, nous vous conduisons à Marseille, à l''aéroport Marseille-Provence (MRS) ou à la gare Saint-Charles.

Un chauffeur professionnel, un tarif fixe, une ponctualité garantie pour rejoindre la capitale de la région PACA.',
 '[{"q":"VTC Fréjus – Marseille : quel tarif ?","a":"Environ 160 à 200€ pour un transfert Fréjus – Marseille en VTC premium."},{"q":"VTC Toulon – Marseille Aéroport ?","a":"Environ 80 à 100€ pour un transfert Toulon – Aéroport Marseille-Provence."},{"q":"Durée Fréjus – Marseille en VTC ?","a":"Environ 1h30 à 2h selon la circulation sur l''A8/A50."}]'::jsonb,
 true),

('vtc-aix-en-provence', 'city',
 'VTC Aix-en-Provence – Chauffeur Privé depuis le Var | L''Ambassadeur des VTC',
 'VTC Aix-en-Provence depuis le Var. Transferts aéroport Marseille, gare TGV Aix, Toulon. Chauffeur privé 24h/24.',
 'VTC Aix-en-Provence – Transfert depuis le Var',
 'L''Ambassadeur des VTC assure vos transferts entre le Var, la Côte d''Azur et Aix-en-Provence. Depuis Fréjus, Saint-Raphaël ou Toulon, nous vous conduisons à Aix-en-Provence, à la gare TGV d''Aix ou à l''aéroport Marseille-Provence.

Tarif fixe, réservé à l''avance, sans surprise.',
 '[{"q":"VTC Fréjus – Aix-en-Provence : tarif ?","a":"Environ 180 à 220€ pour un transfert Fréjus – Aix-en-Provence."},{"q":"VTC Toulon – Aix-en-Provence ?","a":"Environ 90 à 110€ pour un transfert Toulon – Aix-en-Provence."},{"q":"Durée Toulon – Aix-en-Provence en VTC ?","a":"Environ 45 à 60 minutes selon le trafic."}]'::jsonb,
 true),

('vtc-bandol', 'city',
 'VTC Bandol – Sanary – Chauffeur Privé | L''Ambassadeur des VTC',
 'VTC à Bandol et Sanary-sur-Mer. Transferts aéroport Toulon, Marseille, Nice. Chauffeur privé 24h/24.',
 'VTC Bandol & Sanary – Chauffeur Privé',
 'L''Ambassadeur des VTC assure vos transferts à Bandol et Sanary-sur-Mer. Ces deux stations balnéaires proches de Toulon sont desservies par notre service de chauffeur privé pour vos trajets vers l''aéroport de Toulon-Hyères, Marseille-Provence et Nice Côte d''Azur.',
 '[{"q":"VTC Bandol – Toulon-Hyères Aéroport ?","a":"Environ 35 à 50€ pour un transfert Bandol – Aéroport Toulon-Hyères."},{"q":"VTC Sanary – Nice Aéroport ?","a":"Environ 150 à 180€ pour un transfert Sanary – Nice Aéroport."},{"q":"Couvrez-vous Six-Fours et Ollioules depuis Bandol ?","a":"Oui, nous intervenons dans tout le secteur ouest de Toulon."}]'::jsonb,
 true),

-- ============================================================
-- AÉROPORTS
-- ============================================================

('vtc-aeroport-cannes-mandelieu', 'airport',
 'VTC Aéroport Cannes-Mandelieu – Transfert Premium | L''Ambassadeur des VTC',
 'Transfert VTC aéroport Cannes-Mandelieu (CEQ). Prise en charge et dépose, suivi de vol. Service premium 24h/24.',
 'VTC Aéroport de Cannes-Mandelieu',
 'L''Ambassadeur des VTC assure vos transferts depuis et vers l''aéroport de Cannes-Mandelieu (CEQ), aéroport d''affaires et d''aviation privée de la Côte d''Azur. Idéal pour les jets privés, nos chauffeurs vous accueillent sur le tarmac ou au terminal selon votre type d''appareil.

Nous couvrons les trajets depuis Fréjus, Saint-Raphaël, Toulon, Monaco et toute la Côte d''Azur.',
 '[{"q":"VTC disponible pour l''aviation d''affaires à Cannes ?","a":"Oui, nous assurons les prises en charge pour jets privés et aéronefs d''affaires à Cannes-Mandelieu."},{"q":"VTC Fréjus – Cannes-Mandelieu : quel prix ?","a":"Environ 70 à 90€ pour un transfert Fréjus – Aéroport Cannes-Mandelieu."},{"q":"Chauffeur disponible pour accueillir en FBO ?","a":"Oui, nos chauffeurs peuvent accueillir directement au FBO sur demande."}]'::jsonb,
 true),

-- ============================================================
-- GARES
-- ============================================================

('vtc-gare-de-frejus', 'station',
 'VTC Gare de Fréjus – Chauffeur Privé | L''Ambassadeur des VTC',
 'VTC gare de Fréjus. Prise en charge et dépose en gare. Transferts Nice Aéroport, Saint-Raphaël, Saint-Tropez. 24h/24.',
 'VTC Gare de Fréjus – Chauffeur Privé',
 'L''Ambassadeur des VTC assure la prise en charge et la dépose à la gare de Fréjus. Que vous arriviez par le train ou que vous souhaitiez rejoindre la gare, notre chauffeur est à votre disposition avec un panneau d''accueil personnalisé.

Correspondances avec la gare de Saint-Raphaël pour les TGV. Transferts disponibles vers Nice Aéroport, Saint-Tropez, Cannes et Toulon.',
 '[{"q":"Prise en charge directement en sortie de gare à Fréjus ?","a":"Oui, votre chauffeur vous attend en sortie de gare avec un panneau nominatif."},{"q":"VTC gare Fréjus – Nice Aéroport ?","a":"Environ 95 à 115€ pour un transfert direct gare Fréjus – Nice Aéroport."},{"q":"La gare de Fréjus est-elle bien desservie ?","a":"La gare de Fréjus est sur la ligne Nice – Marseille. Pour les TGV, la gare principale est Saint-Raphaël-Valescure."}]'::jsonb,
 true),

('vtc-gare-de-nice', 'station',
 'VTC Gare de Nice-Ville – Chauffeur Privé | L''Ambassadeur des VTC',
 'VTC gare Nice-Ville (Thiers). Transferts vers Fréjus, Var, Saint-Tropez, Monaco. Chauffeur privé 24h/24.',
 'VTC Gare de Nice-Ville – Chauffeur Privé',
 'L''Ambassadeur des VTC assure vos transferts depuis la gare de Nice-Ville (Thiers) vers le Var, Saint-Tropez, Fréjus, Saint-Raphaël et toute la Côte d''Azur. Votre chauffeur vous attend en sortie de gare avec un panneau d''accueil.',
 '[{"q":"VTC gare de Nice vers Fréjus : tarif ?","a":"Environ 110 à 130€ pour un transfert Nice-Ville – Fréjus."},{"q":"VTC Nice-Ville vers Saint-Tropez ?","a":"Environ 150 à 180€ pour un transfert gare de Nice – Saint-Tropez."},{"q":"Attente gratuite si train en retard ?","a":"Oui, nous suivons l''heure réelle de votre train et ajustons la prise en charge."}]'::jsonb,
 true),

('vtc-gare-de-cannes', 'station',
 'VTC Gare de Cannes – Chauffeur Privé | L''Ambassadeur des VTC',
 'VTC gare de Cannes. Transferts Nice Aéroport, Fréjus, Saint-Raphaël, Saint-Tropez. Chauffeur privé 24h/24.',
 'VTC Gare de Cannes – Chauffeur Privé',
 'L''Ambassadeur des VTC assure vos transferts depuis et vers la gare de Cannes. Accueil personnalisé avec panneau nominatif, aide aux bagages, ponctualité garantie. Transferts disponibles vers Nice Aéroport, Fréjus, Saint-Raphaël et Saint-Tropez.',
 '[{"q":"VTC gare de Cannes – Nice Aéroport ?","a":"Environ 70 à 90€ pour un transfert gare de Cannes – Nice Aéroport."},{"q":"VTC gare de Cannes – Fréjus ?","a":"Environ 60 à 80€ pour un transfert gare Cannes – Fréjus."},{"q":"Accueil en gare de Cannes disponible la nuit ?","a":"Oui, service disponible 24h/24 pour tous les trains y compris de nuit."}]'::jsonb,
 true),

('vtc-gare-tgv-les-arcs-draguignan', 'station',
 'VTC Gare TGV Les Arcs-Draguignan – Chauffeur Privé | L''Ambassadeur des VTC',
 'VTC gare TGV Les Arcs-Draguignan. Transferts Fréjus, Saint-Raphaël, Saint-Tropez, Nice Aéroport. Chauffeur privé 24h/24.',
 'VTC Gare TGV Les Arcs-Draguignan – Chauffeur Privé',
 'L''Ambassadeur des VTC assure les transferts depuis la gare TGV des Arcs-Draguignan, principale gare TGV du Var intérieur. Depuis cette gare, rejoignez en VTC Fréjus, Saint-Raphaël, Saint-Tropez, Draguignan, Nice Aéroport et toute la Côte d''Azur.

Votre chauffeur vous attend à la sortie avec un panneau nominatif. Tarif fixe, réservé à l''avance.',
 '[{"q":"VTC gare TGV Les Arcs – Fréjus : tarif ?","a":"Environ 35 à 50€ pour un transfert gare TGV – Fréjus."},{"q":"VTC gare Les Arcs – Saint-Tropez ?","a":"Environ 60 à 80€ pour un transfert gare Les Arcs-Draguignan – Saint-Tropez."},{"q":"VTC gare Les Arcs – Nice Aéroport ?","a":"Environ 100 à 120€ pour un transfert gare Les Arcs – Nice Aéroport."}]'::jsonb,
 true),

('vtc-gare-tgv-marseille-saint-charles', 'station',
 'VTC Gare Marseille Saint-Charles – Transfert Var | L''Ambassadeur des VTC',
 'VTC depuis gare Marseille Saint-Charles vers le Var. Fréjus, Toulon, Saint-Raphaël. Chauffeur privé 24h/24.',
 'VTC Gare Marseille Saint-Charles – Transfert vers le Var',
 'L''Ambassadeur des VTC assure vos transferts depuis la gare Marseille Saint-Charles vers le Var et la Côte d''Azur. Depuis la plus grande gare de la région PACA, rejoignez Toulon, Fréjus, Saint-Raphaël, Saint-Tropez et Nice en VTC premium.

Votre chauffeur vous attend en sortie de gare, aide aux bagages incluse.',
 '[{"q":"VTC Marseille Saint-Charles – Fréjus : tarif ?","a":"Environ 180 à 220€ pour un transfert gare Marseille – Fréjus."},{"q":"VTC Marseille Saint-Charles – Toulon ?","a":"Environ 90 à 110€ pour un transfert gare Marseille – Toulon."},{"q":"Durée Marseille Saint-Charles – Fréjus en VTC ?","a":"Environ 1h30 à 2h selon la circulation."}]'::jsonb,
 true),

-- ============================================================
-- TRANSFERTS DEPUIS FRÉJUS
-- ============================================================

('transfert-frejus-nice', 'transfer',
 'Transfert VTC Fréjus – Nice | L''Ambassadeur des VTC',
 'Transfert VTC Fréjus Nice. Tarif fixe, chauffeur professionnel, disponible 24h/24. Réservation instantanée.',
 'Transfert VTC Fréjus → Nice',
 'L''Ambassadeur des VTC assure votre transfert entre Fréjus et Nice en VTC premium. Durée estimée : 55 à 75 minutes selon le trafic sur l''A8. Votre chauffeur vous dépose à votre hôtel, domicile, restaurant ou bureau à Nice.

Tarif fixe réservé à l''avance, confirmation immédiate.',
 '[{"q":"Tarif transfert Fréjus – Nice ?","a":"Environ 110 à 130€ pour un transfert VTC Fréjus – Nice centre."},{"q":"Durée Fréjus – Nice en VTC ?","a":"Environ 55 à 75 minutes selon le trafic sur l''A8."},{"q":"Prise en charge à l''hôtel à Fréjus ?","a":"Oui, votre chauffeur vient vous chercher directement à votre adresse."}]'::jsonb,
 true),

('transfert-frejus-monaco', 'transfer',
 'Transfert VTC Fréjus – Monaco | L''Ambassadeur des VTC',
 'Transfert VTC Fréjus Monaco. Tarif fixe, chauffeur discret, véhicule premium. Disponible 24h/24.',
 'Transfert VTC Fréjus → Monaco',
 'L''Ambassadeur des VTC assure votre transfert entre Fréjus et la Principauté de Monaco. Un service discret et haut de gamme pour rejoindre Monaco en toute sérénité. Durée estimée : 1h15 à 1h30.

Tarif fixe, aucun supplément péage non inclus à l''avance.',
 '[{"q":"Tarif VTC Fréjus – Monaco ?","a":"Environ 150 à 180€ pour un transfert Fréjus – Monaco."},{"q":"Durée Fréjus – Monaco en VTC ?","a":"Environ 1h10 à 1h30 via l''A8."},{"q":"Service disponible pour les événements à Monaco (GP, MIPIM...) ?","a":"Oui, nous proposons un service dédié lors des grands événements monégasques."}]'::jsonb,
 true),

('transfert-frejus-aeroport-marseille', 'transfer',
 'Transfert VTC Fréjus – Aéroport Marseille-Provence | L''Ambassadeur des VTC',
 'Transfert VTC Fréjus aéroport Marseille. Tarif fixe, suivi vol, ponctualité garantie. Disponible 24h/24.',
 'Transfert VTC Fréjus → Aéroport Marseille-Provence',
 'L''Ambassadeur des VTC assure votre transfert entre Fréjus et l''aéroport de Marseille-Provence (MRS). Pour vos vols au départ ou à l''arrivée de Marseille, notre chauffeur vous garantit ponctualité et confort. Durée estimée : 1h45 à 2h15.',
 '[{"q":"Tarif VTC Fréjus – Marseille Aéroport ?","a":"Environ 190 à 230€ pour un transfert Fréjus – Aéroport Marseille-Provence."},{"q":"Suivi de vol inclus ?","a":"Oui, votre chauffeur adapte l''heure de prise en charge selon l''heure réelle de votre vol."},{"q":"Durée Fréjus – Marseille Aéroport ?","a":"Environ 1h45 à 2h15 selon la circulation sur l''A8 et l''A7."}]'::jsonb,
 true),

('transfert-frejus-aeroport-toulon', 'transfer',
 'Transfert VTC Fréjus – Aéroport Toulon-Hyères | L''Ambassadeur des VTC',
 'Transfert VTC Fréjus Toulon-Hyères. Tarif fixe, service premium, disponible 24h/24.',
 'Transfert VTC Fréjus → Aéroport Toulon-Hyères',
 'L''Ambassadeur des VTC assure votre transfert entre Fréjus et l''aéroport de Toulon-Hyères (TLN). Un trajet d''environ 50 minutes pour rejoindre le 2ème aéroport de la région PACA.

Tarif fixe, confirmation immédiate, voiture haut de gamme.',
 '[{"q":"Tarif VTC Fréjus – Toulon-Hyères Aéroport ?","a":"Environ 70 à 90€ pour un transfert Fréjus – Aéroport Toulon-Hyères."},{"q":"Durée Fréjus – Toulon-Hyères en VTC ?","a":"Environ 45 à 60 minutes via l''A57."},{"q":"Transfert disponible pour les vols matinaux ?","a":"Oui, disponible 24h/24 incluant les départs très tôt le matin."}]'::jsonb,
 true),

('transfert-frejus-antibes', 'transfer',
 'Transfert VTC Fréjus – Antibes | L''Ambassadeur des VTC',
 'Transfert VTC Fréjus Antibes Juan-les-Pins. Tarif fixe, chauffeur professionnel, disponible 24h/24.',
 'Transfert VTC Fréjus → Antibes & Juan-les-Pins',
 'L''Ambassadeur des VTC assure votre transfert entre Fréjus et Antibes, Juan-les-Pins ou Sophia Antipolis. Durée estimée : 40 à 55 minutes selon la circulation sur l''A8.',
 '[{"q":"Tarif VTC Fréjus – Antibes ?","a":"Environ 75 à 95€ pour un transfert Fréjus – Antibes."},{"q":"VTC Fréjus – Sophia Antipolis ?","a":"Environ 80 à 100€ pour un transfert Fréjus – Sophia Antipolis."},{"q":"Durée Fréjus – Juan-les-Pins ?","a":"Environ 40 à 55 minutes via l''A8."}]'::jsonb,
 true),

('transfert-frejus-grasse', 'transfer',
 'Transfert VTC Fréjus – Grasse | L''Ambassadeur des VTC',
 'Transfert VTC Fréjus Grasse et arrière-pays. Tarif fixe, chauffeur privé, disponible 24h/24.',
 'Transfert VTC Fréjus → Grasse',
 'L''Ambassadeur des VTC assure votre transfert entre Fréjus et Grasse, capitale du parfum. Service premium, tarif fixe, réservé à l''avance. Durée estimée : 45 à 60 minutes.',
 '[{"q":"Tarif VTC Fréjus – Grasse ?","a":"Environ 80 à 100€ pour un transfert Fréjus – Grasse."},{"q":"VTC Fréjus – Mougins ?","a":"Environ 75 à 95€ pour un transfert Fréjus – Mougins."},{"q":"Durée Fréjus – Grasse en VTC ?","a":"Environ 45 à 60 minutes selon le trafic."}]'::jsonb,
 true),

('transfert-frejus-menton', 'transfer',
 'Transfert VTC Fréjus – Menton | L''Ambassadeur des VTC',
 'Transfert VTC Fréjus Menton et frontière italienne. Tarif fixe, disponible 24h/24.',
 'Transfert VTC Fréjus → Menton',
 'L''Ambassadeur des VTC assure votre transfert entre Fréjus et Menton, aux portes de l''Italie. Service disponible 24h/24, tarif fixe, véhicule premium.',
 '[{"q":"Tarif VTC Fréjus – Menton ?","a":"Environ 140 à 170€ pour un transfert Fréjus – Menton."},{"q":"Durée Fréjus – Menton en VTC ?","a":"Environ 1h20 à 1h45 via l''A8."},{"q":"Peut-on aller jusqu''en Italie ?","a":"Oui, nous pouvons vous déposer à Vintimille et dans les villes italiennes proches."}]'::jsonb,
 true),

-- ============================================================
-- TRANSFERTS DEPUIS SAINT-RAPHAËL
-- ============================================================

('transfert-saint-raphael-nice', 'transfer',
 'Transfert VTC Saint-Raphaël – Nice | L''Ambassadeur des VTC',
 'Transfert VTC Saint-Raphaël Nice. Tarif fixe, chauffeur professionnel, 24h/24.',
 'Transfert VTC Saint-Raphaël → Nice',
 'L''Ambassadeur des VTC assure votre transfert entre Saint-Raphaël et Nice. Depuis votre hôtel, domicile ou la gare de Saint-Raphaël-Valescure, votre chauffeur vous conduit jusqu''à Nice en toute sérénité. Durée estimée : 55 à 70 minutes.',
 '[{"q":"Tarif VTC Saint-Raphaël – Nice ?","a":"Environ 100 à 120€ pour un transfert Saint-Raphaël – Nice centre."},{"q":"VTC Saint-Raphaël – Nice Aéroport ?","a":"Environ 90 à 110€ pour un transfert direct Saint-Raphaël – Aéroport Nice."},{"q":"Durée Saint-Raphaël – Nice en VTC ?","a":"Environ 55 à 70 minutes via l''A8."}]'::jsonb,
 true),

('transfert-saint-raphael-saint-tropez', 'transfer',
 'Transfert VTC Saint-Raphaël – Saint-Tropez | L''Ambassadeur des VTC',
 'Transfert VTC Saint-Raphaël Saint-Tropez. Tarif fixe, chauffeur privé, disponible toute l''année.',
 'Transfert VTC Saint-Raphaël → Saint-Tropez',
 'L''Ambassadeur des VTC assure votre transfert entre Saint-Raphaël et Saint-Tropez. En dehors de la saison estivale, comptez 35 à 45 minutes via la route des Maures. En juillet-août, prévoyez 60 à 90 minutes en raison du trafic.',
 '[{"q":"Tarif VTC Saint-Raphaël – Saint-Tropez ?","a":"Environ 60 à 80€ pour un transfert Saint-Raphaël – Saint-Tropez."},{"q":"VTC depuis la gare de Saint-Raphaël vers Saint-Tropez ?","a":"Oui, votre chauffeur vous attend à la sortie de la gare de Saint-Raphaël-Valescure."},{"q":"Durée en haute saison ?","a":"60 à 90 minutes en juillet-août. Prévoir de la marge."}]'::jsonb,
 true),

('transfert-saint-raphael-cannes', 'transfer',
 'Transfert VTC Saint-Raphaël – Cannes | L''Ambassadeur des VTC',
 'Transfert VTC Saint-Raphaël Cannes. Tarif fixe, disponible 24h/24. Festival de Cannes et événements.',
 'Transfert VTC Saint-Raphaël → Cannes',
 'L''Ambassadeur des VTC assure votre transfert entre Saint-Raphaël et Cannes en 30 à 45 minutes via la Corniche de l''Estérel ou l''A8. Service idéal pour le Festival de Cannes, les congrès et les déplacements professionnels.',
 '[{"q":"Tarif VTC Saint-Raphaël – Cannes ?","a":"Environ 55 à 75€ pour un transfert Saint-Raphaël – Cannes."},{"q":"VTC Saint-Raphaël – Cannes pour le Festival ?","a":"Oui, service disponible toute la durée du Festival avec tarif fixe."},{"q":"Durée Saint-Raphaël – Cannes ?","a":"30 à 45 minutes via l''A8 ou la corniche de l''Estérel."}]'::jsonb,
 true),

('transfert-saint-raphael-monaco', 'transfer',
 'Transfert VTC Saint-Raphaël – Monaco | L''Ambassadeur des VTC',
 'Transfert VTC Saint-Raphaël Monaco. Chauffeur discret, tarif fixe, véhicule premium. Disponible 24h/24.',
 'Transfert VTC Saint-Raphaël → Monaco',
 'L''Ambassadeur des VTC assure votre transfert entre Saint-Raphaël et Monaco. Un trajet de 1h15 à 1h30 via l''A8 dans un véhicule haut de gamme avec chauffeur professionnel en costume.',
 '[{"q":"Tarif VTC Saint-Raphaël – Monaco ?","a":"Environ 140 à 170€ pour un transfert Saint-Raphaël – Monaco."},{"q":"Durée Saint-Raphaël – Monaco ?","a":"Environ 1h10 à 1h30 via l''A8."},{"q":"Service disponible pour les événements à Monaco ?","a":"Oui, Grand Prix, MIPIM, MAPIC et tous les grands événements monégasques."}]'::jsonb,
 true),

('transfert-saint-raphael-aeroport-marseille', 'transfer',
 'Transfert VTC Saint-Raphaël – Aéroport Marseille | L''Ambassadeur des VTC',
 'Transfert VTC Saint-Raphaël aéroport Marseille-Provence. Tarif fixe, suivi vol, 24h/24.',
 'Transfert VTC Saint-Raphaël → Aéroport Marseille-Provence',
 'L''Ambassadeur des VTC assure votre transfert entre Saint-Raphaël et l''aéroport de Marseille-Provence (MRS). Durée estimée : 1h45 à 2h15. Suivi de vol en temps réel inclus.',
 '[{"q":"Tarif VTC Saint-Raphaël – Marseille Aéroport ?","a":"Environ 180 à 220€ pour un transfert Saint-Raphaël – Marseille-Provence."},{"q":"Durée Saint-Raphaël – Marseille Aéroport ?","a":"Environ 1h45 à 2h15 selon la circulation."},{"q":"Suivi vol disponible ?","a":"Oui, votre chauffeur suit votre vol en temps réel et ajuste la prise en charge."}]'::jsonb,
 true),

('transfert-saint-raphael-aeroport-toulon', 'transfer',
 'Transfert VTC Saint-Raphaël – Aéroport Toulon-Hyères | L''Ambassadeur des VTC',
 'Transfert VTC Saint-Raphaël Toulon-Hyères. Tarif fixe, chauffeur privé, disponible 24h/24.',
 'Transfert VTC Saint-Raphaël → Aéroport Toulon-Hyères',
 'L''Ambassadeur des VTC assure votre transfert entre Saint-Raphaël et l''aéroport de Toulon-Hyères (TLN). Durée estimée : 55 à 75 minutes. Tarif fixe, sans supplément.',
 '[{"q":"Tarif VTC Saint-Raphaël – Toulon-Hyères ?","a":"Environ 80 à 100€ pour un transfert Saint-Raphaël – Aéroport Toulon-Hyères."},{"q":"Durée du trajet ?","a":"Environ 55 à 70 minutes via la N98."},{"q":"Disponible tôt le matin ?","a":"Oui, service disponible 24h/24 pour tous les horaires de vol."}]'::jsonb,
 true),

-- ============================================================
-- TRANSFERTS DEPUIS NICE AÉROPORT
-- ============================================================

('transfert-nice-aeroport-saint-tropez', 'transfer',
 'Transfert VTC Nice Aéroport – Saint-Tropez | L''Ambassadeur des VTC',
 'Transfert VTC depuis Nice Aéroport vers Saint-Tropez. Chauffeur en salle d''arrivée, tarif fixe, disponible 24h/24.',
 'Transfert VTC Nice Aéroport → Saint-Tropez',
 'L''Ambassadeur des VTC assure votre transfert depuis l''aéroport de Nice Côte d''Azur jusqu''à Saint-Tropez. Votre chauffeur vous attend dans la salle d''arrivée avec un panneau nominatif. Suivi de vol en temps réel pour adapter la prise en charge en cas de retard.

Durée estimée : 1h15 à 1h45 selon la saison.',
 '[{"q":"Tarif VTC Nice Aéroport – Saint-Tropez ?","a":"Environ 150 à 180€ pour un transfert Nice Aéroport – Saint-Tropez."},{"q":"Mon chauffeur m''attend-il si mon vol est retardé ?","a":"Oui, nous suivons votre vol en temps réel. Aucun surcoût pour les retards."},{"q":"Durée Nice Aéroport – Saint-Tropez en VTC ?","a":"1h15 à 1h45 selon la saison et le trafic."}]'::jsonb,
 true),

('transfert-nice-aeroport-frejus', 'transfer',
 'Transfert VTC Nice Aéroport – Fréjus | L''Ambassadeur des VTC',
 'Transfert VTC depuis Nice Aéroport vers Fréjus. Suivi vol, accueil en salle d''arrivée. Disponible 24h/24.',
 'Transfert VTC Nice Aéroport → Fréjus',
 'L''Ambassadeur des VTC vous prend en charge à l''aéroport de Nice Côte d''Azur et vous conduit directement à Fréjus. Accueil avec panneau nominatif, aide aux bagages, suivi de vol en temps réel. Durée estimée : 55 à 70 minutes.',
 '[{"q":"Tarif VTC Nice Aéroport – Fréjus ?","a":"Environ 95 à 115€ pour un transfert Nice Aéroport – Fréjus."},{"q":"Où se retrouve-t-on à l''aéroport de Nice ?","a":"Votre chauffeur vous attend dans la salle d''arrivée avec un panneau à votre nom, au niveau des sorties bagages."},{"q":"Durée Nice Aéroport – Fréjus ?","a":"Environ 55 à 70 minutes via l''A8."}]'::jsonb,
 true),

('transfert-nice-aeroport-draguignan', 'transfer',
 'Transfert VTC Nice Aéroport – Draguignan | L''Ambassadeur des VTC',
 'Transfert VTC Nice Aéroport vers Draguignan et le Var intérieur. Tarif fixe, disponible 24h/24.',
 'Transfert VTC Nice Aéroport → Draguignan',
 'L''Ambassadeur des VTC assure votre transfert depuis l''aéroport de Nice jusqu''à Draguignan et le Var intérieur. Accueil en salle d''arrivée, véhicule haut de gamme, tarif fixe. Durée estimée : 1h15 à 1h30.',
 '[{"q":"Tarif VTC Nice Aéroport – Draguignan ?","a":"Environ 120 à 140€ pour un transfert Nice Aéroport – Draguignan."},{"q":"Couvrez-vous Trans-en-Provence et Lorgues depuis Nice ?","a":"Oui, nous desservons tout l''arrière-pays varois depuis Nice Aéroport."},{"q":"Durée Nice Aéroport – Draguignan ?","a":"Environ 1h15 à 1h30 via l''A8 et la N555."}]'::jsonb,
 true),

-- ============================================================
-- TRANSFERTS INTER-VILLES
-- ============================================================

('transfert-cannes-aeroport-nice', 'transfer',
 'Transfert VTC Cannes – Aéroport Nice | L''Ambassadeur des VTC',
 'Transfert VTC Cannes aéroport Nice. Tarif fixe, ponctualité garantie, suivi de vol. Disponible 24h/24.',
 'Transfert VTC Cannes → Aéroport de Nice',
 'L''Ambassadeur des VTC assure votre transfert entre Cannes et l''aéroport de Nice Côte d''Azur. 25 à 40 minutes selon le trafic, tarif fixe, chauffeur professionnel. Idéal pour partir en voyage depuis Cannes sans stress.',
 '[{"q":"Tarif VTC Cannes – Nice Aéroport ?","a":"Environ 65 à 85€ pour un transfert Cannes – Nice Aéroport."},{"q":"Durée Cannes – Nice Aéroport ?","a":"Environ 25 à 40 minutes via l''A8."},{"q":"VTC disponible tôt le matin à Cannes ?","a":"Oui, disponible 24h/24 pour tous les horaires de vol."}]'::jsonb,
 true),

('transfert-antibes-aeroport-nice', 'transfer',
 'Transfert VTC Antibes – Aéroport Nice | L''Ambassadeur des VTC',
 'Transfert VTC Antibes aéroport Nice. Tarif fixe, 24h/24. Juan-les-Pins et Cap d''Antibes inclus.',
 'Transfert VTC Antibes → Aéroport de Nice',
 'L''Ambassadeur des VTC assure votre transfert depuis Antibes, Juan-les-Pins ou le Cap d''Antibes vers l''aéroport de Nice Côte d''Azur en 20 à 30 minutes. Tarif fixe, confirmation immédiate.',
 '[{"q":"Tarif VTC Antibes – Nice Aéroport ?","a":"Environ 50 à 70€ selon le lieu de prise en charge à Antibes."},{"q":"Durée Antibes – Nice Aéroport ?","a":"Environ 20 à 35 minutes via l''A8."},{"q":"VTC depuis Juan-les-Pins vers Nice Aéroport ?","a":"Oui, même tarif, environ 20 à 30 minutes."}]'::jsonb,
 true),

('transfert-sainte-maxime-aeroport-nice', 'transfer',
 'Transfert VTC Sainte-Maxime – Nice Aéroport | L''Ambassadeur des VTC',
 'Transfert VTC Sainte-Maxime Nice Aéroport. Tarif fixe, suivi vol, disponible 24h/24.',
 'Transfert VTC Sainte-Maxime → Aéroport de Nice',
 'L''Ambassadeur des VTC assure votre transfert entre Sainte-Maxime et l''aéroport de Nice Côte d''Azur. Durée estimée : 1h10 à 1h30. Votre chauffeur vient vous chercher à domicile, villa ou hôtel.',
 '[{"q":"Tarif VTC Sainte-Maxime – Nice Aéroport ?","a":"Environ 120 à 140€ pour un transfert Sainte-Maxime – Nice Aéroport."},{"q":"Durée Sainte-Maxime – Nice Aéroport ?","a":"Environ 1h10 à 1h30 via l''A8."},{"q":"Service disponible en haute saison ?","a":"Oui, disponible toute l''année y compris juillet-août. Réservez à l''avance en haute saison."}]'::jsonb,
 true),

('transfert-draguignan-aeroport-nice', 'transfer',
 'Transfert VTC Draguignan – Nice Aéroport | L''Ambassadeur des VTC',
 'Transfert VTC Draguignan Nice Aéroport. Tarif fixe, suivi vol. Disponible 24h/24 dans le Var.',
 'Transfert VTC Draguignan → Aéroport de Nice',
 'L''Ambassadeur des VTC assure votre transfert entre Draguignan et l''aéroport de Nice Côte d''Azur. Depuis la sous-préfecture du Var, rejoignez Nice Aéroport en 1h15 à 1h30. Tarif fixe, voiture premium.',
 '[{"q":"Tarif VTC Draguignan – Nice Aéroport ?","a":"Environ 120 à 140€ pour un transfert Draguignan – Nice Aéroport."},{"q":"VTC Draguignan – Toulon-Hyères Aéroport ?","a":"Environ 70 à 90€ pour un transfert Draguignan – Aéroport Toulon-Hyères."},{"q":"Durée Draguignan – Nice Aéroport ?","a":"Environ 1h15 à 1h30 via la N555 et l''A8."}]'::jsonb,
 true),

('transfert-toulon-cannes', 'transfer',
 'Transfert VTC Toulon – Cannes | L''Ambassadeur des VTC',
 'Transfert VTC Toulon Cannes. Tarif fixe, chauffeur professionnel. Festival, congrès, événements.',
 'Transfert VTC Toulon → Cannes',
 'L''Ambassadeur des VTC assure votre transfert entre Toulon et Cannes en 1h à 1h15 via l''A8. Idéal pour le Festival de Cannes, le MIPIM, les congrès et les déplacements professionnels.',
 '[{"q":"Tarif VTC Toulon – Cannes ?","a":"Environ 100 à 120€ pour un transfert Toulon – Cannes."},{"q":"VTC Toulon – Cannes pour le Festival ?","a":"Oui, service disponible avec tarif fixe pendant toute la durée du Festival de Cannes."},{"q":"Durée Toulon – Cannes en VTC ?","a":"Environ 1h à 1h15 via l''A8."}]'::jsonb,
 true),

('transfert-hyeres-saint-tropez', 'transfer',
 'Transfert VTC Hyères – Saint-Tropez | L''Ambassadeur des VTC',
 'Transfert VTC Hyères Saint-Tropez. Tarif fixe, chauffeur privé, disponible 24h/24 dans le Var.',
 'Transfert VTC Hyères → Saint-Tropez',
 'L''Ambassadeur des VTC assure votre transfert entre Hyères et Saint-Tropez. Durée estimée : 45 à 75 minutes selon la saison. Service disponible toute l''année.',
 '[{"q":"Tarif VTC Hyères – Saint-Tropez ?","a":"Environ 75 à 95€ pour un transfert Hyères – Saint-Tropez."},{"q":"VTC depuis l''aéroport Toulon-Hyères vers Saint-Tropez ?","a":"Oui, nous pouvons vous prendre à l''aéroport de Toulon-Hyères et vous conduire à Saint-Tropez pour environ 85 à 110€."},{"q":"Durée Hyères – Saint-Tropez ?","a":"Environ 45 à 75 minutes selon le trafic."}]'::jsonb,
 true),

('transfert-roquebrune-aeroport-nice', 'transfer',
 'Transfert VTC Roquebrune-sur-Argens – Nice Aéroport | L''Ambassadeur des VTC',
 'Transfert VTC Roquebrune-sur-Argens Nice Aéroport. Tarif fixe, suivi vol. 24h/24.',
 'Transfert VTC Roquebrune-sur-Argens → Nice Aéroport',
 'L''Ambassadeur des VTC assure votre transfert entre Roquebrune-sur-Argens et l''aéroport de Nice Côte d''Azur. Depuis Les Issambres, Roquebrune-Plage ou le village, votre chauffeur vient vous chercher à domicile.',
 '[{"q":"Tarif VTC Roquebrune – Nice Aéroport ?","a":"Environ 100 à 120€ pour un transfert Roquebrune-sur-Argens – Nice Aéroport."},{"q":"Couvrez-vous Les Issambres ?","a":"Oui, nous intervenons aux Issambres et dans toute la commune de Roquebrune-sur-Argens."},{"q":"Durée Roquebrune – Nice Aéroport ?","a":"Environ 50 à 70 minutes via l''A8."}]'::jsonb,
 true),

-- ============================================================
-- PAGES CHAUFFEUR PRIVÉ (variantes keyword)
-- ============================================================

('chauffeur-prive-saint-raphael', 'city',
 'Chauffeur Privé Saint-Raphaël – VTC Premium | L''Ambassadeur des VTC',
 'Chauffeur privé à Saint-Raphaël. VTC premium pour transferts aéroport, gare, Saint-Tropez, Cannes. Disponible 24h/24.',
 'Chauffeur Privé Saint-Raphaël – Service VTC Premium',
 'Vous cherchez un chauffeur privé à Saint-Raphaël ? L''Ambassadeur des VTC est votre solution de transport haut de gamme dans l''Estérel. Basés à Fréjus, nous intervenons à Saint-Raphaël, Valescure, Boulouris et dans toute la commune.

Nos services à Saint-Raphaël : transferts aéroport (Nice, Toulon-Hyères), transferts gare (Saint-Raphaël-Valescure), trajets vers Saint-Tropez, Cannes et Monaco, mises à disposition à l''heure.

Tarif fixe, confirmation immédiate, chauffeur en costume.',
 '[{"q":"Chauffeur privé ou VTC à Saint-Raphaël : quelle différence ?","a":"Un VTC (Véhicule de Tourisme avec Chauffeur) est un chauffeur privé professionnel titulaire d''une carte VTC. Le service est identique à un chauffeur privé classique, avec tarif fixe et réservation à l''avance."},{"q":"Prix d''un chauffeur privé à Saint-Raphaël ?","a":"Nos tarifs commencent à 25€ pour un court trajet. Comptez 90 à 110€ pour l''aéroport de Nice."},{"q":"Chauffeur disponible 7j/7 à Saint-Raphaël ?","a":"Oui, notre service de chauffeur privé est disponible 24h/24 et 7j/7 à Saint-Raphaël."}]'::jsonb,
 true),

('chauffeur-prive-cannes', 'city',
 'Chauffeur Privé Cannes – VTC Festival & Prestige | L''Ambassadeur des VTC',
 'Chauffeur privé à Cannes. Festival, MIPIM, MAPIC, transferts aéroport Nice. Service VTC premium 24h/24.',
 'Chauffeur Privé Cannes – Service VTC Prestige',
 'L''Ambassadeur des VTC est votre chauffeur privé à Cannes pour tous vos déplacements sur la Côte d''Azur. Service premium adapté aux exigences cannoise : Festival de Cannes, MIPIM, MAPIC, Cannes Lions et tous les événements du Palais des Congrès.

Nos chauffeurs sont en costume, discrets et ponctuels. Véhicules haut de gamme, eau fraîche à bord, prise en charge à votre hôtel ou appartement.',
 '[{"q":"Chauffeur privé disponible pendant le Festival de Cannes ?","a":"Oui, nous proposons un service dédié au Festival avec tarif fixe garanti pendant toute la durée de l''événement."},{"q":"VTC ou chauffeur privé à Cannes : comment réserver ?","a":"Réservez en 2 minutes sur notre site ou par téléphone. Confirmation immédiate, aucune création de compte requise."},{"q":"Prix chauffeur privé Cannes – Nice Aéroport ?","a":"Environ 65 à 85€ pour un transfert Cannes – Nice Aéroport en voiture premium."}]'::jsonb,
 true),

('chauffeur-prive-toulon', 'city',
 'Chauffeur Privé Toulon – VTC Premium Var | L''Ambassadeur des VTC',
 'Chauffeur privé à Toulon. VTC pour transferts aéroport, gare, Marseille, Nice. Service premium disponible 24h/24.',
 'Chauffeur Privé Toulon – Service VTC',
 'L''Ambassadeur des VTC propose un service de chauffeur privé à Toulon, préfecture du Var. Que vous soyez à Toulon pour affaires ou en déplacement, notre service VTC premium vous transporte vers les aéroports de Toulon-Hyères, Marseille et Nice, la gare SNCF, ou vers Saint-Tropez, Cannes et Monaco.',
 '[{"q":"Chauffeur privé Toulon – Marseille Aéroport ?","a":"Environ 80 à 100€ pour un transfert Toulon – Aéroport Marseille-Provence."},{"q":"VTC Toulon – Nice Aéroport : tarif ?","a":"Environ 140 à 170€ pour un transfert Toulon – Nice Aéroport."},{"q":"Chauffeur privé disponible 24h/24 à Toulon ?","a":"Oui, notre service fonctionne 24h/24 et 7j/7 à Toulon et dans toute l''agglomération."}]'::jsonb,
 true),

('chauffeur-prive-nice', 'city',
 'Chauffeur Privé Nice – VTC Premium Côte d''Azur | L''Ambassadeur des VTC',
 'Chauffeur privé à Nice. VTC premium pour transferts aéroport, Monaco, Cannes, Saint-Tropez. Disponible 24h/24.',
 'Chauffeur Privé Nice – Service VTC Premium',
 'L''Ambassadeur des VTC est votre chauffeur privé à Nice pour tous vos déplacements sur la Côte d''Azur. Depuis Nice, nous assurons vos transferts vers l''aéroport de Nice Côte d''Azur, Monaco, Cannes, Antibes, Saint-Tropez et le Var.

Service haut de gamme, chauffeur en costume, ponctualité garantie.',
 '[{"q":"Chauffeur privé Nice – Monaco : tarif ?","a":"Environ 70 à 90€ pour un transfert Nice – Monaco avec chauffeur privé."},{"q":"VTC depuis Nice vers Saint-Tropez : combien ?","a":"Environ 150 à 180€ pour un transfert Nice – Saint-Tropez."},{"q":"Chauffeur privé Nice disponible la nuit ?","a":"Oui, service disponible 24h/24 à Nice et dans toute la Côte d''Azur."}]'::jsonb,
 true),

('chauffeur-prive-saint-tropez', 'city',
 'Chauffeur Privé Saint-Tropez – VTC Prestige | L''Ambassadeur des VTC',
 'Chauffeur privé à Saint-Tropez. VTC prestige pour villas, yachts, boîtes de nuit. Transferts Nice Aéroport 24h/24.',
 'Chauffeur Privé Saint-Tropez – Service VTC Prestige',
 'L''Ambassadeur des VTC propose un service de chauffeur privé prestige à Saint-Tropez. Pour vos déplacements depuis ou vers Saint-Tropez — villas, yachts, restaurants, boîtes de nuit — notre chauffeur est à votre disposition à toute heure.

Transferts disponibles vers Nice Aéroport (1h30), Cannes (1h15), Monaco (2h), Fréjus (35 min) et Toulon (1h30).',
 '[{"q":"Chauffeur privé Saint-Tropez la nuit ?","a":"Oui, notre service est disponible 24h/24 y compris les nuits d''été pour les sorties en boîte de nuit ou retours de soirée."},{"q":"VTC Saint-Tropez – Nice Aéroport : tarif ?","a":"Environ 160 à 200€ pour un transfert Saint-Tropez – Nice Aéroport."},{"q":"Chauffeur privé pour les yachts à Saint-Tropez ?","a":"Oui, nous assurons les transferts depuis le port de Saint-Tropez vers tous les aéroports et destinations."}]'::jsonb,
 true),

('chauffeur-prive-var', 'city',
 'Chauffeur Privé Var – Service VTC dans tout le Var | L''Ambassadeur des VTC',
 'Chauffeur privé dans tout le Var. VTC premium pour transferts aéroport, gare, Côte d''Azur. Disponible 24h/24.',
 'Chauffeur Privé dans le Var – Service VTC Premium',
 'L''Ambassadeur des VTC est votre chauffeur privé de référence dans tout le département du Var (83). Nous intervenons dans toutes les communes du Var pour vos transferts vers les aéroports (Nice, Toulon-Hyères, Marseille), les gares TGV et les destinations de la Côte d''Azur.

Zone de couverture : Toulon, Fréjus, Saint-Raphaël, Draguignan, Brignoles, Hyères, Saint-Tropez, La Seyne-sur-Mer et toutes les communes du Var.',
 '[{"q":"Intervenez-vous dans tout le Var ?","a":"Oui, L''Ambassadeur des VTC couvre l''ensemble du département du Var (83), de Toulon à Fréjus en passant par Draguignan et Saint-Tropez."},{"q":"Comment réserver un chauffeur privé dans le Var ?","a":"Réservez en ligne en 2 minutes ou appelez-nous. Confirmation immédiate, tarif fixe."},{"q":"Chauffeur privé dans le Var 24h/24 ?","a":"Oui, notre service est disponible 24h/24 et 7j/7 dans tout le Var."}]'::jsonb,
 true),

-- ============================================================
-- PAGES ÉVÉNEMENTS & SPÉCIALITÉS
-- ============================================================

('vtc-mariage-var', 'city',
 'VTC Mariage Var – Chauffeur Privé pour Votre Mariage | L''Ambassadeur des VTC',
 'VTC pour mariage dans le Var. Chauffeur privé pour mariés et invités. Service élégant et ponctuel. Réservation dès maintenant.',
 'VTC Mariage dans le Var – Chauffeur Privé',
 'L''Ambassadeur des VTC propose un service VTC haut de gamme pour votre mariage dans le Var. Que ce soit pour transporter les mariés, la famille ou les invités, nous mettons notre flotte de véhicules premium et nos chauffeurs en costume à votre service.

Navettes mariage, voiture des mariés, transferts invités depuis l''aéroport ou la gare, retours en soirée — nous gérons toute la logistique transport de votre journée.',
 '[{"q":"VTC pour un mariage dans le Var : comment réserver ?","a":"Contactez-nous avec les détails de votre mariage (date, lieu, nombre de trajets) et nous vous proposons un devis personnalisé."},{"q":"Proposez-vous des forfaits mariage ?","a":"Oui, nous proposons des forfaits dédiés aux mariages incluant la décoration du véhicule sur demande."},{"q":"Intervenez-vous pour les mariages à Saint-Tropez ?","a":"Oui, nous couvrons tous les lieux de réception du Var : châteaux, domaines viticoles, mas provençaux."}]'::jsonb,
 true),

('vtc-corporate-cote-dazur', 'city',
 'VTC Corporate Côte d''Azur – Transport Entreprise | L''Ambassadeur des VTC',
 'VTC pour entreprises sur la Côte d''Azur. Transport corporate, séminaires, congrès. Facturation entreprise disponible.',
 'VTC Corporate Côte d''Azur – Transport Professionnel',
 'L''Ambassadeur des VTC propose un service de transport corporate haut de gamme pour les entreprises de la Côte d''Azur et du Var. Transferts aéroport, navettes entre hôtels et lieux de congrès, mise à disposition de chauffeur pour vos collaborateurs et clients VIP.

Facturation entreprise disponible. Compte client dédié sur demande. Parfait pour le MIPIM, le Festival de Cannes, les Cannes Lions et tous les événements professionnels de la région.',
 '[{"q":"Proposez-vous des comptes entreprise ?","a":"Oui, nous proposons des comptes entreprise avec facturation mensuelle pour les sociétés ayant des besoins réguliers."},{"q":"VTC pour séminaires et congrès sur la Côte d''Azur ?","a":"Oui, nous assurons la logistique transport complète pour vos séminaires, avec navettes, transferts aéroport et mises à disposition."},{"q":"Comment ouvrir un compte corporate ?","a":"Contactez-nous par téléphone ou email pour ouvrir un compte corporate adapté à vos besoins."}]'::jsonb,
 true),

('vtc-evenement-cannes', 'city',
 'VTC Événements Cannes – Festival, MIPIM, Congrès | L''Ambassadeur des VTC',
 'VTC pour événements à Cannes. Festival de Cannes, MIPIM, MAPIC, Cannes Lions. Chauffeur privé disponible 24h/24.',
 'VTC Événements Cannes – Festival & Congrès',
 'L''Ambassadeur des VTC est votre partenaire transport pour tous les grands événements cannois. Nous assurons les transferts depuis Nice Aéroport, Monaco, Fréjus et Saint-Raphaël vers Cannes pendant le Festival, le MIPIM, le MAPIC, les Cannes Lions et tous les congrès du Palais des Festivals.

Service premium, chauffeur en costume, tarif fixe garanti pendant les événements.',
 '[{"q":"VTC disponible pendant le Festival de Cannes ?","a":"Oui, nous maintenons notre service 24h/24 pendant le Festival avec tarif fixe garanti."},{"q":"Transferts aéroport Nice – Cannes pour le MIPIM ?","a":"Oui, nous proposons des transferts réguliers Nice Aéroport – Cannes pour toute la durée du MIPIM."},{"q":"Comment réserver pour un événement à Cannes ?","a":"Réservez à l''avance via notre site ou par téléphone. En période d''événement, nous recommandons de réserver 48h minimum à l''avance."}]'::jsonb,
 true),

('vtc-cote-dazur', 'city',
 'VTC Côte d''Azur – Chauffeur Privé Premium | L''Ambassadeur des VTC',
 'VTC sur toute la Côte d''Azur. Fréjus, Nice, Cannes, Monaco, Saint-Tropez. Chauffeur privé premium disponible 24h/24.',
 'VTC Côte d''Azur – Chauffeur Privé Premium',
 'L''Ambassadeur des VTC est votre chauffeur privé sur toute la Côte d''Azur. De Fréjus à Menton, nous couvrons l''intégralité de la Riviera française pour vos transferts aéroport, gare, longue distance et mise à disposition.

Véhicules haut de gamme, chauffeurs professionnels, tarifs fixes et transparents. La Côte d''Azur dans le confort et l''élégance.',
 '[{"q":"Quelle est la zone de couverture de L''Ambassadeur des VTC ?","a":"Nous couvrons l''ensemble de la Côte d''Azur : Var (Fréjus, Saint-Raphaël, Toulon, Saint-Tropez) et Alpes-Maritimes (Nice, Cannes, Antibes, Monaco, Menton)."},{"q":"VTC disponible sur toute la Côte d''Azur 24h/24 ?","a":"Oui, notre service est disponible 24h/24 et 7j/7 sur toute la Côte d''Azur."},{"q":"Comment réserver un VTC sur la Côte d''Azur ?","a":"Réservez en ligne en 2 minutes sur notre site ou par téléphone. Confirmation immédiate, tarif fixe."}]'::jsonb,
 true)

ON CONFLICT (slug) DO NOTHING;
