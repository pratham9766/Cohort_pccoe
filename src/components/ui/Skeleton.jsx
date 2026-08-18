export function Skeleton({ width = '100%', height = 16, circle = false }) {
  return <span className="skeleton" style={{ display: 'block', width, height, borderRadius: circle ? '50%' : undefined }} />;
}
