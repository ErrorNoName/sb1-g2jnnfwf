/*
  # Mise à jour du schéma et des politiques

  1. Stockage
    - Configuration du bucket reports
    - Mise à jour des politiques de stockage

  2. Politiques
    - Mise à jour des politiques RLS
    - Ajout de la politique de suppression
    - Configuration du nettoyage automatique
*/

-- Configuration du stockage
DO $$ 
BEGIN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
        'reports',
        'reports',
        true,
        10485760,
        ARRAY['image/jpeg', 'image/png', 'image/gif', 'video/mp4']
    ) ON CONFLICT (id) DO UPDATE
    SET public = true,
        file_size_limit = 10485760,
        allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
END $$;

-- Mise à jour du trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recréation du trigger si nécessaire
DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Mise à jour des politiques RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Suppression des anciennes politiques
DROP POLICY IF EXISTS "Lecture pour utilisateurs authentifiés" ON reports;
DROP POLICY IF EXISTS "Création pour utilisateurs authentifiés" ON reports;
DROP POLICY IF EXISTS "Modification par le créateur" ON reports;
DROP POLICY IF EXISTS "Suppression par le créateur" ON reports;

-- Création des nouvelles politiques
CREATE POLICY "Lecture pour utilisateurs authentifiés"
    ON reports FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Création pour utilisateurs authentifiés"
    ON reports FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Modification par le créateur"
    ON reports FOR UPDATE
    TO authenticated
    USING (auth.uid() = reported_by)
    WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Suppression par le créateur"
    ON reports FOR DELETE
    TO authenticated
    USING (auth.uid() = reported_by);

-- Configuration du stockage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Suppression des anciennes politiques de stockage
DROP POLICY IF EXISTS "Upload pour authentifiés" ON storage.objects;
DROP POLICY IF EXISTS "Lecture publique" ON storage.objects;
DROP POLICY IF EXISTS "Gestion par le propriétaire" ON storage.objects;

-- Création des nouvelles politiques de stockage
CREATE POLICY "Upload pour authentifiés"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'reports');

CREATE POLICY "Lecture publique"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'reports');

CREATE POLICY "Gestion par le propriétaire"
    ON storage.objects FOR ALL
    TO authenticated
    USING (auth.uid() = owner)
    WITH CHECK (auth.uid() = owner);

-- Mise à jour de la fonction de nettoyage
CREATE OR REPLACE FUNCTION clean_report_files()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM storage.objects
    WHERE bucket_id = 'reports'
        AND name LIKE 'proofs/%'
        AND name LIKE '%' || split_part(OLD.proof_url, '/', -1);
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Recréation du trigger de nettoyage
DROP TRIGGER IF EXISTS cleanup_report_files ON reports;
CREATE TRIGGER cleanup_report_files
    BEFORE DELETE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION clean_report_files();