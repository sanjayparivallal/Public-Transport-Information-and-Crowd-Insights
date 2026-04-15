/**
 * MeshBackground — Premium animated CSS mesh gradient
 * ─────────────────────────────────────────────────────
 * No heavy 3D libraries. Pure CSS animated blobs give a smooth,
 * modern SaaS look (inspired by Stripe / Linear / Vercel).
 *
 * Orb colors pulled directly from the design system:
 *   indigo  #6366f1 | violet #7c3aed | cyan #06b6d4
 *   blue    #3b82f6 | purple #8b5cf6
 */
const TransitBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-slate-100" aria-hidden="true" style={{ perspective: '1000px' }}>
    
    {/* Base Ambient Glow */}
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/50 via-white to-white"></div>

    {/* Map Image Layer */}
    <div 
      className="absolute inset-0 opacity-[0.15]"
      style={{
        backgroundImage: 'url(/bg-map.png)',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        mixBlendMode: 'multiply'
      }}
    />

    {/* Elegant 3D Grid Loop */}
    <div className="absolute bottom-0 left-0 right-0 h-[60vh] origin-bottom overflow-hidden" 
         style={{ transform: 'rotateX(60deg) scale(2.5)', opacity: 0.35 }}>
      <div 
        className="absolute inset-x-0 bottom-0 h-[200%] w-full"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(99, 102, 241, 0.4) 1px, transparent 1px),
            linear-gradient(to top, rgba(99, 102, 241, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          animation: 'gridMove 4s linear infinite',
        }}
      />
      {/* Fade out top of grid */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-slate-100/80 to-slate-100"></div>
    </div>

    {/* Subtle animated floating glow */}
    <div style={{
      position: 'absolute',
      width: '120vw',
      height: '120vh',
      top: '-10%',
      left: '-10%',
      background: 'radial-gradient(circle at 50% 50%, rgba(59,130,246,0.06), transparent 60%)',
      animation: 'mapPulse 12s ease-in-out infinite alternate',
    }} />

    {/* Vignette border for depth */}
    <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(255,255,255,1)]" />

    <style>{`
      @keyframes gridMove {
        0% { transform: translateY(0); }
        100% { transform: translateY(60px); }
      }
      @keyframes mapPulse {
        0% { transform: scale(1) translate(0, 0); opacity: 0.8; }
        50% { transform: scale(1.05) translate(-2%, 2%); opacity: 1; }
        100% { transform: scale(1) translate(2%, -2%); opacity: 0.8; }
      }
    `}</style>
  </div>
);

export default TransitBackground;
