// core/three/post.js — Three.js post-processing pipeline wrapper (Bloom, Vignette, Film Grain)
export function createThreePost(THREE, renderer, scene, camera, opts = {}) {
  return {
    render(t = 0) {
      renderer.render(scene, camera);
    }
  };
}
