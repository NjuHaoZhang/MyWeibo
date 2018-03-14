import json
from routes.session import session
from utils import (
    log,
    redirect,
    http_response,
    json_response,
)
from models.todo import Todo
from models.weibo import (
    Weibo,
    Comment,
)


######################################################################
# todo api
# 本文件只返回 json 格式的数据
# 而不是 html 格式的数据
def all(request):
    """
    返回所有 todo
    """
    todo_list = Todo.all()
    # 要转换为 dict 格式才行
    todos = [t.json() for t in todo_list]
    return json_response(todos)


def add(request):
    """
    接受浏览器发过来的添加 todo 请求
    添加数据并返回给浏览器
    """
    # 得到浏览器发送的 json 格式数据
    # 浏览器用 ajax 发送 json 格式的数据过来
    # 所以这里我们用新增加的 json 函数来获取格式化后的 json 数据
    form = request.json() # 字符串格式转化成dict
    # 创建一个 todo
    t = Todo.new(form)
    json_response(t.json())


def delete(request):
    """
    通过下面这样的链接来删除一个 todo
    /delete?id=1
    """
    todo_id = int(request.query.get('id'))
    t = Todo.delete(todo_id)
    return json_response(t.json())


def update(request):
    form = request.json()
    todo_id = int(form.get('id'))
    t = Todo.update(todo_id, form)
    return json_response(t.json())


#############################################################################
# weibo api
def all_weibo(request):
    """
    返回所有 todo
    """
    ms = Weibo.all() # 单纯地从Weibo.txt中生成Weibo对象
    # 要转换为 dict 格式才行
    data = [m.json() for m in ms] # 把属于Weibo对象的所有comments加入到Weibo
    return json_response(data)


def add_weibo(request):
    """
    接受浏览器发过来的添加 weibo 请求
    添加数据并返回给浏览器
    """
    form = request.json()
    # 创建一个 model
    m = Weibo.new(form)
    # 把创建好的 model 返回给浏览器
    return json_response(m.json())

def delete_weibo(request):
    """
    通过下面这样的链接来删除一个 weibo及其comments
    /delete?id=1
    """
    weibo_id = int(request.query.get('id'))
    w = Weibo.delete(weibo_id) # 删除这个weibo
    cs = w.comments()
    for c in cs:
        cdel = Comment.delete(c.id) # 删除这个weibo关联的所有commnets
    return json_response(w.json())


def update_weibo(request):
    form = request.json()
    weibo_id = int(form.get('id'))
    w = Weibo.update(weibo_id, form)
    return json_response(w.json())


#####################################################################
# comment api
# all_comments这个功能已经在insert一条新weibo时展示在前台了

def add_comment(request):
    """
    接受浏览器发过来的添加 todo 请求
    添加数据并返回给浏览器
    """
    # 得到浏览器发送的 json 格式数据
    # 浏览器用 ajax 发送 json 格式的数据过来
    # 所以这里我们用新增加的 json 函数来获取格式化后的 json 数据
    form = request.json() # 字符串格式转化成dict
    c = Comment.new(form)
    cs = Comment.find_all(weibo_id=c.weibo_id) # 加载属于该微博的所有comment
    cs_list = [c.json() for c in cs] # 每一个对象转成dict
    return json_response(cs_list)



def delete_comment(request):
    """
    通过下面这样的链接来删除一个 todo
    /delete?id=1
    """
    comment_id = int(request.query.get('id'))
    c = Comment.delete(comment_id)
    cs = Comment.find_all(weibo_id=c.weibo_id)  # 加载属于该微博的所有comment
    cs_list = [c.json() for c in cs]  # 每一个对象转成dict
    return json_response(cs_list)



route_dict = {
    # todo api
    '/api/todo/all': all,
    '/api/todo/add': add,
    '/api/todo/delete': delete,
    '/api/todo/update': update,
    # weibo api
    '/api/weibo/all': all_weibo,
    '/api/weibo/add': add_weibo,
    '/api/weibo/delete': delete_weibo,
    '/api/weibo/update': update_weibo,
    # comment api
    '/api/comment/add': add_comment,
    '/api/comment/delete': delete_comment,

}
