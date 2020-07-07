# 业务逻辑

*本验证码组件操作主要为三步组成：*

- 获取验证码内容
- 用户进行操作，验证码收集信息
- 将信息发送至后台进行人机验证

## 第一步

调用`getPreHandle`接口，使用`appid`获取一个PreHandle，该prehandle的内容包括验证码的标识、类型。

调用`getImg`接口，使用获取到的PreHandle，获取验证码的图片url和其他相关信息在前端显示

## 第二步

等待用户输入验证信息。

图片验证码通过组件的input框输入；点击验证码捕捉用户的点击事件，记录用户点击的坐标；滑动验证码记录用户拖动时的鼠标轨迹。

将上述信息保存、加密用来验证

**注意**

- 本验证码组件目前为明文通信，未对用户的输入信息进行加密

- 滑动验证码验证存储了用户的拖动鼠标轨迹，但验证仅使用了用户的鼠标释放位置，希望在后续版本得到优化

## 第三步

调用`getTicket`接口，发送验证码标识和用户输入信息至后台进行验证

<b><font color='red'>若验证通过，将得到一个验证成功的Ticket，组件将该ticket与验证码标识、验证码参数、验证码类型四个值通过callback函数传出。

在组件外部，应在登录时再次使用上述四个参数进行安全验证，验证通过则完成整个验证码操作流程。
</font></b>
# 代码逻辑

本验证码组件内部由四部分组成，分别为：`_imgcaptcha`;`_clicaptcha`;`_slicaptcha`;`_captcha`

## _imgcaptcha 图片验证码

本部分为图片验证码组件

### 内部函数调用顺序

**入口：**
init-->reset-(jsonp)->getPreHandle-(jsonp)->getNewSignature

**验证：**
verify-(jsonp)->callback/fail

### 函数表

| 名称        | 说明               |
|------------|--------------------|
| init       | 暴露出的入口函数，初始化组件内容|
| reset      | 刷新函数，重新请求一个新的验证图片，init后会自动调用该函数|
| getPreHandle| 获取一个参数，利用该参数获取signature|
| getNewSignature|获取验证码标签signature和验证码图片|
|verify      | 将输入框中内容提交验证，根据结果调用callback或fail|
| adaptatPlaceholder| 适配浏览器设置input的placeholder|
| jsonp      | 原生js封装的jsonp方法， 参数见示例 |

jsonp函数调用例

``` javascript
jsonp({
    jsonp: 'verify',
    url: src,
    success: function(data) {
    },
    timeout: function() {
    },
    time: true
})
```

### 变量表

| 名称       |   类型  | 说明               |
|------------|--------|--------------------|
| opt        | Object | 储存外部传入参数，通信所需的接口也储存在这里 |
| model      | String | 标记组件状态，防止重复点击，可选值包括'waiting'/'load'|
| sign       | String | 存储验证码标识sign，在getNewSignature内赋值，在验证成功时包在返回对象内传递给callback函数  |
| urlparams  | String | 存储获取验证码所需urlparams，在getNewSignature内获取 |
| el         | Object | 验证码组件对象 |
| input      | Object | 输入框对象    |
| imgbox     | Object | 图片对象      |

### 状态控制

使用model标记组件状态，当开始通信时将model设置为load，通信完成或超时失败时将model设置为waiting

load状态下禁止再次刷新、验证操作。

## _clicaptcha

本部分为点击验证码组件

### 内部函数调用顺序

**初始化：**
init

**入口：**
reset-(jsonp)->getPreHandle

**验证：**
verify-(jsonp)->callback/fail

### 函数表

| 名称        | 说明               |
|------------|--------------------|
| init       | 初始化函数，初始化组件内容|
| reset      | 刷新函数，重新请求一组新的验证图片和文字，同时组件可视化|
| hide| 隐藏组件 |
| down | 记录鼠标点击，点击后才能响应up事件 |
| up      | 捕捉鼠标释放事件，绘制一个新的标签在图片上，当总标签数达到需求时，进行验证 |
| getPreHandle |获取验证码标签signature和验证码图片|
| result     | 验证的回调函数 |
| jsonp      | 同图片验证码例 |

### 变量表

| 名称       |   类型  | 说明               |
|------------|--------|--------------------|
| opt        | Object | 储存外部传入参数，通信所需的接口也储存在这里 |
| model      | String | 标记组件状态，防止重复点击，可选值包括'waiting'/'load'/'done'|
| sign       | String | 存储验证码标识sign，在getPreHandle内赋值，在验证成功时包在返回对象内传递给callback函数  |
| urlparams  | String | 存储获取验证码所需urlparams，在getPreHandle内获取 |
| el         | Object | 验证码组件对象 |
| xyArr      | Array |  点击坐标数组    |
| data     | Object | 存储getPreHandle获取的对象      |

另外还有组件内部的元素对象，变量名为元素id。

### 状态控制

使用model标记组件状态，当开始通信时将model设置为load，通信完成或超时失败时将model设置为done。

load状态下禁止验证码组件操作。

验证后显示结果信息时model为waiting，waiting状态下禁止组件操作，但可以刷新，timeout后自动刷新组件。

## _slicaptcha

本部分为滑块验证码组件

### 内部函数调用顺序


**入口：**
init-->reset-(jsonp)->getPreHandle

**验证：**
verify-(jsonp)->callback/fail

### 函数表

| 名称        | 说明               |
|------------|--------------------|
| init       | 初始化函数，初始化组件内容|
| reset      | 刷新组件，重新请求一组新的验证图片和文字|
| verify       | 验证函数 |
| handleDragStart | 开始拖动，记录鼠标位置 |
| handleDragMove | 响应鼠标移动事件，修改slider的位置和mask长度，记录鼠标轨迹 |
| handleDragEnd | 响应鼠标释放事件，记录释放位置，调用验证函数 |
| verify        | 调用验证接口验证，根据验证结果修改样式 |
| getPreHandle |获取验证码标签signature和验证码图片|
| result     | 验证的回调函数 |
| jsonp      | 同图片验证码例 |

### 变量表

| 名称       |   类型  | 说明               |
|------------|--------|--------------------|
| opt        | Object | 储存外部传入参数，通信所需的接口也储存在这里 |
| sign       | String | 存储验证码标识sign，在getPreHandle内赋值，在验证成功时包在返回对象内传递给callback函数  |
| urlparams  | String | 存储获取验证码所需urlparams，在getPreHandle内获取 |
| el         | Object | 验证码组件对象 |
| inity      | Number | 记录滑块初始y位置 |
| originX      | Number | 记录点击初始x位置 |
| originY      | Number | 记录点击初始y位置 |
| isMouseDown  | Boolean | 记录鼠标点击状态 |
| loading  | Boolean | 记录是否正在加载 |
| hasinit  | Boolean | 记录是否初始化 |
| trail  | Array | 鼠标轨迹数组，先版本接口中不会使用该数据 |

