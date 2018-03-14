var timeString = function(timestamp) {
    t = new Date(timestamp * 1000)
    t = t.toLocaleTimeString()
    return t
}

var commentsTemplate = function(comments) {
    var html = ''
    for(var i = 0; i < comments.length; i++) {
        var c = comments[i]
        var t = `
            <div class="comment-div" data-id=${c.id}>
                <div class="comment-div-content">${c.content}</div>
                <button class="comment-div-delete">删除</button>
            </div>
        `
        html += t
    }
    return html
}

var WeiboTemplate = function(Weibo) {
    var content = Weibo.content
    var id = Weibo.id
    var comments = commentsTemplate(Weibo.comments)
    var t = `
        <div class='weibo-cell' id="weibo-${id}" data-id=${id} data-content="${content}">
            <div class="weibo-content">
                [WEIBO]:${content}
            </div>
            <button class="weibo-delete">删除weibo</button>
            <button class="weibo-edit">修改weibo</button>
            
            <div class="comment-list"> 
                ${comments}
            </div>
            <div class="comment-form">
                <input type="hidden" id="comment-weibo-id" value=${id}>
                <input id="comment-content">
                <br>
                <button class="comment-add">添加评论</button>
            </div>
        </div>
    `
    return t
    /*
    上面的写法在 python 中是这样的
    t = """
    <div class="Weibo-cell">
        <button class="Weibo-delete">删除</button>
        <span>{}</span>
    </div>
    """.format(Weibo)
    */
}

var insertWeibo = function(Weibo) {
    var WeiboCell = WeiboTemplate(Weibo)
    var WeiboList = e('.weibo-list') // 找到静态页中写固定了的Weibo-list
    WeiboList.insertAdjacentHTML('beforeend', WeiboCell) //把WeiboCell挂在Weibo-list中
}

var insertEditForm = function(cell) {
    var content = cell.dataset.content //得到content
    var form = `
        <div class='weibo-edit-form'>
            <input class="weibo-edit-input" value="${content}">  
            <button class='weibo-update'>更新</button>
        </div>
    `
    cell.insertAdjacentHTML('beforeend', form)
}

var loadWeibos = function() {
    // 调用 ajax api 来载入数据
    apiWeiboAll(function(r) {
        // console.log('load all', r)
        // 解析为 数组
        var Weibos = JSON.parse(r) //当前得到的Weibos是添加了comments后的Weibos
        // 循环添加到页面中
        for(var i = 0; i < Weibos.length; i++) {
            var Weibo = Weibos[i]
            insertWeibo(Weibo)
        }
    })
}


var bindEventWeiboAdd = function() {
    var b = e('#id-button-add-weibo')
    // 注意, 第二个参数可以直接给出定义函数
    b.addEventListener('click', function(){
        var input = e('#id-input-weibo')
        var content = input.value
        var form = {
            'content': content,
        }
        apiWeiboAdd(form, function(r) {
            // 收到返回的数据, 插入到页面中
            var Weibo = JSON.parse(r)
            insertWeibo(Weibo)
        })
    })
}

var bindEventWeiboDelete = function() {
    var WeiboList = e('.weibo-list')
    // 注意, 第二个参数可以直接给出定义函数
    WeiboList.addEventListener('click', function(event){
        var self = event.target
        log("click,", self)
        if(self.classList.contains('weibo-delete')){
            // 删除这个 Weibo及其评论
            var WeiboCell = self.parentElement
            var Weibo_id = WeiboCell.dataset.id
            apiWeiboDelete(Weibo_id, function(r){
                log('删除成功', Weibo_id)
                WeiboCell.remove()
            })
        }
    })
}

var bindEventWeiboEdit = function() {
    var WeiboList = e('.weibo-list')
    // 注意, 第二个参数可以直接给出定义函数
    WeiboList.addEventListener('click', function(event){
        var self = event.target
        if(self.classList.contains('weibo-edit')){
            var WeiboCell = self.parentElement
            insertEditForm(WeiboCell)
            // WeiboCell.style.display= "none" //让当前这个WeiboCell不显示;本html的布局方式有问题，需要
            //重写，然后才能简单的实现WeiboCell的部分内容不显示；暂时不处理这个。
        }
    })
}


var bindEventWeiboUpdate = function() {
    var WeiboList = e('.weibo-list')
    // 注意, 第二个参数可以直接给出定义函数
    WeiboList.addEventListener('click', function(event){
        var self = event.target
        if(self.classList.contains('weibo-update')){
            log('点击了 update ')
            //
            var editForm = self.parentElement
            // querySelector 是 DOM 元素的方法
            // document.querySelector 中的 document 是所有元素的祖先元素
            var input = editForm.querySelector('.weibo-edit-input')
            var content = input.value
            // 用 closest 方法可以找到最近的直系父节点
            var WeiboCell = self.closest('.weibo-cell')
            var Weibo_id = WeiboCell.dataset.id
            var form = {
                'id': Weibo_id,
                'content': content,
            }
            apiWeiboUpdate(form, function(r){
                log('更新成功', Weibo_id)
                var Weibo = JSON.parse(r)
                var selector = '#weibo-' + Weibo.id
                var WeiboCell = e(selector)
                var titleSpan = WeiboCell.querySelector('.weibo-content')
                titleSpan.innerHTML = Weibo.content
                //WeiboCell.style.display= "block" //让当前这个WeiboCell显示 {暂时不管这个功能 }
            })
            editForm.remove()
        }
    })
}


var bindEventCommentAdd = function() {
    var WeiboList = e('.weibo-list') //第一次只能找静态页中固定存在的节点
    // 注意, 第二个参数可以直接给出定义函数
    WeiboList.addEventListener('click', function(event){
        var self = event.target
        var comment_form = self.parentElement
        var WeiboCell = comment_form.parentElement // 只局部更新当前这个WeiboCell
        //log("CommentAdd, WeiboCell,",WeiboCell)
        if (self.classList.contains('comment-add')){
            // var input = e('#comment-content') //这种获取元素的方法错了，因为不能唯一。
            var input = comment_form.querySelector('#comment-content') // 要根据self来获取目标元素
            var content = input.value
            //log("content,", content)
            var input = comment_form.querySelector('#comment-weibo-id')
            var weibo_id = input.value
            var form = {
                'content': content,
                'weibo_id':weibo_id,
            }
            apiCommentAdd(form, function(r) {
                var comments = JSON.parse(r)
                //log("comments",comments)
                var comment_list = WeiboCell.querySelector('.comment-list')
                var comments_html = commentsTemplate(comments)
                comment_list.innerHTML = comments_html
            })
        }
    })
}

var bindEventCommentDelete = function() {
    var WeiboList = e('.weibo-list')
    // 注意, 第二个参数可以直接给出定义函数
    WeiboList.addEventListener('click', function(event){
        var self = event.target
        log("click,", self)
        if(self.classList.contains('comment-div-delete')){
            var comment_div = self.parentElement
            var comment_id = comment_div.dataset.id
            apiCommentDelete(comment_id, function(r){
                comment_div.remove()
            })
        }
    })
}


var bindEvents = function() {
    bindEventWeiboAdd()
    bindEventWeiboDelete()
    bindEventWeiboEdit()
    bindEventWeiboUpdate()

    bindEventCommentAdd()
    bindEventCommentDelete()
}

var __main = function() {
    bindEvents()
    loadWeibos()
}

__main()
