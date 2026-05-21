
var SlideTransition = (function () {

  var _root       = null;   
  var _slideOut   = null;   
  var _slideIn    = null;   
  var _tl         = null;   
  var _swiper     = null;
  var _busy       = false;

  // ─── camera config ───────────────────────────────────────────────
  var CAM_FOV = 70;   
  var CAM_Z   = 60;   


  function _calcPlaneSize(containerW, containerH) {
    var fovRad = (CAM_FOV * Math.PI) / 180;
    var h      = 2 * Math.tan(fovRad / 2) * CAM_Z;
    var aspect = containerW / containerH;
    var w      = h * aspect;
    return { w: w, h: h };
  }

  var W = 100, H = 60; 

  // ═══════════════════════════════════════════════════════════════════
  //  PUBLIC API
  // ═══════════════════════════════════════════════════════════════════

  function init(swiperInstance) {
    _swiper = swiperInstance;

    var firstSlide = swiperInstance.slides[swiperInstance.activeIndex];

    var sliderWrapper = swiperInstance.el; 
    _buildRoot(sliderWrapper);

    var sz = _calcPlaneSize(sliderWrapper.offsetWidth, sliderWrapper.offsetHeight);
    W = sz.w;
    H = sz.h;


    var firstImg = firstSlide.querySelector('.wa_ani_image img');
    if (firstImg) {
      _loadAndShowIn(firstImg.src, null, true /* isFirstLoad */);
    }

    // hook Swiper slide-change
    swiperInstance.on('slideChangeTransitionStart', function () {
      if (_busy) return;
      _onSlideChange();
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  //  INTERNAL
  // ═══════════════════════════════════════════════════════════════════

  function _buildRoot(container) {
    _root = new THREERoot({
      container:           container,
      createCameraControls: false,
      antialias:           (window.devicePixelRatio === 1),
      fov:                 CAM_FOV
    });

    _root.renderer.setClearColor(0x000000, 0);
    _root.renderer.setPixelRatio(window.devicePixelRatio || 1);
    _root.camera.position.set(0, 0, CAM_Z);

    window.addEventListener('resize', function () {
      var sz = _calcPlaneSize(container.offsetWidth, container.offsetHeight);
      W = sz.w;
      H = sz.h;
    });
  }

  function _onSlideChange() {
    var activeSlide = _swiper.slides[_swiper.activeIndex];
    var img         = activeSlide ? activeSlide.querySelector('.wa_ani_image img') : null;
    if (!img) return;

    // previous slide image (we need it to animate OUT)
    var prevIndex = _swiper.previousIndex;
    var prevSlide = _swiper.slides[prevIndex];
    var prevImg   = prevSlide ? prevSlide.querySelector('.wa_ani_image img') : null;

    _loadAndShowIn(img.src, prevImg ? prevImg.src : null, false);
  }

  /**
   * @param {string}  inSrc        URL of image to animate IN
   * @param {string|null} outSrc   URL of image to animate OUT (null on first load)
   * @param {boolean} firstLoad
   */
  function _loadAndShowIn(inSrc, outSrc, firstLoad) {
    _busy = true;

    var loader   = new THREE.ImageLoader();
    loader.setCrossOrigin('Anonymous');

    var loaded   = 0;
    var inImg    = null;
    var outImg   = null;

    function tryStart() {
      loaded++;
      var needed = outSrc ? 2 : 1;
      if (loaded < needed) return;
      _runTransition(inImg, outImg, firstLoad);
    }

    loader.load(inSrc, function (img) { inImg = img; tryStart(); });

    if (outSrc) {
      var loader2 = new THREE.ImageLoader();
      loader2.setCrossOrigin('Anonymous');
      loader2.load(outSrc, function (img) { outImg = img; tryStart(); });
    }
  }

  function _runTransition(inImg, outImg, firstLoad) {
    // kill old timeline
    if (_tl) { _tl.kill(); _tl = null; }

    // remove old meshes
    if (_slideOut) { _root.scene.remove(_slideOut); _slideOut = null; }
    if (_slideIn)  { _root.scene.remove(_slideIn);  _slideIn  = null; }

    _slideIn = new Slide(W, H, 'in');
    _slideIn.setImage(inImg);
    _root.scene.add(_slideIn);

    _tl = new TimelineMax({
      onComplete: function () {
        _busy = false;
        // keep slideIn visible but stop re-rendering (optional perf)
      }
    });

    if (outImg && !firstLoad) {
      _slideOut = new Slide(W, H, 'out');
      _slideOut.setImage(outImg);
      _root.scene.add(_slideOut);

      _tl.add(_slideOut.transition(), 0);
    }

    _tl.add(_slideIn.transition(), 0);
  }

  // ═══════════════════════════════════════════════════════════════════
  //  Slide class  (triangle particle mesh)
  // ═══════════════════════════════════════════════════════════════════

  var SEG_X = 200;
  var SEG_Y = 100;

  function Slide(width, height, animationPhase) {
    var plane = new THREE.PlaneGeometry(width, height, SEG_X, SEG_Y);
    THREE.BAS.Utils.separateFaces(plane);

    var geometry = new SlideGeometry(plane);


    var aAnimation     = geometry.createAttribute('aAnimation',     2);
    var aStartPosition = geometry.createAttribute('aStartPosition', 3);
    var aControl0      = geometry.createAttribute('aControl0',      3);
    var aControl1      = geometry.createAttribute('aControl1',      3);
    var aEndPosition   = geometry.createAttribute('aEndPosition',   3);

    var minDuration = 0.8, maxDuration = 1.2;
    var maxDelayX   = 0.9, maxDelayY   = 0.125, stretch = 0.11;

    this.totalDuration = maxDuration + maxDelayX + maxDelayY + stretch;

    var startPosition = new THREE.Vector3();
    var control0      = new THREE.Vector3();
    var control1      = new THREE.Vector3();
    var endPosition   = new THREE.Vector3();
    var tempPoint     = new THREE.Vector3();

    function getCP0(centroid) {
      var sy = Math.sign(centroid.y);
      tempPoint.x = THREE.Math.randFloat(0.1, 0.3) * 50;
      tempPoint.y = sy * THREE.Math.randFloat(0.1, 0.3) * 70;
      tempPoint.z = THREE.Math.randFloatSpread(20);
      return tempPoint;
    }
    function getCP1(centroid) {
      var sy = Math.sign(centroid.y);
      tempPoint.x = THREE.Math.randFloat(0.3, 0.6) * 50;
      tempPoint.y = -sy * THREE.Math.randFloat(0.3, 0.6) * 70;
      tempPoint.z = THREE.Math.randFloatSpread(20);
      return tempPoint;
    }

    var i, i2, i3, v;
    for (i = 0, i2 = 0, i3 = 0; i < geometry.faceCount; i++, i2 += 6, i3 += 9) {
      var face     = plane.faces[i];
      var centroid = THREE.BAS.Utils.computeCentroid(plane, face);

      var duration = THREE.Math.randFloat(minDuration, maxDuration);
      var delayX   = THREE.Math.mapLinear(centroid.x, -width * 0.5, width * 0.5, 0.0, maxDelayX);
      var delayY   = (animationPhase === 'in')
        ? THREE.Math.mapLinear(Math.abs(centroid.y), 0, height * 0.5, 0.0,       maxDelayY)
        : THREE.Math.mapLinear(Math.abs(centroid.y), 0, height * 0.5, maxDelayY, 0.0);

      for (v = 0; v < 6; v += 2) {
        aAnimation.array[i2 + v]     = delayX + delayY + Math.random() * stretch * duration;
        aAnimation.array[i2 + v + 1] = duration;
      }

      endPosition.copy(centroid);
      startPosition.copy(centroid);

      if (animationPhase === 'in') {
        control0.copy(centroid).sub(getCP0(centroid));
        control1.copy(centroid).sub(getCP1(centroid));
      } else {
        control0.copy(centroid).add(getCP0(centroid));
        control1.copy(centroid).add(getCP1(centroid));
      }

      for (v = 0; v < 9; v += 3) {
        aStartPosition.array[i3+v]   = startPosition.x;
        aStartPosition.array[i3+v+1] = startPosition.y;
        aStartPosition.array[i3+v+2] = startPosition.z;
        aControl0.array[i3+v]        = control0.x;
        aControl0.array[i3+v+1]      = control0.y;
        aControl0.array[i3+v+2]      = control0.z;
        aControl1.array[i3+v]        = control1.x;
        aControl1.array[i3+v+1]      = control1.y;
        aControl1.array[i3+v+2]      = control1.z;
        aEndPosition.array[i3+v]     = endPosition.x;
        aEndPosition.array[i3+v+1]   = endPosition.y;
        aEndPosition.array[i3+v+2]   = endPosition.z;
      }
    }

    var material = new THREE.BAS.BasicAnimationMaterial(
      {
        shading:  THREE.FlatShading,
        side:     THREE.DoubleSide,
        uniforms: { uTime: { type: 'f', value: 0 } },
        shaderFunctions: [
          THREE.BAS.ShaderChunk['cubic_bezier'],
          THREE.BAS.ShaderChunk['ease_in_out_cubic'],
          THREE.BAS.ShaderChunk['quaternion_rotation']
        ],
        shaderParameters: [
          'uniform float uTime;',
          'attribute vec2 aAnimation;',
          'attribute vec3 aStartPosition;',
          'attribute vec3 aControl0;',
          'attribute vec3 aControl1;',
          'attribute vec3 aEndPosition;',
        ],
        shaderVertexInit: [
          'float tDelay    = aAnimation.x;',
          'float tDuration = aAnimation.y;',
          'float tTime     = clamp(uTime - tDelay, 0.0, tDuration);',
          'float tProgress = ease(tTime, 0.0, 1.0, tDuration);'
        ],
        shaderTransformPosition: [
          (animationPhase === 'in'
            ? 'transformed *= tProgress;'
            : 'transformed *= 1.0 - tProgress;'),
          'transformed += cubicBezier(aStartPosition, aControl0, aControl1, aEndPosition, tProgress);'
        ]
      },
      { map: new THREE.Texture() }
    );

    THREE.Mesh.call(this, geometry, material);
    this.frustumCulled = false;
  }

  Slide.prototype = Object.create(THREE.Mesh.prototype);
  Slide.prototype.constructor = Slide;

  Object.defineProperty(Slide.prototype, 'time', {
    get: function ()  { return this.material.uniforms['uTime'].value; },
    set: function (v) { this.material.uniforms['uTime'].value = v; }
  });

  Slide.prototype.setImage = function (image) {
    // ── cover UV mapping ──────────────────────────────────────────
    var imgAspect   = image.width  / image.height;
    var planeAspect = W / H;

    var scaleU, scaleV, offsetU, offsetV;

    if (imgAspect > planeAspect) {
      scaleV  = 1;
      scaleU  = planeAspect / imgAspect;
      offsetU = (1 - scaleU) / 2;
      offsetV = 0;
    } else {
      scaleU  = 1;
      scaleV  = imgAspect / planeAspect;
      offsetU = 0;
      offsetV = (1 - scaleV) / 2;
    }

    var uvArray = this.geometry.attributes.uv
      ? this.geometry.attributes.uv.array
      : null;

    if (!uvArray) {
      this.geometry.bufferUVs();
      uvArray = this.geometry.attributes.uv.array;
    }

    for (var i = 0; i < uvArray.length; i += 2) {
      uvArray[i]     = offsetU + uvArray[i]     * scaleU;  // u
      uvArray[i + 1] = offsetV + uvArray[i + 1] * scaleV;  // v
    }
    this.geometry.attributes.uv.needsUpdate = true;

    this.material.uniforms.map.value.image      = image;
    this.material.uniforms.map.value.needsUpdate = true;
  };

  Slide.prototype.transition = function () {
    return TweenMax.fromTo(this, 2.5,
      { time: 0.0 },
      { time: this.totalDuration, ease: Power0.easeNone }
    );
  };

  // ─── SlideGeometry ───────────────────────────────────────────────

  function SlideGeometry(model) {
    THREE.BAS.ModelBufferGeometry.call(this, model);
  }
  SlideGeometry.prototype = Object.create(THREE.BAS.ModelBufferGeometry.prototype);
  SlideGeometry.prototype.constructor = SlideGeometry;

  SlideGeometry.prototype.bufferPositions = function () {
    var buf = this.createAttribute('position', 3).array;
    for (var i = 0; i < this.faceCount; i++) {
      var face     = this.modelGeometry.faces[i];
      var centroid = THREE.BAS.Utils.computeCentroid(this.modelGeometry, face);
      var a = this.modelGeometry.vertices[face.a];
      var b = this.modelGeometry.vertices[face.b];
      var c = this.modelGeometry.vertices[face.c];
      buf[face.a*3]   = a.x - centroid.x;
      buf[face.a*3+1] = a.y - centroid.y;
      buf[face.a*3+2] = a.z - centroid.z;
      buf[face.b*3]   = b.x - centroid.x;
      buf[face.b*3+1] = b.y - centroid.y;
      buf[face.b*3+2] = b.z - centroid.z;
      buf[face.c*3]   = c.x - centroid.x;
      buf[face.c*3+1] = c.y - centroid.y;
      buf[face.c*3+2] = c.z - centroid.z;
    }
  };

  // ─── THREERoot ───────────────────────────────────────────────────

  function THREERoot(params) {
    this.renderer = new THREE.WebGLRenderer({ antialias: params.antialias, alpha: true });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));

    // inject canvas
    var container = params.container;
    var canvas    = this.renderer.domElement;
    canvas.style.cssText = [
      'position:absolute',
      'top:0', 'left:0',
      'width:100%', 'height:100%',
      'pointer-events:none',
      'z-index: -2'
    ].join(';');
    container.style.position = container.style.position || 'relative';
    container.appendChild(canvas);

    this.camera = new THREE.PerspectiveCamera(params.fov,
      container.offsetWidth / container.offsetHeight, 10, 100000);

    this.scene = new THREE.Scene();

    this.resize = this.resize.bind(this);
    this.tick   = this.tick.bind(this);

    this._container = container;
    this.resize();
    this.tick();

    window.addEventListener('resize', this.resize, false);
  }

  THREERoot.prototype = {
    tick:   function () { this.render(); requestAnimationFrame(this.tick); },
    render: function () { this.renderer.render(this.scene, this.camera); },
    resize: function () {
      var w = this._container.offsetWidth;
      var h = this._container.offsetHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    }
  };

  // ─── public ──────────────────────────────────────────────────────
  return { init: init };

})();