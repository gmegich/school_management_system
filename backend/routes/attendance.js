import express from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

const attendanceSchema = z.object({
  student_id: z.number().int(),
  type: z.enum(['pickup', 'dropoff', 'absent']),
  timestamp: z.string().datetime().optional(),
});

// Get attendance records
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query = supabase
      .from('attendance')
      .select('*, students(*), buses(*)')
      .order('timestamp', { ascending: false })
      .limit(100);

    // Parents can only see their children's attendance
    if (req.user.role === 'parent') {
      const { data: students } = await supabase
        .from('students')
        .select('id')
        .eq('parent_id', req.user.id);

      if (!students || students.length === 0) {
        return res.json({ attendance: [] });
      }

      const studentIds = students.map(s => s.id);
      query = query.in('student_id', studentIds);
    }

    // Drivers can only see attendance for their bus
    if (req.user.role === 'driver') {
      const { data: bus } = await supabase
        .from('buses')
        .select('id')
        .eq('driver_id', req.user.id)
        .single();

      if (!bus) {
        return res.json({ attendance: [] });
      }

      const { data: students } = await supabase
        .from('students')
        .select('id')
        .eq('bus_id', bus.id);

      if (!students || students.length === 0) {
        return res.json({ attendance: [] });
      }

      const studentIds = students.map(s => s.id);
      query = query.in('student_id', studentIds);
    }

    const { data: attendance, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ attendance: attendance || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create attendance record (driver only)
router.post('/', authenticateToken, requireRole('driver'), async (req, res) => {
  try {
    const validatedData = attendanceSchema.parse(req.body);

    // Verify student is on driver's bus
    const { data: bus } = await supabase
      .from('buses')
      .select('id')
      .eq('driver_id', req.user.id)
      .single();

    if (!bus) {
      return res.status(403).json({ error: 'You are not assigned to a bus' });
    }

    const { data: student } = await supabase
      .from('students')
      .select('id, bus_id')
      .eq('id', validatedData.student_id)
      .eq('bus_id', bus.id)
      .single();

    if (!student) {
      return res.status(403).json({ error: 'Student is not on your bus' });
    }

    const { data: attendance, error } = await supabase
      .from('attendance')
      .insert({
        student_id: validatedData.student_id,
        type: validatedData.type,
        timestamp: validatedData.timestamp || new Date().toISOString(),
        bus_id: bus.id,
      })
      .select('*, students(*), buses(*)')
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ attendance });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// Get student attendance history
router.get('/student/:id', authenticateToken, async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);

    // Check permissions
    if (req.user.role === 'parent') {
      const { data: student } = await supabase
        .from('students')
        .select('id, parent_id')
        .eq('id', studentId)
        .eq('parent_id', req.user.id)
        .single();

      if (!student) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const { data: attendance, error } = await supabase
      .from('attendance')
      .select('*, buses(*)')
      .eq('student_id', studentId)
      .order('timestamp', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ attendance: attendance || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

