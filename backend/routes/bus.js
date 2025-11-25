import express from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

const busSchema = z.object({
  number_plate: z.string().min(1),
  capacity: z.number().int().positive(),
  route_id: z.number().int().optional().nullable(),
  driver_id: z.number().int().optional().nullable(),
  tracking_enabled: z.boolean().optional(),
  status: z.enum(['active', 'inactive', 'maintenance', 'out_of_service']).optional(),
});

// Get all buses
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query = supabase.from('buses').select('*, routes(*)');

    // Drivers can only see their assigned bus
    if (req.user.role === 'driver') {
      const { data: driverBus } = await supabase
        .from('buses')
        .select('id')
        .eq('driver_id', req.user.id)
        .single();

      if (!driverBus) {
        return res.json({ buses: [] });
      }

      query = query.eq('id', driverBus.id);
    }

    const { data: buses, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Fetch driver information separately if needed
    const busesWithDrivers = await Promise.all(
      (buses || []).map(async (bus) => {
        if (bus.driver_id) {
          const { data: driver } = await supabase
            .from('users')
            .select('id, name, email')
            .eq('id', bus.driver_id)
            .single();
          return { ...bus, driver: driver || null };
        }
        return { ...bus, driver: null };
      })
    );

    res.json({ buses: busesWithDrivers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single bus
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    let query = supabase
      .from('buses')
      .select('*, routes(*)')
      .eq('id', req.params.id);

    // Drivers can only see their assigned bus
    if (req.user.role === 'driver') {
      query = query.eq('driver_id', req.user.id);
    }

    const { data: bus, error } = await query.single();

    if (error) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    // Fetch driver information if needed
    if (bus.driver_id) {
      const { data: driver } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('id', bus.driver_id)
        .single();
      bus.driver = driver || null;
    } else {
      bus.driver = null;
    }

    res.json({ bus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create bus (admin only)
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const validatedData = busSchema.parse(req.body);
    const { data: bus, error } = await supabase
      .from('buses')
      .insert(validatedData)
      .select('*, routes(*)')
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Fetch driver information if needed
    if (bus.driver_id) {
      const { data: driver } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('id', bus.driver_id)
        .single();
      bus.driver = driver || null;
    } else {
      bus.driver = null;
    }

    res.status(201).json({ bus });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update bus
// - Admins can update any bus with any fields
// - Drivers can only update their assigned bus's tracking_enabled field
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const busId = parseInt(req.params.id);
    
    // Check if user is driver
    if (req.user.role === 'driver') {
      // Verify driver is assigned to this bus
      const { data: driverBus } = await supabase
        .from('buses')
        .select('id, driver_id')
        .eq('id', busId)
        .eq('driver_id', req.user.id)
        .single();

      if (!driverBus) {
        return res.status(403).json({ error: 'You are not assigned to this bus' });
      }

      // Drivers can only update tracking_enabled
      const updateData = req.body;
      if (Object.keys(updateData).length !== 1 || !('tracking_enabled' in updateData)) {
        return res.status(403).json({ error: 'Drivers can only update tracking_enabled field' });
      }

      // Validate tracking_enabled is a boolean
      if (typeof updateData.tracking_enabled !== 'boolean') {
        return res.status(400).json({ error: 'tracking_enabled must be a boolean' });
      }

      const { data: bus, error } = await supabase
        .from('buses')
        .update({ tracking_enabled: updateData.tracking_enabled })
        .eq('id', busId)
        .select('*, routes(*)')
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      // Fetch driver information if needed
      if (bus.driver_id) {
        const { data: driver } = await supabase
          .from('users')
          .select('id, name, email')
          .eq('id', bus.driver_id)
          .single();
        bus.driver = driver || null;
      } else {
        bus.driver = null;
      }

      return res.json({ bus });
    }

    // Admin can update any bus with any fields
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const validatedData = busSchema.partial().parse(req.body);
    const { data: bus, error } = await supabase
      .from('buses')
      .update(validatedData)
      .eq('id', busId)
      .select('*, routes(*)')
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Fetch driver information if needed
    if (bus.driver_id) {
      const { data: driver } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('id', bus.driver_id)
        .single();
      bus.driver = driver || null;
    } else {
      bus.driver = null;
    }

    res.json({ bus });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete bus (admin only)
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { error } = await supabase
      .from('buses')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Bus deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

