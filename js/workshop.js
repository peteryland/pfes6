import './curry';
const log = x => console.log(x.toString());

const id = x => x;
const constant = x => (y => x);
const add  = ((x, y, z) => x + y + z).$;
const mult = function(x, y) { return x * y; }.$;

class Reducer {
  get unit()   { return undefined; } // abstract
  op(me, x, y) { return undefined; } // abstract

  rreduce(x)   { return x.reduce(this.op.$(this), this.unit); }
}

class Sum extends Reducer {
  get unit()   { return 0; }
  op(me, a, b) { return a + b; }
}
const sum = new Sum();

class Product extends Reducer {
  get unit()   { return 1; }
  op(me, a, b) { return a * b; }
}
const product = new Product();

class Flatten extends Reducer {
  get unit()   { return []; }
  op(me, a, b) { return [...a, ...b]; }
}
const flatten = new Flatten();


log("==============");
log("== Mappable ==");
log("==============");

// we introduce a type class for "Mappables"
// we expect this class to be extended by a class that wraps values somehow
// to be considered a Mappable, it must implement `mapf`
class Mappable {
// `mapf` uses the given function f to map the wrapped value(s) to f(value)
  mapf(f) { return undefined; } // abstract

  mapreplaceby(x) { return this.mapf(constant(x)); }
}
const mapf = ((f, x) => x.mapf(f)).$;   // Helper function to allow use of mapf(f, x)


log("--------------------");
log("-- Identity Class --");
log("--------------------");

class _Id extends Mappable {
  constructor(value) { super(); this.value = value; }
  toString() { return `Id(${this.value})`; }

// here, `mapf` returns a new `Id` object which wraps `f(value)`
  mapf(f) { return Id(f(this.value)); }
}
const Id = x => new _Id(x);

const myid = Id(42);
const myid2 = mapf(x => x+1, myid);
//log( myid2 );


log("-----------------");
log("-- Maybe Class --");
log("-----------------");

const [NOTHING, JUST] = [0, 1]
class _Maybe extends Mappable {
  constructor(tag, value) { super(); this.tag = tag; this.value = value; }
  toString() { return this.tag === NOTHING? "Nothing()" : `Just(${this.value})`}

// this time, we only call the function if a value is indeed wrapped
  mapf(f) { return this.tag === NOTHING? this : Just(f(this.value)); }
}
const Nothing = () => new _Maybe(NOTHING); // functional-style constructors
const Just = x => new _Maybe(JUST, x);

class MaybeReducer extends Reducer {
  get unit() { return Nothing; }
  op(me, a, b) { return a.tag === JUST? a : b; }
}
const maybereducer = new MaybeReducer();

class MaybeReducer2 extends Reducer {
  constructor(parentreducer) { super(); this.parentop = parentreducer.op; }
  get unit() { return Nothing(); }
  op(me, a, b) { return a.tag === NOTHING? b : (b.tag === NOTHING? a : Just(me.parentop(me, a.value, b.value))); }
}
const maybesumreducer = new MaybeReducer2(sum);

const myjustval = Just(7);
const mynothing = Nothing();

const add3 = x => 3 + x;
//log( mapf(add3, myjustval) );
//log( mapf(add3, mynothing) );

// an example function with a failure case
function bigfun(x) {
  const y = x * 2 + 200;
  if (isNaN(y))
    return "I'm sorry, I can't do that.";
  return y;
}

// the failure case doesn't always work as expected
//log( bigfun(1001) );
//log( bigfun("hello") );
//log( bigfun(null) );

// using `Maybe` and `mapf` we can avoid a lot of hard-to-find bugs
//log( mapf(bigfun, Just(1001)) );
//log( mapf(bigfun, Just("hello")) );
//log( mapf(bigfun, Nothing()) );


log("-----------------------");
log("-- Probability Class --");
log("-----------------------");

class _Prob extends Mappable {
  constructor(x) { super(); this.x = x; } // expecting an array of {t: name, p: probability}
  toString() { return `Prob([${this.x.map(y => "{t: " + y.t.toString() + ", p: " + y.p.toString() + "}")}])`; }

  mapf(f) { return Prob(this.x.map(y => ({t: f(y.t), p: y.p}))); }
}
const Prob = x => new _Prob(x);

const coin = Prob([{t: "Heads", p: 0.5}, {t: "Tails", p: 0.5}]);
const loadedcoin = Prob([{t: "Heads", p: 0.6}, {t: "Tails", p: 0.4}]);

const rev = s => s.split('').reverse().join(''); // reverse a string
//log( coin.mapf(rev) );
