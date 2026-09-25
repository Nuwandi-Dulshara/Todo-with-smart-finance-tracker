import { Search, X } from 'lucide-react'

function TaskSearch({ value, onChange, placeholder }) {
  return (
    <label className="search-box task-search">
      <Search size={18} />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      {value && (
        <button className="clear-search" type="button" onClick={() => onChange('')} aria-label="Clear search">
          <X size={15} />
        </button>
      )}
    </label>
  )
}

export default TaskSearch
