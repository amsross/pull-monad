const test = require('tape')
const { pull, collect, flatten, values } = require('pull-stream')
const { of, ap, map, chain } = require('./')
const tap = fn => map(x => (fn(x) && x) || x)

test('pull-monad', assert => {
  const runTest = assert => expected => (...streams) => pull(
    values(streams),
    flatten(),
    tap(x => assert.deepEqual(x, expected, 'expected value returned')),
    collect((err, arr) => {
      assert.ifError(err, 'no error')
      assert.equals(arr.length, streams.length, 'one result per stream')
      assert.end()
    }))

  // u.map(a => a) is equivalent to u
  assert.test('Functor/identity', assert => {
    const left = pull(values([1]), map(x => x))
    const right = values([1])

    runTest(assert)(1)(left, right)
  })

  // u.map(x => f(g(x))) is equivalent to u.map(g).map(f)
  assert.test('Functor/composition', assert => {
    const f = x => x + 1
    const g = x => x * 3
    const left = pull(values([1]), map(x => f(g(x))))
    const right = pull(values([1]), map(g), map(f))

    runTest(assert)(4)(left, right)
  })

  // v.ap(A.of(x => x)) is equivalent to v
  assert.test('Applicative/identity', assert => {
    const left = pull(values([1]), ap(of(x => x)))
    const right = values([1])

    runTest(assert)(1)(left, right)
  })

  // A.of(x).ap(A.of(f)) is equivalent to A.of(f(x))
  assert.test('Applicative/homomorphism', assert => {
    const x = 1
    const f = x => x * 3
    const left = pull(of(x), ap(of(f)))
    const right = of(f(x))

    runTest(assert)(3)(left, right)
  })

  // A.of(x).ap(u) is equivalent to u.ap(A.of(f => f(x)))
  assert.test('Applicative/interchange', assert => {
    const x = 1
    const f = x => x * 3
    const u = () => of(f)
    const left = pull(of(x), ap(u()))
    const right = pull(u(), ap(of(f => f(x))))

    runTest(assert)(3)(left, right)
  })

  // v.ap(u.ap(a.map(f => g => x => f(g(x))))) is equivalent to v.ap(u).ap(a)
  assert.test('Apply/composition', assert => {
    const x = 1
    const f = x => x + 1
    const g = x => x * 3
    const v = () => of(x)
    const u = () => of(g)
    const a = () => of(f)
    const left = pull(v(), ap(pull(u(), ap(pull(a(), map(f => g => x => f(g(x))))))))
    const right = pull(v(), ap(u()), ap(a()))

    runTest(assert)(4)(left, right)
  })

  // m.chain(f).chain(g) is equivalent to m.chain(x => f(x).chain(g))
  assert.test('Chain/associativity', assert => {
    const x = 1
    const f = x => of(x + 1)
    const g = x => of(x * 3)
    const m = () => of(x)
    const left = pull(m(), chain(f), chain(g))
    const right = pull(m(), chain(x => pull(f(x), chain(g))))

    runTest(assert)(6)(left, right)
  })

  assert.end()
})
