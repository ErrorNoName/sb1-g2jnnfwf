/*
  # Optimisation du système de réservation

  1. Nouvelles tables
    - profiles: Stockage des informations utilisateur
    - time_slots: Refonte avec meilleures contraintes

  2. Sécurité
    - Politiques RLS optimisées
    - Validation des données renforcée

  3. Performance
    - Index optimisés sans fonctions non-IMMUTABLE
    - Contraintes de validation
*/

-- Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id),
    username text NOT NULL,
    discord_id text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT valid_discord_id CHECK (discord_id ~ '^.+#[0-9]{4}$')
);

-- Activation RLS pour profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Suppression des politiques existantes si elles existent
DROP POLICY IF EXISTS "Users can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Création des nouvelles politiques
CREATE POLICY "Users can read all profiles"
    ON profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid());

-- Refonte de time_slots
DROP TABLE IF EXISTS time_slots CASCADE;
CREATE TABLE time_slots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id uuid NOT NULL REFERENCES profiles(id),
    guest_id uuid REFERENCES profiles(id),
    start_time timestamptz NOT NULL,
    end_time timestamptz NOT NULL,
    is_booked boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT valid_time_range CHECK (
        start_time < end_time AND
        EXTRACT(EPOCH FROM (end_time - start_time)) <= 7200
    )
);

-- Activation RLS pour time_slots
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;

-- Index optimisés (sans CURRENT_TIMESTAMP dans les prédicats)
CREATE INDEX idx_time_slots_host ON time_slots(host_id);
CREATE INDEX idx_time_slots_availability ON time_slots(is_booked, start_time);
CREATE INDEX idx_time_slots_guest ON time_slots(guest_id)
    WHERE guest_id IS NOT NULL;

-- Suppression des politiques existantes si elles existent
DROP POLICY IF EXISTS "Users can view available or relevant slots" ON time_slots;
DROP POLICY IF EXISTS "Users can create their own slots" ON time_slots;
DROP POLICY IF EXISTS "Hosts can manage their slots" ON time_slots;
DROP POLICY IF EXISTS "Guests can book available slots" ON time_slots;

-- Création des nouvelles politiques
CREATE POLICY "Users can view available or relevant slots"
    ON time_slots FOR SELECT
    TO authenticated
    USING (
        NOT is_booked OR
        host_id = auth.uid() OR
        guest_id = auth.uid()
    );

CREATE POLICY "Users can create their own slots"
    ON time_slots FOR INSERT
    TO authenticated
    WITH CHECK (host_id = auth.uid());

CREATE POLICY "Hosts can manage their slots"
    ON time_slots FOR UPDATE
    TO authenticated
    USING (host_id = auth.uid());

CREATE POLICY "Guests can book available slots"
    ON time_slots FOR UPDATE
    TO authenticated
    USING (
        NOT is_booked AND
        start_time >= CURRENT_TIMESTAMP
    )
    WITH CHECK (guest_id = auth.uid());

-- Suppression de la fonction si elle existe
DROP FUNCTION IF EXISTS update_timestamp CASCADE;

-- Création de la fonction de mise à jour
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language plpgsql;

-- Suppression des triggers s'ils existent
DROP TRIGGER IF EXISTS update_profiles_timestamp ON profiles;
DROP TRIGGER IF EXISTS update_time_slots_timestamp ON time_slots;

-- Création des triggers
CREATE TRIGGER update_profiles_timestamp
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_time_slots_timestamp
    BEFORE UPDATE ON time_slots
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Suppression de la vue si elle existe
DROP VIEW IF EXISTS available_slots;

-- Création de la vue
CREATE VIEW available_slots AS
SELECT 
    ts.*,
    p.username as host_username,
    p.discord_id as host_discord_id
FROM time_slots ts
JOIN profiles p ON p.id = ts.host_id
WHERE 
    NOT ts.is_booked AND 
    ts.start_time >= CURRENT_TIMESTAMP
ORDER BY ts.start_time;

COMMENT ON TABLE profiles IS 'Profils utilisateurs avec informations Discord';
COMMENT ON TABLE time_slots IS 'Créneaux horaires pour les rendez-vous';
COMMENT ON VIEW available_slots IS 'Vue des créneaux disponibles avec informations hôte';