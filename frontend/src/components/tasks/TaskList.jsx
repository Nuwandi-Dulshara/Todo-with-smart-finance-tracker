import TaskCard from './TaskCard'

function TaskList({ tasks, emptyText = 'No tasks found.', compact = false, onEdit, onDelete, onUpdate }) {
  if (tasks.length === 0) {
    return <div className="empty-state">{emptyText}</div>
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          compact={compact}
          onEdit={onEdit}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  )
}

export default TaskList
