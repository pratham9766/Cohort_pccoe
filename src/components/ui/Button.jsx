export function Button({ as: Component = 'button', variant = 'primary', size = 'md', icon: Icon, children, className = '', ...props }) {
  const iconOnly = !children;
  return (
    <Component className={`btn btn-${iconOnly ? 'icon' : variant} btn-size-${size} ${className}`} {...props}>
      {Icon ? <Icon size={18} aria-hidden="true" /> : null}
      {children}
    </Component>
  );
}
