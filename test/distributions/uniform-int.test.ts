import test from 'ava'
import seedrandom from 'seedrandom'

import inDelta from '../_in-delta'
import random from '../../src/random'

type distFn = () => number

/**
 * @param d Distribution function
 * @returns Mean of d
 */
export const calcMean = (d: distFn) => {
  const n = 10000
  let sum = 0

  for (let i = 0; i < n; ++i) {
    const v = d()
    sum += v
  }

  return sum / n
}

test('random.uniformInt() with seedrandom has mean 0.5', (t) => {
  const r = random.clone(seedrandom('MzUyYjZjZmM4YWI5NzEwNDliZGRmOTE3'))
  const d = r.uniformInt()
  const mean = calcMean(d)
  t.true(inDelta(mean, 0.5, 0.05))
})

test('random.uniformInt(max) has mean max / 2', (t) => {
  const r = random.clone(seedrandom('NjcwNjY0MDdiNTEzMmE4Y2I0ZWYxYzNl'))
  const d = r.uniformInt(0, 42)
  const mean = calcMean(d)
  t.true(inDelta(mean, 21, 0.5))
})

test('random.uniformInt(min, max) has mean (min + max) / 2', (t) => {
  const r = random.clone(seedrandom('M2M2ZGFiZDdkOGUzMjkwOTM1MzQwMWRm'))
  const d = r.uniformInt(10, 42)
  const mean = calcMean(d)
  t.true(inDelta(mean, 26, 0.5))
})

test('random.uniformInt(min, max) with non valid input', (t) => {
  const r = random.clone(seedrandom('ZDJjM2IyNmFlNmVjNWQwMGZkMmY1Y2Nk'))
  const error = t.throws(
    () => {
      r.uniformInt(10.1, 42.1)
    },
    { instanceOf: Error }
  )
  t.is(
    error.message,
    'Expected number `argument` `10.1` failed predicate `integer`'
  )
})
