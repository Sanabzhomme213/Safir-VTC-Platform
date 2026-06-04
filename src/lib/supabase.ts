import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Client = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: 'new' | 'loyal' | 'vip';
  total_spent: number;
  total_rides: number;
  loyalty_points: number;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type Reservation = {
  id: string;
  booking_number: string;
  client_id: string;
  departure_address: string;
  departure_lat: number | null;
  departure_lng: number | null;
  arrival_address: string;
  arrival_lat: number | null;
  arrival_lng: number | null;
  ride_date: string;
  ride_time: string;
  passengers: number;
  luggage: number;
  ride_type: 'one_way' | 'round_trip' | 'disposal';
  return_date: string | null;
  return_time: string | null;
  distance_km: number;
  duration_min: number;
  base_price: number;
  deposit_amount: number;
  deposit_percentage: number;
  total_price: number;
  status: 'pending' | 'deposit_paid' | 'confirmed' | 'completed' | 'cancelled';
  flight_number: string | null;
  flight_status: string | null;
  is_quote: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
  client?: Client;
};

export type Quote = {
  id: string;
  reservation_id: string;
  quote_number: string;
  pdf_url: string | null;
  status: 'pending' | 'sent' | 'accepted' | 'rejected' | 'expired';
  valid_until: string | null;
  created_at: string;
  reservation?: Reservation;
};

export type Payment = {
  id: string;
  reservation_id: string;
  amount: number;
  method: 'card' | 'apple_pay' | 'google_pay' | 'cash' | 'transfer';
  type: 'deposit' | 'balance' | 'full';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  stripe_payment_id: string | null;
  created_at: string;
};

export type SeoPage = {
  id: string;
  slug: string;
  page_type: 'city' | 'airport' | 'station' | 'transfer';
  title: string;
  meta_description: string;
  h1: string;
  content: string;
  faq: { q: string; a: string }[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type EmailLog = {
  id: string;
  reservation_id: string | null;
  client_id: string | null;
  email_type: 'confirmation' | 'deposit_confirmation' | 'reminder_24h' | 'thank_you' | 'review_request' | 'quote_sent' | 'marketing' | 'custom';
  subject: string;
  status: 'pending' | 'sent' | 'failed';
  sent_at: string | null;
  created_at: string;
};

export type GoogleBusinessPost = {
  id: string;
  title: string;
  content: string;
  post_type: 'update' | 'offer' | 'event';
  media_url: string | null;
  status: 'draft' | 'published' | 'failed';
  published_at: string | null;
  created_at: string;
};

export type ConciergeOffer = {
  id: string;
  offer_type: 'hotel' | 'restaurant' | 'car_rental' | 'activity';
  name: string;
  description: string;
  partner_name: string;
  affiliate_url: string;
  commission_percent: number;
  city: string;
  is_active: boolean;
  created_at: string;
};

export type LoyaltyRule = {
  id: string;
  name: string;
  min_rides: number;
  min_spent: number;
  discount_percent: number;
  points_per_euro: number;
  created_at: string;
};

export type PromoCode = {
  id: string;
  code: string;
  discount_percent: number;
  discount_amount: number;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
};

export type Settings = {
  id: string;
  key: string;
  value: any;
  updated_at: string;
};

export function generateBookingNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SAF-${date}-${rand}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export const reservationStatusLabel: Record<string, string> = {
  pending: 'En attente',
  deposit_paid: 'Acompte payé',
  confirmed: 'Confirmée',
  completed: 'Terminée',
  cancelled: 'Annulée',
};

export const reservationStatusColor: Record<string, string> = {
  pending: 'badge-warning',
  deposit_paid: 'badge-info',
  confirmed: 'badge-success',
  completed: 'badge-neutral',
  cancelled: 'badge-error',
};

export const clientStatusLabel: Record<string, string> = {
  new: 'Nouveau',
  loyal: 'Fidèle',
  vip: 'VIP',
};

export const rideTypeLabel: Record<string, string> = {
  one_way: 'Aller simple',
  round_trip: 'Aller-retour',
  disposal: 'Mise à disposition',
};

export const paymentMethodLabel: Record<string, string> = {
  card: 'Carte bancaire',
  apple_pay: 'Apple Pay',
  google_pay: 'Google Pay',
  cash: 'Espèces',
  transfer: 'Virement',
};

export const seoPageTypeLabel: Record<string, string> = {
  city: 'Ville',
  airport: 'Aéroport',
  station: 'Gare',
  transfer: 'Transfert',
};

export const emailTypeLabel: Record<string, string> = {
  confirmation: 'Confirmation réservation',
  deposit_confirmation: 'Confirmation acompte',
  reminder_24h: 'Rappel 24h',
  thank_you: 'Merci après trajet',
  review_request: 'Demande d\'avis',
  quote_sent: 'Devis envoyé',
  marketing: 'Marketing',
  custom: 'Personnalisé',
};
