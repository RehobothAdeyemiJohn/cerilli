
-- Create Database Function to insert order that bypasses RLS
CREATE OR REPLACE FUNCTION public.insert_order(
  p_vehicleid UUID,
  p_dealerid UUID,
  p_customername TEXT,
  p_quoteid UUID DEFAULT NULL,
  p_status TEXT DEFAULT 'processing',
  p_orderdate TIMESTAMPTZ DEFAULT NOW(),
  p_deliverydate TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.orders(
    vehicleid, dealerid, customername, quoteid, status, orderdate, deliverydate
  )
  VALUES (
    p_vehicleId, p_dealerId, p_customerName, p_quoteId, p_status, p_orderDate, p_deliveryDate
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;
