const LoadingState = ({ message }: { message?: string }) => (
  <div className="card loading">
    <div className="spinner" aria-hidden="true" />
    <p>{message ?? "Loading"}</p>
  </div>
);

export default LoadingState;
