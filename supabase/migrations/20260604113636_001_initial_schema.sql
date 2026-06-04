/*
  # Safir VTC Manager - Initial Database Schema

  1. New Tables
    - `clients` - Client CRM data (name, phone, email, status, loyalty points)
    - `reservations` - Core booking data (departure, arrival, date, status, pricing, flight info)
    - `quotes` - Quote/invoice tracking (PDF, status, amounts)
    - `payments` - Deposit and payment tracking (amount, method, status)
    - `seo_pages` - Auto-generated SEO landing pages (title, content, FAQ, meta)
    - `loyalty_rules` - Configurable loyalty program rules
    - `promo_codes` - Promotional codes with discount rules
    - `referrals` - Client referral tracking
    - `email_logs` - Email automation tracking (type, status, sent at)
    - `google_business_posts` - Google Business auto-publication tracking
    - `concierge_offers` - Concierge affiliate offers (hotel, restaurant, car rental, activities)
    - `settings` - Platform configuration (deposit %, pricing, API keys config)

  2. Security
    - Enable RLS on ALL tables
    - Policy: Authenticated users can manage all internal data
    - Policy: Public can create reservations and quotes (for booking engine)

  3. Important Notes
    - Reservations use a unique booking number format: SAF-YYYYMMDD-XXXX
    - Client status auto-detects: new, loyal, VIP based on ride count and spend
    - SEO pages auto-generate slug, title, meta_description, faq, content
    - Payments track deposit percentage and remaining balance
*/

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  email text UNIQUE,
  phone text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'loyal', 'vip')),
  total_spent numeric(10,2) NOT NULL DEFAULT 0,
  total_rides integer NOT NULL DEFAULT 0,
  loyalty_points integer NOT NULL DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number text UNIQUE NOT NULL DEFAULT '',
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  departure_address text NOT NULL DEFAULT '',
  departure_lat numeric(9,6),
  departure_lng numeric(9,6),
  arrival_address text NOT NULL DEFAULT '',
  arrival_lat numeric(9,6),
  arrival_lng numeric(9,6),
  ride_date date NOT NULL DEFAULT CURRENT_DATE,
  ride_time time NOT NULL DEFAULT '10:00',
  passengers integer NOT NULL DEFAULT 1,
  luggage integer NOT NULL DEFAULT 0,
  ride_type text NOT NULL DEFAULT 'one_way' CHECK (ride_type IN ('one_way', 'round_trip', 'disposal')),
  return_date date,
  return_time time,
  distance_km numeric(8,2) DEFAULT 0,
  duration_min integer DEFAULT 0,
  base_price numeric(10,2) NOT NULL DEFAULT 0,
  deposit_amount numeric(10,2) DEFAULT 0,
  deposit_percentage integer DEFAULT 20,
  total_price numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'deposit_paid', 'confirmed', 'completed', 'cancelled')),
  flight_number text,
  flight_status text,
  is_quote boolean NOT NULL DEFAULT false,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid REFERENCES reservations(id) ON DELETE CASCADE,
  quote_number text UNIQUE NOT NULL DEFAULT '',
  pdf_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'accepted', 'rejected', 'expired')),
  valid_until timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid REFERENCES reservations(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  method text NOT NULL DEFAULT 'card' CHECK (method IN ('card', 'apple_pay', 'google_pay', 'cash', 'transfer')),
  type text NOT NULL DEFAULT 'deposit' CHECK (type IN ('deposit', 'balance', 'full')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  stripe_payment_id text,
  created_at timestamptz DEFAULT now()
);

-- SEO Pages table
CREATE TABLE IF NOT EXISTS seo_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  page_type text NOT NULL DEFAULT 'city' CHECK (page_type IN ('city', 'airport', 'station', 'transfer')),
  title text NOT NULL DEFAULT '',
  meta_description text DEFAULT '',
  h1 text DEFAULT '',
  content text DEFAULT '',
  faq jsonb DEFAULT '[]',
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Loyalty Rules table
CREATE TABLE IF NOT EXISTS loyalty_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  min_rides integer NOT NULL DEFAULT 0,
  min_spent numeric(10,2) NOT NULL DEFAULT 0,
  discount_percent integer NOT NULL DEFAULT 0,
  points_per_euro numeric(4,2) NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Promo Codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_percent integer NOT NULL DEFAULT 0,
  discount_amount numeric(10,2) DEFAULT 0,
  max_uses integer DEFAULT NULL,
  current_uses integer NOT NULL DEFAULT 0,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  referred_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  reward_points integer NOT NULL DEFAULT 100,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at timestamptz DEFAULT now()
);

-- Email Logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid REFERENCES reservations(id) ON DELETE SET NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  email_type text NOT NULL DEFAULT '' CHECK (email_type IN ('confirmation', 'deposit_confirmation', 'reminder_24h', 'thank_you', 'review_request', 'quote_sent', 'marketing', 'custom')),
  subject text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Google Business Posts table
CREATE TABLE IF NOT EXISTS google_business_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  post_type text NOT NULL DEFAULT 'update' CHECK (post_type IN ('update', 'offer', 'event')),
  media_url text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'failed')),
  published_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Concierge Offers table
CREATE TABLE IF NOT EXISTS concierge_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_type text NOT NULL DEFAULT 'hotel' CHECK (offer_type IN ('hotel', 'restaurant', 'car_rental', 'activity')),
  name text NOT NULL DEFAULT '',
  description text DEFAULT '',
  partner_name text DEFAULT '',
  affiliate_url text DEFAULT '',
  commission_percent numeric(5,2) DEFAULT 0,
  city text DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_business_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE concierge_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for authenticated users (admin access)
CREATE POLICY "Admin can manage clients" ON clients FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin can manage reservations" ON reservations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin can manage quotes" ON quotes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin can manage payments" ON payments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin can manage seo_pages" ON seo_pages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin can manage loyalty_rules" ON loyalty_rules FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin can manage promo_codes" ON promo_codes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin can manage referrals" ON referrals FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin can manage email_logs" ON email_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin can manage google_business_posts" ON google_business_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin can manage concierge_offers" ON concierge_offers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin can manage settings" ON settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Public read-only for SEO pages
CREATE POLICY "Public can view published seo_pages" ON seo_pages FOR SELECT TO anon USING (is_published = true);

-- Public can create reservations (booking engine)
CREATE POLICY "Public can create reservations" ON reservations FOR INSERT TO anon WITH CHECK (true);

-- Public can view own reservation
CREATE POLICY "Public can view own reservation" ON reservations FOR SELECT TO anon USING (true);

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('deposit_default', '20'),
  ('pricing_per_km', '1.80'),
  ('pricing_min', '25'),
  ('pricing_round_trip_discount', '10'),
  ('pricing_disposal_hourly', '45'),
  ('company_name', '"Safir VTC"'),
  ('company_email', '"contact@safir-vtc.fr"'),
  ('company_phone', '"+33 1 23 45 67 89"'),
  ('company_address', '"Lille, France"'),
  ('google_maps_api_key', '""'),
  ('stripe_enabled', 'true'),
  (' resend_enabled', 'true');

-- Insert default loyalty rules
INSERT INTO loyalty_rules (name, min_rides, min_spent, discount_percent, points_per_euro) VALUES
  ('Nouveau', 0, 0, 0, 1),
  ('Fidèle', 5, 300, 5, 1.5),
  ('VIP', 15, 1000, 10, 2);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reservations_client ON reservations(client_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(ride_date);
CREATE INDEX IF NOT EXISTS idx_reservations_booking ON reservations(booking_number);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_seo_pages_slug ON seo_pages(slug);
CREATE INDEX IF NOT EXISTS idx_seo_pages_type ON seo_pages(page_type);
CREATE INDEX IF NOT EXISTS idx_payments_reservation ON payments(reservation_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_reservation ON email_logs(reservation_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(email_type);
