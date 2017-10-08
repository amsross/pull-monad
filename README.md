# pull-monad

Monadic functions for pull-streams

These are the methods that make something "monadic." These functions and their
interactions with each other satisfy the laws laid out in
[fantasy-land](https://github.com/fantasyland/fantasy-land).

Usually these methods exist on the protytpe and are used like so:

```
const lift2 = (f, a, b) => b.ap(a.map(f))
```

Because these are simply `through`'s, though, they must be used as such:

```
const lift2 = (f, a, b) => pull(b, ap(pull(a, map(f))))
```

## example

``` js
const pull = require('pull-stream')
const { map, of, ap, chain } = require('pull-monad')

const plus1 = x => x + 1                       // takes a number and returns a number
const times7 = x => x * 7                      // takes a number and returns a number
const triplicate = x => pull.values([x, x, x]) // takes a number and returns a stream

pull(
  lift2(a => b => a + b, of(1), of(2)),
  map(times7),
  chain(triplicate),
  ap(of(plus1)),
  pull.collect((err, arr) => console.log(arr)))

// => [22, 22, 22]
```
