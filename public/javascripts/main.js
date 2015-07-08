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
  var marker,
      lineArr,
      md = mapData.map,
      mdLen = md.length;

  for(var j = 0; j < mdLen; j++) {
    drawMap(md[j], j);
  }

  function drawMap(data, index) {

    var slider = '#slide' + index;
    $(slider + " h1").html(data.date);

    var dataS = data.path;
    var dest = "mapContainer" + index;

    var map = new AMap.Map(dest, {
      resizeEnable: true,
      view: new AMap.View2D({
        center: new AMap.LngLat(dataS[0].lng, dataS[0].lat),
        zoom: 17
      }),
      continuousZoomEnable: false
    });
    AMap.event.addListener(map, "complete", completeEventHandler);

    function completeEventHandler() {
      marker = new AMap.Marker({
        map: map,
        position: new AMap.LngLat(dataS[0].lng, dataS[0].lat),
        icon: "http://7vijjg.com1.z0.glb.clouddn.com/move.jpg",
        offset: new AMap.Pixel(-26, -13),
        autoRotation: true
      });

      lineArr = new Array();
      var pathLen = dataS.length;
      for (var i = 0; i < pathLen; i++) {
          lineArr.push(new AMap.LngLat(dataS[i].lng, dataS[i].lat));
      }

      for(var i = 0; i < pathLen; i++) {
        addMaker(map, dataS, i);
      }

      var polyline = new AMap.Polyline({
        map: map,
        path: lineArr,
        strokeColor: "#00a",
        strokeOpacity: 1,
        strokeWeight: 2,
        strokeStyle: "solid"
      });

      map.setFitView();

      (function(marker, index, lineArr) {
        $('#slide' + index + ' input:first-child').on('click', function() {
          marker.moveAlong(lineArr, 2000);
        });

        $('#slide' + index + ' input:last-child').on('click', function() {
          marker.stopMove();
        });
      })(marker, index, lineArr);
    }
  }

  function addMaker(map, data, i) {
    var markerNew = new AMap.Marker({
      map: map,
      position: new AMap.LngLat(data[i].lng, data[i].lat),
      icon: "http://7vijjg.com1.z0.glb.clouddn.com/marker.png",
      title: data[i].name
    });
  }

  // image wall
  var $iw_thumbs = $('#iw_thumbs'),
      $iw_ribbon = $('#iw_ribbon'),
      $iw_ribbon_close = $iw_ribbon.children('span.iw_close'),
      $iw_ribbon_zoom = $iw_ribbon.children('span.iw_zoom')
      phd = photoData.photo,
      phLen = phd.length;

  for(var i = 0; i < phLen; i++) {
    addPhotoData(i);
  }

  function addPhotoData(i) {
    var li = '<li><img src="' + phd[i].small + '", data-img="' + phd[i].large + '", alt="' + phd[i].description + '">';
    li += '<div><p>' + phd[i].description + '</p></div>';
    li += '</li>';
    $iw_thumbs.append(li);
  }

  var ImageWall	= (function() {
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
