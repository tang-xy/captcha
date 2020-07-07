window['_imgcaptcha'] =  (function(){
    var defaluts = {
        newSignatureSrc: '//captcha.com/getNewSignature',
		imgSrc: '//captcha.com/getImg',
		preSrc: '//captcha.com/captcha/v1/js?captcha_type=1',
		verifySrc: '//captcha.com/getTicket',
        callback: function(e){console.log(e);},
		fail: function(e){console.log(e);}
	};
	var opt = defaluts;
    var el, input, imgbox;
    var model = 'waiting';
	var urlparams = '';
	var sign =';'
    function creatEl(type, conf) {
		var element = document.createElement(type)
		for(att in conf) {
			if(conf[att] !== undefined)
				element.setAttribute(att,conf[att]);
		}
		return element;
    }
    function extend(o,n){
		for (var p in n){
			 if(n.hasOwnProperty(p))
				 o[p]=n[p];
		 }
     }; 
     function reset() {
         if( model == 'waiting'){
            model = 'load';
            input.setplaceholder('验证码加载中');
            jsonp({
                jsonp: 'getPreHandle',
                url: opt.preSrc+ '&random=' + Math.random() * (new Date().getTime()),
                success: getPreHandle,
                timeout: function() {
                    input.setplaceholder('验证码加载失败');
                    model = 'waiting';
                },
                time: true
            })
         }
     }
     function getPreHandle(data) {
        if(data.status_code === 0 ) {
            var src = opt.newSignatureSrc + '?' + data.url.split("?")[1];
            jsonp({
                jsonp: 'getNewSignature',
                url: src+ '&random=' + Math.random() * (new Date().getTime()),
                success: getNewSignature,
                timeout: function() {
                    input.setplaceholder('验证码加载失败');
                    model = 'waiting';
                },
                time: true
            })
        } else {
            input.setplaceholder('验证码加载失败');
			model = 'waiting';
		}
     }
     function getNewSignature(data){
        if(data.code === 0 ) {
			sign = data.signature;
            urlparams = data.urlParams;
            var imgSrc = opt.imgSrc + '?random=' + Math.random() * (new Date().getTime()) + '&' + data.urlParams;
            imgbox.setAttribute('src', imgSrc);
            imgbox.onload = function() {
                model = 'waiting';
                input.setplaceholder('请输入验证码');
            }
        } else {
            input.setplaceholder('验证码加载失败');
			model = 'waiting';
		}
     }
     function verify() {
         model = 'load';
         var src = opt.verifySrc + '?' + urlparams + '&phrase=' + input.value;
        jsonp({
            jsonp: 'verify',
            url: src,
            success: function(data) {
                model = 'waiting';
                if(data.code === 0){
                    opt.callback({
						ticket: data.ticket,
						phrase:input.value,
						signature: sign,
						captcha_type: 1,
					   });
                } else {
                    input.value = '';
                    opt.fail();
                    reset();
                }
            },
            timeout: function() {
                input.setplaceholder('验证失败');
                model = 'waiting';
            },
            time: true
        })
     }
     function jsonp(params) {
		params = params || {};
		var callbackName = params.jsonp;
		var head = document.getElementsByTagName("head")[0]
		var script = document.createElement('script');
		script.src = params.url + '&callback=' + callbackName;
		script.onerror = function(e) {
			//console.log(e);
		};
		window[callbackName] = function (jsonData) {
			head.removeChild(script);
			clearTimeout(script.timer);
			window[callbackName] = null;
			params.success && params.success(jsonData)
		}
		//请求超时的处理函数
		if (params.time) {
			script.timer = setTimeout(function() {
				window[callbackName] = null;
				head.removeChild(script)
				params.timeout && params.timeout({
					message: '超时'
				})
			}, 5000);
		}
		head.appendChild(script);
    }
    function adaptatPlaceholder() {
        if('placeholder'in this){
            this.setplaceholder = function(value) {
                this.setAttribute('placeholder', value);
            };   
        } else {
            this.onfocus = function() {
                this.value = '';
            }
            this.setplaceholder = function(value) {
                this.value = value;
            };    
        }
    }
    
     return {
        'init' :function(elId,options) {
            el = document.getElementById(elId);
            el.style.cssText = 'border-bottom: 1px solid #DDDDDD;height: 65px; position: relative;'
            extend(opt,options);
            var html = 
	'				    <input type="text" class="imgcaptcha-input" id="imgcaptcha-input">'+
	'				    <img src="//captcha.com/getImg" class="imgcaptcha-img" id="imgcaptcha-img">'
            el.innerHTML = html;
            imgbox = document.getElementById('imgcaptcha-img');
            imgbox.onclick = reset;
            input = document.getElementById('imgcaptcha-input');
            adaptatPlaceholder.apply(input);
            input.setplaceholder("请输入验证码");
            reset();
        },
        'verify' : verify
    };
})();

window['_clicaptcha'] = (function(){
	var defaluts = {
		imgSrc: '//captcha.com/getImg',
		preSrc: '//captcha.com/getPreHandle?captcha_type=3&appid=registernew',
		verifySrc: '//captcha.com/getTicket',
		successText: '验证成功！',
		failedText: '未点中正确区域，请重试！',
		callback: function(e){console.log(e);},
		fail: function(e){console.log(e);}
	};
	var opt = defaluts;
	var el = document.getElementsByTagName('body')[0];
	var container;
	var imgbox;
	var img;
	var title;
	var refreshBtn;
	var mask;
	var step = [];
	var text;
	var model = 'waiting';
	var xyArr = [];
	var data;
	var sign = '';
	init();
	var down = function(e) {
		e.preventDefault ? e.preventDefault() : (e.returnValue = false);
		img.setmouseup (up);
	};
	var up = function(e) {
		if(model === 'done') {
			xyArr.push(e.offsetX + ',' + e.offsetY);
			var nowStep = creatEl('span',{
				'id': "step" + step.length
			});
			//debugger;
			nowStep.style.cssText = 'left:' + (e.offsetX - 13) + 'px;top:' + (e.offsetY - 13) + 'px';
			nowStep.innerHTML = xyArr.length.toString()
			imgbox.appendChild(nowStep);
			step.push(nowStep);
			if(xyArr.length == text.length){
				model = 'loading';
				var captchainfo = [xyArr.join('-'), img.width, img.height].join(';');
				jsonp({
					jsonp: 'result',
					url: opt.verifySrc + '?' + data.data.urlParams
						+ '&phrase=' + captchainfo,
					success: result,
					timeout: function() {
						title.innerHTML = '验证失败，请刷新重试';
						setTimeout(function(){
							model = 'waiting';
							reset()
						}, 1500);
					},
					time: true
				})
			}
		}
		img.setmouseup(null);
	};
	function creatEl(type, conf) {
		var element = document.createElement(type)
		for(att in conf) {
			if(conf[att] !== undefined)
				element.setAttribute(att,conf[att]);
		}
		return element;
	}
	function extend(o,n){
		for (var p in n){
			 if(n.hasOwnProperty(p))
				 o[p]=n[p];
		 }
	 }; 
	function hide() {
		mask.style.display='none';
		container.style.display='none';
		title.innerHTML = '';
		model = 'waiting';
	};
	function init() {
		el.innerHTML += '<div id="clicaptcha-container">'+
		'<div id="clicaptcha-imgbox">'+
			'<img id="clicaptcha-img" alt="">'+
		'</div>'+
		'<div id="clicaptcha-title"></div>'+
		'<div id="clicaptcha-refresh-box">'+
			'<div id="clicaptcha-refresh-line clicaptcha-refresh-line-left"></div>'+
			'<a href="javascript:;" id="clicaptcha-refresh-btn" title="刷新"></a>'+
			'<div id="clicaptcha-refresh-line clicaptcha-refresh-line-right"></div>'+
		'</div>'+
	'</div>' + '<div id="clicaptcha-mask"></div>';
		mask = document.getElementById("clicaptcha-mask");
		img = document.getElementById("clicaptcha-img");
		imgbox = document.getElementById("clicaptcha-imgbox");
		container = document.getElementById("clicaptcha-container");
		refreshBtn = document.getElementById("clicaptcha-refresh-btn");
		title = document.getElementById("clicaptcha-title");
		mask.onclick = hide;
		refreshBtn.onclick = function() {
			reset();
		};
	
	if(img.addEventListener) {
		img.setmousedown = function(fn){
			img.removeEventListener('mousedown',fn);
			img.addEventListener('mousedown',fn);
		}
		img.setmouseup = function(fn){
			img.removeEventListener('mouseup',fn);
			img.addEventListener('mouseup',fn);
		}
	} else {
		img.setmousedown = function(fn){
			img.detachEvent('onmousedown',fn);
			img.attachEvent('onmousedown',fn);
		}
		img.setmouseup = function(fn){
			img.detachEvent('onmouseup',fn);
			img.attachEvent('onmouseup',fn);
		}
	}
		
	}
	function getPreHandle(params) {
		data = params;
		sign = data.data.sign;
		if(data.code === 0 ) {
			var imgSrc = opt.imgSrc + '?random=' + Math.random() * (new Date().getTime()) + '&' + data.data.urlParams;
			img.setAttribute('src', imgSrc);
			img.onload = function() {
				xyArr = [];
				text = data.data.problem;
				var t = [];
				for(var i = 0; i < text.length; i++){
					t.push('“<span>'+text[i]+'</span>”');
				}
				var titleText = '请依次点击' + t.join('、');
				title.innerHTML = titleText;
				model = 'done';
				
				img.setAttribute('alt', '验证码加载失败，请点击刷新按钮');
				img.setmousedown (down);
			}
		} else {
			img.setAttribute('alt', '验证码加载失败，请点击刷新按钮');
			model = 'done';
		}
	}
	function result(data) {
		model = 'waiting';
		if(data.code == 0) {
			title.innerHTML = opt.successText;
			setTimeout(function(){
				hide();
				opt.callback({
					ticket: data.ticket,
					phrase: [xyArr.join('-'), img.width, img.height].join(';'),
					signature: sign,
					captcha_type: 3,
				   });
			}, 1500);
		} else {
			title.innerHTML = opt.failedText;
			setTimeout(function(){
				reset()
			}, 1500);
		}
	}
	function reset() {
		if(model !== 'waiting' && model !== 'done') {
			return;
		}
		model = 'load';
		img.setAttribute('alt', '验证码加载中');
		if(step.length !== 0) {
			for(var index = 0;index < step.length;index++){
				imgbox.removeChild(step[index]);
			}
			step = [];
		}	
		img.setAttribute('src', '');
		mask.style.display='block';
		container.style.display='block';
		jsonp({
			jsonp: 'PreHandle',
			url: opt.preSrc + '&' + Math.random() * (new Date().getTime()),
			success: getPreHandle,
			timeout: function() {
				img.setAttribute('alt', '验证码加载失败，请点击刷新按钮');
				model = 'done';
			},
			time: true
		})
		// $.ajax({
		// 	url:opt.preSrc + '&' + Math.random() * (new Date().getTime()),
		// 	type:'GET',
		// 	data:{},
		// 	dataType:'jsonp',
		// 	jsonp: 'callback',
		// 	success:function(result){
		// 		console.log(result);
		// 	},
		// 	error:function(e){
		// 		console.log(e);
		// 	},
		// 	complete:function(){
		// 	}
		// });
	}
	function jsonp(params) {
		params = params || {};
		var callbackName = params.jsonp;
		var head = document.getElementsByTagName("head")[0]
		var script = document.createElement('script');
		script.src = params.url + '&callback=' + callbackName;
		script.onerror = function(e) {
			console.log(e);
		};
		window[callbackName] = function (jsonData) {
			head.removeChild(script);
			clearTimeout(script.timer);
			window[callbackName] = null;
			params.success && params.success(jsonData)
		}
		//请求超时的处理函数
		if (params.time) {
			script.timer = setTimeout(function() {
				window[callbackName] = null;
				head.removeChild(script)
				params.timeout && params.timeout({
					message: '超时'
				})
			}, 5000);
		}
		head.appendChild(script);
		
	}
	return {
		'clicaptcha': function(options) {
			if(options != undefined){
				extend(opt,options);
			}
			reset();
		}
	}
})();

window['_slicaptcha'] = (function(){
	var el,
		img,
		block,
		barText,
		slider,
		sliderIcon,
		originX,
		originY,
		mask,
		urlparams,
		inity;
	var isMouseDown = false;
	var loading = false;
	var hasinit = false;
	var trail = [];
	var sign = '';
	var opt = {
        width: 309,     // canvas宽度
        height: 177,    // canvas高度
        PI: Math.PI,
		scale: 309/340,
		useAfterSuccess: true,
		loadingText: '加载中...',
        failedText: '再试一次',
		barText: '向右拖动滑块填充拼图',
		imgSrc: '//captcha.com/getImg',
		preSrc: '//captcha.com/getPreHandle?captcha_type=4&appid=registernew',
		verifySrc: '//captcha.com/getTicket',
		callback: function(e){console.log(e);},
		fail: function(e){console.log(e);}
	};
	var handleDragStart = function (e) {
		if(isMouseDown || loading) return;
		originX = e.clientX || e.touches[0].clientX;
		originY = e.clientY || e.touches[0].clientY;
		isMouseDown = true;
		barText.innerHTML = '&nbsp;';
		slider.style.backgroundPosition = ' -80px -207px';
	};
	var handleDragMove = function (e) {
		if (!isMouseDown || loading) return false;
		var eventX = e.clientX || e.touches[0].clientX;
		var eventY = e.clientY || e.touches[0].clientY;
		var moveX = eventX - originX;
		var moveY = eventY - originY;
		if (moveX < 0 || moveX + 40 > opt.width) return false;
		slider.style.left = (moveX) + 'px';
		var blockLeft = (opt.width - 40 - 20) / (opt.width - 40) * moveX;
		block.style.left = (moveX + 21) + 'px';
		//sliderContainer.classList.add('sliderContainer_active');
		mask.style.width = (moveX + 4) + 'px';
		trail.push((Math.round(moveX), Math.round(moveY)));
	};
	var handleDragEnd = function (e) {
		if (!isMouseDown || loading) return false;
		isMouseDown = false;
		loading = true;
		var eventX = e.clientX || e.changedTouches[0].clientX;
		//if (eventX === originX) return false;
		//sliderContainer.classList.remove('sliderContainer_active');
		verify(eventX-originX);
	};
	function verify(x) {
		var src = opt.verifySrc + '?' + urlparams + '&phrase=' + (x) + ';' + inity + ';' + opt.width + ';' + opt.height;
	   jsonp({
		   jsonp: 'verify',
		   url: src,
		   success: function(data) {
			   if(data.code === 0){
				   if(opt.useAfterSuccess){
					setTimeout(function () {
						loading = false;
						//reset();
					}, 1000);
				   }
				   slider.style.backgroundPosition = ' -220px -207px';
				   slider.style.cssText += ';top: -1px;border: 1px solid #52CCBA;background-color: #52CCBA !important;';
				   mask.style.cssText += ';border-width: 1px 0 1px 1px;border: 1px solid #52CCBA;background-color: #D2F4EF !important;';
				   opt.callback({
					ticket: data.ticket,
					phrase: (x) + ';' + inity + ';' + opt.width + ';' + opt.height,
					signature: sign,
					captcha_type: 4,
				   });
			   } else {
				barText.innerHTML = opt.failedText;
				slider.style.backgroundPosition = ' -10px -207px';
				slider.style.cssText += ';top: -1px;border: 1px solid #f57a7a;background-color: #f57a7a !important;';
				mask.style.cssText += ';border-width: 1px 0 1px 1px;border: 1px solid #f57a7a;background-color: #fce1e1 !important;';
				opt.fail();
				setTimeout(function () {
					loading = false;
					reset();
				}, 1000);
			   }
		   },
		   timeout: function() {
			   
			slider.style.backgroundPosition = ' -10px -207px';
			slider.style.cssText += ';top: -1px;border: 1px solid #f57a7a;background-color: #f57a7a !important;';
			mask.style.cssText += ';border-width: 1px 0 1px 1px;border: 1px solid #f57a7a;background-color: #fce1e1 !important;';
			barText.innerHTML = opt.failedText;
			opt.fail();
				setTimeout(function () {
					loading = false;
					reset();
				}, 1000);
		   },
		   time: true
	   })
	}
	function reset(){
		if(loading) return;
		loading = true;
		isMouseDown = false;
		slider.style.cssText = '';
		//slider.style.backgroundImage = "url('assets/captcha_sprites.png')";
		slider.style.backgroundPosition = ' -150px -207px';
		block.style.left = '21px';
		mask.style.cssText = '';
		barText.innerHTML = opt.loadingText;
		//img.style.background = "url('assets/captcha_sprites.png') -10px -10px";
		//img.setAttribute("src", 'file://D:\\Captcha\\catpcha-demo-js\\captcha\\assets\\loading.png');
		jsonp({
			jsonp: 'PreHandle',
			url: opt.preSrc+ '&random=' + Math.random() * (new Date().getTime()),
			success: getPreHandle,
			timeout: function() {
				loading = false;
			},
			time: true
		})
	};
	function getPreHandle(data) {
		if(data.code === 0) {
			sign = data.data.sign;
			urlparams = data.data.urlParams;
			var src = opt.imgSrc + '?' + urlparams + '&iuk=';
			img.setAttribute("src", src + data.data.imgs[0]);
			img.onload = function() {
				barText.innerHTML = opt.barText;
				loading = false;
			};
			inity = (data.data.inity/340 * opt.width);
			block.style.top = (inity + 45) +'px';
			block.style.display = 'block';
			block.setAttribute("src", src + data.data.imgs[1]);
			block.onload = function() {
				block.clientHeight *= opt.scale;
				
				block.clientWidth *= opt.scale;
			}
		}
	}
	function jsonp(params) {
		params = params || {};
		var callbackName = params.jsonp;
		var head = document.getElementsByTagName("head")[0]
		var script = document.createElement('script');
		script.src = params.url + '&callback=' + callbackName;
		script.onerror = function(e) {
			console.log(e);
		};
		window[callbackName] = function (jsonData) {
			head.removeChild(script);
			clearTimeout(script.timer);
			window[callbackName] = null;
			params.success && params.success(jsonData)
		}
		//请求超时的处理函数
		if (params.time) {
			script.timer = setTimeout(function() {
				window[callbackName] = null;
				head.removeChild(script)
				params.timeout && params.timeout({
					message: '超时'
				})
			}, 5000);
		}
		head.appendChild(script);
		
	};
	function extend(o,n){
		for (var p in n){
			 if(n.hasOwnProperty(p))
				 o[p]=n[p];
		 }
	 }; 
	 function init(){
		el.innerHTML = '<div id="slicaptcha-title" draggable="false"><span>请完成安全验证</span></div>' +
		'<div><img id="slicaptcha-img"style="width:' + (opt.width - 2) + 'px; height: ' + opt.height + 'px;" draggable="false"></img>'+
		'</div>'+
'                        <div id="slicaptcha-icon" class="refreshIcon fa fa-repeat"></div>' +
'                        <img id="slicaptcha-block" class="block" draggable="false"></img>'+
'                        <div id="slicaptcha-container" class="sliderContainer">' +
'                            <div class="sliderbg"></div>' + 
'                            <div class="sliderMask" id="slicaptcha-mask">' +
'                                <div id="slider" class="slider"><img id="sliderIcon" class="fa fa-arrow-right sliderIcon"></img></div>'+
'                            </div>' +
'                            <span class="sliderText" id="slicaptcha-text"></span>'
'                        </div>';
		el.style.cssText += 
		'padding: 15px 21px;' +
		'background: #FFFFFF;' +
		'border: 1px solid #D9D9D9;' +
		'box-shadow: 0 3px 14px 0 rgba(0,0,0,0.10);' +
		'border-radius: 6px;'+
		'border-radius: 6px;'
		barText = document.getElementById("slicaptcha-text");
		barText.style.cssText += 'user-select: none';
		img = document.getElementById("slicaptcha-img");
		img.style.cssText += 'user-select: none';
		block = document.getElementById("slicaptcha-block");
		block.style.cssText += 'user-select: none';
		mask = document.getElementById("slicaptcha-mask");
		slider = document.getElementById('slider');
		document.getElementById("slicaptcha-icon").onclick = reset;
		// slider.onmousedown = handleDragStart;
		// document.onmousemove = handleDragMove;
		// document.onmouseup = handleDragEnd;
		sliderIcon = document.getElementById('sliderIcon');
		sliderIcon.style.cssText += 'user-select: none';
		sliderContainer = document.getElementById('slicaptcha-container');
		if(slider.addEventListener) {
			slider.addEventListener('mousedown', handleDragStart);
			document.addEventListener('mousemove', handleDragMove);
			document.addEventListener('mouseup', handleDragEnd);
		} else {
			slider.attachEvent('onmousedown',handleDragStart);
			document.attachEvent('onmousemove', handleDragMove);
			document.attachEvent('onmouseup', handleDragEnd);
		}
		hasinit = true;
	 };
	 return {
		'init': function(elId,options){
			if(!hasinit){
				hasinit = true;
				extend(opt, options);
				el = document.getElementById(elId);
				el.style.cssText = "position : relative;";
				init();
			}
			reset();
		}
	 };
})();

window['_captcha'] = (function(){
    // var imgdefaluts = {
    //     newSignatureSrc: '//captcha.com/getNewSignature',
	// 	imgSrc: '//captcha.com/getImg',
	// 	preSrc: '//captcha.com/captcha/v1/js?captcha_type=1',
	// 	verifySrc: '//captcha.com/getTicket',
    //     success: function(tip){console.log(tip)},
    //     fail: function(tip){console.log("fail");}
    // };
    // var clidefaluts = {
	// 	imgSrc: '//captcha.com/getImg',
	// 	preSrc: '//captcha.com/getPreHandle?captcha_type=2&appid=registernew',
	// 	verifySrc: '//captcha.com/getTicket',
	// 	successText: '验证成功！',
	// 	failedText: '未点中正确区域，请重试！',
	// 	callback: function(){console.log("callback")}
    // };
    var verify = null;
	var imgcaptcha = window['_imgcaptcha'];
	var cli = window['_clicaptcha'];
	var sli = window['_slicaptcha'];
    return {
        'init': function(type,data,elId) {
            if (type === 'click'){
                document.getElementById(elId).onclick = function(){
                    cli.clicaptcha(data)
                }
            } else if (type === 'image'){
                imgcaptcha.init('imgcaptcha', {
                    callback: function(tip){console.log(tip)}
                });
				verify = imgcaptcha.verify;
            } else if (type === 'slider'){
				sli.init(elId, data);
			}
        },
        'verify' : function() {
			return verify();
		}
    }
})()