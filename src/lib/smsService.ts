import { supabase } from './supabase';
import type { Reservation, Client } from './supabase';

// ── Core send function ──────────────────────────────────────────────────────

export async function sendSms(to: string, text: string): Promise<boolean> {
  if (!to) return false;

  const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) ?? '';
  const configured  = supabaseUrl.startsWith('https://') && !supabaseUrl.includes('your-project');

  if (!configured) {
    console.info('[Demo SMS]', to, '→', text);
    return true;
  }

  try {
    const { data } = await supabase.functions.invoke('send-sms', { body: { to, text } });
    return data?.ok === true;
  } catch (e) {
    console.error('SMS error:', e);
    return false;
  }
}

// ── Templates ───────────────────────────────────────────────────────────────

export function smsReservationConfirmed(r: Reservation, client: Client, companyName: string, companyPhone: string): string {
  return `${companyName} - Reservation confirmee !
N° ${r.booking_number}
Date : ${new Date(r.ride_date).toLocaleDateString('fr-FR')} a ${r.ride_time}
De : ${r.departure_address.split(',')[0]}
Vers : ${r.arrival_address.split(',')[0]}
Montant : ${r.total_price}EUR
Acompte : ${r.deposit_amount}EUR
Contact : ${companyPhone}`;
}

export function smsDepositPaid(r: Reservation, amount: number, companyName: string): string {
  return `${companyName} - Acompte recu !
${amount}EUR encaisse pour votre resa ${r.booking_number}.
Votre trajet du ${new Date(r.ride_date).toLocaleDateString('fr-FR')} a ${r.ride_time} est confirme.
Merci de votre confiance !`;
}

export function smsBalancePaid(r: Reservation, companyName: string): string {
  return `${companyName} - Paiement complet recu !
Resa ${r.booking_number} - ${r.total_price}EUR solde.
Rendez-vous le ${new Date(r.ride_date).toLocaleDateString('fr-FR')} a ${r.ride_time}.
Bon voyage !`;
}

export function smsRideReminder(r: Reservation, companyName: string, companyPhone: string): string {
  const tomorrow = new Date(r.ride_date).toLocaleDateString('fr-FR');
  return `${companyName} - Rappel trajet
Demain ${tomorrow} a ${r.ride_time}
De : ${r.departure_address.split(',')[0]}
Vers : ${r.arrival_address.split(',')[0]}
${r.flight_number ? `Vol : ${r.flight_number}` : ''}
Questions ? ${companyPhone}`.trim();
}

export function smsDriverAssigned(r: Reservation, driverName: string, vehicleInfo: string, companyPhone: string): string {
  return `Votre chauffeur est en route !
${driverName} - ${vehicleInfo}
Arrivee prevue : ${r.ride_time}
Suivi & contact : ${companyPhone}`;
}

export function smsThankYou(companyName: string, reviewUrl: string): string {
  return `${companyName} - Merci pour votre confiance !
Votre avis compte beaucoup pour nous.
Laissez un avis Google en 1 clic :
${reviewUrl}`;
}

export function smsQuoteSent(r: Reservation, companyName: string, companyPhone: string): string {
  return `${companyName} - Votre devis
N° ${r.booking_number}
${r.departure_address.split(',')[0]} -> ${r.arrival_address.split(',')[0]}
Montant estimé : ${r.total_price}EUR
Valable 30 jours. Pour confirmer : ${companyPhone}`;
}

export function smsStatusUpdate(r: Reservation, companyName: string): string {
  const statusMsg: Record<string, string> = {
    confirmed:    'Votre reservation est confirmee !',
    cancelled:    'Votre reservation a ete annulee.',
    completed:    'Trajet termine. Merci !',
    deposit_paid: 'Acompte bien recu !',
  };
  return `${companyName} - ${statusMsg[r.status] ?? 'Mise a jour'}
Resa ${r.booking_number}`;
}

// ── Auto-send on reservation events ─────────────────────────────────────────

export async function notifyReservationCreated(
  r: Reservation,
  client: Client,
  companyName: string,
  companyPhone: string
): Promise<void> {
  if (!client.phone) return;
  const text = r.is_quote
    ? smsQuoteSent(r, companyName, companyPhone)
    : smsReservationConfirmed(r, client, companyName, companyPhone);
  await sendSms(client.phone, text);
}

export async function notifyDepositPaid(
  r: Reservation,
  client: Client,
  amount: number,
  companyName: string
): Promise<void> {
  if (!client.phone) return;
  await sendSms(client.phone, smsDepositPaid(r, amount, companyName));
}

export async function notifyBalancePaid(
  r: Reservation,
  client: Client,
  companyName: string
): Promise<void> {
  if (!client.phone) return;
  await sendSms(client.phone, smsBalancePaid(r, companyName));
}

export async function notifyRideReminder(
  r: Reservation,
  client: Client,
  companyName: string,
  companyPhone: string
): Promise<void> {
  if (!client.phone) return;
  await sendSms(client.phone, smsRideReminder(r, companyName, companyPhone));
}

export async function notifyThankYou(
  client: Client,
  companyName: string,
  reviewUrl = 'https://g.page/r/ambassadeur-vtc/review'
): Promise<void> {
  if (!client.phone) return;
  await sendSms(client.phone, smsThankYou(companyName, reviewUrl));
}
