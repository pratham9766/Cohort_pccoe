export function Card({ children, hover = false, className = '', ...props }) {
  return (
    <section className={`card glass-card ${hover ? 'hover' : ''} ${className}`} {...props}>
      {children}
    </section>
  );
}
