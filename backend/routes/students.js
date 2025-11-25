import express from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

const studentSchema = z.object({
  name: z.string().min(1),
  grade: z.string().min(1),
  parent_id: z.number().int(),
  bus_id: z.number().int().optional().nullable(),
});

// Get all students
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query = supabase
      .from('students')
      .select('*, buses(*, routes(*))')
      .order('name');

    // Parents can only see their own children
    if (req.user.role === 'parent') {
      query = query.eq('parent_id', req.user.id);
    }

    // Drivers can only see students on their bus
    if (req.user.role === 'driver') {
      const { data: bus } = await supabase
        .from('buses')
        .select('id')
        .eq('driver_id', req.user.id)
        .single();

      if (!bus) {
        return res.json({ students: [] });
      }

      query = query.eq('bus_id', bus.id);
    }

    const { data: students, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Fetch parent information separately if needed
    const studentsWithParents = await Promise.all(
      (students || []).map(async (student) => {
        if (student.parent_id) {
          const { data: parent } = await supabase
            .from('users')
            .select('id, name, email')
            .eq('id', student.parent_id)
            .single();
          return { ...student, parent: parent || null };
        }
        return { ...student, parent: null };
      })
    );

    res.json({ students: studentsWithParents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single student
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    let query = supabase
      .from('students')
      .select('*, buses(*, routes(*))')
      .eq('id', req.params.id);

    // Parents can only see their own children
    if (req.user.role === 'parent') {
      query = query.eq('parent_id', req.user.id);
    }

    // Drivers can only see students on their bus
    if (req.user.role === 'driver') {
      const { data: bus } = await supabase
        .from('buses')
        .select('id')
        .eq('driver_id', req.user.id)
        .single();

      if (!bus) {
        return res.status(403).json({ error: 'Access denied' });
      }

      query = query.eq('bus_id', bus.id);
    }

    const { data: student, error } = await query.single();

    if (error) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Fetch parent information if needed
    if (student.parent_id) {
      const { data: parent } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('id', student.parent_id)
        .single();
      student.parent = parent || null;
    } else {
      student.parent = null;
    }

    res.json({ student });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create student (admin or parent)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const validatedData = studentSchema.parse(req.body);
    
    // Parents can only register students for themselves
    if (req.user.role === 'parent') {
      if (validatedData.parent_id !== req.user.id) {
        return res.status(403).json({ error: 'You can only register students for yourself' });
      }
    }
    // Admins can register students for any parent
    else if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { data: student, error } = await supabase
      .from('students')
      .insert(validatedData)
      .select('*, buses(*, routes(*))')
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Fetch parent information if needed
    if (student.parent_id) {
      const { data: parent } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('id', student.parent_id)
        .single();
      student.parent = parent || null;
    } else {
      student.parent = null;
    }

    res.status(201).json({ student });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update student (admin or parent for their own children)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    // First, check if student exists and verify permissions
    const { data: existingStudent, error: fetchError } = await supabase
      .from('students')
      .select('parent_id')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !existingStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Parents can only update their own children
    if (req.user.role === 'parent') {
      if (existingStudent.parent_id !== req.user.id) {
        return res.status(403).json({ error: 'You can only update your own children' });
      }
    }
    // Only admin and parent roles can update
    else if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Prepare update data - convert empty strings to null and ensure proper types
    const updateData = { ...req.body };
    
    // Parents cannot change parent_id
    if (req.user.role === 'parent') {
      delete updateData.parent_id;
    }
    
    // Convert bus_id: empty string or undefined to null, string numbers to integers
    if ('bus_id' in updateData) {
      if (updateData.bus_id === '' || updateData.bus_id === undefined) {
        updateData.bus_id = null;
      } else {
        updateData.bus_id = parseInt(updateData.bus_id, 10);
        if (isNaN(updateData.bus_id)) {
          return res.status(400).json({ error: 'Invalid bus_id format' });
        }
      }
    }
    
    // Convert parent_id if present (only admins can change this)
    if ('parent_id' in updateData && updateData.parent_id !== undefined && req.user.role === 'admin') {
      updateData.parent_id = parseInt(updateData.parent_id, 10);
      if (isNaN(updateData.parent_id)) {
        return res.status(400).json({ error: 'Invalid parent_id format' });
      }
    }
    
    const validatedData = studentSchema.partial().parse(updateData);
    const { data: student, error } = await supabase
      .from('students')
      .update(validatedData)
      .eq('id', req.params.id)
      .select('*, buses(*, routes(*))')
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Fetch parent information if needed
    if (student.parent_id) {
      const { data: parent } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('id', student.parent_id)
        .single();
      student.parent = parent || null;
    } else {
      student.parent = null;
    }

    res.json({ student });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete student (admin only)
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

