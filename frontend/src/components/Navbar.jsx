import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: '商品' },
  { to: '/cart', label: '購物車', isCart: true },
  { to: '/badge', label: '稱號' },
  { to: '/orders-advice', label: '訂單與建議' },
  { to: '/subscription', label: '訂閱方案' },
];

export default function Navbar() {
  const { cartItemCount } = useAppData();
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';

  const navLinks = isAdmin
    ? [...links, { to: '/admin/dashboard', label: '後台管理' }]
    : links;

  const handleNavClick = () => setIsMenuOpen(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg hm-navbar" aria-label="主導覽列">
      <div className="container hm-navbar-inner">
        <NavLink className="navbar-brand hm-navbar-brand" to="/" onClick={handleNavClick}>
          <span className="hm-brand-dot" aria-hidden="true"></span>
          <span>HealthyMeal</span>
        </NavLink>

        <button
          className="navbar-toggler hm-navbar-toggler"
          type="button"
          aria-controls="navbarNav"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse${isMenuOpen ? ' show' : ''}`} id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center hm-navbar-links">
            {navLinks.map((link) => (
              <li className="nav-item" key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `nav-link hm-nav-pill${link.isCart ? ' hm-nav-pill-cart' : ''}${isActive ? ' active' : ''}`
                  }
                  onClick={handleNavClick}
                >
                  <span>{link.label}</span>
                  {link.isCart && cartItemCount > 0 ? (
                    <span className="badge rounded-pill bg-success">{cartItemCount}</span>
                  ) : null}
                </NavLink>
              </li>
            ))}

            {isAuthenticated ? (
              <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
                <div className="hm-user-actions">
                  <div className="hm-user-chip" title={user?.username || user?.email || '會員'}>
                    <span className="hm-user-avatar" aria-hidden="true">
                      {(user?.username || user?.email || 'U').slice(0, 1).toUpperCase()}
                    </span>
                    <span className="hm-user-name">{user?.username || user?.email || '會員'}</span>
                  </div>
                  <button className="btn btn-outline-success btn-sm hm-logout-btn" type="button" onClick={handleLogout}>
                    登出
                  </button>
                </div>
              </li>
            ) : (
              <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
                <NavLink className="btn btn-success btn-sm hm-login-btn" to="/login" onClick={handleNavClick}>
                  登入
                </NavLink>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
