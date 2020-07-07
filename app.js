
var express = require('express');
var app = express();
var path = require('path');

// 设置登录页和主页访问路径
app.get('/index', function (req, res) {
    res.sendFile(__dirname + '/' + 'demo.html');
});
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/' + 'demo.html');
});
// 托管静态文件
app.use('/clicaptcha', express.static(path.join(__dirname, 'clicaptcha')));
app.use('/css', express.static(path.join(__dirname, 'css')));

// 生成服务器并监听
var server = app.listen(8082,'localhost',function () {//（3.2.3）
    var host = server.address().address
    var port = server.address().port
    console.log('应用实例，访问地址为 http://%s:%s', host, port)
});