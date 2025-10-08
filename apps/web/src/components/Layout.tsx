import { PropsWithChildren } from "react";

const Layout = ({ children }: PropsWithChildren) => (
  <div className="app-container">
    <header className="app-header">
      <div>
        <h1>League Rank Analytics</h1>
        <p>Actionable insights for your ranked climb</p>
      </div>
    </header>
    <main>{children}</main>
    <footer className="app-footer">Data simulated for demonstration purposes.</footer>
  </div>
);

export default Layout;
