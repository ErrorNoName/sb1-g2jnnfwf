/*
  # Correction de la structure des créneaux horaires

  1. Tables
    - time_slots: Stockage des créneaux et réservations
    - profiles: Table de profils utilisateurs (nécessaire pour la vue)

  2. Améliorations
    - Meilleure gestion des contraintes
    - Index optimisés
    - Politiques RLS complètes
    - Vue performante
*/

-- Création de la table profiles si elle n'existe pas
CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username text NOT NULL,
    discord_id text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Active RLS sur profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politiques pour profiles
CREATE POLICY "Tout le monde peut lire les profils"
    ON profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Les utilisateurs peuvent gérer leur profil"
    ON profiles FOR ALL
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Table des créneaux horaires
CREATE TABLE time_slots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    discord_id text NOT NULL,
    start_time timestamptz NOT NULL,
    end_time timestamptz NOT NULL,
    is_booked boolean DEFAULT false,
    booked_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    booked_by_discord_id text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT valid_time_range CHECK (end_time > start_time),
    CONSTRAINT valid_booking CHECK (
        (is_booked = false AND booked_by IS NULL AND booked_by_discord_id IS NULL) OR
        (is_booked = true AND booked_by IS NOT NULL AND booked_by_discord_id IS NOT NULL)
    )
);

-- Active RLS sur time_slots
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;

-- Politiques pour time_slots
CREATE POLICY "Lecture des créneaux disponibles"
    ON time_slots FOR SELECT
    TO authenticated
    USING (
        is_booked = false OR 
        host_id = auth.uid() OR 
        booked_by = auth.uid()
    );

CREATE POLICY "Création de ses propres créneaux"
    ON time_slots FOR INSERT
    TO authenticated
    WITH CHECK (host_id = auth.uid());

CREATE POLICY "Modification de ses créneaux"
    ON time_slots FOR UPDATE
    TO authenticated
    USING (
        host_id = auth.uid() OR 
        (is_booked = false AND auth.uid() IN (SELECT id FROM profiles))
    );

CREATE POLICY "Suppression de ses créneaux"
    ON time_slots FOR DELETE
    TO authenticated
    USING (host_id = auth.uid() AND NOT is_booked);

-- Index optimisés
CREATE INDEX idx_time_slots_host_id ON time_slots(host_id);
CREATE INDEX idx_time_slots_start_time ON time_slots(start_time);
CREATE INDEX idx_time_slots_is_booked ON time_slots(is_booked);
CREATE INDEX idx_time_slots_booked_by ON time_slots(booked_by);
CREATE INDEX idx_time_slots_booking_status ON time_slots(is_booked, start_time) 
    WHERE start_time > now();

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_time_slots_updated_at
    BEFORE UPDATE ON time_slots
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Vue des créneaux disponibles
CREATE OR REPLACE VIEW available_slots AS
SELECT 
    ts.id,
    ts.host_id,
    ts.discord_id,
    ts.start_time,
    ts.end_time,
    ts.created_at,
    p.username as host_username
FROM time_slots ts
JOIN profiles p ON ts.host_id = p.id
WHERE NOT ts.is_booked
    AND ts.start_time > now()
ORDER BY ts.start_time ASC;