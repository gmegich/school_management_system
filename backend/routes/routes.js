import express from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

const routeSchema = z.object({
  name: z.string().min(1),
  stops: z.array(z.object({
    name: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    order: z.number().int(),
  })),
});

// Get all routes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data: routes, error } = await supabase
      .from('routes')
      .select('*')
      .order('name');

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ routes: routes || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single route
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { data: route, error } = await supabase
      .from('routes')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Route not found' });
    }

    res.json({ route });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create route (admin only)
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const validatedData = routeSchema.parse(req.body);
    const { data: route, error } = await supabase
      .from('routes')
      .insert({
        name: validatedData.name,
        stops: validatedData.stops,
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ route });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update route (admin only)
router.put('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const validatedData = routeSchema.partial().parse(req.body);
    const { data: route, error } = await supabase
      .from('routes')
      .update(validatedData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ route });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete route (admin only)
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { error } = await supabase
      .from('routes')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

