// The Frankencurry - allows us to partially apply functions
const curry = (f, args = []) => function () {
  const args1 = args.concat(...arguments);
  return args1.length >= f.length? f(...args1) : curry(f, args1);
};
Object.defineProperty(Function.prototype, "$", {
  get: function() { return curry(this); }
});
