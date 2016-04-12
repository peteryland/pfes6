import './curry';
const log = x => console.log(x.toString());

log("=====================================");
log("== FP-Style Functions and Currying ==");
log("=====================================");

// we need to get used to seeing functions defined using "fat arrow" or
// "lambda" syntax
const id = x => x;
const constant = x => (y => x);

// the `id` function
//log( id(3) );

// the `constant` function
const myconstf = constant("hello");
//log( myconstf(4) );

// intro to currying
// ignore the `.$` for now
// these two are the same function, just with different ways to call
const add  = ((x, y, z) => x + y + z).$;
const add2 = x => (y => (z => x + y + z));

// `add` gets called with three params
//log( add(1, 2, 3) );

// however, `add2` takes one param and returns a function that takes one param
// and returns a function that takes one param
//log( add2(1)(2)(4) );

// this is where the `.$` comes in
// it's from the curry import at the top and transforms any function into one
// that can be (optionally) curried
//log( add(1)(2)(5) );
//log( add(1, 2)(6) );
//log( add(1)(2, 7, 8) );

// it also works when defining functions with the `function` keyword
const mult = function(x, y) { return x * y; }.$;
//log( mult(5)(4) );
