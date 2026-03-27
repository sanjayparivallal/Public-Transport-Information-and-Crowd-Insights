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
const VantaBackground = () => (
  <>
    {/* ── Fixed canvas layer — behind everything ────────────── */}
    <div
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      aria-hidden="true"
      style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #f5f7ff 45%, #eef2ff 100%)' }}
    >

      {/* Orb 1 — large indigo top-left */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        left: '-10%',
        width: '65vw',
        height: '65vw',
        maxWidth: 900,
        maxHeight: 900,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.22) 0%, transparent 68%)',
        animation: 'meshOrb1 18s ease-in-out infinite alternate',
      }} />

      {/* Orb 2 — violet / purple right-center */}
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '-12%',
        width: '55vw',
        height: '55vw',
        maxWidth: 780,
        maxHeight: 780,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.18) 0%, transparent 68%)',
        animation: 'meshOrb2 22s ease-in-out infinite alternate',
      }} />

      {/* Orb 3 — cyan bottom-left */}
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        left: '10%',
        width: '45vw',
        height: '45vw',
        maxWidth: 650,
        maxHeight: 650,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.15) 0%, transparent 68%)',
        animation: 'meshOrb3 26s ease-in-out infinite alternate',
      }} />

      {/* Orb 4 — blue / indigo bottom-right */}
      <div style={{
        position: 'absolute',
        bottom: '5%',
        right: '5%',
        width: '40vw',
        height: '40vw',
        maxWidth: 560,
        maxHeight: 560,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.14) 0%, transparent 68%)',
        animation: 'meshOrb4 20s ease-in-out infinite alternate',
      }} />

      {/* Orb 5 — small fuchsia / pink center accent */}
      <div style={{
        position: 'absolute',
        top: '45%',
        left: '35%',
        width: '30vw',
        height: '30vw',
        maxWidth: 420,
        maxHeight: 420,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.12) 0%, transparent 68%)',
        animation: 'meshOrb5 30s ease-in-out infinite alternate',
      }} />

      {/* ── Noise texture overlay — adds premium grain depth ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 200px',
        opacity: 1,
        mixBlendMode: 'multiply',
      }} />
    </div>

    {/* ── Keyframe animations in a style tag ─────────────────── */}
    <style>{`
      @keyframes meshOrb1 {
        0%   { transform: translate(0,   0)   scale(1.00); }
        33%  { transform: translate(4%,  3%)  scale(1.04); }
        66%  { transform: translate(-2%, 5%)  scale(0.97); }
        100% { transform: translate(3%, -2%)  scale(1.02); }
      }
      @keyframes meshOrb2 {
        0%   { transform: translate(0,   0)   scale(1.00); }
        33%  { transform: translate(-5%, 2%)  scale(1.06); }
        66%  { transform: translate(2%, -4%)  scale(0.95); }
        100% { transform: translate(-3%, 3%)  scale(1.03); }
      }
      @keyframes meshOrb3 {
        0%   { transform: translate(0,  0)    scale(1.00); }
        50%  { transform: translate(6%, -3%)  scale(1.08); }
        100% { transform: translate(-4%, 4%)  scale(0.96); }
      }
      @keyframes meshOrb4 {
        0%   { transform: translate(0,   0)   scale(1.00); }
        40%  { transform: translate(-4%, 4%)  scale(1.05); }
        100% { transform: translate(3%, -5%)  scale(0.98); }
      }
      @keyframes meshOrb5 {
        0%   { transform: translate(0,  0)    scale(1.00); }
        25%  { transform: translate(-6%, 4%)  scale(1.10); }
        75%  { transform: translate(4%, -6%)  scale(0.92); }
        100% { transform: translate(2%, 2%)   scale(1.04); }
      }
    `}</style>
  </>
);

export default VantaBackground;
