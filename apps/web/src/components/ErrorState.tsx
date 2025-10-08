const ErrorState = ({ message }: { message: string }) => (
  <div className="card error">
    <h2>Uh oh!</h2>
    <p>{message}</p>
  </div>
);

export default ErrorState;
