/** Fixed ambient backdrop: aurora gradients, drifting orbs, a faint grid and film grain. Purely decorative. */
export function Scene() {
  return (
    <div className="scene" aria-hidden="true">
      <span className="scene-orb a" />
      <span className="scene-orb b" />
      <span className="scene-orb c" />
      <span className="scene-grid" />
      <span className="scene-noise" />
    </div>
  );
}
