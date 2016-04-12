import './curry';
const log = x => console.log(x.toString());

const id = x => x;
const constant = x => (y => x);
const add  = ((x, y, z) => x + y + z).$;
const add2 = ((x, y) => x + y).$;
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


log("================");
log("== Applicable ==");
log("================");

class Mappable {
  mapf(f) { return undefined; } // abstract

  mapreplaceby(x) { return this.mapf(constant(x)); }
}
const mapf = ((f, x) => x.mapf(f)).$;   // Helper function to allow use of mapf(f, x)

class Applicable extends Mappable {
  // pure :: a -> f a
  // ap :: f (a -> b) -> f a -> f b
  seqf(x) { return this.mapreplaceby(id).ap(x); }
  seqfL(x) { return liftA2(constant, this, x); }
  pure(x) { return this.constructor.pure(x); }
}
const liftA  = ((f, x)       => pure(f).ap(x)).$;
const liftA2 = ((f, x, y)    => mapf(f.$, x).ap(y)).$;
const liftA3 = ((f, x, y, z) => mapf(f.$, x).ap(y).ap(z)).$;


log("--------------------");
log("-- Identity Class --");
log("--------------------");

class _Id extends Applicable {
  constructor(value) { super(); this.value = value; }
  toString() { return `Id(${this.value})`; }

  mapf(f) { return Id(f(this.value)); }

  ap(x) { return Id(this.value(x.value)); }
  static pure(x) { return Id(x); }
}
const Id = x => new _Id(x); // functional-style constructor

const myid = Id(42);
const myid2 = mapf(x => x+1, myid);
const myid3 = Id(x => x*3).ap(myid);
//log( myid3 );


log("-----------------");
log("-- Maybe Class --");
log("-----------------");

const [NOTHING, JUST] = [0, 1]
class _Maybe extends Applicable {
  constructor(tag, value) { super(); this.tag = tag; this.value = value; }
  toString() { return this.tag === NOTHING? "Nothing()" : `Just(${this.value})`}

  mapf(f) { return this.tag === NOTHING? this : Just(f(this.value)); }

  ap(x) { return this.tag === NOTHING? this : mapf(this.value, x); }
  static pure(x) { return Just(x); }
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

const add3 = x => 3 + x;
const mymaybe1 = mapf(add3, Just(7));
//log( mymaybe1 );
const mymaybe2 = mapf(add3, Nothing());
//log( mymaybe2 );
const mymaybe3 = Just(add3).ap(Just(8));
//log( mymaybe3 );
const mymaybe4 = mapf(add2, Just(3)).ap(Just(8));
//log( mymaybe4 );
const mymaybe5 = mapf(add2, Nothing()).ap(Just(8));
//log( mymaybe5 );
const mymaybe6 = mapf(add2, Just(3)).ap(Nothing());
//log( mymaybe6 );
const mymaybe7 = Just(3).mapf(add2).ap(Just(8));
//log( mymaybe7 );

function bigfun(x) {
  const y = x * 2 + 200;
  if (isNaN(y))
    return "I'm sorry, I can't do that.";
  return y;
}

const somenum = Just(1001);
const something = Just("hello");
const nothing = Nothing();

//log( mapf(bigfun, somenum) );
//log( mapf(bigfun, something) );
//log( mapf(bigfun, nothing) );

function bigfun2(x) {
  const y = x * 2 + 200;
  return isNaN(y)? Nothing() : Just(y);
}

//log( nothing.ap(somenum) );
const somefun = Just(add3);
//log( somefun.ap(somenum) );
//log( somefun.ap(nothing) );
const justadd = Just(add2);
//log( justadd.ap(somenum).ap(somenum) );
//log( justadd.ap(somenum).ap(nothing) );
//log( justadd.ap(nothing) );


log("-----------------------");
log("-- Probability Class --");
log("-----------------------");

class _Prob extends Applicable {
  constructor(x) { super(); this.x = x; } // expecting an array of {t: name, p: probability}
  toString() { return `Prob([${this.x.map(y => "{t: " + y.t.toString() + ", p: " + y.p + "}\n     ")}])`; }

  mapf(f) { return Prob(this.x.map(y => ({t: f(y.t), p: y.p}))); }

  ap(z) { return Prob([].concat(...this.x.map(y => z.mapf(y.t).x.map(w => ({t: w.t, p: y.p * w.p}))))); }
  static pure(x) { return Prob([{t: x, p: 1}]); }
}
const Prob = x => new _Prob(x);

//log( _Prob.pure("Heads") );

const coin = Prob([{t: "Heads", p: 0.5}, {t: "Tails", p: 0.5}]);
const loadedcoin = Prob([{t: "Heads", p: 0.6}, {t: "Tails", p: 0.4}]);

const rev = s => s.split('').reverse().join(''); // reverse a string
//log( coin.mapf(rev) );

const myfs = Prob([{t: rev, p: 0.8}, {t: x => x.toUpperCase(), p: 0.2}]);
const myprob1 = myfs.ap(coin);
//log( myprob1 );

//log( coin.mapf(add2).ap(coin) );
//log( coin.mapf(add2).ap(loadedcoin) );
//log( coin.mapf(((x,y,z) => x + "/" + y + "/" + z).$).ap(loadedcoin).ap(coin) );

const liftedAdd = liftA2((x,y) => x + "/" + y)
//log( liftedAdd(coin, loadedcoin) );

const liftedAdd3 = liftA3((x,y,z) => x + "/" + y + "/" + z)
//log( liftedAdd3(coin)(loadedcoin)(coin) );

//log( myprob1.mapf(add2).ap(coin) );
