class RegEx:
    def isNullable(self): raise Exception()
    def derive(self, c): raise Exception()
    def matches(self, string):
        if len(string) == 0:
            return self.isNullable()
        else:
            return self.derive(string[0]).matches(string[1:])

class Empty(RegEx):

    def isNullable(self):
        return False

    def derive(self, c):
        return self

class Blank(RegEx):

    def isNullable(self):
        return True

    def derive(self, c):
        return Empty()

class Primitive(RegEx):

    def __init__(self, c):
        self.c = c

    def isNullable(self):
        return False

    def derive(self, c):
        if self.c == c:
            return Blank()
        else:
            return Empty()

class Choice(RegEx):
    def __init__(self, this, that):
        self.this = this
        self.that = that

    def isNullable(self):
        return self.this.isNullable() or self.that.isNullable()

    def derive(self, c):
        return Choice(self.this.derive(c), self.that.derive(c))

class Repetition(RegEx):
    def __init__(self, base):
        self.base = base

    def isNullable(self):
        return True

    def derive(self, c):
        return Sequence(self.base.derive(c), self)

class Sequence(RegEx):

    def __init__(self, left, right):
        self.left = left
        self.right = right

    def isNullable(self):
        return self.left.isNullable() and self.right.isNullable()

    def derive(self, c):
        if (self.left.isNullable()):
            return Choice(Sequence(self.left.derive(c), self.right),
                          self.right.derive(c))
        else:
            return Sequence(self.left.derive(c), self.right)

class Intersection(RegEx):

    def __init__(self, this, that):
        self.this = this
        self.that = that

    def isNullable(self):
        return self.this.isNullable() and self.that.isNullable()

    def derive(self, c):
        return Intersection(self.this.derive(c), self.that.derive(c))

class Difference(RegEx):

    def __init__(self, left, right):
        self.left = left
        self.right = right

    def isNullable(self):
        return self.left.isNullable() and not self.right.isNullable()

    def derive(self, c):
        return Difference(self.left.derive(c), self.right.derive(c))

class Complement(RegEx):

    def __init__(self, base):
        self.base = base

    def isNullable(self):
        return not base.isNullable()

    def derive(self, c):
        return Complement(self.base.derive(c))

# tests
print(Empty().matches("anything"))
print(Blank().matches("anything"))
print(Blank().matches(""))
print(Primitive('c').matches("c"))
f = Primitive('f')
print(f.matches('f'))
o = Primitive('o')
foo = Sequence(f, Sequence(o,o))
print(foo.matches("foo"))
print(foo.matches("bar"))
b = Primitive('b')
a = Primitive('a')
r = Primitive('r')
bar = Sequence(b, Sequence(a,r))
print(bar.matches("bar"))

foobar = Choice(foo, bar)
print(foobar.matches("foo"))
print(foobar.matches("bar"))
print(foobar.matches("foobar"))

foobarstar = Repetition(foobar)
print(foobarstar.matches("foobarfoo"))
print(foobarstar.matches("foobarfoof"))
