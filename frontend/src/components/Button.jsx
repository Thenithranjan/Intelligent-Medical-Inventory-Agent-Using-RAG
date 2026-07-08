import { useRef } from 'react';
import { Loader2 } from 'lucide-react';
import './Button.css';

/**
 * Premium button component with multiple variants & micro-animations.
 *
 * @param {'primary'|'secondary'|'ghost'|'danger'|'success'|'accent'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} pill       — fully rounded
 * @param {boolean} loading    — shows spinner
 * @param {boolean} iconOnly   — square shape for icon-only buttons
 * @param {React.ReactNode} icon     — icon element (left side)
 * @param {React.ReactNode} iconRight — icon element (right side)
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  pill = false,
  loading = false,
  disabled = false,
  iconOnly = false,
  icon,
  iconRight,
  className = '',
  ...rest
}) {
  const btnRef = useRef(null);

  const handleRipple = (e) => {
    const btn = btnRef.current;
    if (!btn || disabled || loading) return;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'btn-ripple';
    const diameter = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${diameter}px`;
    ripple.style.left = `${e.clientX - rect.left - diameter / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - diameter / 2}px`;
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  };

  const classes = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    pill && 'btn-pill',
    iconOnly && 'btn-icon-only',
    loading && 'btn-loading',
    disabled && 'btn-disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={btnRef}
      className={classes}
      disabled={disabled || loading}
      onMouseDown={handleRipple}
      {...rest}
    >
      {loading && <Loader2 className="btn-spinner" size={size === 'sm' ? 14 : 18} />}
      {!loading && icon && <span className="btn-icon">{icon}</span>}
      {children && <span className="btn-label">{children}</span>}
      {!loading && iconRight && <span className="btn-icon btn-icon-right">{iconRight}</span>}
    </button>
  );
}
