import { addDays, formatDateInput, todayInput } from '../utils/taskHelpers'

const today = todayInput()
const tomorrow = formatDateInput(addDays(new Date(), 1))
const nextWeek = formatDateInput(addDays(new Date(), 6))
const yesterday = formatDateInput(addDays(new Date(), -1))

const mockTasks = [
  {
    id: 'task-1',
    title: 'Complete Project Report',
    description: 'Draft the weekly project summary and collect final review notes.',
    dueDate: today,
    dueTime: '09:30',
    priority: 'High',
    category: 'Work',
    status: 'In Progress',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Team Planning Session',
    description: 'Prepare agenda items for the afternoon planning call.',
    dueDate: today,
    dueTime: '14:00',
    priority: 'Medium',
    category: 'Meetings',
    status: 'To Do',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Review Budget Notes',
    description: 'Organize task-related spending notes for later backend work.',
    dueDate: today,
    dueTime: '16:30',
    priority: 'Low',
    category: 'Admin',
    status: 'Completed',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'Meeting Preparation',
    description: 'Finalize talking points and send the pre-read.',
    dueDate: yesterday,
    dueTime: '17:00',
    priority: 'High',
    category: 'Meetings',
    status: 'To Do',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-5',
    title: 'Design Task Board',
    description: 'Sketch the empty, loading, and filtered states for task lists.',
    dueDate: tomorrow,
    dueTime: '11:15',
    priority: 'Medium',
    category: 'Design',
    status: 'In Progress',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-6',
    title: 'Archive Completed Notes',
    description: 'Move old personal planning notes into an archive folder.',
    dueDate: nextWeek,
    dueTime: '10:00',
    priority: 'Low',
    category: 'Personal',
    status: 'To Do',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-7',
    title: 'Prepare Weekly Review',
    description: 'Summarize completed, pending, and blocked tasks.',
    dueDate: tomorrow,
    dueTime: '15:45',
    priority: 'High',
    category: 'Work',
    status: 'To Do',
    createdAt: new Date().toISOString(),
  },
]

export default mockTasks
