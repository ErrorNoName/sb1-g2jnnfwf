/*
  # Création de la table des rapports d'avatars crash

  1. Structure
    - Table `avatar_crash_reports`
      - `id` (uuid, clé primaire)
      - `avatar_id` (text, ID VRChat)
      - `reported_by` (uuid, référence auth.users)
      - `created_at` (timestamp)

  2. Sécurité
    - Enable RLS
    - Politiques de lecture/écriture
*/

CREATE TABLE IF NOT EXISTS avatar_crash_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    avatar_id text NOT NULL CHECK (avatar_id ~ '^avtr_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
    reported_by uuid NOT NULL REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now()
);

ALTER TABLE avatar_crash_reports ENABLE ROW LEVEL SECURITY;

-- Politique de lecture pour utilisateurs authentifiés
CREATE POLICY "Lecture des rapports d'avatars"
    ON avatar_crash_reports FOR SELECT
    TO authenticated
    USING (true);

-- Politique de création pour utilisateurs authentifiés
CREATE POLICY "Création des rapports d'avatars"
    ON avatar_crash_reports FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = reported_by);