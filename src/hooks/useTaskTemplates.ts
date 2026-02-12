import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getDayPlan, TaskTemplate } from '@/data/dayPlans';
import { toast } from 'sonner';

export interface DbTaskTemplate {
  id: string;
  department: string;
  day_number: number;
  title: string;
  duration: string;
  priority: 'high' | 'medium' | 'low';
  sort_order: number;
}

export function useTaskTemplates(department?: string, dayNumber?: number) {
  const [templates, setTemplates] = useState<DbTaskTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('task_templates').select('*').order('sort_order');
    if (department) query = query.eq('department', department);
    if (dayNumber) query = query.eq('day_number', dayNumber);

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching task templates:', error);
    } else {
      setTemplates(data as DbTaskTemplate[]);
    }
    setLoading(false);
  }, [department, dayNumber]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return { templates, loading, refetch: fetchTemplates };
}

/** Returns DB templates if they exist for this dept+day, otherwise falls back to hardcoded defaults */
export function getEffectiveTasks(
  dbTemplates: DbTaskTemplate[],
  department: string,
  day: number
): TaskTemplate[] {
  const filtered = dbTemplates.filter(
    (t) => t.department === department && t.day_number === day
  );
  if (filtered.length > 0) {
    return filtered.map((t) => ({
      id: t.id,
      title: t.title,
      duration: t.duration,
      priority: t.priority,
    }));
  }
  return getDayPlan(department, day);
}

export function useAdminTaskTemplates() {
  const { templates, loading, refetch } = useTaskTemplates();

  const addTemplate = async (template: Omit<DbTaskTemplate, 'id' | 'sort_order'> & { sort_order?: number }) => {
    const { error } = await supabase.from('task_templates').insert({
      ...template,
      sort_order: template.sort_order ?? 0,
    });
    if (error) {
      toast.error('Failed to add task: ' + error.message);
      return false;
    }
    toast.success('Task added');
    refetch();
    return true;
  };

  const updateTemplate = async (id: string, updates: Partial<DbTaskTemplate>) => {
    const { error } = await supabase.from('task_templates').update(updates).eq('id', id);
    if (error) {
      toast.error('Failed to update task: ' + error.message);
      return false;
    }
    toast.success('Task updated');
    refetch();
    return true;
  };

  const deleteTemplate = async (id: string) => {
    const { error } = await supabase.from('task_templates').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete task: ' + error.message);
      return false;
    }
    toast.success('Task deleted');
    refetch();
    return true;
  };

  const seedDefaults = async (department: string) => {
    const rows: any[] = [];
    for (let day = 1; day <= 7; day++) {
      const tasks = getDayPlan(department, day);
      tasks.forEach((t, i) => {
        rows.push({
          department,
          day_number: day,
          title: t.title,
          duration: t.duration,
          priority: t.priority,
          sort_order: i,
        });
      });
    }
    const { error } = await supabase.from('task_templates').insert(rows);
    if (error) {
      toast.error('Failed to seed defaults: ' + error.message);
      return false;
    }
    toast.success(`Seeded ${rows.length} tasks for ${department}`);
    refetch();
    return true;
  };

  return { templates, loading, refetch, addTemplate, updateTemplate, deleteTemplate, seedDefaults };
}
