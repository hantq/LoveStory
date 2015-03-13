$(function() {

  // fullpage
  $('#fullpage').fullpage({
    sectionsColor: ['#eae1c0', '#4bbfc3', '#8fb98b', '#de564b', '#e5e6d0'],
    css3: true,
    scrollOverflow: true,
    navigation: true,
    navigationTooltips: ['正如初次见到你那样的心跳', '我们共同走过的时间',
      '我们一起去过的地方', '我们留下的那些回忆', '来给我们留言吧'],
    slidesNavigation: true,
    slidesNavTooltips: ['2014/11/16', '2014/12/07', '2014/12/13', '2014/12/14', '2014/12/31']
  });

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
    url: 'http://localhost:3000/data/travel.json',
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

  // image wall
  var $iw_thumbs = $('#iw_thumbs'),
      $iw_ribbon = $('#iw_ribbon'),
      $iw_ribbon_close = $iw_ribbon.children('span.iw_close'),
      $iw_ribbon_zoom = $iw_ribbon.children('span.iw_zoom');

  ImageWall	= (function() {
      var w_dim,
        current = -1,
        isRibbonShown = false,
        isFullMode = false,
        ribbonAnim = {speed : 500, easing : 'easeOutExpo'},
        imgAnim = {speed : 400, easing : 'swing'},

        init = function() {
          $iw_thumbs.imagesLoaded(function() {
            $iw_thumbs.masonry({
              isAnimated: true
            });
          });
          getWindowsDim();
          initEventsHandler();
        },
        getWindowsDim = function() {
          w_dim = {
            width	: $(window).width(),
            height	: $(window).height()
          };
        },
        initEventsHandler	= function() {
          $iw_thumbs.delegate('li', 'click', function() {
            if($iw_ribbon.is(':animated'))
              return false;
            var $el = $(this);
            if($el.data('ribbon')) {
              showFullImage($el);
            }
            else if(!isRibbonShown) {
              isRibbonShown = true;
              $el.data('ribbon',true);
              current = $el.index();
              showRibbon($el);
            }
          });

          $iw_ribbon_close.bind('click', closeRibbon);

          $(window).bind('resize', function() {
                getWindowsDim();
                if($iw_ribbon.is(':animated'))
                  return false;
                closeRibbon();
               }).bind('scroll', function() {
                if($iw_ribbon.is(':animated'))
                  return false;
                closeRibbon();
               });

        },
        showRibbon = function($el) {
          var	$img = $el.children('img'),
            $descrp	= $img.next();

          // fadeOut all the other images
          $iw_thumbs.children('li').not($el).animate({opacity : 0.2}, imgAnim.speed);

          // increase the image z-index, and set the height to 100px (default height)
          $img.css('z-index', 100)
            .data('originalHeight',$img.height())
            .stop()
            .animate({
              height : '100px'
            }, imgAnim.speed, imgAnim.easing);

          // the ribbon will animate from the left or right
          // depending on the position of the image
          var ribbonCssParam = {
              top	: $el.offset().top - $(window).scrollTop() - 6 + 'px'
            },
            descriptionCssParam,
            dir;

          if($el.offset().left < (w_dim.width / 2)) {
            dir = 'left';
            ribbonCssParam.left = 0;
            ribbonCssParam.right = 'auto';
          }
          else {
            dir = 'right';
            ribbonCssParam.right = 0;
            ribbonCssParam.left = 'auto';
          }

          $iw_ribbon.css(ribbonCssParam)
                .show()
                .stop()
                .animate({width : '100%'}, ribbonAnim.speed, ribbonAnim.easing, function() {
                  switch(dir) {
                    case 'left':
                      descriptionCssParam	= {
                        'left': $img.outerWidth(true) + 'px',
                        'text-align': 'left'
                      };
                      break;
                    case 'right' :
                      descriptionCssParam	= {
                        'left': '-200px',
                        'text-align': 'right'
                      };
                      break;
                  };
                  $descrp.css(descriptionCssParam).fadeIn();
                  $iw_ribbon_close.show();
                  $iw_ribbon_zoom.show();
                });
        },
        closeRibbon = function() {
          isRibbonShown = false;

          $iw_ribbon_close.hide();
          $iw_ribbon_zoom.hide();

          if(!isFullMode) {

            // current wall image
            var $el = $iw_thumbs.children('li').eq(current);

            resetWall($el);

            // slide out ribbon
            $iw_ribbon.stop()
                  .animate({width : '0%'}, ribbonAnim.speed, ribbonAnim.easing);

          }
          else {
            $iw_ribbon.stop().animate({
              opacity		: 0.8,
              height 		: '0px',
              marginTop	: w_dim.height/2 + 'px'
            }, ribbonAnim.speed, function() {
              $iw_ribbon.css({
                'width'		: '0%',
                'height'	: '126px',
                'margin-top': '0px'
              }).children('img').remove();
            });

            isFullMode	= false;
          }
        },
        resetWall			= function($el) {
          var $img		= $el.children('img'),
            $descrp		= $img.next();

          $el.data('ribbon',false);

          // reset the image z-index and height
          $img.css('z-index',1).stop().animate({
            height 		: $img.data('originalHeight')
          }, imgAnim.speed,imgAnim.easing);

          // fadeOut the description
          $descrp.fadeOut();

          // fadeIn all the other images
          $iw_thumbs.children('li').not($el).animate({opacity : 1}, imgAnim.speed);
        },
        showFullImage		= function($el) {
          isFullMode	= true;

          $iw_ribbon_close.hide();

          var	$img	= $el.children('img'),
            large	= $img.data('img'),

            // add a loading image on top of the image
            $loading = $('<span class="iw_loading"></span>');

          $el.append($loading);

          // preload large image
          $('<img/>').load(function() {
            var $largeImage	= $(this);

            $loading.remove();

            $iw_ribbon_zoom.hide();

            resizeImage($largeImage);

            // reset the current image in the wall
            resetWall($el);

            // animate ribbon in and out
            $iw_ribbon.stop().animate({
              opacity		: 1,
              height 		: '0px',
              marginTop	: '63px' // half of ribbons height
            }, ribbonAnim.speed, function() {
              // add the large image to the DOM
              $iw_ribbon.prepend($largeImage);

              $iw_ribbon_close.show();

              $iw_ribbon.animate({
                height 		: '100%',
                marginTop	: '0px',
                top			: '0px'
              }, ribbonAnim.speed);
            });
          }).attr('src',large);

        },
        resizeImage			= function($image) {
          var widthMargin		= 100,
            heightMargin 	= 100,

            windowH      	= w_dim.height - heightMargin,
            windowW      	= w_dim.width - widthMargin,
            theImage     	= new Image();

          theImage.src     	= $image.attr("src");

          var imgwidth     	= theImage.width,
            imgheight    	= theImage.height;

          if((imgwidth > windowW) || (imgheight > windowH)) {
            if(imgwidth > imgheight) {
              var newwidth 	= windowW,
                ratio 		= imgwidth / windowW,
                newheight 	= imgheight / ratio;

              theImage.height = newheight;
              theImage.width	= newwidth;

              if(newheight > windowH) {
                var newnewheight 	= windowH,
                  newratio 		= newheight/windowH,
                  newnewwidth 	= newwidth/newratio;

                theImage.width 		= newnewwidth;
                theImage.height		= newnewheight;
              }
            }
            else {
              var newheight 	= windowH,
                ratio 		= imgheight / windowH,
                newwidth 	= imgwidth / ratio;

              theImage.height = newheight;
              theImage.width	= newwidth;

              if(newwidth > windowW) {
                var newnewwidth 	= windowW,
                    newratio 		= newwidth/windowW,
                  newnewheight 	= newheight/newratio;

                theImage.height 	= newnewheight;
                theImage.width		= newnewwidth;
              }
            }
          }

          $image.css({
            'width'			: theImage.width + 'px',
            'height'		: theImage.height + 'px',
            'margin-left'	: -theImage.width / 2 + 'px',
            'margin-top'	: -theImage.height / 2 + 'px'
          });
        };

      return {init : init};
    })();

  ImageWall.init();

});
