import TaskFilters from './TaskFilters'
import TaskSearch from './TaskSearch'

function TaskToolbar({
  search,
  placeholder,
  filters,
  categories,
  showDateFilter,
  sortOptions,
  onSearchChange,
  onFilterChange,
  onSortChange,
}) {
  return (
    <section className="panel controls-panel task-toolbar">
      <TaskSearch value={search} onChange={onSearchChange} placeholder={placeholder} />
      <TaskFilters
        filters={filters}
        categories={categories}
        showDateFilter={showDateFilter}
        sortOptions={sortOptions}
        onFilterChange={onFilterChange}
        onSortChange={onSortChange}
      />
    </section>
  )
}

export default TaskToolbar
