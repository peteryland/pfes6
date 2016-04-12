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


log("--------------------");
log("-- Identity Class --");
log("--------------------");

class _Id {
  constructor(value) { this.value = value; }
  toString() { return `Id(${this.value})`}
}
const Id = x => new _Id(x); // functional-style constructor

const myid = Id(42); // example instance
//log( myid );


log("-----------------");
log("-- Maybe Class --");
log("-----------------");

const [NOTHING, JUST] = [0, 1]
class _Maybe {
  constructor(tag, value) { this.tag = tag; this.value = value; }
  toString() { return this.tag === NOTHING? "Nothing()" : `Just(${this.value})`}
}
const Nothing = () => new _Maybe(NOTHING); // functional-style constructors
const Just = x => new _Maybe(JUST, x);

const mymaybe = Just(7);
//log( mymaybe );
const mynothing = Nothing();
//log( mynothing );

class MaybeReducer extends Reducer {
  get unit() { return Nothing; }
  op(me, a, b) { return a.tag === JUST? a : b; }
}
const maybereducer = new MaybeReducer();

//log( maybereducer.rreduce([Nothing(), Just(4), Just(5), Nothing()]) );

class MaybeReducer2 extends Reducer {
  constructor(parentreducer) { super(); this.parentop = parentreducer.op; }
  get unit() { return Nothing(); }
  op(me, a, b) { return a.tag === NOTHING? b : (b.tag === NOTHING? a : Just(me.parentop(me, a.value, b.value))); }
}
const maybesumreducer = new MaybeReducer2(sum);

//log( maybesumreducer.rreduce([Nothing(), Just(4), Just(5), Nothing()]) );

log("-----------------------");
log("-- Probability Class --");
log("-----------------------");

class _Prob {
  constructor(x) { this.x = x; } // expecting an array of {t: name, p: probability}
  toString() { return `Prob([${this.x.map(y => "{t: " + y.t.toString() + ", p: " + y.p + "}\n     ")}])`; }
}
const Prob = x => new _Prob(x);

const coin = Prob([{t: "Heads", p: 0.5}, {t: "Tails", p: 0.5}]);
//log( coin );

const loadedcoin = Prob([{t: "Heads", p: 0.6}, {t: "Tails", p: 0.4}]);
//log( loadedcoin );
