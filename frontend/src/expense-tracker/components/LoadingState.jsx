function LoadingState({ message = 'Loading data...' }) {
  return (
    <div className="expense-loading-state" role="status">
      <span />
      <p>{message}</p>
    </div>
  )
}

export default LoadingState
