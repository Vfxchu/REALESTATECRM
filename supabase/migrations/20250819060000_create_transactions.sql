-- Create transactions table if not exists with initial schema
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id uuid NOT NULL REFERENCES public.leads(id),
    type text NOT NULL,
    amount numeric,
    currency text,
    status text,
    notes text,
    source_of_funds text,
    nationality text,
    id_type text,
    id_number text,
    id_expiry date,
    pep boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
