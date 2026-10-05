import * as THREE from 'three';
/* Covered GPU warm-up: real draws, not compile-only, while the loading cover is present. */
export const SpaceVoyagePerf = (function () {
  'use strict';
  var target = new THREE.Vector3();

  function collect(scene, renderer) {
    var textures = [], geometries = [];
    scene.traverse(function (object) {
      if (object.geometry && geometries.indexOf(object.geometry) < 0) geometries.push(object.geometry);
      if (!object.material) return;
      var materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach(function (material) {
        Object.keys(material).forEach(function (key) {
          var value = material[key];
          if (value && value.isTexture && textures.indexOf(value) < 0) {
            textures.push(value);
          }
        });
      });
    });
    return { textures: textures, geometries: geometries };
  }

  function warm(options) {
    var renderer = options.renderer, scene = options.scene, camera = options.camera;
    var skyDome = options.skyDome, views = options.views;
    var resources = collect(scene, renderer);
    renderer.compile(scene, camera);
    var warmTarget = new THREE.WebGLRenderTarget(32, 32, { depthBuffer: true, stencilBuffer: false });
    var savedPosition = camera.position.clone();
    var savedQuaternion = camera.quaternion.clone();
    var previousTarget = renderer.getRenderTarget();
    renderer.setRenderTarget(warmTarget);

    // Force one covered draw of every renderable before the representative route views. Parent
    // visibility is enabled too so a hidden group cannot prevent one of its meshes from reaching
    // the renderer. All state is restored immediately after this single pass.
    var savedObjectState = [];
    scene.traverse(function (object) {
      savedObjectState.push({
        object: object,
        visible: object.visible,
        frustumCulled: object.frustumCulled
      });
      object.visible = true;
      if (object.isMesh || object.isPoints || object.isSprite) object.frustumCulled = false;
    });
    camera.position.set(0, 12, -3000);
    target.set(0, 8, -3050);
    camera.lookAt(target);
    skyDome.position.copy(camera.position);
    renderer.render(scene, camera);
    savedObjectState.forEach(function (state) {
      state.object.visible = state.visible;
      state.object.frustumCulled = state.frustumCulled;
    });

    views.forEach(function (view) {
      camera.position.fromArray(view.p);
      target.fromArray(view.t);
      camera.lookAt(target);
      skyDome.position.copy(camera.position);
      renderer.render(scene, camera);
    });
    renderer.setRenderTarget(previousTarget);
    warmTarget.dispose();
    camera.position.copy(savedPosition);
    camera.quaternion.copy(savedQuaternion);
    skyDome.position.copy(camera.position);
    return { textureCount: resources.textures.length, geometryCount: resources.geometries.length, warmPasses: views.length + 1 };
  }

  return { warm: warm };
})();
