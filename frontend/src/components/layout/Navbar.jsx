import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  // Clean, focused navigation items (no unnecessary bloat or wrapping)
  const adminNavItems = [
    { to: '/', label: 'Dashboard', icon: 'bi-grid' },
    { to: '/members', label: 'Members', icon: 'bi-people' },
    { to: '/plans', label: 'Plans & Offers', icon: 'bi-tags' },
    { to: '/memberships', label: 'Memberships', icon: 'bi-credit-card' },
    { to: '/equipment', label: 'Equipment', icon: 'bi-cpu' },
    { to: '/supplements', label: 'Supplements', icon: 'bi-capsule' }
  ];

  const memberNavItems = [
    { to: '/', label: 'Dashboard', icon: 'bi-speedometer2' },
    { to: '/plans', label: 'Plans & Offers', icon: 'bi-tags' },
    { to: '/equipment', label: 'Equipment', icon: 'bi-cpu' },
    { to: '/supplements', label: 'Supplements', icon: 'bi-capsule' }
  ];

  const navItems = isAdmin ? adminNavItems : memberNavItems;

  return (
    <nav className="navbar navbar-expand-xl navbar-dark bg-dark border-bottom border-secondary border-opacity-25 px-3 py-1 sticky-top shadow-sm">
      <div className="container-fluid">
        {/* Brand */}
        <Link to="/" className="navbar-brand d-flex align-items-center gap-1.5 me-3 py-0">
          <i className="bi bi-lightning-charge-fill text-warning fs-5"></i>
          <span 
            className="text-white fs-5 fw-bold text-nowrap" 
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Hulk<span className="text-warning">Fitness</span>
          </span>
          {isAdmin ? (
            <span className="badge bg-warning text-dark px-1.5 py-0.5 ms-1 fw-bold" style={{ fontSize: '0.65rem' }}>
              ADMIN
            </span>
          ) : (
            <span className="badge bg-secondary text-white px-1.5 py-0.5 ms-1 fw-bold" style={{ fontSize: '0.65rem' }}>
              MEMBER
            </span>
          )}
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler border-0 py-1 px-2"
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <i className="bi bi-list fs-5"></i>
        </button>

        {/* Navigation Items */}
        <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto mb-2 mb-xl-0 ms-xl-2 gap-1 flex-nowrap align-items-center">
            {navItems.map((item) => (
              <li className="nav-item" key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `nav-link px-2 py-1 rounded-2 d-inline-flex align-items-center gap-1 text-nowrap fw-medium ${
                      isActive ? 'active bg-success text-white fw-semibold shadow-sm' : 'text-light text-opacity-75'
                    }`
                  }
                  style={{ fontSize: '0.82rem' }}
                >
                  <i className={`bi ${item.icon}`} style={{ fontSize: '0.82rem' }}></i>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          {/* User Info & Cart & Logout */}
          <div className="d-flex align-items-center gap-2 pt-2 pt-xl-0 border-top border-secondary border-opacity-25 border-top-0-xl">
            {/* Cart Link (Members only) */}
            {!isAdmin && (
              <NavLink
                to="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `btn btn-sm d-inline-flex align-items-center gap-1.5 px-2.5 py-1 rounded-2 text-nowrap ${
                    isActive
                      ? 'btn-success text-white fw-semibold'
                      : 'btn-outline-light border-secondary border-opacity-50 text-light'
                  }`
                }
                style={{ fontSize: '0.8rem' }}
                title="Shopping Cart"
              >
                <i className="bi bi-cart3" style={{ fontSize: '0.85rem' }}></i>
                <span>Cart</span>
                {totalItems > 0 && (
                  <span className="badge rounded-pill bg-warning text-dark px-1.5 py-0.5 fw-bold" style={{ fontSize: '0.68rem' }}>
                    {totalItems}
                  </span>
                )}
              </NavLink>
            )}

            <div className="d-none d-lg-flex align-items-center gap-1.5 text-nowrap px-1" title={user?.email}>
              <i className="bi bi-person-circle text-warning" style={{ fontSize: '0.9rem' }}></i>
              <span className="fw-semibold text-white small">{user?.name || 'User'}</span>
            </div>

            <button
              onClick={logout}
              className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 px-2.5 py-1 rounded-2 text-nowrap"
              style={{ fontSize: '0.78rem' }}
            >
              <i className="bi bi-box-arrow-right" style={{ fontSize: '0.78rem' }}></i>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
