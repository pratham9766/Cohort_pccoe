export function Input({ label, error, icon: Icon, className = '', ...props }) {
  return (
    <label className={`field ${className}`}>
      {label ? <span>{label}</span> : null}
      <span className="input-wrap">
        {Icon ? <Icon size={17} aria-hidden="true" /> : null}
        <input className="input" {...props} />
      </span>
      {error ? <small className="muted">{error}</small> : null}
    </label>
  );
}
