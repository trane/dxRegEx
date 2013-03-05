class RegEx
    def isNullable() raise "" end
    def derive(c) raise "" end
    def matches(string)
        if string.size == 0
            self.isNullable
        else
            self.derive(string[0]).matches(string[1..-1])
        end
    end
end

class Empty < RegEx
    def isNullable
        false
    end
    def derive(c)
        self
    end
end

class Blank < RegEx
    def isNullable
        true
    end
    def derive(c)
        Empty.new
    end
end

class Primitive < RegEx
    def initialize(c)
        @c = c
    end
    def isNullable
        false
    end
    def derive(c)
        if @c == c
            Blank.new
        else
            Empty.new
        end
    end
end

class Choice < RegEx
    def initialize(this, that)
        @this = this
        @that = that
    end
    def isNullable
        @this.isNullable || @that.isNullable
    end
    def derive(c)
        Choice.new(@this.derive(c), @that.derive(c))
    end
end

class Repetition < RegEx
    def initialize(base)
        @base = base
    end
    def isNullable
        true
    end
    def derive(c)
        Sequence.new(@base.derive(c), self)
    end
end

class Sequence < RegEx
    def initialize(left, right)
        @left = left
        @right = right
    end
    def isNullable
        @left.isNullable && @right.isNullable
    end
    def derive(c)
        if @left.isNullable
            Choice.new(Sequence.new(@left.derive(c), @right), @right.derive(c))
        else
            Sequence.new(@left.derive(c), @right)
        end
    end
end

class Intersection < RegEx
    def initialize(this, that)
        @this = this
        @that = that
    end
    def isNullable
        @this.isNullable && @that.isNullable
    end
    def derive(c)
        Intersection.new(@this.derive(c), @that.derive(c))
    end
end

class Difference < RegEx
    def initialize(left, right)
        @left = left
        @right = right
    end
    def isNullable
        @left.isNullable && !@right.isNullable
    end
    def derive(c)
        Difference.new(@left.derive(c), @right.derive(c))
    end
end

class Complement < RegEx
    def initialize(base)
        @base = base
    end
    def isNullable
        !@base.isNullable
    end
    def derive(c)
        Complement.new(@base.derive(c))
    end
end

puts Empty.new.matches("anything")
puts Blank.new.matches("anything")
puts Blank.new.matches("")
puts Primitive.new('c').matches('c')
f = Primitive.new 'f'
puts f.matches 'f'
o = Primitive.new 'o'
foo = Sequence.new(f, Sequence.new(o, o))
puts foo.matches("foo")
puts foo.matches("bar")
b = Primitive.new 'b'
a = Primitive.new 'a'
r = Primitive.new 'r'
bar = Sequence.new(b, Sequence.new(a, r))
puts bar.matches 'bar'
foobar = Choice.new(foo, bar)
puts foobar.matches 'foo'
puts foobar.matches 'bar'
puts foobar.matches 'foobar'

foobarstar = Repetition.new foobar
puts foobarstar.matches 'foobarfoo'
puts foobarstar.matches 'foobarfoof'

