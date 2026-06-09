-- Step 0: Create contacts table if not exists
CREATE TABLE IF NOT EXISTS public.contacts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name text NOT NULL,
    phone text,
    email text,
    marketing_source text,
    interest_tags text[] DEFAULT '{}'::text[],
    status_mode text NOT NULL DEFAULT 'auto',
    status_effective text NOT NULL DEFAULT 'active',
    budget_min numeric,
    budget_max numeric,
    buyer_preferences jsonb,
    tenant_preferences jsonb,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Add basic RLS policies
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.contacts;
CREATE POLICY "Allow select for authenticated" ON public.contacts FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.contacts;
CREATE POLICY "Allow insert for authenticated" ON public.contacts FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update for authenticated" ON public.contacts;
CREATE POLICY "Allow update for authenticated" ON public.contacts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Temporarily disable the audit trigger (commented out as trigger doesn't exist on new table)
-- ALTER TABLE contacts DISABLE TRIGGER audit_contacts_write;

-- Step 1: Create contacts from leads that are referenced as property owners
INSERT INTO contacts (id, full_name, phone, email, marketing_source, interest_tags, status_mode, status_effective, created_by)
SELECT 
  l.id,
  l.name,
  l.phone,
  NULLIF(l.email, ''),
  l.lead_source,
  COALESCE(l.interest_tags, ARRAY[]::text[]),
  'auto',
  'active',
  l.agent_id
FROM leads l
WHERE l.id IN (
  SELECT DISTINCT owner_contact_id 
  FROM properties 
  WHERE owner_contact_id IS NOT NULL
)
AND NOT EXISTS (
  SELECT 1 FROM contacts c WHERE c.id = l.id
);

-- Re-enable the audit trigger (commented out as trigger doesn't exist on new table)
-- ALTER TABLE contacts ENABLE TRIGGER audit_contacts_write;

-- Step 2: Drop the old foreign key constraint
ALTER TABLE properties 
DROP CONSTRAINT IF EXISTS properties_owner_contact_id_fkey;

-- Step 3: Add new foreign key constraint pointing to contacts
ALTER TABLE properties
ADD CONSTRAINT properties_owner_contact_id_fkey 
FOREIGN KEY (owner_contact_id) 
REFERENCES contacts(id) 
ON DELETE SET NULL;