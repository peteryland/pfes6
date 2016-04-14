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

class Mappable {
  mapf(f) { return undefined; } // abstract

  mapreplaceby(x) { return this.mapf(constant(x)); }
}
const mapf = ((f, x) => x.mapf(f)).$;   // Helper function to allow use of mapf(f, x)

class Applicable extends Mappable {
  static pure(x) { return undefined; } // abstract - Wrap a value
  ap(x) { return undefined; } // abstract - Apply a wrapped function to a wrapped value

  seqf(x) { return this.mapreplaceby(id).ap(x); }
  seqfL(x) { return liftA2(constant, this, x); }
  pure(x) { return this.constructor.pure(x); }
}
const liftA  = ((f, x)       => pure(f).ap(x)).$;
const liftA2 = ((f, x, y)    => mapf(f.$, x).ap(y)).$;
const liftA3 = ((f, x, y, z) => mapf(f.$, x).ap(y).ap(z)).$;

class Bindable extends Applicable {
  bind(f) { return undefined; } // abstract - Apply a function that returns a wrapped value(s) to a wrapped value(s)

  seqm(x) { return this.bind(constant(x)); }
  join() { return this.bind(id); }
  ret(x) { return this.constructor.pure(x); }
}
const bind     = ((f, x) => x.bind(f)).$;  // Helper function to allow use of bind(f, x)
const when     = ((b, x) => b? x : x.constructor.pure(undefined)).$;
const sequence = (xs) => mapM(id, xs);
// const foldr = ((f, a, [x, ...xs]) => xs.length === 0? f(x, a) : foldr(f, f(x, a), xs)).$;
// const mapM$k   = (pure, a, r) => f(a).bind(x =>              // x <- f a
//                                   r.bind(xs =>               // xs <- r
//                                   pure([x, ...xs])));        // return (x:xs)
// const mapM     = (f, as) => foldr(mapM$k(as[0].pure.$), as[0].pure([]), as);
const mapM = (f, xs) => xs.reduce(
  (acc, x) => (f(x)).bind(y =>             // y  <- f(x)
              acc.bind(ys =>               // ys <- acc
              xs[0].pure(ys.concat(y)))),  // return ys ++ y
  xs[0].pure([])); // won't work on []


log("--------------------");
log("-- Identity Class --");
log("--------------------");

class _Id extends Bindable {
  constructor(value) { super(); this.value = value; }
  toString() { return `Id(${this.value})`; }

  mapf(f) { return Id(f(this.value)); }

  ap(x) { return Id(this.value(x.value)); }
  static pure(x) { return Id(x); }

  bind(f) { return f(this.value); }
}
const Id = x => new _Id(x);

const myid = Id(42);
const myid2 = mapf(x => x+1, myid);
//log( myid2 );
const myid3 = Id(x => x*3).ap(myid);
const myid4 = myid2.bind(x =>                    // think of this as binding the name "x" to the value inside myid2
              Id(`${x} times ${x} is ${x*x}`));
//log( myid4 );
const myid5 = myid.bind(x =>                    // think of this as binding the name "x" to the value inside myid
              myid2.bind(y =>                   // and now we also bind the name "y" to the value inside myid2
              Id(`${x} times ${y} is ${x*y}`)));
//log( myid5 );


log("-----------------");
log("-- Maybe Class --");
log("-----------------");

const [NOTHING, JUST] = [0, 1]
class _Maybe extends Bindable {
  constructor(tag, value) { super(); this.tag = tag; this.value = value; }
  toString() { return this.tag === NOTHING? "Nothing()" : `Just(${this.value})`}

  mapf(f) { return this.tag === NOTHING? this : Just(f(this.value)); }

  ap(x) { return this.tag === NOTHING? this : mapf(this.value, x); }
  static pure(x) { return Just(x); }

  bind(f) { return this.tag === NOTHING? this : f(this.value); }
}
const Nothing = () => new _Maybe(NOTHING);
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

//log( bind(bigfun2, nothing) );
//log( bind(bigfun2, Just(77)) );
//log( bigfun2(77).bind(bigfun2) );
//log( bigfun2("hello").bind(bigfun2) );

//log( somenum.seqf(something) );
//log( somenum.seqfL(something) );
//log( something.seqf(somenum) );
//log( something.seqfL(somenum) );
//log( nothing.seqf(something) );
//log( something.seqf(nothing) );
//log( nothing.seqfL(something) );
//log( something.seqfL(nothing) );
//log( nothing.seqf(nothing) );
//log( nothing.seqfL(nothing) );

//log( _Maybe.pure(21).bind(bigfun2) );
//log( Just(100).bind(_Maybe.pure) );
//log( Just(200).seqm(Just(100)) );
//log( Just(Just("foo")).join() );
//log( nothing.join() );
//log( Just(nothing).join() );

//log( when(true, Just(77)) );
//log( when(false, Just(77)) );

//log( sequence([Just(3), Just("hello"), Just(1000)]) );
//log( sequence([Just(3), nothing, Just("hello"), Just(1000)]) );


log("-----------------------");
log("-- Probability Class --");
log("-----------------------");

function flatten_probs(xs) {
  const ys = xs.reduce(function(rv, x) { rv[x.t] = rv[x.t]? { t: x.t, p: rv[x.t].p + x.p } : x; return rv; }, {});
  return Object.keys(ys).map(key => ys[key]);
}

class _Prob extends Bindable {
  constructor(x) { super(); this.x = x; } // expecting an array of {t: name, p: probability}
  toString() { return `Prob([${this.x.map(y => "{t: " + y.t.toString() + ", p: " + y.p + "}\n     ")}])`; }

  mapf(f) { return Prob(this.x.map(({t, p}) => ({t:f(t), p}))); }

  ap(z) { return Prob(flatten_probs([].concat(...this.x.map(({t:t1, p:p1}) => z.mapf(t1).x.map(({t, p}) => ({t, p: p1 * p})))))); }
  static pure(t) { return Prob([{t, p:1}]); }

  bind(f) { return Prob(flatten_probs([].concat(...this.x.map(({t:t1, p:p1}) => f(t1).x.map(({t, p}) => ({t, p: p1 * p})))))); }
}
const Prob = x => new _Prob(x);

//log( _Prob.pure("Heads") );

const coin = Prob([{t: "Heads", p: 0.5}, {t: "Tails", p: 0.5}]);
const loadedcoin = Prob([{t: "Heads", p: 0.6}, {t: "Tails", p: 0.4}]);

const rev = s => s.split('').reverse().join(''); // reverse a string

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

const countHeads = (...xs) => xs.filter(x => x === "Heads").length;

const threecoins = coin.bind(x =>
                   loadedcoin.bind(y =>
                   coin.bind(z =>
                   _Prob.pure(countHeads(x, y, z)))));
//log( threecoins );
const twoheadsfromthreecoins = Prob(threecoins.x.filter(x => x.t == 2))
//log( twoheadsfromthreecoins );


log("------------------");
log("-- Either Class --");
log("------------------");

const [LEFT, RIGHT] = [0, 1]
class _Either extends Bindable {
  constructor(tag, value) { super(); this.tag = tag; this.value = value; }
  toString() { return this.tag === LEFT? `Left(${this.value})` : `Right(${this.value})`}

  mapf(f) { return this.tag === LEFT? Left(f(this.value)) : this; }

  ap(x) { return this.tag === LEFT? mapf(this.value, x) : this; }
  static pure(x) { return Left(x); }

  bind(f) { return this.tag === LEFT? f(this.value) : this; }
}
const Left = x => new _Either(LEFT, x);
const Right = x => new _Either(RIGHT, x);

const myval = Left(3);
const myzero = Left(0);
const myerr = Right("earlier error");

const fn = (x => x === 0? Right("can't divide by zero") : Left(3/x));

const mybindf = val => val.bind(x => // think of this as bind the name "x" to the value inside val
                       fn(x));

//log( mybindf(myval) );
//log( mybindf(myzero) );
//log( mybindf(myerr) );


log("-----------------");
log("-- Array Class --");
log("-----------------");

class _Array_ {
  constructor(x) { this.x = x; } // expecting a normal javascript array
  toString() { return this.x.toString(); }

  mapf(f) { return Array_(this.x.map(x => f(x))); } // must explicitly apply just one argument

  static pure(x) { return Array_([x]); }
}
const Array_ = x => new _Array_(x);

//log(Array_([1, 2]).mapf(add3));
const f = ((x, y) => `${x} + ${y} = ${x + y}`).$
//log(f(1, 2));
//log(Array_([f(1), f(2)]).mapf(f1 => f1(0)));
const myArray = Array_([1, 2]);
//log(mapf(g => g(3), mapf(f, myArray)));


//Array.prototype.snoc = function(x) { return [x].concat(this); }
//const cons = (x, xs) => [x].concat(xs);
//log([1, 2, 3].snoc(0));
//log(cons(0, [1, 2, 3]));


log("----------------");
log("-- List Class --");
log("----------------");

const [NIL, CONS] = [0, 1];
class _List {
  constructor(tag, h, r) { this.tag = tag; this.h = h; this.r = r; }
  toString() { return this.tag === NIL? "[]" : `${this.h}:${this.r}`; }

  mapf(f) { return this.tag === NIL? this : L_(f(this.h), this.r.mapf(f)); }
}
const L$ = new _List(NIL);
const L_ = (x, xs) => new _List(CONS, x, xs);

//log( L_(10, L_(20, L$)) );
//log( L_(10, L_(20, L$)).mapf(add3) );
