/**
 * Skeleton.jsx
 * Generic skeleton loader component for creating premium loading states.
 * Usage:
 *   <Skeleton />               — full-width text line (default)
 *   <Skeleton variant="card" /> — a raised card-shaped block
 *   <Skeleton variant="avatar" size={48} /> — circular avatar
 *   <Skeleton variant="stat" />  — stat card block (icon + two lines)
 *   <Skeleton variant="row" />   — a full horizontal row with avatar + lines
 */

const Skeleton = ({
  variant = 'line',
  width,
  height,
  size,
  className = '',
  lines = 1,
}) => {
  const base =
    'animate-pulse bg-gradient-to-r from-slate-100 via-slate-200/60 to-slate-100 bg-[length:400%_100%] rounded-xl';

  if (variant === 'avatar') {
    const dim = size || 48;
    return (
      <div
        className={`${base} rounded-full shrink-0 ${className}`}
        style={{ width: dim, height: dim }}
      />
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={`${base} rounded-[2rem] ${className}`}
        style={{ width: width || '100%', height: height || 200 }}
      />
    );
  }

  if (variant === 'stat') {
    return (
      <div className={`bg-white rounded-[2rem] border-2 border-slate-100 p-6 space-y-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className={`${base} rounded-2xl`} style={{ width: 48, height: 48 }} />
          <div className="flex-1 space-y-2">
            <div className={`${base} h-3 rounded-lg w-2/3`} />
            <div className={`${base} h-2 rounded-lg w-1/2`} />
          </div>
        </div>
        <div className={`${base} h-8 rounded-xl w-3/4`} />
      </div>
    );
  }

  if (variant === 'row') {
    return (
      <div className={`flex items-center gap-4 p-4 ${className}`}>
        <div className={`${base} rounded-full shrink-0`} style={{ width: 44, height: 44 }} />
        <div className="flex-1 space-y-2">
          {Array.from({ length: lines || 2 }).map((_, i) => (
            <div
              key={i}
              className={`${base} h-3 rounded-lg`}
              style={{ width: i === 0 ? '60%' : '40%' }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'transport-card') {
    return (
      <div className="bg-white rounded-[2rem] border-2 border-slate-100 p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`${base} rounded-2xl`} style={{ width: 48, height: 48 }} />
            <div className="space-y-2">
              <div className={`${base} h-4 rounded-lg w-32`} />
              <div className={`${base} h-3 rounded-lg w-20`} />
            </div>
          </div>
          <div className={`${base} h-6 rounded-full w-20`} />
        </div>
        <div className="space-y-2 pt-2 border-t border-slate-50">
          <div className={`${base} h-3 rounded-lg w-full`} />
          <div className={`${base} h-3 rounded-lg w-4/5`} />
        </div>
        <div className="flex gap-2 pt-2">
          <div className={`${base} h-8 rounded-xl flex-1`} />
          <div className={`${base} h-8 rounded-xl w-24`} />
        </div>
      </div>
    );
  }

  // Default: text lines
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`${base} h-4 rounded-lg`}
          style={{ width: i === lines - 1 && lines > 1 ? '60%' : (width || '100%') }}
        />
      ))}
    </div>
  );
};

export default Skeleton;
