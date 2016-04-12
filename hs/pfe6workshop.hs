module PFES6Workshop where

-- FP-Style Functions and Currying

identity = \x -> x
identity' x = x
constant x y = x

-- | Identity function example
-- > identity 3

-- | Constant Function example
-- > let myconstf = constant "hello"
-- > myconstf 4

add x y z = x + y + z
add'      = \x y z -> x + y + z
add''     = \x -> \y -> \z -> x + y + z

-- | Currying examples
-- > add  1 2 3
-- > ((add' 1) 2) 4
-- > ((add 1) 2) 5
-- > (add 1 2) 6
-- > (add 1) 2 7 8

mult = \x y -> x * y
-- | Another example
-- > (mult 5) 4


-- TODO: Reducer (Monoid) Typeclass


-- Mappable (Functor) Typeclass

class Mappable m where
  mapf :: (a -> b) -> m a -> m b

  -- mapreplaceby :: a -> m b -> m a
  -- mapreplaceby x mb = mapf (const x) mb

-- Identity Type

data Id a = Id a deriving Show
newtype Id' a = Id' { runId' :: a }

instance Mappable Id where
  mapf f (Id x) = Id (f x)

-- | New Instance Example
-- > let myid = Id 42
-- > myid
--
-- > let myid2 = mapf (\x -> x + 1) myid
-- > myid2


-- Option Type
data Option a = Some a | None deriving Show

instance Mappable Option where
  mapf f (Some x) = Some (f x)
  mapf f None = None

-- | Option Examples
-- > let myjustval = Some 3
-- > myjustval
--
-- > let mynothing = None
-- > mynothing
--
-- > let add3 x = 3 + x
-- > mapf add3 myjustval
-- > mapf add3 mynothing

-- Probability Type
data Prob a = Prob [(a, Rational)] deriving Show

instance Mappable Prob where
  mapf f (Prob xs) = Prob (map (\(t, p) -> (f t, p)) xs)

-- | Prob Examples
-- > let myprob = Prob [("Heads", 1/2), ("Tails", 1/2)]
-- > myprob
-- > mapf reverse myprob
