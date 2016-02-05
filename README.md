# pfes6
## Pure Functional Programming Concepts with ECMAScript 6

This follow-along workshop will give an introduction to some of the most
important concepts of pure functional languages, but in the familiar
environment of ES6.  Over the course of the workshop, examples of currying,
functors, applicative functors and monads will be created together in ES6.

Use the below instructions to set up your environment, if you haven't already,
then proceed through the git tags in order on the `workshop` branch of this
repo.

## Running the ES6 part with Babel

### Linux
```
# Install node and npm
[ -x /usr/bin/curl ] && curl -s https://deb.nodesource.com/gpgkey/nodesource.gpg.key | sudo apt-key add -
# OR
[ -x /usr/bin/wget ] && wget -qO- https://deb.nodesource.com/gpgkey/nodesource.gpg.key | sudo apt-key add -
DISTRO=jessie
# OR precise, sid, trusty, vivid, wheezy, wily, xenial
echo "deb https://deb.nodesource.com/node_5.x $DISTRO main" | sudo tee /etc/apt/sources.list.d/nodesource.list > /dev/null
sudo aptitude install apt-transport-https
sudo aptitude update
sudo aptitude install nodejs
# Install babel
(cd && npm install babel-cli babel-preset-es2015)
# Configure babel
echo '{"presets": ["es2015"]}' > ~/.babelrc
```

### OSX
```
# Install homebrew
sudo ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
# Install npm
sudo brew install npm
# Install babel
sudo npm install --global babel-cli babel-preset-es2015
# Configure babel
echo '{"presets": ["es2015"]}' > ~/.babelrc
```

### Windows
```
??
```

## Running the Haskell part

### Use [https://ghc.io/](https://ghc.io/)

Don't forget to use `let` when declaring in interactive mode.

### [Install Haskell](https://www.haskell.org/downloads)

If you are new to Haskell, I'd recommend sticking with the Haskell Platform, and then switching to Stack when you're ready to be a bit more adventurous.

If you've a little more experience with Haskell already, or if you want to dive right into lots of Haskell, then go straight to using Stack.

### Skip it and go straight to Tony Morris's course

Note: A fair amount of prior knowledge is assumed with this course, so if you find yourself a bit lost from the start, read the first few chapters from either [Real World Haskell](http://book.realworldhaskell.org/read/) or [Learn You a Haskell](http://learnyouahaskell.com/chapters) before you begin.

1. Install Haskell (as above)
2. git clone [https://github.com/NICTA/course](https://github.com/NICTA/course)
3. Read the README at the above URL and follow the instructions.
