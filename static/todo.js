var timeString = function(timestamp) {
    t = new Date(timestamp * 1000)
    t = t.toLocaleTimeString()
    return t
}

var todoTemplate = function(todo) {
    var title = todo.title
    var id = todo.id
    var ut = timeString(todo.ut)
    // data-xx 是自定义标签属性的语法
    // 通过这样的方式可以给任意标签添加任意属性
    // 假设 d 是 这个 div 的引用
    // 这样的自定义属性通过  d.dataset.xx 来获取
    // 在这个例子里面, 是 d.dataset.id
    var t = `
        <div class="todo-cell" id='todo-${id}' data-id="${id}">
            <button class="todo-edit">编辑</button>
            <button class="todo-delete">删除</button>
            <span class='todo-title'>${title}</span>
            <time class='todo-ut'>${ut}</time>
        </div>
    `
    return t
    /*
    上面的写法在 python 中是这样的
    t = """
    <div class="todo-cell">
        <button class="todo-delete">删除</button>
        <span>{}</span>
    </div>
    """.format(todo)
    */
}

var insertTodo = function(todo) {
    var todoCell = todoTemplate(todo)
    // 把todoCell 插入 todo-list
    var todoList = e('.todo-list') //找到已有的todolist，把新按钮所在的div挂在.todo-list下
    todoList.insertAdjacentHTML('beforeend', todoCell)
}

var insertEditForm = function(cell) {
    var form = `
        <div class='todo-edit-form'>
            <input class="todo-edit-input">
            <button class='todo-update'>更新</button>
        </div>
    `
    cell.insertAdjacentHTML('beforeend', form)
}

var loadTodos = function() {
    // 调用 ajax api 来载入数据
    apiTodoAll(function(r) { //r接收实参{这个实参来自服务器的响应,其定义见gua.js中对回调函数输入的实参}
        // console.log('load all', r)
        // 解析为 数组
        var todos = JSON.parse(r)
        // 循环添加到页面中
        for(var i = 0; i < todos.length; i++) {
            var todo = todos[i]
            insertTodo(todo)
        }
    })
}

var bindEventTodoAdd = function() { //编写事件监听器
    var b = e('#id-button-add')
    // 注意, 第二个参数可以直接给出定义函数
    b.addEventListener('click', function(){
        var input = e('#id-input-todo')
        var title = input.value
        log('click add', title)
        var form = {
            'title': title,
        }
        apiTodoAdd(form, function(r) { //定义回调函数，并作为参数传入gua.js中定义的API中
            // 收到返回的数据, 插入到页面中
            var todo = JSON.parse(r)
            insertTodo(todo)
        })
    })
}

var bindEventTodoDelete = function() { //和bindEventTodoAdd的逻辑刚刚相反
    var todoList = e('.todo-list') //当时add一个todo的div时，就是挂在.todo-list下,所以现在删也是要到.todo-list
    // 注意, 第二个参数可以直接给出定义函数
    todoList.addEventListener('click', function(event){ //事件监听委托给 爷爷节点 todoList
        var self = event.target //找到click动作的目标位置 {即要找到删除按钮}，因为这个按钮的父亲是todo{一个div},todo的父亲是todo-list{也是一个div}
        if(self.classList.contains('todo-delete')){ //找到删除按钮了
            // 删除这个 todo
            var todoCell = self.parentElement // 其实是要删除“删除按钮”所在的那个todo{即一个div}
            var todo_id = todoCell.dataset.id //但是add一个todo的div时，曾经自定义了一个data-id属性，现在从这个属性中取到当时add时存的值
            apiTodoDelete(todo_id, function(r){ //又去gua.js中调用ajax(),发送删除的HTTP请求到服务器
                log('删除成功', todo_id)
                todoCell.remove() //把这个todo从本地浏览器的静态页上删除掉
            })
        }
    })
}

var bindEventTodoEdit = function() {
    var todoList = e('.todo-list')
    // 注意, 第二个参数可以直接给出定义函数
    todoList.addEventListener('click', function(event){ // 又是把监听事件委托给了爷爷todolist
        var self = event.target
        if(self.classList.contains('todo-edit')){ //找到了"编辑按钮"
            var todoCell = self.parentElement //找到 "编辑按钮"的父亲{某一个todo,本质是一个div}
            insertEditForm(todoCell) //把一个用于编辑的div插入到todoCell最末尾{让其紧跟着这个待编辑的todo}
        }
    })
}


var bindEventTodoUpdate = function() {
    var todoList = e('.todo-list') // 又是委托{这个静态页面中恒存在的div}来监听事件
    // 注意, 第二个参数可以直接给出定义函数
    todoList.addEventListener('click', function(event){
        var self = event.target //当前被点击的对象
        if(self.classList.contains('todo-update')){ // 找到了“update按钮”
            log('点击了 update ')
            //
            var editForm = self.parentElement //拿到整个editForm
            // querySelector 是 DOM 元素的方法
            // document.querySelector 中的 document 是所有元素的祖先元素
            var input = editForm.querySelector('.todo-edit-input') //找到editForm中的input框
            var title = input.value
            // 用 closest 方法可以找到最近的直系祖先
            var todoCell = self.closest('.todo-cell') // 找到“update按钮”最近的一个class名为.todo-cell的祖先
            var todo_id = todoCell.dataset.id // 从这个to中拿到自定义data-id的值
            var form = {
                'id': todo_id,
                'title': title,
            }
            apiTodoUpdate(form, function(r){ // 拿form去调用ajax()在服务器上更新上面那个todo,以及即将执行下面的回调函数
                log('更新成功', todo_id)
                var todo = JSON.parse(r) //解析apiTodoUpdate后得到的HTTP响应
                var selector = '#todo-' + todo.id //根据最开始{add todo} 时定义的id属性来
                var todoCell = e(selector)        //找需要更新的todo
                var titleSpan = todoCell.querySelector('.todo-title') //根据 这个todo的 {'.todo-title'的这个class属性}去找这个todo的一个子节点
                titleSpan.innerHTML = todo.title //更新titleSpan的内嵌的html内容，同理可以修改17行的${ut}
            })
            // 如果上面的update成功，就把editForm这个div干掉
            editForm.remove()
        }
    })
}

var bindEvents = function() {
    bindEventTodoAdd()
    bindEventTodoDelete()
    bindEventTodoEdit()
    bindEventTodoUpdate()
}

var __main = function() {
    bindEvents()
    loadTodos()
}

__main()


// 例如下图，待会儿在blog中逐个解释每一个CURD背后的逻辑和流程到底是怎样的？
// 可以很好地梳理清楚js和ajax的运行过程及效果

/*
给 删除 按钮绑定删除的事件
1, 绑定事件
2, 删除整个 todo-cell 元素
*/
// var todoList = e('.todo-list')
// // 事件响应函数会被传入一个参数, 就是事件本身
// todoList.addEventListener('click', function(event){
//     // log('click todolist', event)
//     // 我们可以通过 event.target 来得到被点击的元素
//     var self = event.target
//     // log('被点击的元素是', self)
//     // 通过比较被点击元素的 class 来判断元素是否是我们想要的
//     // classList 属性保存了元素的所有 class
//     // 在 HTML 中, 一个元素可以有多个 class, 用空格分开
//     // log(self.classList)
//     // 判断是否拥有某个 class 的方法如下
//     if (self.classList.contains('todo-delete')) {
//         log('点到了 删除按钮')
//         // 删除 self 的父节点
//         // parentElement 可以访问到元素的父节点
//         self.parentElement.remove()
//     } else {
//         // log('点击的不是删除按钮******')
//     }
// })