-- Sprint 2: Create logistics tables for routes and tracking
-- Description: Tables for delivery routes, courier assignments, and tracking

-- Table: courier_assignments
CREATE TABLE IF NOT EXISTS schema_lab.courier_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES schema_lab.orders(id) ON DELETE CASCADE,
    courier_id UUID REFERENCES schema_core.users(id),
    assignment_type TEXT CHECK (assignment_type IN ('pickup', 'delivery')),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courier_assignments_order ON schema_lab.courier_assignments(order_id);
CREATE INDEX IF NOT EXISTS idx_courier_assignments_courier ON schema_lab.courier_assignments(courier_id);
CREATE INDEX IF NOT EXISTS idx_courier_assignments_status ON schema_lab.courier_assignments(status);

-- Table: delivery_routes
CREATE TABLE IF NOT EXISTS schema_lab.delivery_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    courier_id UUID REFERENCES schema_core.users(id),
    route_name TEXT NOT NULL,
    route_date DATE NOT NULL,
    order_ids UUID[],
    optimized_sequence JSONB,
    total_distance_km DECIMAL(10,2),
    estimated_duration_minutes INTEGER,
    status TEXT CHECK (status IN ('draft', 'active', 'completed', 'cancelled')) DEFAULT 'draft',
    google_maps_url TEXT,
    google_maps_route_data JSONB,
    ai_optimization_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_routes_courier ON schema_lab.delivery_routes(courier_id);
CREATE INDEX IF NOT EXISTS idx_delivery_routes_date ON schema_lab.delivery_routes(route_date);
CREATE INDEX IF NOT EXISTS idx_delivery_routes_status ON schema_lab.delivery_routes(status);

-- Table: route_checkpoints
CREATE TABLE IF NOT EXISTS schema_lab.route_checkpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID REFERENCES schema_lab.delivery_routes(id) ON DELETE CASCADE,
    order_id UUID REFERENCES schema_lab.orders(id),
    checkpoint_type TEXT CHECK (checkpoint_type IN ('pickup', 'delivery')),
    sequence_number INTEGER NOT NULL,
    clinic_id UUID REFERENCES schema_medical.clinics(id),
    address TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    estimated_arrival TIMESTAMPTZ,
    actual_arrival TIMESTAMPTZ,
    status TEXT CHECK (status IN ('pending', 'arrived', 'completed', 'skipped')) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_route_checkpoints_route ON schema_lab.route_checkpoints(route_id);
CREATE INDEX IF NOT EXISTS idx_route_checkpoints_order ON schema_lab.route_checkpoints(order_id);
CREATE INDEX IF NOT EXISTS idx_route_checkpoints_status ON schema_lab.route_checkpoints(status);

-- Table: courier_locations (for real-time tracking)
CREATE TABLE IF NOT EXISTS schema_lab.courier_locations (
    courier_id UUID PRIMARY KEY REFERENCES schema_core.users(id) ON DELETE CASCADE,
    lat DECIMAL(10,8) NOT NULL,
    lng DECIMAL(11,8) NOT NULL,
    accuracy DECIMAL(10,2),
    heading DECIMAL(5,2),
    speed DECIMAL(5,2),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courier_locations_updated ON schema_lab.courier_locations(updated_at DESC);

-- Add comments
COMMENT ON TABLE schema_lab.courier_assignments IS 'Asignaciones de órdenes a mensajeros';
COMMENT ON TABLE schema_lab.delivery_routes IS 'Rutas de entrega optimizadas';
COMMENT ON TABLE schema_lab.route_checkpoints IS 'Puntos de parada en las rutas';
COMMENT ON TABLE schema_lab.courier_locations IS 'Ubicación en tiempo real de los mensajeros';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON schema_lab.courier_assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON schema_lab.delivery_routes TO authenticated;
GRANT SELECT, INSERT, UPDATE ON schema_lab.route_checkpoints TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON schema_lab.courier_locations TO authenticated;
