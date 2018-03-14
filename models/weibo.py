from models import Model
from models.user import User


# 微博类
class Weibo(Model):
    def __init__(self, form):
        self.id = None
        self.content = form.get('content', '')

    def json(self): # 重载Model的json()，目的是改造已有的model内容，这是隐式的操作，只有查看源码才能知晓
        d = self.__dict__.copy()
        comments = [c.json() for c in self.comments()]
        d['comments'] = comments # 给当前d临时新增一个属性，
        return d

    def comments(self):
        return Comment.find_all(weibo_id=self.id) # 找出当前Weibo所拥有的所有comments

    @classmethod
    def update(cls, id, form):
        t = cls.find(id)
        valid_names = [
            'content',
        ]
        for key in form:
            # 这里只应该更新我们想要更新的东西
            if key in valid_names:
                setattr(t, key, form[key])
        t.save()
        return t


# 评论类
class Comment(Model):
    def __init__(self, form):
        self.id = None
        self.content = form.get('content', '')
        # 和别的数据关联的方式, 用 user_id 表明拥有它的 user 实例
        self.weibo_id = int(form.get('weibo_id', -1))
