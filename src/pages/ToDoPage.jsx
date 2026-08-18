import { useEffect, useMemo, useState } from 'react';
import { BellRing, CalendarClock, Check, Circle, Clock, Flag, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button.jsx';
import { Card } from '@/components/ui/Card.jsx';
import { Input } from '@/components/ui/Input.jsx';
import { useNotificationStore } from '@/stores/notificationStore.js';

const STORAGE_KEY = 'cohort.todo.tasks';
const defaultForm = {
  title: '',
  notes: '',
  dueAt: '',
  remindAt: '',
  priority: 'medium',
};

const seedTasks = [
  {
    id: 'todo-seed-1',
    title: 'Submit assignment draft',
    notes: 'Upload PDF before lab starts.',
    dueAt: '2026-08-21T09:00',
    remindAt: '2026-08-21T08:30',
    priority: 'high',
    completed: false,
    reminded: false,
    createdAt: '2026-08-18T09:00:00.000Z',
  },
  {
    id: 'todo-seed-2',
    title: 'Check GDGC workshop slot',
    notes: 'Confirm venue and team count.',
    dueAt: '2026-08-22T15:30',
    remindAt: '2026-08-22T14:30',
    priority: 'medium',
    completed: false,
    reminded: false,
    createdAt: '2026-08-18T09:05:00.000Z',
  },
];

function loadTasks() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : seedTasks;
  } catch {
    return seedTasks;
  }
}

function formatDateTime(value) {
  if (!value) return 'No time set';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getTaskState(task, now) {
  if (task.completed) return 'done';
  if (task.dueAt && new Date(task.dueAt).getTime() <= now) return 'overdue';
  if (task.remindAt && new Date(task.remindAt).getTime() <= now) return 'reminder';
  return 'upcoming';
}

export default function ToDoPage() {
  const addToast = useNotificationStore((state) => state.addToast);
  const [tasks, setTasks] = useState(loadTasks);
  const [form, setForm] = useState(defaultForm);
  const [filter, setFilter] = useState('active');
  const [now, setNow] = useState(Date.now());
  const [notificationPermission, setNotificationPermission] = useState(() => window.Notification?.permission ?? 'unsupported');

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const dueReminders = tasks.filter((task) => (
      !task.completed &&
      !task.reminded &&
      task.remindAt &&
      new Date(task.remindAt).getTime() <= now
    ));

    if (dueReminders.length === 0) return;

    dueReminders.forEach((task) => {
      addToast(`Reminder: ${task.title}`, 'info');
      if (window.Notification?.permission === 'granted') {
        new window.Notification('Cohort reminder', {
          body: `${task.title}${task.dueAt ? ` due ${formatDateTime(task.dueAt)}` : ''}`,
          tag: task.id,
        });
      }
    });

    setTasks((current) => current.map((task) => (
      dueReminders.some((item) => item.id === task.id) ? { ...task, reminded: true } : task
    )));
  }, [addToast, now, tasks]);

  const filteredTasks = useMemo(() => {
    const visible = tasks.filter((task) => {
      if (filter === 'done') return task.completed;
      if (filter === 'all') return true;
      return !task.completed;
    });

    return [...visible].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return new Date(a.dueAt || '2999-12-31').getTime() - new Date(b.dueAt || '2999-12-31').getTime();
    });
  }, [filter, tasks]);

  const stats = useMemo(() => ({
    active: tasks.filter((task) => !task.completed).length,
    due: tasks.filter((task) => getTaskState(task, now) === 'overdue').length,
    reminders: tasks.filter((task) => !task.completed && task.remindAt).length,
  }), [now, tasks]);

  const updateForm = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const addTask = (event) => {
    event.preventDefault();
    const title = form.title.trim();
    if (!title) return;

    setTasks((current) => [{
      id: crypto.randomUUID(),
      title,
      notes: form.notes.trim(),
      dueAt: form.dueAt,
      remindAt: form.remindAt,
      priority: form.priority,
      completed: false,
      reminded: false,
      createdAt: new Date().toISOString(),
    }, ...current]);
    setForm(defaultForm);
    addToast('Task added to your list.', 'success');
  };

  const requestReminderPermission = async () => {
    if (!window.Notification) {
      addToast('Browser notifications are not supported here.', 'error');
      return;
    }
    const permission = await window.Notification.requestPermission();
    setNotificationPermission(permission);
    addToast(permission === 'granted' ? 'Reminder notifications enabled.' : 'Reminders will stay inside the app.', permission === 'granted' ? 'success' : 'info');
  };

  const toggleTask = (taskId) => {
    setTasks((current) => current.map((task) => (
      task.id === taskId ? { ...task, completed: !task.completed } : task
    )));
  };

  const deleteTask = (taskId) => {
    setTasks((current) => current.filter((task) => task.id !== taskId));
  };

  return (
    <section className="page stack todo-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">c/to-do</h1>
          <p className="muted">Plan assignments, club work, deadlines, and reminders in one campus list.</p>
        </div>
        <Button variant="secondary" icon={BellRing} onClick={requestReminderPermission}>
          {notificationPermission === 'granted' ? 'Reminders on' : 'Enable reminders'}
        </Button>
      </div>

      <div className="todo-layout">
        <Card className="todo-composer">
          <form onSubmit={addTask}>
            <Input label="Task" value={form.title} placeholder="What needs to be done?" onChange={updateForm('title')} />
            <label className="field">
              <span>Notes</span>
              <textarea className="textarea-input" value={form.notes} placeholder="Add context, links, room number..." onChange={updateForm('notes')} />
            </label>
            <div className="todo-form-grid">
              <Input label="Due" type="datetime-local" value={form.dueAt} onChange={updateForm('dueAt')} />
              <Input label="Reminder" type="datetime-local" value={form.remindAt} onChange={updateForm('remindAt')} />
            </div>
            <label className="field">
              <span>Priority</span>
              <select className="todo-select" value={form.priority} onChange={updateForm('priority')}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <Button type="submit" icon={Plus}>Add task</Button>
          </form>
        </Card>

        <div className="todo-main stack">
          <div className="todo-summary">
            <Card><strong>{stats.active}</strong><span>Active</span></Card>
            <Card><strong>{stats.due}</strong><span>Overdue</span></Card>
            <Card><strong>{stats.reminders}</strong><span>Reminders</span></Card>
          </div>

          <div className="todo-toolbar">
            {['active', 'all', 'done'].map((item) => (
              <button key={item} type="button" className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>
                {item}
              </button>
            ))}
          </div>

          <div className="todo-list">
            {filteredTasks.length ? filteredTasks.map((task) => {
              const state = getTaskState(task, now);
              return (
                <Card key={task.id} className={`todo-item todo-${state}`}>
                  <button type="button" className="todo-check" aria-label={task.completed ? 'Mark active' : 'Mark complete'} onClick={() => toggleTask(task.id)}>
                    {task.completed ? <Check size={18} aria-hidden="true" /> : <Circle size={18} aria-hidden="true" />}
                  </button>
                  <div className="todo-copy">
                    <div className="todo-title-row">
                      <h2>{task.title}</h2>
                      <span className={`todo-priority priority-${task.priority}`}><Flag size={14} aria-hidden="true" /> {task.priority}</span>
                    </div>
                    {task.notes ? <p>{task.notes}</p> : null}
                    <div className="todo-meta">
                      <span><CalendarClock size={15} aria-hidden="true" /> Due {formatDateTime(task.dueAt)}</span>
                      <span><Clock size={15} aria-hidden="true" /> Reminder {formatDateTime(task.remindAt)}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" icon={Trash2} aria-label="Delete task" onClick={() => deleteTask(task.id)} />
                </Card>
              );
            }) : (
              <Card className="todo-empty">
                <h2>No tasks here</h2>
                <p className="muted">Add a task with a due date and reminder to start tracking it.</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
