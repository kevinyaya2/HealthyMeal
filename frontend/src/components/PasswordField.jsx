import { useState } from 'react';

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
        <path
          d="M12 5C7 5 2.7 8.1 1 12c1.7 3.9 6 7 11 7s9.3-3.1 11-7c-1.7-3.9-6-7-11-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path
        d="m2 4 2.5 2.5A13.8 13.8 0 0 0 1 12c1.7 3.9 6 7 11 7 2.2 0 4.2-.6 6-1.6L20 20l1.4-1.4L3.4 2.6 2 4Zm9.4 9.4 3.2 3.2a4 4 0 0 1-3.2-3.2ZM12 8c2.2 0 4 1.8 4 4 0 .4-.1.8-.2 1.2l3.1 3.1A11.6 11.6 0 0 0 23 12c-1.7-3.9-6-7-11-7-1.7 0-3.3.4-4.8 1L9.6 8A4 4 0 0 1 12 8Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function PasswordField({
  id,
  name,
  className = '',
  placeholder,
  value,
  onChange,
  autoComplete,
  required = false,
  disabled = false,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="hm-password-field-wrap">
      <input
        id={id}
        name={name}
        type={visible ? 'text' : 'password'}
        className={`${className} hm-password-input`.trim()}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
      />
      <button
        type="button"
        className="hm-password-toggle"
        onClick={() => setVisible((prev) => !prev)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        title={visible ? 'Hide password' : 'Show password'}
      >
        <EyeIcon open={visible} />
      </button>
    </div>
  );
}
