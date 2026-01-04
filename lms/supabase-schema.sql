-- ============================================
-- SCHEMA LMS PARA CHUMBI DIGITAL
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. PROFILES (extiende auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'vip')),
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para crear profile automaticamente al registrar usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. COURSES (catalogo de cursos)
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  long_description TEXT,
  thumbnail_url TEXT,
  price_tier TEXT DEFAULT 'free' CHECK (price_tier IN ('free', 'premium', 'vip')),
  price_amount DECIMAL(10,2) DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  estimated_hours INTEGER,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. LESSONS (lecciones por curso)
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  content_type TEXT DEFAULT 'video' CHECK (content_type IN ('video', 'text', 'mixed', 'quiz')),
  video_url TEXT,
  video_provider TEXT CHECK (video_provider IN ('youtube', 'vimeo', 'bunny', 'supabase', 'loom')),
  content_markdown TEXT,
  duration_minutes INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  is_free_preview BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, slug)
);

-- 4. LESSON_RESOURCES (recursos descargables)
CREATE TABLE public.lesson_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  resource_type TEXT CHECK (resource_type IN ('pdf', 'image', 'code', 'link', 'figma', 'notion')),
  file_url TEXT NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. USER_ENROLLMENTS (inscripciones)
CREATE TABLE public.user_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  payment_status TEXT DEFAULT 'free' CHECK (payment_status IN ('free', 'pending', 'completed', 'refunded')),
  stripe_payment_id TEXT,
  stripe_customer_id TEXT,
  completed_at TIMESTAMPTZ,
  certificate_id UUID,
  UNIQUE(user_id, course_id)
);

-- 6. LESSON_PROGRESS (progreso por leccion)
CREATE TABLE public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  last_video_position INTEGER DEFAULT 0,
  notes TEXT,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- 7. CERTIFICATES (certificados generados)
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  certificate_code TEXT UNIQUE NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  pdf_url TEXT,
  verification_url TEXT,
  metadata_json JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id, course_id)
);

-- 8. COURSE_REVIEWS (resenas de cursos)
CREATE TABLE public.course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;

-- Profiles: usuarios pueden ver y editar su propio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Courses: todos pueden ver cursos publicados
CREATE POLICY "Anyone can view published courses" ON public.courses
  FOR SELECT USING (is_published = TRUE);

-- Lessons: ver lecciones de cursos publicados
CREATE POLICY "View lessons of published courses" ON public.lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = lessons.course_id
      AND courses.is_published = TRUE
    )
  );

-- Resources: ver recursos de lecciones accesibles
CREATE POLICY "View resources of accessible lessons" ON public.lesson_resources
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.courses c ON c.id = l.course_id
      WHERE l.id = lesson_resources.lesson_id
      AND c.is_published = TRUE
    )
  );

-- Enrollments: usuarios gestionan sus propias inscripciones
CREATE POLICY "Users can view own enrollments" ON public.user_enrollments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own enrollments" ON public.user_enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own enrollments" ON public.user_enrollments
  FOR UPDATE USING (auth.uid() = user_id);

-- Progress: usuarios gestionan su propio progreso
CREATE POLICY "Users can view own progress" ON public.lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.lesson_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.lesson_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Certificates: usuarios ven sus certificados, publico puede verificar
CREATE POLICY "Users can view own certificates" ON public.certificates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can verify certificates by code" ON public.certificates
  FOR SELECT USING (TRUE);

-- Reviews: usuarios gestionan sus propias resenas
CREATE POLICY "Users can manage own reviews" ON public.course_reviews
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view approved reviews" ON public.course_reviews
  FOR SELECT USING (is_approved = TRUE);

-- ============================================
-- INDICES PARA PERFORMANCE
-- ============================================
CREATE INDEX idx_courses_slug ON public.courses(slug);
CREATE INDEX idx_courses_published ON public.courses(is_published) WHERE is_published = TRUE;
CREATE INDEX idx_lessons_course ON public.lessons(course_id, order_index);
CREATE INDEX idx_lessons_slug ON public.lessons(slug);
CREATE INDEX idx_enrollments_user ON public.user_enrollments(user_id);
CREATE INDEX idx_enrollments_course ON public.user_enrollments(course_id);
CREATE INDEX idx_progress_user ON public.lesson_progress(user_id);
CREATE INDEX idx_progress_lesson ON public.lesson_progress(lesson_id);
CREATE INDEX idx_certificates_code ON public.certificates(certificate_code);

-- ============================================
-- CURSO DE EJEMPLO (opcional)
-- ============================================
INSERT INTO public.courses (slug, title, description, price_tier, is_published, difficulty_level, estimated_hours, tags)
VALUES (
  'introduccion-al-dojo',
  'Introduccion al Dojo Digital',
  'Aprende los fundamentos del pensamiento creativo y la metodologia del dojo.',
  'free',
  TRUE,
  'beginner',
  2,
  ARRAY['fundamentos', 'creatividad', 'metodologia']
);

-- Lecciones del curso de ejemplo
INSERT INTO public.lessons (course_id, slug, title, content_type, content_markdown, duration_minutes, order_index, is_free_preview)
SELECT
  id,
  'bienvenida',
  'Bienvenida al Dojo',
  'text',
  '# Bienvenido al Dojo Digital

Este es el inicio de tu viaje. Aqui aprenderas a pensar de manera diferente.

## Lo que aprenderas

- Fundamentos del pensamiento creativo
- Metodologia del 1% diario
- Herramientas practicas

Sigue adelante, el camino apenas comienza.',
  5,
  1,
  TRUE
FROM public.courses WHERE slug = 'introduccion-al-dojo';

INSERT INTO public.lessons (course_id, slug, title, content_type, content_markdown, duration_minutes, order_index)
SELECT
  id,
  'mentalidad',
  'La Mentalidad del Aprendiz',
  'text',
  '# La Mentalidad del Aprendiz

Para crecer, primero debemos vaciar nuestra taza.

## Principios clave

1. **Curiosidad constante** - Nunca dejes de preguntar
2. **Humildad intelectual** - Acepta que no lo sabes todo
3. **Practica deliberada** - Mejora un 1% cada dia

> "En la mente del principiante hay muchas posibilidades, en la mente del experto hay pocas." - Shunryu Suzuki',
  10,
  2
FROM public.courses WHERE slug = 'introduccion-al-dojo';

INSERT INTO public.lessons (course_id, slug, title, content_type, content_markdown, duration_minutes, order_index)
SELECT
  id,
  'primeros-pasos',
  'Tus Primeros Pasos',
  'text',
  '# Tus Primeros Pasos

Ahora que conoces la mentalidad, es hora de actuar.

## Tu primera mision

1. Define un area de mejora
2. Comprometete a 5 minutos diarios
3. Registra tu progreso

Recuerda: pequenos pasos, grandes transformaciones.',
  8,
  3
FROM public.courses WHERE slug = 'introduccion-al-dojo';
