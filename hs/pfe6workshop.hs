module PFES6Workshop where

import Data.Char(toUpper) -- TODO: remove, it's only needed for the Applicable Prob examples

-- FP-Style Functions and Currying

identity = \x -> x  -- define as a lambda
identity' x = x     -- usual way to define it
constant x y = x

-- | Identity function example
-- > identity 3

-- | Constant Function example
-- > let myconstf = constant "hello"
-- > myconstf 4

-- These are all equivalent.  Haskell allows currying and partial application.
add x y z = x + y + z                   -- usual way
add'      = \x y z -> x + y + z         -- as a lambda
add''     = \x -> \y -> \z -> x + y + z -- uncurried

-- | Currying examples: all these parentheses are optional
-- > add 1 2 3
-- > ((add' 1) 2) 4
-- > ((add 1) 2) 5
-- > (add 1 2) 6
-- > (add 1) 2 7

mult = \x y -> x * y
-- | Another example
-- > (mult 5) 4


-- Identity Type

data Id a = Id a deriving Show
data Id' a = Id' { runId' :: a } deriving Show -- a newer way to define it

-- | New Identity Instance Example
-- > let myid = Id 42
-- > myid


-- Option Type
data Option a = Some a | None deriving Show

-- | Option Examples
-- > let myjustval = Some 3
-- > myjustval
--
-- > let mynothing = None
-- > mynothing


-- Probability Type
data Prob a = Prob { runProb :: [(a, Rational)] } deriving Show

-- | Prob Examples
-- > let coin = Prob [("Heads", 1/2), ("Tails", 1/2)]
-- > coin
-- > let loadedcoin = Prob [("Heads", 1/2), ("Tails", 1/2)]
-- > loadedcoin


-- Reducer (Monoid) Typeclass

class Reducer a where
  unit :: a
  op :: a -> a -> a

  rreduce :: [a] -> a
  rreduce = foldr op unit

-- We must wrap Nums in order to implement reducers for two reasons:
-- 1. Num is a typeclass that encapsulates all numeric types, not a type itself
-- 2. We want to implement two distinct reducers

newtype Sum a = Sum a deriving Show

instance (Num a) => Reducer (Sum a) where
  unit = Sum 0
  op (Sum x) (Sum y) = Sum (x + y)

-- | Reduce using Sum
-- > let mylist = [1, 2, 3, 4]
-- > rreduce $ map Sum mylist

newtype Product a = Product a deriving Show

instance (Num a) => Reducer (Product a) where
  unit = Product 1
  op (Product x) (Product y) = Product (x * y)

-- | Reduce using Product
-- > rreduce $ map Product mylist

instance Reducer [a] where
  unit = []
  op = (++)

-- | Reduce a list of lists
-- > let listoflists = [[1, 2], [5, 6], [8, 10]]
-- > rreduce listoflists


-- Mappable (Functor) Typeclass

class Mappable m where
  mapf :: (a -> b) -> m a -> m b  -- apply a fn to a wrapped arg

  mapreplaceby :: a -> m b -> m a
  mapreplaceby x mb = mapf (const x) mb

instance Mappable Id where
  mapf f (Id x) = Id (f x)

-- | Mapping Identities Example
-- > let myid2 = mapf (\x -> x + 1) myid
-- > myid2

instance Mappable Option where
  mapf f (Some x) = Some (f x)
  mapf f None = None

-- | Option Examples
-- > let add3 x = 3 + x
-- > mapf add3 myjustval
-- > mapf add3 mynothing

instance Mappable Prob where
  mapf f (Prob xs) = Prob (map (\(t, p) -> (f t, p)) xs)

-- | Prob Examples
-- > mapf reverse myprob


-- Applicable (Applicative Functor) Typeclass

class Mappable m => Applicable m where
  wrap :: a -> m a                 -- also known as "pure" or "return"
  ap :: m (a -> b) -> m a -> m b   -- apply a wrapped fn to a wrapped arg

liftA :: Applicable m => (a -> b) -> m a -> m b
liftA f a = ap (wrap f) a

liftA2 :: Applicable m => (a -> b -> c) -> m a -> m b -> m c
liftA2 f a b = ap (mapf f a) b
liftA2' f a b = f `mapf` a `ap` b -- using infix notation

liftA3 :: Applicable m => (a -> b -> c -> d) -> m a -> m b -> m c -> m d
liftA3 f a b c = f `mapf` a `ap` b `ap` c

instance Applicable Id where
  wrap = Id
  ap (Id f) (Id a) = Id (f a)

-- TODO: examples

instance Applicable Option where
  wrap = Some
  ap (Some f) m = mapf f m
  ap None _     = None

-- TODO: examples

multiplyprobs p = map (\(t, r) -> (t, p*r))
concatprobs p (Prob xs) ys = multiplyprobs p xs ++ ys

instance Applicable Prob where
  wrap x = Prob [(x, 1)]
  ap (Prob fs) xs = Prob (ap' fs xs)
    where
      ap' :: [(a -> b, Rational)] -> Prob a -> [(b, Rational)]
      ap' ((f, p):ps) xs = concatprobs p (mapf f xs) (ap' ps xs)
      ap' [] _ = []

-- | Applicable Prob Examples
-- > import Data.Char(toUpper)
-- > toUpperS = map toUpper
--
-- > coin = Prob [("Heads", 1/2), ("Tails", 1/2)]
-- > loadedcoin = Prob [("Heads", 1/2), ("Tails", 1/2)]
-- > probf = Prob [(reverse, 1/10), (toUpperS, 9/10)]
--
-- > probf `ap` coin
-- > probf `ap` loadedcoin
-- > liftA2 (++) coin loadedcoin
-- > liftA3 (\a b c -> a ++ "/" ++ b ++ "/" ++ c) coin loadedcoin coin


-- Bindable (Monad) Typeclass

class Applicable m => Bindable m where
  bind :: (a -> m b) -> m a -> m b

x `b` f = bind f x

instance Bindable Id where
  bind f (Id x) = f x

instance Bindable Option where
  bind f (Some x) = f x
  bind f None     = None

instance Bindable Prob where
  bind f (Prob xs) = Prob (bind' f xs)
    where
      bind' f []          = []
      bind' f ((t, p):xs) = concatprobs p (f t) (bind' f xs)

toUpperS = map toUpper
coin = Prob [("Heads", 1/2), ("Tails", 1/2)]
loadedcoin = Prob [("Heads", 3/5), ("Tails", 2/5)]
probf = Prob [(reverse, 1/10), (toUpperS, 9/10)]
x1 = probf `ap` coin
x2 = probf `ap` loadedcoin
x3 = liftA2 (++) coin loadedcoin
x4 = liftA3 (\a b c -> a ++ "/" ++ b ++ "/" ++ c) coin loadedcoin coin

x5 = coin `b`       \x ->
     loadedcoin `b` \y ->
     coin `b`       \z ->
     wrap $ x ++ y ++ z

x6 = coin `b`       \x ->
     loadedcoin `b` \y ->
     coin `b`       \z ->
     wrap $ length $ filter (== "Heads") $ [x, y, z]

addToProb x [] = [x]
addToProb (u, r) ((t, p):ys) = if t == u then (t, p+r):ys else (t, p):addToProb (u, r) ys
x7 = foldr addToProb [] $ runProb x6
