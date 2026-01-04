-- Test update_lab_order_status RPC
SELECT public.update_lab_order_status(
    '1688a014-e19a-4d4e-bb29-43e06cc240ab'::UUID,
    'income_validation',
    'Test move'
)
