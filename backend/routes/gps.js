import express from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

const locationSchema = z.object({
  bus_id: z.number().int(),
  latitude: z.number(),
  longitude: z.number(),
  speed: z.number().optional(),
});

// Update bus location (driver only)
router.post('/', authenticateToken, requireRole('driver'), async (req, res) => {
  try {
    const validatedData = locationSchema.parse(req.body);

    // Verify driver is assigned to this bus
    const { data: bus } = await supabase
      .from('buses')
      .select('id')
      .eq('id', validatedData.bus_id)
      .eq('driver_id', req.user.id)
      .single();

    if (!bus) {
      return res.status(403).json({ error: 'You are not assigned to this bus' });
    }

    const { data: location, error } = await supabase
      .from('locations')
      .insert({
        bus_id: validatedData.bus_id,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        speed: validatedData.speed || 0,
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Broadcast location update via Socket.IO for real-time tracking
    const io = req.app.get('io');
    if (io) {
      io.to(`bus-${validatedData.bus_id}`).emit('location-update', {
        busId: validatedData.bus_id,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        speed: validatedData.speed || 0,
        timestamp: location.created_at || new Date().toISOString(),
      });
    }

    res.status(201).json({ location });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// Get latest location for a bus
router.get('/:busId', authenticateToken, async (req, res) => {
  try {
    const busId = parseInt(req.params.busId);

    // Check permissions
    if (req.user.role === 'driver') {
      const { data: bus } = await supabase
        .from('buses')
        .select('id')
        .eq('id', busId)
        .eq('driver_id', req.user.id)
        .single();

      if (!bus) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (req.user.role === 'parent') {
      // Parents can only see buses of their children
      const { data: student } = await supabase
        .from('students')
        .select('bus_id')
        .eq('parent_id', req.user.id)
        .eq('bus_id', busId)
        .limit(1)
        .single();

      if (!student) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const { data: location, error } = await supabase
      .from('locations')
      .select('*')
      .eq('bus_id', busId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json({ location });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get location history for a bus
router.get('/:busId/history', authenticateToken, async (req, res) => {
  try {
    const busId = parseInt(req.params.busId);
    const limit = parseInt(req.query.limit) || 100;

    // Check permissions (same as above)
    if (req.user.role === 'driver') {
      const { data: bus } = await supabase
        .from('buses')
        .select('id')
        .eq('id', busId)
        .eq('driver_id', req.user.id)
        .single();

      if (!bus) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (req.user.role === 'parent') {
      const { data: student } = await supabase
        .from('students')
        .select('bus_id')
        .eq('parent_id', req.user.id)
        .eq('bus_id', busId)
        .limit(1)
        .single();

      if (!student) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const { data: locations, error } = await supabase
      .from('locations')
      .select('*')
      .eq('bus_id', busId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ locations: locations || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all active buses (admin only)
router.get('/all/active', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    // Get latest location for each bus
    const { data: buses } = await supabase
      .from('buses')
      .select('id, number_plate');

    if (!buses || buses.length === 0) {
      return res.json({ activeBuses: [] });
    }

    const activeBuses = await Promise.all(
      buses.map(async (bus) => {
        const { data: location } = await supabase
          .from('locations')
          .select('*')
          .eq('bus_id', bus.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        return {
          bus_id: bus.id,
          number_plate: bus.number_plate,
          location: location || null,
        };
      })
    );

    res.json({ activeBuses: activeBuses.filter(b => b.location !== null) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

