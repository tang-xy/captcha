window['_imgcaptcha'] =  (function(){
    var defaluts = {
        newSignatureSrc: '//captcha.com/getNewSignature',
		imgSrc: '//captcha.com/getImg',
		preSrc: '//captcha.com/captcha/v1/js?captcha_type=1',
		verifySrc: '//captcha.com/getTicket',
        success: function(tip){alert('成功')},
        fail: function(tip){alert('失败')}
	};
	var opt = defaluts;
    var el, input, imgbox, re;
    var model = 'waiting';
    var urlparams = '';
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
         if(model === 'load') return;
         model = 'load';
         var src = opt.verifySrc + '?' + urlparams + '&phrase=' + input.value;
        jsonp({
            jsonp: 'verify',
            url: src,
            success: function(data) {
                model = 'waiting';
                if(data.code === 0){
                    opt.success(data.ticket);
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
