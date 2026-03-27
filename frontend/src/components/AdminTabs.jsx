import { NavLink } from 'react-router-dom';

const items = [
  { to: '/admin/dashboard', label: '儀表板' },
  { to: '/admin/menu', label: '餐點管理' },
  { to: '/admin/orders', label: '訂單管理' },
  { to: '/admin/users', label: '使用者管理' },
];

export default function AdminTabs() {
  return (
    <ul className="nav nav-pills gap-2 mb-3 flex-wrap">
      {items.map((item) => (
        <li className="nav-item" key={item.to}>
          <NavLink
            to={item.to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : 'text-success border border-success-subtle'}`}
          >
            {item.label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}
