-- Payment processing tables for Empire Performance Coaching
-- These should be created in your Supabase database

-- Payment intents table
CREATE TABLE IF NOT EXISTS payment_intents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    amount INTEGER NOT NULL, -- Amount in pence (GBP)
    currency VARCHAR(3) DEFAULT 'gbp' NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}' NOT NULL,
    client_secret TEXT UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'requires_payment_method' NOT NULL,
    stripe_payment_intent_id VARCHAR(255) UNIQUE, -- Actual Stripe PI ID when using real Stripe
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    confirmed_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Update the bookings table to include payment information
-- This assumes you already have a bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS payment_intent_id UUID REFERENCES payment_intents(id),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending' NOT NULL,
ADD COLUMN IF NOT EXISTS total_amount INTEGER, -- Amount in pence
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;

-- Payment status can be: pending, paid, failed, refunded, partially_refunded

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON payment_intents(status);
CREATE INDEX IF NOT EXISTS idx_payment_intents_stripe_id ON payment_intents(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_intent ON bookings(payment_intent_id);

-- Row Level Security (RLS) policies
ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own payment intents
CREATE POLICY "Users can view own payment intents" ON payment_intents
    FOR SELECT USING (
        metadata->>'playerId' = auth.uid()::text
        OR metadata->>'playerId' = (SELECT id::text FROM auth.users WHERE id = auth.uid())
    );

-- Policy: Only authenticated users can create payment intents
CREATE POLICY "Authenticated users can create payment intents" ON payment_intents
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Only system/admin can update payment intents (for webhook updates)
CREATE POLICY "System can update payment intents" ON payment_intents
    FOR UPDATE USING (auth.role() = 'service_role');

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payment_intents_updated_at
    BEFORE UPDATE ON payment_intents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a view for payment analytics
CREATE OR REPLACE VIEW payment_analytics AS
SELECT
    DATE_TRUNC('day', created_at) as payment_date,
    COUNT(*) as total_payments,
    COUNT(CASE WHEN status = 'succeeded' THEN 1 END) as successful_payments,
    COUNT(CASE WHEN status = 'requires_payment_method' THEN 1 END) as pending_payments,
    COUNT(CASE WHEN status = 'payment_failed' THEN 1 END) as failed_payments,
    SUM(CASE WHEN status = 'succeeded' THEN amount ELSE 0 END) as total_revenue_pence,
    ROUND(SUM(CASE WHEN status = 'succeeded' THEN amount ELSE 0 END) / 100.0, 2) as total_revenue_gbp
FROM payment_intents
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY payment_date DESC;

-- Create a function to safely create payment intents
CREATE OR REPLACE FUNCTION create_payment_intent(
    p_amount INTEGER,
    p_currency VARCHAR(3),
    p_description TEXT,
    p_metadata JSONB
)
RETURNS payment_intents AS $$
DECLARE
    result payment_intents;
    client_secret TEXT;
BEGIN
    -- Generate a mock client secret (replace with actual Stripe integration)
    client_secret := 'pi_' || EXTRACT(EPOCH FROM NOW())::bigint || '_secret_' ||
                    substr(md5(random()::text), 1, 10);

    INSERT INTO payment_intents (
        amount,
        currency,
        description,
        metadata,
        client_secret
    ) VALUES (
        p_amount,
        p_currency,
        p_description,
        p_metadata,
        client_secret
    ) RETURNING * INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT ON payment_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION create_payment_intent TO authenticated;