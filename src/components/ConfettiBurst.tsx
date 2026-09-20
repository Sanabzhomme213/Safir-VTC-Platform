const COLORS = ['#336cff', '#22c55e', '#f59e0b', '#f43f5e', '#a855f7', '#06b6d4'];

export default function ConfettiBurst() {
  const pieces = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    color: COLORS[i % COLORS.length],
    delay: `${Math.random() * 0.15}s`,
    size: 6 + Math.random() * 6,
  }));

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-0 overflow-visible">
      {pieces.map(p => (
        <span
          key={p.id}
          className="absolute top-0 rounded-sm animate-confetti-fall"
          style={{
            left: p.left,
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
}
