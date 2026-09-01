function CategoryBadge({ category }) {
  return <span className={`expense-category-badge category-${category.toLowerCase().replaceAll(' ', '-')}`}>{category}</span>
}

export default CategoryBadge
