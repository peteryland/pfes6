import './curry';
const log = x => console.log(x.toString());

const id = x => x;
const constant = x => (y => x);
const add  = ((x, y, z) => x + y + z).$;
const mult = function(x, y) { return x * y; }.$;

log("=============");
log("== Reducer ==");
log("=============");

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

const mylist = [1, 2, 3, 4];

const s = sum.rreduce(mylist);
//log( s );

const p = product.rreduce(mylist);
//log( p );

class Flatten extends Reducer {
  get unit()   { return []; }
  op(me, a, b) { return [...a, ...b]; }
}
const flatten = new Flatten();
//log( flatten.rreduce([[1, 2],[3, 4]]) );
