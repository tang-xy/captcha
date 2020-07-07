window['_clicaptcha'] = (function(){
	var defaluts = {
		imgSrc: '//captcha.com/getImg',
		preSrc: '//captcha.com/getPreHandle?captcha_type=2&appid=registernew',
		verifySrc: '//captcha.com/getTicket',
		success_tip: '验证成功！',
		error_tip: '未点中正确区域，请重试！',
		callback: function(){console.log("callback")}
	};
	var opt = defaluts;
	var el = document.getElementsByTagName('body')[0];
	var container = creatEl('div',{
		'id': 'clicaptcha-container'
	});
	var imgbox = creatEl('div',{
		'id': "clicaptcha-imgbox"
	});
	var img = creatEl('img',{
		'id': "clicaptcha-img",
		'alt': ""
	});
	var title = creatEl('div',{
		'id': "clicaptcha-title"
	});
	var refreshBtn = creatEl('a',{
		'id': "clicaptcha-refresh-btn",
		'href': "javascript:;",
		"title": '刷新'
	});
	var mask = creatEl('div',{
		'id': "clicaptcha-mask"
	});
	var step = [];
	var text;
	var model = 'waiting';
	var xyArr = [];
	var data;
	init();
	var down = function(e) {
		console.log(e);
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
			title.innerHTML = opt.success_tip;
			setTimeout(function(){
				hide();
				opt.callback(data.ticket);
			}, 1500);
		} else {
			title.innerHTML = opt.error_tip;
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