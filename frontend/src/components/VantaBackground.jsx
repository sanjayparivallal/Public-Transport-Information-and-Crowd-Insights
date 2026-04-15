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
  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-slate-50" aria-hidden="true">
    {/* Map Image Layer */}
    <div 
      className="absolute inset-0 opacity-[0.25]"
      style={{
        backgroundImage: 'url(/bg-map.png)',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        mixBlendMode: 'multiply'
      }}
    />

    {/* Subtle animated floating glow over the map */}
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
    <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(255,255,255,0.9)]" />

    <style>{`
      @keyframes mapPulse {
        0% { transform: scale(1) translate(0, 0); opacity: 0.8; }
        50% { transform: scale(1.05) translate(-2%, 2%); opacity: 1; }
        100% { transform: scale(1) translate(2%, -2%); opacity: 0.8; }
      }
    `}</style>
  </div>
);

export default TransitBackground;
