import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';

const links = [
  { to: '/', label: '商品' },
  { to: '/cart', label: '購物車', isCart: true },
  { to: '/badge', label: '稱號' },
  { to: '/orders-advice', label: '訂單與建議' },
  { to: '/subscription', label: '訂閱方案' },
];

export default function Navbar() {
  const { cartItemCount } = useAppData();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = () => setIsMenuOpen(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container">
        <NavLink className="navbar-brand fw-bold text-success" to="/" onClick={handleNavClick}>
          HealthyMeal
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          aria-controls="navbarNav"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse${isMenuOpen ? ' show' : ''}`} id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center">
            {links.map((link) => (
              <li className="nav-item" key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `nav-link nav-animated${link.isCart ? ' d-flex align-items-center gap-2' : ''}${isActive ? ' active fw-semibold' : ''}`
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
          </ul>
        </div>
      </div>
    </nav>
  );
}
