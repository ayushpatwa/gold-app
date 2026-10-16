-- ========================================================================
-- RAMCHANDRA AND SONS JEWELLERS - PHASE 1 DATABASE SCHEMA & ENGINE
-- Target: Supabase / PostgreSQL
-- Features: Row Level Security (RLS), Realtime Publication, Auto-Calculation Trigger
-- ========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------
-- 1. TABLE: market_base_rates
-- Stores raw spot prices ingested from external feeds (MCX, Kitco, LBMA)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.market_base_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gold_usd NUMERIC(10, 2) NOT NULL,            -- e.g. 4153.99
    silver_usd NUMERIC(10, 2) NOT NULL,          -- e.g. 57.08
    gold_inr_base NUMERIC(12, 2) NOT NULL,       -- MCX/IBJA Base 10g INR (e.g. 147420.00)
    silver_inr_base NUMERIC(12, 2) NOT NULL,     -- MCX/IBJA Base 1kg INR (e.g. 210751.00)
    usd_inr NUMERIC(8, 4) NOT NULL DEFAULT 86.5000,
    source VARCHAR(50) DEFAULT 'MCX_IBJA_LIVE',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 2. TABLE: rate_configurations
-- Admin offsets, margins, formulas, and manual override controls
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rate_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_name VARCHAR(100) NOT NULL DEFAULT 'Kasganj Showroom Standard',
    gold_999_offset NUMERIC(10, 2) NOT NULL DEFAULT 3293.00,      -- Added to gold_inr_base
    silver_bank_offset NUMERIC(10, 2) NOT NULL DEFAULT 5530.00,   -- Added to silver_inr_base
    local_mohar_offset NUMERIC(10, 2) NOT NULL DEFAULT 2163.00,   -- Subtracted from Gold 999
    silver_coin_10g_margin NUMERIC(10, 2) NOT NULL DEFAULT 52.00, -- Coin premium on 10g silver
    bid_ask_spread NUMERIC(10, 2) NOT NULL DEFAULT 80.00,         -- Spread around base
    is_manual_override BOOLEAN NOT NULL DEFAULT FALSE,
    override_gold_rate NUMERIC(12, 2) NULL,
    override_silver_rate NUMERIC(12, 2) NULL,
    store_notice TEXT NOT NULL DEFAULT 'Indicative rates only. Confirm at store. We don’t sell bullion.',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 3. TABLE: live_bullion_rates
-- Final calculated rates for client applications to stream via Realtime
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.live_bullion_rates (
    id VARCHAR(50) PRIMARY KEY,                   -- 'gold-999', 'silver-bank', 'kasganj-mohar', 'silver-coin-10gm'
    symbol VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    purity VARCHAR(50) NOT NULL,
    unit VARCHAR(20) NOT NULL,                    -- '10 gm', '1 kg'
    price NUMERIC(12, 2) NOT NULL,
    previous_price NUMERIC(12, 2) NOT NULL,
    diff NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    direction VARCHAR(10) NOT NULL DEFAULT 'up',  -- 'up', 'down', 'unchanged'
    badge_style VARCHAR(20) NOT NULL DEFAULT 'plain', -- 'accent', 'green', 'plain'
    sort_order INT NOT NULL DEFAULT 0,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 4. TABLE: live_spread_rates
-- Real-time Bid / Ask spread rows for client table
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.live_spread_rates (
    id VARCHAR(50) PRIMARY KEY,
    source VARCHAR(50) NOT NULL,
    bid NUMERIC(12, 2) NOT NULL,
    ask NUMERIC(12, 2) NOT NULL,
    bid_formatted VARCHAR(50) NOT NULL,
    ask_formatted VARCHAR(50) NOT NULL,
    bid_status VARCHAR(20) DEFAULT 'soft-red',    -- 'soft-red', 'soft-green'
    ask_status VARCHAR(20) DEFAULT 'soft-green',
    is_currency BOOLEAN DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 0,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 5. TABLE: jewellery_products
-- Gallery catalog items for Ramchandra and Sons Jewellers
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.jewellery_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_code VARCHAR(100) UNIQUE NOT NULL,  -- e.g. 'RSJ-NK-033'
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,               -- 'Necklaces', 'Earrings', 'Bangles', 'Rings', 'Silver'
    collection VARCHAR(100) NOT NULL DEFAULT 'Gold',
    gender VARCHAR(20) NOT NULL DEFAULT 'Female',
    purity VARCHAR(50) NOT NULL,                  -- '14K', '18K', '22K', '24K', '925 Silver'
    gross_weight NUMERIC(8, 3) NOT NULL,          -- in grams (e.g. 103.840)
    net_weight NUMERIC(8, 3) NOT NULL,            -- in grams (e.g. 83.620)
    diamond_weight NUMERIC(6, 2) DEFAULT 0.00,    -- in carats (e.g. 15.03)
    stone_weight NUMERIC(6, 2) DEFAULT 0.00,      -- in carats (e.g. 86.07)
    description TEXT,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,    -- Array of photo URLs
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    availability_note TEXT DEFAULT 'Contact the showroom to confirm availability.',
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- Public can read live rates & products; only authenticated admin can write
-- ------------------------------------------------------------------------
ALTER TABLE public.market_base_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_bullion_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_spread_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jewellery_products ENABLE ROW LEVEL SECURITY;

-- Public READ policies
CREATE POLICY "Public can view market base rates" ON public.market_base_rates FOR SELECT USING (true);
CREATE POLICY "Public can view rate configurations" ON public.rate_configurations FOR SELECT USING (true);
CREATE POLICY "Public can view live bullion rates" ON public.live_bullion_rates FOR SELECT USING (true);
CREATE POLICY "Public can view live spread rates" ON public.live_spread_rates FOR SELECT USING (true);
CREATE POLICY "Public can view jewellery products" ON public.jewellery_products FOR SELECT USING (true);

-- Admin WRITE policies (using auth.uid() or service role)
CREATE POLICY "Admins can update configurations" ON public.rate_configurations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage products" ON public.jewellery_products FOR ALL USING (auth.role() = 'authenticated');

-- ------------------------------------------------------------------------
-- AUTOMATIC HYBRID CALCULATION TRIGGER IN POSTGRESQL
-- Runs whenever market_base_rates or rate_configurations are updated
-- ------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.compute_and_sync_live_rates()
RETURNS TRIGGER AS $$
DECLARE
    v_base RECORD;
    v_cfg RECORD;
    v_gold_999 NUMERIC(12, 2);
    v_silver_bank NUMERIC(12, 2);
    v_kasganj_mohar NUMERIC(12, 2);
    v_silver_coin NUMERIC(12, 2);
    v_spread_half NUMERIC(10, 2);
    v_prev_price NUMERIC(12, 2);
    v_diff NUMERIC(10, 2);
    v_dir VARCHAR(10);
BEGIN
    -- Fetch the most recent base rates and configurations
    SELECT * INTO v_base FROM public.market_base_rates ORDER BY updated_at DESC LIMIT 1;
    SELECT * INTO v_cfg FROM public.rate_configurations LIMIT 1;

    IF v_base IS NULL OR v_cfg IS NULL THEN
        RETURN NEW;
    END IF;

    -- 1. Compute Base Gold & Silver with manual override checks
    IF v_cfg.is_manual_override AND v_cfg.override_gold_rate IS NOT NULL THEN
        v_gold_999 := v_cfg.override_gold_rate;
    ELSE
        -- Formula 1: Final Gold 999 = base_gold_inr + gold_999_offset
        v_gold_999 := v_base.gold_inr_base + v_cfg.gold_999_offset;
    END IF;

    IF v_cfg.is_manual_override AND v_cfg.override_silver_rate IS NOT NULL THEN
        v_silver_bank := v_cfg.override_silver_rate;
    ELSE
        -- Formula 2: Final Silver Bank = base_silver_inr + silver_bank_offset
        v_silver_bank := v_base.silver_inr_base + v_cfg.silver_bank_offset;
    END IF;

    -- Formula 3: Kasganj Mohar = Final Gold 999 - local_mohar_offset
    v_kasganj_mohar := v_gold_999 - v_cfg.local_mohar_offset;

    -- Formula 4: Silver Coin 10gm = (Final Silver Bank / 100) + silver_coin_10g_margin
    v_silver_coin := ROUND((v_silver_bank / 100.0) + v_cfg.silver_coin_10g_margin);

    v_spread_half := ROUND(v_cfg.bid_ask_spread / 2.0);

    -- Helper procedure for updating or inserting live_bullion_rates
    -- 1) Gold 999
    SELECT price INTO v_prev_price FROM public.live_bullion_rates WHERE id = 'gold-999';
    IF v_prev_price IS NULL THEN v_prev_price := v_gold_999 - 1630.00; END IF;
    v_diff := ABS(v_gold_999 - v_prev_price);
    IF v_gold_999 >= v_prev_price THEN v_dir := 'up'; ELSE v_dir := 'down'; END IF;

    INSERT INTO public.live_bullion_rates (id, symbol, name, purity, unit, price, previous_price, diff, direction, badge_style, sort_order, last_updated)
    VALUES ('gold-999', 'GOLD999', 'Gold 999', '24K 99.9%', '10 gm', v_gold_999, v_prev_price, v_diff, v_dir, 'accent', 1, NOW())
    ON CONFLICT (id) DO UPDATE SET
        price = EXCLUDED.price,
        previous_price = EXCLUDED.previous_price,
        diff = EXCLUDED.diff,
        direction = EXCLUDED.direction,
        last_updated = NOW();

    -- 2) Silver Bank
    SELECT price INTO v_prev_price FROM public.live_bullion_rates WHERE id = 'silver-bank';
    IF v_prev_price IS NULL THEN v_prev_price := v_silver_bank - 3732.00; END IF;
    v_diff := ABS(v_silver_bank - v_prev_price);
    IF v_silver_bank >= v_prev_price THEN v_dir := 'up'; ELSE v_dir := 'down'; END IF;

    INSERT INTO public.live_bullion_rates (id, symbol, name, purity, unit, price, previous_price, diff, direction, badge_style, sort_order, last_updated)
    VALUES ('silver-bank', 'SILVERBANK', 'Silver Bank', '99.9% Fine', '1 kg', v_silver_bank, v_prev_price, v_diff, v_dir, 'green', 2, NOW())
    ON CONFLICT (id) DO UPDATE SET
        price = EXCLUDED.price,
        previous_price = EXCLUDED.previous_price,
        diff = EXCLUDED.diff,
        direction = EXCLUDED.direction,
        last_updated = NOW();

    -- 3) Kasganj Mohar
    SELECT price INTO v_prev_price FROM public.live_bullion_rates WHERE id = 'kasganj-mohar';
    IF v_prev_price IS NULL THEN v_prev_price := v_kasganj_mohar - 3694.00; END IF;
    v_diff := ABS(v_kasganj_mohar - v_prev_price);
    IF v_kasganj_mohar >= v_prev_price THEN v_dir := 'up'; ELSE v_dir := 'down'; END IF;

    INSERT INTO public.live_bullion_rates (id, symbol, name, purity, unit, price, previous_price, diff, direction, badge_style, sort_order, last_updated)
    VALUES ('kasganj-mohar', 'KASGANJMOHAR', 'Kasganj Mohar', 'Local Hallmark', '10 gm', v_kasganj_mohar, v_prev_price, v_diff, v_dir, 'green', 3, NOW())
    ON CONFLICT (id) DO UPDATE SET
        price = EXCLUDED.price,
        previous_price = EXCLUDED.previous_price,
        diff = EXCLUDED.diff,
        direction = EXCLUDED.direction,
        last_updated = NOW();

    -- 4) Silver Coin 10gm
    SELECT price INTO v_prev_price FROM public.live_bullion_rates WHERE id = 'silver-coin-10gm';
    IF v_prev_price IS NULL THEN v_prev_price := v_silver_coin - 40.00; END IF;
    v_diff := ABS(v_silver_coin - v_prev_price);
    IF v_silver_coin >= v_prev_price THEN v_dir := 'up'; ELSE v_dir := 'down'; END IF;

    INSERT INTO public.live_bullion_rates (id, symbol, name, purity, unit, price, previous_price, diff, direction, badge_style, sort_order, last_updated)
    VALUES ('silver-coin-10gm', 'SILVERCOIN10G', 'Silver Coin 10gm', '999 Fine', '10 gm', v_silver_coin, v_prev_price, v_diff, v_dir, 'plain', 4, NOW())
    ON CONFLICT (id) DO UPDATE SET
        price = EXCLUDED.price,
        previous_price = EXCLUDED.previous_price,
        diff = EXCLUDED.diff,
        direction = EXCLUDED.direction,
        last_updated = NOW();

    -- 5) Update Live Spreads Table
    INSERT INTO public.live_spread_rates (id, source, bid, ask, bid_formatted, ask_formatted, bid_status, ask_status, is_currency, sort_order, last_updated)
    VALUES
    ('spread-silver', 'Silver', v_base.silver_inr_base, v_base.silver_inr_base + v_cfg.bid_ask_spread,
     TO_CHAR(v_base.silver_inr_base, 'FM99,99,999'), TO_CHAR(v_base.silver_inr_base + v_cfg.bid_ask_spread, 'FM99,99,999'),
     'soft-red', 'soft-green', false, 1, NOW()),

    ('spread-gold', 'Gold', v_base.gold_inr_base, v_base.gold_inr_base + 52.00,
     TO_CHAR(v_base.gold_inr_base, 'FM99,99,999'), TO_CHAR(v_base.gold_inr_base + 52.00, 'FM99,99,999'),
     'soft-green', 'soft-red', false, 2, NOW()),

    ('spread-gold-usd', 'Gold ($)', v_base.gold_usd, v_base.gold_usd + 0.32,
     TO_CHAR(v_base.gold_usd, 'FM99,990.00'), TO_CHAR(v_base.gold_usd + 0.32, 'FM99,990.00'),
     'soft-red', 'soft-red', false, 3, NOW()),

    ('spread-silver-usd', 'Silver ($)', v_base.silver_usd, v_base.silver_usd + 0.02,
     TO_CHAR(v_base.silver_usd, 'FM990.00'), TO_CHAR(v_base.silver_usd + 0.02, 'FM990.00'),
     'soft-red', 'soft-red', false, 4, NOW()),

    ('spread-inr', 'INR', 95.05, 95.09, '95.05', '95.09', 'plain', 'plain', true, 5, NOW())
    ON CONFLICT (id) DO UPDATE SET
        bid = EXCLUDED.bid,
        ask = EXCLUDED.ask,
        bid_formatted = EXCLUDED.bid_formatted,
        ask_formatted = EXCLUDED.ask_formatted,
        bid_status = EXCLUDED.bid_status,
        ask_status = EXCLUDED.ask_status,
        last_updated = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach triggers to both base rates and configurations
DROP TRIGGER IF EXISTS trigger_compute_on_base_rates ON public.market_base_rates;
CREATE TRIGGER trigger_compute_on_base_rates
AFTER INSERT OR UPDATE ON public.market_base_rates
FOR EACH STATEMENT EXECUTE FUNCTION public.compute_and_sync_live_rates();

DROP TRIGGER IF EXISTS trigger_compute_on_configs ON public.rate_configurations;
CREATE TRIGGER trigger_compute_on_configs
AFTER INSERT OR UPDATE ON public.rate_configurations
FOR EACH STATEMENT EXECUTE FUNCTION public.compute_and_sync_live_rates();

-- Enable Supabase Realtime publication for the live tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_bullion_rates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_spread_rates;

-- ------------------------------------------------------------------------
-- SEED INITIAL DATA
-- ------------------------------------------------------------------------
INSERT INTO public.market_base_rates (gold_usd, silver_usd, gold_inr_base, silver_inr_base, usd_inr, source)
VALUES (4153.99, 57.08, 147420.00, 210751.00, 86.5000, 'MCX_IBJA_LIVE');

INSERT INTO public.rate_configurations (config_name, gold_999_offset, silver_bank_offset, local_mohar_offset, silver_coin_10g_margin, bid_ask_spread, is_manual_override)
VALUES ('Kasganj Showroom Standard', 3293.00, 5530.00, 2163.00, 52.00, 80.00, false);

-- Run initial compute once
SELECT public.compute_and_sync_live_rates();
