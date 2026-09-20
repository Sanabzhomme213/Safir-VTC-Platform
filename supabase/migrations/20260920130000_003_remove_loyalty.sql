/*
  # Remove loyalty program

  1. Changes
    - Drops the `loyalty_rules` table (points/discount tiers admin config).
    - Drops `clients.loyalty_points`.

  2. Notes
    - The generic `clients.status` tier ('new' | 'loyal' | 'vip') is kept —
      it's a rides/spend-based CRM segmentation used for filtering and
      badges, independent of the points/rewards program being removed here.
*/

DROP TABLE IF EXISTS loyalty_rules;
ALTER TABLE clients DROP COLUMN IF EXISTS loyalty_points;
