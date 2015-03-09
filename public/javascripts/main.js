$(function() {

  // heart
  var container;
  var camera, scene, renderer;
  var group, text;
  var targetRotation = 0;
  var heartShape, particleCloud, sparksEmitter, emitterPos;
  var timeOnShapePath = 0;
  var windowWidth = window.innerWidth, windowHeight = window.innerHeight;

  init();
  animate();

  function init() {

    container = document.createElement('div');
    $("#heart")[0].appendChild(container);

    camera = new THREE.PerspectiveCamera(50, windowWidth / windowHeight, 1, 1000);
    camera.position.set(0, 150, 700);

    scene = new THREE.Scene();
    group = new THREE.Group();
    scene.add( group );

    var string = "I Love You";
    var text3d = new THREE.TextGeometry(string, {
      size: 60,
      height: 20,
      curveSegments: 2,
      font: "helvetiker"
    });

    text3d.computeBoundingBox();
    var centerOffset = -0.5 * (text3d.boundingBox.max.x - text3d.boundingBox.min.x);
    var textMaterial = new THREE.MeshBasicMaterial({
      color: Math.random() * 0xffffff,
      overdraw: 0.5
    });

    text = new THREE.Mesh(text3d, textMaterial);
    text.position.x = centerOffset;
    text.position.y = 100;
    text.position.z = 0;
    text.rotation.x = 0;
    text.rotation.y = Math.PI * 2;
    group.add(text);

    particleCloud = new THREE.Object3D();
    particleCloud.y = 800;
    group.add(particleCloud);

    // Create Particle Systems
    var x = 0, y = 0;
    heartShape = new THREE.Shape();
    heartShape.moveTo( x + 25, y + 25 );
    heartShape.bezierCurveTo( x + 25, y + 25, x + 20, y, x, y );
    heartShape.bezierCurveTo( x - 30, y, x - 30, y + 35,x - 30,y + 35 );
    heartShape.bezierCurveTo( x - 30, y + 55, x - 10, y + 77, x + 25, y + 95 );
    heartShape.bezierCurveTo( x + 60, y + 77, x + 80, y + 55, x + 80, y + 35 );
    heartShape.bezierCurveTo( x + 80, y + 35, x + 80, y, x + 50, y );
    heartShape.bezierCurveTo( x + 35, y, x + 25, y + 25, x + 25, y + 25 );

    var hue = 0;

    var hearts = function(context){
      context.globalAlpha = 0.5;
      var x = 0, y = 0;
      context.scale(0.05, -0.05); // Scale so canvas render can redraw within bounds
      context.beginPath();
       // From http://blog.burlock.org/html5/130-paths
      context.bezierCurveTo( x + 2.5, y + 2.5, x + 2.0, y, x, y );
      context.bezierCurveTo( x - 3.0, y, x - 3.0, y + 3.5,x - 3.0,y + 3.5 );
      context.bezierCurveTo( x - 3.0, y + 5.5, x - 1.0, y + 7.7, x + 2.5, y + 9.5 );
      context.bezierCurveTo( x + 6.0, y + 7.7, x + 8.0, y + 5.5, x + 8.0, y + 3.5 );
      context.bezierCurveTo( x + 8.0, y + 3.5, x + 8.0, y, x + 5.0, y );
      context.bezierCurveTo( x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5 );
      context.fill();
      context.lineWidth = 0.5;
      context.stroke();
    }

    var setTargetParticle = function(){
      var material = new THREE.SpriteCanvasMaterial( {
        program: hearts
      } );
      material.color.setHSL(hue, 1, 0.75);
      hue += 0.001;
      if (hue > 1) hue -= 1;
      particle = new THREE.Sprite( material );
      particle.scale.x = particle.scale.y = Math.random() * 40 + 40;
      particleCloud.add( particle );
      return particle;
    };

    var onParticleCreated = function( p ) {

      p.target.position.copy( p.position );

    };

    var onParticleDead = function( particle ) {

      particle.target.visible = false;
      particleCloud.remove( particle.target );

    };

    sparksEmitter = new SPARKS.Emitter(new SPARKS.SteadyCounter(160));

    emitterpos = new THREE.Vector3();

    sparksEmitter.addInitializer(new SPARKS.Position( new SPARKS.PointZone( emitterpos ) ) );
    sparksEmitter.addInitializer(new SPARKS.Lifetime(0,2));
    sparksEmitter.addInitializer(new SPARKS.Target(null, setTargetParticle));

    sparksEmitter.addInitializer(new SPARKS.Velocity(new SPARKS.PointZone(new THREE.Vector3(0,-50,10))));

    sparksEmitter.addAction(new SPARKS.Age());
    sparksEmitter.addAction(new SPARKS.Move());
    sparksEmitter.addAction(new SPARKS.RandomDrift(50,50,2000));

    sparksEmitter.addCallback("created", onParticleCreated);
    sparksEmitter.addCallback("dead", onParticleDead);
    sparksEmitter.addCallback("updated", function( particle ) {
      particle.target.position.copy( particle.position );
    });

    sparksEmitter.start();

    // End Particles

    renderer = new THREE.CanvasRenderer();
    renderer.setClearColor( 0xf0f0f0 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );

  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
  }

  function animate() {
    requestAnimationFrame( animate );
    render();
  }

  function render() {

    timeOnShapePath += 0.0337;

    if (timeOnShapePath > 1) timeOnShapePath -= 1;

    var pointOnShape = heartShape.getPointAt( timeOnShapePath );

    emitterpos.x = pointOnShape.x * 5 - 100;
    emitterpos.y = -pointOnShape.y * 5 + 400;

    particleCloud.rotation.y += 0.02;

    group.rotation.y += ( targetRotation - group.rotation.y ) * 0.05;
    renderer.render( scene, camera );

  }

  // timer
  timeElapse();
  setInterval(function() {
    timeElapse();
  }, 1000);

  function timeElapse() {
    var start = Date.parse("Jan 1, 2015");
    var current = new Date().getTime();

    var seconds = (current - start) / 1000;
    var days = Math.floor(seconds / (3600 * 24));
    seconds = seconds % (3600 * 24);
    var hours = Math.floor(seconds / 3600);

    if (hours < 10) {
      hours = "0" + hours;
    }
    seconds = seconds % 3600;
    var minutes = Math.floor(seconds / 60);
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    seconds = Math.floor(seconds % 60);
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    var result = " " + days + " 天 " + hours + " 小时 " + minutes + " 分 " + seconds + " 秒";
    $("#section1 span").html(result);
  }

  // map
  var mapData;
  $.ajax({
    type: 'get',
    url: 'http://localhost:3000/javascripts/travel.json',
    success: function(res) {
      mapData = res;
      console.log(mapData);
    },
    error: function() {
      console.log('Ajax access error!');
    }
  });

  function drawMap(selected) {
    var dataS = mapData[selected];

    //初始化地图对象，加载地图
    var map = new AMap.Map("mapContainer", {
      resizeEnable: true,
      //二维地图显示视口
      view: new AMap.View2D({
        //地图中心点
        center: new AMap.LngLat(dataS[0].lng, dataS[0].lat),
        //地图显示的缩放级别
        zoom: 17
      }),
      continuousZoomEnable: false
    });
    AMap.event.addListener(map, "complete", completeEventHandler);

    //地图图块加载完毕后执行函数
    function completeEventHandler() {
      marker = new AMap.Marker({
        map: map,
        position: new AMap.LngLat(dataS[0].lng, dataS[0].lat), //基点位置
        icon: "http://code.mapabc.com/images/car_03.png", //marker图标，直接传递地址url
        offset: new AMap.Pixel(-26, -13), //相对于基点的位置
        autoRotation: true
      });

      lineArr = new Array();
      for (var i = 0; i < dataS.length; i++) {
        lineArr.push(new AMap.LngLat(dataS[i].lng, dataS[i].lat));
      }

      //绘制轨迹
      var polyline = new AMap.Polyline({
        map: map,
        path: lineArr,
        strokeColor: "#00A", //线颜色
        strokeOpacity: 1, //线透明度
        strokeWeight: 3, //线宽
        strokeStyle: "solid" //线样式
      });

      map.setFitView();

      marker.moveAlong(lineArr, 2000);
    }
  }




  // comments
  (function() {
		var ds = document.createElement('script');
		ds.type = 'text/javascript';ds.async = true;
		ds.src = (document.location.protocol == 'https:' ? 'https:' : 'http:') + '//static.duoshuo.com/embed.js';
		ds.charset = 'UTF-8';
		(document.getElementsByTagName('head')[0]
		 || document.getElementsByTagName('body')[0]).appendChild(ds);
	})();


});
