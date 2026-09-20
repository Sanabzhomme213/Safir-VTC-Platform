/*
  # Payment links for pending reservations

  1. Changes
    - `reservations.payment_token` — random token used to build a shareable
      payment link (e.g. /payer/:id?t=:token) sent to the client by SMS/email
      when they book without paying immediately.
    - `reservations.payment_link_sent_at` — last time a payment link was sent,
      shown to the admin in the dashboard.

  2. Notes
    - The token is not a strong access-control boundary on its own (the
      `reservations` table already allows public SELECT by design for the
      booking engine), but it avoids trivially guessable payment URLs.
*/

ALTER TABLE reservations ADD COLUMN IF NOT EXISTS payment_token text;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS payment_link_sent_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS idx_reservations_payment_token ON reservations(payment_token) WHERE payment_token IS NOT NULL;
