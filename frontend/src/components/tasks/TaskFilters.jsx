function TaskFilters({
  filters,
  categories,
  showDateFilter = false,
  sortOptions,
  onFilterChange,
  onSortChange,
}) {
  return (
    <>
      <select
        value={filters.status}
        onChange={(event) => onFilterChange('status', event.target.value)}
        aria-label="Filter by status"
      >
        <option>All</option>
        <option value="To Do">Pending</option>
        <option>In Progress</option>
        <option>Completed</option>
      </select>
      <select
        value={filters.priority}
        onChange={(event) => onFilterChange('priority', event.target.value)}
        aria-label="Filter by priority"
      >
        <option>All</option>
        <option>Low</option>
        <option>Medium</option>
        <option>High</option>
      </select>
      <select
        value={filters.category}
        onChange={(event) => onFilterChange('category', event.target.value)}
        aria-label="Filter by category"
      >
        <option>All</option>
        {categories.map((category) => (
          <option key={category}>{category}</option>
        ))}
      </select>
      {showDateFilter && (
        <select
          value={filters.dateRange}
          onChange={(event) => onFilterChange('dateRange', event.target.value)}
          aria-label="Filter by date"
        >
          <option>All Dates</option>
          <option>Today</option>
          <option>Upcoming</option>
          <option>Overdue</option>
          <option>Custom</option>
        </select>
      )}
      {showDateFilter && filters.dateRange === 'Custom' && (
        <input
          type="date"
          value={filters.customDate}
          onChange={(event) => onFilterChange('customDate', event.target.value)}
          aria-label="Custom due date"
        />
      )}
      <select value={filters.sort} onChange={(event) => onSortChange(event.target.value)} aria-label="Sort tasks">
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </>
  )
}

export default TaskFilters
