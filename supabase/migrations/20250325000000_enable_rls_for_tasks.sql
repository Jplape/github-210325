-- Active les politiques RLS pour la table tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Politique de lecture : seules les tâches de l'utilisateur
CREATE POLICY "Enable read access for own tasks" 
ON public.tasks FOR SELECT
USING (auth.uid() = user_id);

-- Politique d'insertion : seulement pour les utilisateurs authentifiés
CREATE POLICY "Enable insert for authenticated users"
ON public.tasks FOR INSERT
TO authenticated
WITH CHECK (true);

-- Politique de mise à jour : seulement pour le propriétaire
CREATE POLICY "Enable update for task owner"
ON public.tasks FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Politique de suppression : seulement pour le propriétaire
CREATE POLICY "Enable delete for task owner" 
ON public.tasks FOR DELETE
USING (auth.uid() = user_id);