/*
  # Saved addresses for quick rebooking

  1. Changes
    - `clients.saved_addresses` — jsonb array of { id, label, address, lat, lng }
      the client manages from their space, used to prefill a new booking in
      one tap instead of retyping an address.
*/

ALTER TABLE clients ADD COLUMN IF NOT EXISTS saved_addresses jsonb NOT NULL DEFAULT '[]';
