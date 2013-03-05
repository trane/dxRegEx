var RegEx, Primitive, Blank, Empty, Choice, Sequence, Repetition, Intersection,
    Compliment, Difference;

RegEx = function() {
  this.derive = function(c) {};
  this.isNullable = function() {};
  this.matches = function(s) {
    if (s.length === 0) {
      return this.isNullable();
    } else {
      return this.derive(s[0]).matches(s.substr(1));
    }
  };
  return this;
};

/*
 * D_c{∅} = ∅
 * δ(∅) = ∅
 */
Empty = function() {
  this.derive = function(c) {
    return new Empty;
  };
  this.isNullable = function() {
    return false;
  };
  return this;
};
Empty.prototype = new RegEx;

/*
 * D_c{eps} = ∅
 * δ(eps) = eps
 */
Blank = function() {
  this.derive = function(c) {
    return new Empty;
  };
  this.isNullable = function() {
    return true;
  };
  return this;
};
Blank.prototype = new RegEx;

/*
 * D_c{c} = eps
 * D_c{c'} = ∅ if c ≠ c
 * δ(c) = ∅
 */
Primitive = function(c) {
  this.c = c;
  this.derive = function(c) {
    if (c === this.c) {
      return new Blank;
    } else {
      return new Empty;
    }
  };
  this.isNullable = function() {
    return false;
  };
}
Primitive.prototype = new RegEx;

/*
 * D_c(L1 U L2) = D_c(L1) U D_c(L2)
 * δ(L1 U L2) = δ(L1) U δ(L2)
 */
Choice = function(thisOne, thatOne) {
  this.thisOne = thisOne;
  this.thatOne = thatOne;
  this.derive = function(c) {
    return new Choice(this.thisOne.derive(c), this.thatOne.derive(c));
  };
  this.isNullable = function() {
    return this.thisOne.isNullable() || this.thatOne.isNullable();
  };
  return this;
};
Choice.prototype = new RegEx;

/*
 * D_c(L*) = (D_cL).L*
 * δ(L*) = eps
 */
Repetition = function(internal) {
  this.internal = internal;
  this.derive = function(c) {
    return new Sequence(this.internal.derive(c), this);
  };
  this.isNullable = function() {
    return true;
  };
  return this;
};
Repetition.prototype = new RegEx;

/*
 * D_c(L1.L2) = D_c(L1.L2) U (δ(L1).D_c(L2))
 * δ(L1 U L2) = δ(L1) U δ(L2)
 */
Sequence = function(first, second) {
  this.first = first;
  this.second = second;
  this.derive = function(c) {
    if (this.first.isNullable()) {
      return new Choice(new Sequence(this.first.derive(c), this.second),
                        this.second.derive(c));
    } else {
      return new Sequence(this.first.derive(c), this.second);
    }
  };
  this.isNullable = function() {
    return this.first.isNullable() && this.second.isNullable();
  };
  return this;
};
Sequence.prototype = new RegEx;

/*
 * D_c(L1 ∩ L2) = D_c(L1) ∩ D_c(L2)
 * δ(L1 ∩ L2) = δ(L1) ∩ δ(L2)
 */
Intersection = function(first, second) {
  this.first = first;
  this.second = second;
  this.derive = function(c) {
    return new Intersection(this.first.derive(c), this.second.derive(c));
  };
  this.isNullable = function() {
    return this.first.isNullable() && this.second.isNullable();
  };
  return this;
};
Intersection.prototype = new RegEx;

Difference = function(left, right) {
    this.left = left;
    this.right = right;
    this.isNullable = function() {
        this.left.isNullable() && !this.right.isNullable();
    };
    this.derive = function(c) {
        return new Difference(this.left.derive(c), this.right.derive(c))
    };
};
Difference.prototype = new RegEx;

/*
 * D_c(~L) = ~(D_c(L))
 * δ(~L) = ~(δ(L))
 */
Complement = function(lang) {
  this.lang = lang;
  this.derive = function(c) {
    return new Complement(this.lang.derive(c));
  };
  this.isNullable = function() {
    return !this.lang.isNullable();
  };
  return this;
};
Complement.prototype = new RegEx;
