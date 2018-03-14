var log = function() {
    console.log.apply(console, arguments)
}

var e = function(sel) {
    return document.querySelector(sel)
}

/*
 ajax 函数
*/
var ajax = function(method, path, data, responseCallback) {
    var r = new XMLHttpRequest()
    // 设置请求方法和请求地址
    r.open(method, path, true)
    // 设置发送的数据的格式为 application/json
    // 这个不是必须的
    r.setRequestHeader('Content-Type', 'application/json')
    // 注册响应函数 {当请求得到响应，就自动激发}
    r.onreadystatechange = function() {
        if(r.readyState === 4) {  //4表示服务器响应已完成
            // r.response 存的就是服务器发过来的放在 HTTP BODY 中的数据
            responseCallback(r.response) //把服务器响应内容给了回调函数做实参，故形参也是一个{接收实参}
        }
    }
    // 把数据转换为 json 格式字符串
    data = JSON.stringify(data)
    // 发送请求
    r.send(data)
}


// TODO API {向服务器发起请求的API}, 处理响应的回调函数写在todo.js里面
// 获取所有 todo
var apiTodoAll = function(callback) { //当本函数执行完，请求得到响应后，系统自动执行回调函数callback
    var path = '/api/todo/all'
    ajax('GET', path, '', callback)
}

// 增加一个 todo
var apiTodoAdd = function(form, callback) {
    var path = '/api/todo/add'
    ajax('POST', path, form, callback)
}

// 删除一个 todo
var apiTodoDelete = function(id, callback) {
    var path = '/api/todo/delete?id=' + id
    ajax('GET', path, '', callback)
    //    get(path, callback)
}

// 更新一个 todo
var apiTodoUpdate = function(form, callback) {
    var path = '/api/todo/update'
    ajax('POST', path, form, callback)
    //    post(path, form, callback)
}




/*  Weibo的API */

// load weibo all
var apiWeiboAll = function(callback) {
    var path = '/api/weibo/all'
    ajax('GET', path, '', callback)
}

// 增加一个 weibo
var apiWeiboAdd = function(form, callback) {
    var path = '/api/weibo/add'
    ajax('POST', path, form, callback)
}

// 删除一个 todo
var apiWeiboDelete = function(id, callback) {
    var path = '/api/weibo/delete?id=' + id
    ajax('GET', path, '', callback)
    //    get(path, callback)
}

// 更新一个 todo
var apiWeiboUpdate = function(form, callback) {
    var path = '/api/weibo/update'
    ajax('POST', path, form, callback)
    //    post(path, form, callback)
}



/* Comment */
// add
var apiCommentAdd = function (form, callback) {
    var path = '/api/comment/add'
    ajax('POST', path, form, callback)
}

// delete
var apiCommentDelete = function (id, callback) {
    var path = '/api/comment/delete?id=' + id
    ajax('GET', path, '', callback)
}