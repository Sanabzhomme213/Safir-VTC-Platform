import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { formatCurrency } from './supabase';
import type { Reservation, Client } from './supabase';
import type { AppSettings } from './DataContext';

const S = StyleSheet.create({
  page: { padding: 44, fontFamily: 'Helvetica', fontSize: 10, color: '#0a0a0a', backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  brandName: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#1a45f5', marginBottom: 3 },
  brandSub: { fontSize: 9, color: '#6d6d6d', marginBottom: 2 },
  right: { alignItems: 'flex-end' },
  invoiceTitle: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#1a45f5', marginBottom: 4 },
  invoiceNum: { fontSize: 12, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  invoiceDate: { fontSize: 9, color: '#6d6d6d', marginBottom: 6 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  badgePaid: { backgroundColor: '#d1fae5' },
  badgePending: { backgroundColor: '#fef3c7' },
  badgeTextPaid: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#065f46' },
  badgeTextPending: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#92400e' },
  dividerBlue: { borderBottomWidth: 2, borderBottomColor: '#1a45f5', marginVertical: 20 },
  dividerGray: { borderBottomWidth: 1, borderBottomColor: '#e7e7e7', marginVertical: 10 },
  row2: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  infoBox: { flex: 1, backgroundColor: '#f6f6f6', borderRadius: 6, padding: 14 },
  label: { fontSize: 7.5, color: '#888', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  val: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#0a0a0a', marginBottom: 2 },
  valSm: { fontSize: 9.5, color: '#0a0a0a', marginBottom: 1 },
  sectionTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  tableLabel: { color: '#6d6d6d', flex: 2 },
  tableVal: { fontFamily: 'Helvetica-Bold', textAlign: 'right', flex: 1 },
  totalBox: { backgroundColor: '#f0f4ff', borderRadius: 6, padding: 12, marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 13, fontFamily: 'Helvetica-Bold' },
  totalVal: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#1a45f5' },
  noteBox: { backgroundColor: '#f6f6f6', borderRadius: 6, padding: 10, marginTop: 16 },
  footer: { position: 'absolute', bottom: 28, left: 44, right: 44, textAlign: 'center', fontSize: 8, color: '#b0b0b0', borderTopWidth: 1, borderTopColor: '#e7e7e7', paddingTop: 8 },
});

interface InvoiceData {
  reservation: Reservation;
  client: Client | null;
  invoiceNumber: string;
  isPaid: boolean;
  settings: AppSettings;
}

function InvoiceDoc({ d }: { d: InvoiceData }) {
  const { reservation: r, client, invoiceNumber, isPaid, settings } = d;

  const rideTypeLabel: Record<string, string> = {
    one_way: 'Aller simple',
    round_trip: 'Aller-retour',
    disposal: 'Mise à disposition',
  };

  return (
    <Document title={invoiceNumber} author={settings.company_name}>
      <Page size="A4" style={S.page}>
        {/* Header */}
        <View style={S.header}>
          <View>
            <Text style={S.brandName}>{settings.company_name}</Text>
            <Text style={S.brandSub}>Service de VTC Premium</Text>
            <Text style={S.brandSub}>{settings.company_phone}</Text>
            <Text style={S.brandSub}>{settings.company_email}</Text>
            <Text style={S.brandSub}>{settings.company_address}</Text>
          </View>
          <View style={S.right}>
            <Text style={S.invoiceTitle}>FACTURE</Text>
            <Text style={S.invoiceNum}>{invoiceNumber}</Text>
            <Text style={S.invoiceDate}>
              Date : {new Date(r.ride_date).toLocaleDateString('fr-FR')}
            </Text>
            <View style={[S.badge, isPaid ? S.badgePaid : S.badgePending]}>
              <Text style={isPaid ? S.badgeTextPaid : S.badgeTextPending}>
                {isPaid ? '✓ PAYÉE' : '⏳ EN ATTENTE'}
              </Text>
            </View>
          </View>
        </View>

        <View style={S.dividerBlue} />

        {/* Client + Booking info */}
        <View style={S.row2}>
          <View style={S.infoBox}>
            <Text style={S.label}>Facturer à</Text>
            <Text style={S.val}>{client ? `${client.first_name} ${client.last_name}` : 'Client'}</Text>
            {client?.email ? <Text style={S.valSm}>{client.email}</Text> : null}
            {client?.phone ? <Text style={S.valSm}>{client.phone}</Text> : null}
          </View>
          <View style={S.infoBox}>
            <Text style={S.label}>Réservation</Text>
            <Text style={S.val}>{r.booking_number}</Text>
            <Text style={S.valSm}>Date : {new Date(r.ride_date).toLocaleDateString('fr-FR')}</Text>
            <Text style={S.valSm}>Heure : {r.ride_time}</Text>
            <Text style={S.valSm}>Type : {rideTypeLabel[r.ride_type] ?? r.ride_type}</Text>
          </View>
        </View>

        {/* Trajet */}
        <View>
          <Text style={S.sectionTitle}>Détails du trajet</Text>
          <View style={S.tableRow}><Text style={S.tableLabel}>Adresse de départ</Text><Text style={[S.tableVal, { flex: 2 }]}>{r.departure_address}</Text></View>
          <View style={S.dividerGray} />
          <View style={S.tableRow}><Text style={S.tableLabel}>Adresse d'arrivée</Text><Text style={[S.tableVal, { flex: 2 }]}>{r.arrival_address}</Text></View>
          <View style={S.dividerGray} />
          <View style={S.tableRow}><Text style={S.tableLabel}>Distance estimée</Text><Text style={S.tableVal}>{r.distance_km} km</Text></View>
          <View style={S.dividerGray} />
          <View style={S.tableRow}><Text style={S.tableLabel}>Durée estimée</Text><Text style={S.tableVal}>{r.duration_min} min</Text></View>
          <View style={S.dividerGray} />
          <View style={S.tableRow}><Text style={S.tableLabel}>Passagers</Text><Text style={S.tableVal}>{r.passengers}</Text></View>
          {r.luggage > 0 && (
            <>
              <View style={S.dividerGray} />
              <View style={S.tableRow}><Text style={S.tableLabel}>Bagages</Text><Text style={S.tableVal}>{r.luggage}</Text></View>
            </>
          )}
        </View>

        <View style={S.dividerBlue} />

        {/* Tarification */}
        <View>
          <Text style={S.sectionTitle}>Détail tarifaire</Text>
          <View style={S.tableRow}><Text style={S.tableLabel}>Prix de base</Text><Text style={S.tableVal}>{formatCurrency(r.base_price)}</Text></View>
          <View style={S.dividerGray} />
          <View style={S.tableRow}><Text style={S.tableLabel}>Acompte versé ({r.deposit_percentage}%)</Text><Text style={[S.tableVal, { color: '#059669' }]}>– {formatCurrency(r.deposit_amount)}</Text></View>
          <View style={S.dividerGray} />
          <View style={S.tableRow}><Text style={S.tableLabel}>Solde restant</Text><Text style={S.tableVal}>{formatCurrency(r.total_price - r.deposit_amount)}</Text></View>
          <View style={S.totalBox}>
            <Text style={S.totalLabel}>Total TTC</Text>
            <Text style={S.totalVal}>{formatCurrency(r.total_price)}</Text>
          </View>
        </View>

        {r.notes ? (
          <View style={S.noteBox}>
            <Text style={S.label}>Notes</Text>
            <Text style={{ fontSize: 9.5 }}>{r.notes}</Text>
          </View>
        ) : null}

        <Text style={S.footer}>
          {settings.company_name} — {settings.company_email} — {settings.company_phone} — {settings.company_address}
          {'\n'}Merci de votre confiance !
        </Text>
      </Page>
    </Document>
  );
}

export async function downloadInvoicePDF(data: InvoiceData): Promise<void> {
  const blob = await pdf(<InvoiceDoc d={data} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.invoiceNumber}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export type { InvoiceData };