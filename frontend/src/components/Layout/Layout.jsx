import PropTypes from 'prop-types';
import './Layout.css';

// -----------------------------------------------------------------------------
// Layout Component
// -----------------------------------------------------------------------------
// Provides a consistent shell for dashboard-style pages: a hero header, an
// optional sidebar, and a flexible content region. Because it only receives
// pre-rendered React nodes, you can slot any component into these regions
// without coupling layout and data logic together.
export function Layout({ header, sidebar, children }) {
  const hasSidebar = Boolean(sidebar);
  return (
    <div className={hasSidebar ? 'layout layout--with-sidebar' : 'layout'}>
      {/* Header banner spanning the full width of the layout grid */}
      <header className="layout__header">{header}</header>
      <div className="layout__body">
        {/* Sidebar is optional so we render it conditionally */}
        {hasSidebar ? <aside className="layout__sidebar">{sidebar}</aside> : null}
        <main className="layout__content">{children}</main>
      </div>
    </div>
  );
}

Layout.propTypes = {
  // `header` expects a React node (text, markup, or entire component tree)
  header: PropTypes.node,
  // `sidebar` is optional on pages that do not require navigation or stats
  sidebar: PropTypes.node,
  // `children` holds the primary content area for the route
  children: PropTypes.node.isRequired
};
