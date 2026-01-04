-- ============================================
-- CONFIGURACION DE ADMIN PARA LMS
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. Agregar columna de rol a profiles (si no existe)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'
CHECK (role IN ('user', 'admin', 'instructor'));

-- 2. Crear indice para busquedas por rol
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 3. Funcion para verificar si usuario es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'instructor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Politicas para que ADMIN pueda gestionar cursos
-- Primero eliminamos politicas existentes si hay conflicto
DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can insert courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can update courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can delete courses" ON public.courses;

-- Admin puede ver todos los cursos (publicados o no)
CREATE POLICY "Admins can view all courses" ON public.courses
  FOR SELECT USING (
    is_published = TRUE
    OR public.is_admin()
  );

-- Admin puede insertar cursos
CREATE POLICY "Admins can insert courses" ON public.courses
  FOR INSERT WITH CHECK (public.is_admin());

-- Admin puede actualizar cursos
CREATE POLICY "Admins can update courses" ON public.courses
  FOR UPDATE USING (public.is_admin());

-- Admin puede eliminar cursos
CREATE POLICY "Admins can delete courses" ON public.courses
  FOR DELETE USING (public.is_admin());

-- 5. Politicas para que ADMIN pueda gestionar lecciones
DROP POLICY IF EXISTS "Admins can manage lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can insert lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can update lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can delete lessons" ON public.lessons;

-- Admin puede ver todas las lecciones
CREATE POLICY "Admins can view all lessons" ON public.lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = lessons.course_id
      AND courses.is_published = TRUE
    )
    OR public.is_admin()
  );

-- Admin puede insertar lecciones
CREATE POLICY "Admins can insert lessons" ON public.lessons
  FOR INSERT WITH CHECK (public.is_admin());

-- Admin puede actualizar lecciones
CREATE POLICY "Admins can update lessons" ON public.lessons
  FOR UPDATE USING (public.is_admin());

-- Admin puede eliminar lecciones
CREATE POLICY "Admins can delete lessons" ON public.lessons
  FOR DELETE USING (public.is_admin());

-- 6. Politicas para recursos
DROP POLICY IF EXISTS "Admins can manage resources" ON public.lesson_resources;

CREATE POLICY "Admins can manage resources" ON public.lesson_resources
  FOR ALL USING (public.is_admin());

-- 7. Politica para que admin vea todos los enrollments
DROP POLICY IF EXISTS "Admins can view all enrollments" ON public.user_enrollments;

CREATE POLICY "Admins can view all enrollments" ON public.user_enrollments
  FOR SELECT USING (
    auth.uid() = user_id
    OR public.is_admin()
  );

-- 8. Politica para que admin vea todos los profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    auth.uid() = user_id
    OR public.is_admin()
  );

-- ============================================
-- HACER ADMIN A UN USUARIO
-- Reemplaza 'tu-email@ejemplo.com' con tu email
-- ============================================

UPDATE public.profiles
SET role = 'admin'
WHERE user_id = (
  SELECT id FROM auth.users
  WHERE email = 'tu-email@ejemplo.com'
);

-- Para verificar que funciono:
-- SELECT * FROM public.profiles WHERE role = 'admin';

-- ============================================
-- NOTA: Si aun no tienes un usuario registrado,
-- primero registrate en el LMS y luego ejecuta
-- el UPDATE de arriba con tu email real.
-- ============================================
