-- Create app_config table for global settings
CREATE TABLE IF NOT EXISTS public.app_config (
    key text PRIMARY KEY,
    value jsonb DEFAULT '{}'::jsonb,
    description text,
    updated_at timestamptz DEFAULT now(),
    updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Authenticated read access" ON public.app_config;
    DROP POLICY IF EXISTS "Super admin write access" ON public.app_config;
END $$;

CREATE POLICY "Authenticated read access" ON public.app_config
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Super admin write access" ON public.app_config
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- RPC to get config (helper)
CREATE OR REPLACE FUNCTION public.get_config(p_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN (SELECT value FROM public.app_config WHERE key = p_key);
END;
$$;

-- Seed Welcome Message Config
INSERT INTO public.app_config (key, value, description)
VALUES 
('welcome_message', '{
    "enabled": true,
    "style": "nano",
    "duration": 4000,
    "title": "Bienvenido de nuevo,",
    "subtitle": "Panel de Control listo."
}'::jsonb, 'Configuration for the login welcome toast')
ON CONFLICT (key) DO NOTHING;
