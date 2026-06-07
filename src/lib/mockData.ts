import type { Reservation, Client, Payment, SeoPage, EmailLog, ConciergeOffer, PromoCode, LoyaltyRule } from './supabase';

export const mockClients: Client[] = [
  { id: '1', first_name: 'Jean', last_name: 'Dupont', email: 'jean.dupont@email.fr', phone: '+33 6 12 34 56 78', status: 'vip', total_spent: 2850, total_rides: 22, loyalty_points: 5700, notes: '', created_at: '2025-01-15T10:00:00Z', updated_at: '2025-06-01T10:00:00Z' },
  { id: '2', first_name: 'Marie', last_name: 'Laurent', email: 'marie.laurent@email.fr', phone: '+33 6 98 76 54 32', status: 'loyal', total_spent: 680, total_rides: 7, loyalty_points: 1020, notes: '', created_at: '2025-03-01T10:00:00Z', updated_at: '2025-05-28T10:00:00Z' },
  { id: '3', first_name: 'Pierre', last_name: 'Martin', email: 'pierre.martin@email.fr', phone: '+33 6 55 44 33 22', status: 'new', total_spent: 85, total_rides: 1, loyalty_points: 85, notes: '', created_at: '2025-06-01T10:00:00Z', updated_at: '2025-06-01T10:00:00Z' },
  { id: '4', first_name: 'Sophie', last_name: 'Bernard', email: 'sophie.b@email.fr', phone: '+33 6 11 22 33 44', status: 'loyal', total_spent: 1200, total_rides: 12, loyalty_points: 1800, notes: 'Préfère les Mercedes', created_at: '2025-02-10T10:00:00Z', updated_at: '2025-05-30T10:00:00Z' },
  { id: '5', first_name: 'Lucas', last_name: 'Moreau', email: 'lucas.moreau@email.fr', phone: '+33 6 77 88 99 00', status: 'vip', total_spent: 3500, total_rides: 30, loyalty_points: 7000, notes: 'Client corporate', created_at: '2024-11-01T10:00:00Z', updated_at: '2025-06-02T10:00:00Z' },
  { id: '6', first_name: 'Emma', last_name: 'Petit', email: 'emma.petit@email.fr', phone: '+33 6 33 44 55 66', status: 'new', total_spent: 0, total_rides: 0, loyalty_points: 0, notes: '', created_at: '2025-06-03T10:00:00Z', updated_at: '2025-06-03T10:00:00Z' },
];

export const mockReservations: Reservation[] = [
  { id: 'r1', booking_number: 'SAF-20250603-A1B2', client_id: '1', departure_address: 'Gare de Toulon', departure_lat: 43.1242, departure_lng: 5.9304, arrival_address: 'Aéroport Nice Côte d\'Azur', arrival_lat: 43.6584, arrival_lng: 7.2159, ride_date: '2025-06-04', ride_time: '08:00', passengers: 2, luggage: 2, ride_type: 'one_way', return_date: null, return_time: null, distance_km: 120, duration_min: 80, base_price: 120, deposit_amount: 24, deposit_percentage: 20, total_price: 120, status: 'confirmed', flight_number: 'AF1234', flight_status: 'on_time', is_quote: false, notes: '', created_at: '2025-06-01T10:00:00Z', updated_at: '2025-06-03T10:00:00Z' },
  { id: 'r2', booking_number: 'SAF-20250603-C3D4', client_id: '2', departure_address: 'Hôtel Byblos, Saint-Tropez', departure_lat: 43.2727, departure_lng: 6.6406, arrival_address: 'Aéroport Nice Côte d\'Azur', arrival_lat: 43.6584, arrival_lng: 7.2159, ride_date: '2025-06-04', ride_time: '14:30', passengers: 1, luggage: 1, ride_type: 'one_way', return_date: null, return_time: null, distance_km: 180, duration_min: 110, base_price: 180, deposit_amount: 36, deposit_percentage: 20, total_price: 180, status: 'deposit_paid', flight_number: null, flight_status: null, is_quote: false, notes: '', created_at: '2025-06-02T10:00:00Z', updated_at: '2025-06-03T10:00:00Z' },
  { id: 'r3', booking_number: 'SAF-20250603-E5F6', client_id: '3', departure_address: 'Aéroport Nice Côte d\'Azur', departure_lat: 43.6584, departure_lng: 7.2159, arrival_address: 'Villa Azur, Hyères', arrival_lat: 43.1203, arrival_lng: 6.1286, ride_date: '2025-06-04', ride_time: '18:00', passengers: 3, luggage: 4, ride_type: 'one_way', return_date: null, return_time: null, distance_km: 105, duration_min: 70, base_price: 110, deposit_amount: 33, deposit_percentage: 30, total_price: 110, status: 'pending', flight_number: 'BA5678', flight_status: null, is_quote: false, notes: '', created_at: '2025-06-03T10:00:00Z', updated_at: '2025-06-03T10:00:00Z' },
  { id: 'r4', booking_number: 'SAF-20250602-G7H8', client_id: '5', departure_address: 'Palais des Congrès, Fréjus', departure_lat: 43.4326, departure_lng: 6.7370, arrival_address: 'Port de Saint-Tropez', arrival_lat: 43.2726, arrival_lng: 6.6404, ride_date: '2025-06-04', ride_time: '09:00', passengers: 1, luggage: 0, ride_type: 'disposal', return_date: null, return_time: null, distance_km: 55, duration_min: 50, base_price: 180, deposit_amount: 90, deposit_percentage: 50, total_price: 180, status: 'confirmed', flight_number: null, flight_status: null, is_quote: false, notes: 'Mise à disposition 4h', created_at: '2025-05-30T10:00:00Z', updated_at: '2025-06-02T10:00:00Z' },
  { id: 'r5', booking_number: 'SAF-20250603-I9J0', client_id: '4', departure_address: 'Gare de Draguignan', departure_lat: 43.5387, departure_lng: 6.4652, arrival_address: 'Aéroport Toulon-Hyères', arrival_lat: 43.0974, arrival_lng: 6.1461, ride_date: '2025-06-05', ride_time: '10:00', passengers: 2, luggage: 2, ride_type: 'round_trip', return_date: '2025-06-05', return_time: '20:00', distance_km: 65, duration_min: 55, base_price: 130, deposit_amount: 26, deposit_percentage: 20, total_price: 117, status: 'pending', flight_number: null, flight_status: null, is_quote: false, notes: 'Aller-retour, remise 10%', created_at: '2025-06-03T14:00:00Z', updated_at: '2025-06-03T14:00:00Z' },
  { id: 'r6', booking_number: 'SAF-20250601-K1L2', client_id: '1', departure_address: '8 Avenue de la Liberté, Toulon', departure_lat: 43.1242, departure_lng: 5.9304, arrival_address: 'Aéroport Toulon-Hyères', arrival_lat: 43.0974, arrival_lng: 6.1461, ride_date: '2025-06-02', ride_time: '07:00', passengers: 1, luggage: 1, ride_type: 'one_way', return_date: null, return_time: null, distance_km: 28, duration_min: 25, base_price: 55, deposit_amount: 11, deposit_percentage: 20, total_price: 55, status: 'completed', flight_number: null, flight_status: null, is_quote: false, notes: '', created_at: '2025-05-28T10:00:00Z', updated_at: '2025-06-02T10:00:00Z' },
  { id: 'r7', booking_number: 'SAF-20250603-M3N4', client_id: '6', departure_address: 'Monaco, Place du Casino', departure_lat: 43.7396, departure_lng: 7.4269, arrival_address: 'Aéroport Nice Côte d\'Azur', arrival_lat: 43.6584, arrival_lng: 7.2159, ride_date: '2025-06-06', ride_time: '06:00', passengers: 1, luggage: 1, ride_type: 'one_way', return_date: null, return_time: null, distance_km: 22, duration_min: 30, base_price: 75, deposit_amount: 15, deposit_percentage: 20, total_price: 75, status: 'pending', flight_number: null, flight_status: null, is_quote: true, notes: 'Demande de devis', created_at: '2025-06-03T16:00:00Z', updated_at: '2025-06-03T16:00:00Z' },
];

export const mockPayments: Payment[] = [
  { id: 'p1', reservation_id: 'r1', amount: 24, method: 'card', type: 'deposit', status: 'completed', stripe_payment_id: 'pi_123', created_at: '2025-06-01T10:00:00Z' },
  { id: 'p2', reservation_id: 'r2', amount: 36, method: 'apple_pay', type: 'deposit', status: 'completed', stripe_payment_id: 'pi_456', created_at: '2025-06-02T10:00:00Z' },
  { id: 'p3', reservation_id: 'r4', amount: 90, method: 'card', type: 'deposit', status: 'completed', stripe_payment_id: 'pi_789', created_at: '2025-05-30T10:00:00Z' },
  { id: 'p4', reservation_id: 'r6', amount: 55, method: 'google_pay', type: 'full', status: 'completed', stripe_payment_id: 'pi_012', created_at: '2025-06-02T10:00:00Z' },
];

export const mockSeoPages: SeoPage[] = [
  { id: 's1', slug: 'vtc-toulon', page_type: 'city', title: 'VTC Toulon - Chauffeur Privé Premium', meta_description: 'Service VTC premium à Toulon. Chauffeur privé, transferts aéroport, gare. Réservation instantanée.', h1: 'Chauffeur VTC à Toulon', content: "L'Ambassadeur des VTC propose un service de chauffeur privé premium à Toulon et ses environs. Nos conducteurs expérimentés vous offrent un confort et une fiabilité sans égal pour tous vos trajets.", faq: [{ q: 'Quel est le prix d\'un VTC à Toulon ?', a: 'Nos tarifs commencent à 35€ pour un trajet en ville.' }, { q: 'Comment réserver un VTC à Toulon ?', a: 'Réservez en ligne en 2 minutes sur notre site ou par téléphone.' }], is_published: true, created_at: '2025-05-01T10:00:00Z', updated_at: '2025-06-01T10:00:00Z' },
  { id: 's2', slug: 'vtc-hyeres', page_type: 'city', title: 'VTC Hyères - Chauffeur Privé', meta_description: 'Chauffeur VTC à Hyères. Transferts professionnels, confort premium.', h1: 'Chauffeur VTC à Hyères', content: 'Découvrez notre service VTC à Hyères et la presqu\'île de Giens...', faq: [{ q: 'VTC Hyères disponible 24h/24 ?', a: 'Oui, notre service est disponible 24h/24 et 7j/7.' }], is_published: true, created_at: '2025-05-01T10:00:00Z', updated_at: '2025-06-01T10:00:00Z' },
  { id: 's3', slug: 'vtc-aeroport-nice', page_type: 'airport', title: 'VTC Aéroport Nice Côte d\'Azur - Transfert Premium', meta_description: 'Transfert VTC aéroport de Nice. Prise en charge, suivi de vol en temps réel.', h1: 'Transfert VTC Aéroport Nice Côte d\'Azur', content: 'Service de transfert premium vers l\'aéroport de Nice depuis tout le Var et la Côte d\'Azur...', faq: [{ q: 'Suivez-vous les vols ?', a: 'Oui, nous suivons les vols en temps réel pour ajuster la prise en charge.' }], is_published: true, created_at: '2025-05-01T10:00:00Z', updated_at: '2025-06-01T10:00:00Z' },
  { id: 's4', slug: 'vtc-saint-tropez', page_type: 'city', title: 'VTC Saint-Tropez - Chauffeur Privé', meta_description: 'Service VTC premium à Saint-Tropez et le Golfe de Saint-Tropez.', h1: 'Chauffeur VTC à Saint-Tropez', content: '', faq: [], is_published: false, created_at: '2025-05-15T10:00:00Z', updated_at: '2025-05-15T10:00:00Z' },
  { id: 's5', slug: 'transfert-toulon-nice', page_type: 'transfer', title: 'Transfert VTC Toulon Nice', meta_description: 'Transfert VTC Toulon - Nice en voiture premium.', h1: 'Transfert Toulon Nice en VTC', content: '', faq: [], is_published: false, created_at: '2025-05-20T10:00:00Z', updated_at: '2025-05-20T10:00:00Z' },
];

export const mockEmailLogs: EmailLog[] = [
  { id: 'e1', reservation_id: 'r1', client_id: '1', email_type: 'confirmation', subject: 'Confirmation de votre réservation SAF-20250603-A1B2', status: 'sent', sent_at: '2025-06-01T10:00:00Z', created_at: '2025-06-01T10:00:00Z' },
  { id: 'e2', reservation_id: 'r1', client_id: '1', email_type: 'deposit_confirmation', subject: 'Acompte reçu - SAF-20250603-A1B2', status: 'sent', sent_at: '2025-06-01T10:30:00Z', created_at: '2025-06-01T10:30:00Z' },
  { id: 'e3', reservation_id: 'r2', client_id: '2', email_type: 'confirmation', subject: 'Confirmation de votre réservation', status: 'sent', sent_at: '2025-06-02T10:00:00Z', created_at: '2025-06-02T10:00:00Z' },
  { id: 'e4', reservation_id: 'r2', client_id: '2', email_type: 'deposit_confirmation', subject: 'Acompte reçu', status: 'sent', sent_at: '2025-06-02T10:30:00Z', created_at: '2025-06-02T10:30:00Z' },
  { id: 'e5', reservation_id: 'r6', client_id: '1', email_type: 'thank_you', subject: 'Merci pour votre trajet !', status: 'sent', sent_at: '2025-06-02T08:00:00Z', created_at: '2025-06-02T08:00:00Z' },
  { id: 'e6', reservation_id: 'r6', client_id: '1', email_type: 'review_request', subject: 'Laissez-nous un avis Google', status: 'sent', sent_at: '2025-06-02T09:00:00Z', created_at: '2025-06-02T09:00:00Z' },
  { id: 'e7', reservation_id: 'r7', client_id: '6', email_type: 'quote_sent', subject: 'Votre devis SAF-20250603-M3N4', status: 'sent', sent_at: '2025-06-03T16:10:00Z', created_at: '2025-06-03T16:10:00Z' },
];

export const mockConciergeOffers: ConciergeOffer[] = [
  { id: 'c1', offer_type: 'hotel', name: 'Hôtel Byblos Saint-Tropez', description: 'Hôtel 5 étoiles mythique au cœur de Saint-Tropez', partner_name: 'Booking.com', affiliate_url: '#', commission_percent: 8, city: 'Saint-Tropez', is_active: true, created_at: '2025-05-01T10:00:00Z' },
  { id: 'c2', offer_type: 'restaurant', name: 'Le Jardin de la Tour', description: 'Restaurant gastronomique avec vue mer à Toulon', partner_name: 'LaFourchette', affiliate_url: '#', commission_percent: 5, city: 'Toulon', is_active: true, created_at: '2025-05-01T10:00:00Z' },
  { id: 'c3', offer_type: 'car_rental', name: 'Europcar Nice Aéroport', description: 'Location de voitures premium à l\'aéroport de Nice', partner_name: 'Europcar', affiliate_url: '#', commission_percent: 10, city: 'Nice', is_active: true, created_at: '2025-05-01T10:00:00Z' },
  { id: 'c4', offer_type: 'activity', name: 'Sortie en mer Golfe de Saint-Tropez', description: 'Croisière privée dans le Golfe de Saint-Tropez', partner_name: 'GetYourGuide', affiliate_url: '#', commission_percent: 12, city: 'Saint-Tropez', is_active: true, created_at: '2025-05-01T10:00:00Z' },
];

export const mockLoyaltyRules: LoyaltyRule[] = [
  { id: 'l1', name: 'Nouveau', min_rides: 0, min_spent: 0, discount_percent: 0, points_per_euro: 1, created_at: '2025-01-01T10:00:00Z' },
  { id: 'l2', name: 'Fidèle', min_rides: 5, min_spent: 300, discount_percent: 5, points_per_euro: 1.5, created_at: '2025-01-01T10:00:00Z' },
  { id: 'l3', name: 'VIP', min_rides: 15, min_spent: 1000, discount_percent: 10, points_per_euro: 2, created_at: '2025-01-01T10:00:00Z' },
];

export const mockPromoCodes: PromoCode[] = [
  { id: 'pc1', code: 'BIENVENUE10', discount_percent: 10, discount_amount: 0, max_uses: 100, current_uses: 23, valid_from: '2025-01-01T00:00:00Z', valid_until: '2025-12-31T23:59:59Z', is_active: true, created_at: '2025-01-01T10:00:00Z' },
  { id: 'pc2', code: 'ETE2025', discount_percent: 15, discount_amount: 0, max_uses: 50, current_uses: 8, valid_from: '2025-06-01T00:00:00Z', valid_until: '2025-08-31T23:59:59Z', is_active: true, created_at: '2025-06-01T10:00:00Z' },
  { id: 'pc3', code: 'PARRAIN', discount_percent: 0, discount_amount: 20, max_uses: null, current_uses: 15, valid_from: '2025-01-01T00:00:00Z', valid_until: null, is_active: true, created_at: '2025-01-01T10:00:00Z' },
];

export const monthlyRevenue = [
  { month: 'Jan', revenue: 4200, reservations: 32 },
  { month: 'Fév', revenue: 3800, reservations: 28 },
  { month: 'Mar', revenue: 5100, reservations: 38 },
  { month: 'Avr', revenue: 4600, reservations: 35 },
  { month: 'Mai', revenue: 6200, reservations: 45 },
  { month: 'Jun', revenue: 7800, reservations: 52 },
];

export const conversionData = [
  { month: 'Jan', quotes: 40, reservations: 32 },
  { month: 'Fév', quotes: 35, reservations: 28 },
  { month: 'Mar', quotes: 48, reservations: 38 },
  { month: 'Avr', quotes: 44, reservations: 35 },
  { month: 'Mai', quotes: 55, reservations: 45 },
  { month: 'Jun', quotes: 62, reservations: 52 },
];
