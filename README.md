# captcha

## 组件描述

- **简介**： 原生js验证码组件
- **功能**： 包括图片验证码、点击验证码、滑块验证码三种类型
- **使用**： 本验证码组件绑定在window上，使用`window['_captcha']`调用;在init()初始化时指定回调函数。通过callback回调函数传出验证成功信息，fail回调函数传出失败信息
- **注意**： **验证成功时的成功信息包括ticket、验证码标识、验证码参数和验证码类型四个值，需要在登录时使用这四个值调用认证中心api进行验证**
- **兼容性**： 其中图片验证码、点击验证码最低可支持至ie6版本浏览器，滑块验证码可支持至ie8


## 快速上手

### demo

在根目录下运行`node app.js`查看使用demo。

### 开始

- 在项目中引入`/captcha/v1.0/captcha.css` 和`/captcha/v1.0/captcha.js`

#### 引用实例

见app.js

```html
<div id="login">
    <form method="post" id="form" name="form">
        <div class="title"><b>方案一：</b></div>
        <div class="row">
            <div id="imgcaptcha" ></div>
            <button type="button" id="imgsub">验证</button>
        </div>
    </form>
    <form method="post" id="form" name="form">
            <div class="clicaptcha-title"><b>方案二：</b></div>
        <div class="row">
            <button type="button" id="sub">点此进行验证</button>
        </div>
    </form>
    <form method="post" id="form" name="form">
        <div class="title"><b>方案三：</b></div>
        <div class="row">
            <div id="slicaptcha"></div>
        </div>
    </form>
</div>

<script>
var captcha = window['_captcha'];

//点击验证码
captcha.init('click',{
    callback: function() {
        document.getElementById("sub").innerHTML = "验证成功";
    }
},'sub');

//滑动验证码
captcha.init('slider',{
    callback: function(e) { console.log(e); },
    fail: function(e) { console.log(e); },
},'slicaptcha');

//图片验证码
captcha.init('image',{
    callback: function(e) { console.log(e); },
    fail: function(e) { console.log(e); },
},'imgcaptcha');

//图片验证码点击验证
document.getElementById("imgsub").onclick = function(e) {
    captcha.verify();
}
</script>
```

## 方法

### init 初始化

使用`window['_captcha'].init()`方法初始化一个验证码组件

| 参数        | 类型       | 可选值                     | 说明              |
| ----------- | ---------- | --------------------------| ----------------- |
| \*type      | String     | 'click'、'image'、'slider' | 选择要使用的验证码类型 |
|  data       | Object     | 见下表                    | 验证码组件的所需参数   |
| \*elId      | String     | --                         | 验证码组件的父组件id  |

#### 验证码组件的所需参数

通过init函数中的data参数传递，不同type验证码所需参数有些许不同。

##### 通用

| 参数        | 类型       | 默认值                        | 说明               |
| ----------- | ---------- | -----------------------------| ----------------- |
| callback    | Function   | function(e){console.log(e);} | 验证成功时回调函数，传入一个对象，包括：验证成功得到的ticket；验证码唯一标识符signature；验证码类别captcha_type；前段发给验证码的参数phrase  |
|  fail       | Function   | function(e){console.log(e);} | 验证失败时回调函数，传入失败信息字符串  |

##### 点击验证码

| 参数        | 类型       | 默认值                        | 说明               |
| ----------- | ---------- | -----------------------------| ----------------- |
| successText | String     | '验证成功！'                  | 验证成功时提示文字  |
|  failText   | String     | '未点中正确区域，请重试！'     | 验证失败时提示文字  |

##### 滑块验证码

| 参数        | 类型       | 默认值                       | 说明               |
| ----------- | ---------- | ---------------------------| ----------------- |
| loadingText | String     | '加载中...'                 | 正在加载时提示文字 |
|  failText   | String     | '未点中正确区域，请重试！'   | 验证失败时提示文字  |
|  barText    | String     | '向右拖动滑块填充拼图'       | 拖动条处提示文字   |
|useAfterSuccess| Boolean  | true                       | 验证成功后能否再次使用   |

### verify 验证函数

使用`window['_captcha'].verify()`方法验证是否能够通过，无参数。图片验证码专用

**注意**

1.滑块验证码和点击验证码会在用户操作后自动调用验证函数进行验证，无需外部调用该函数；图片验证码需要手动调用该验证函数进行验证。

2.验证后将调用init传入的成功/失败回调函数。

3.请必在init创建后再调用该函数进行验证。

## 备注

- 滑块验证码传递的x轴坐标，相较后端需求有3-4像素的偏差，原因不明，希望能后续优化

- 代码内部逻辑和业务逻辑见about.md
