import ow from 'ow'

import RNG from './rng'
import RNGFactory from './rng-factory'

import uniform from './distributions/uniform'
import uniformInt from './distributions/uniform-int'
import uniformBoolean from './distributions/uniform-boolean'
import normal from './distributions/normal'
import logNormal from './distributions/log-normal'
import bernoulli from './distributions/bernoulli'
import binomial from './distributions/binomial'
import geometric from './distributions/geometric'
import poisson from './distributions/poisson'
import exponential from './distributions/exponential'
import irwinHall from './distributions/irwin-hall'
import bates from './distributions/bates'
import pareto from './distributions/pareto'


export { RNG, RNGFactory }

/**
 * Seedable random number generator supporting many common distributions.
 *
 * Defaults to Math.random as its underlying pseudorandom number generator.
 *
 * @name Random
 * @class
 *
 * @param {RNG|function} [rng=Math.random] - Underlying pseudorandom number generator.
 */
class Random<R extends RNG> {

  _cache: any
  _rng: RNG
  _patch: typeof Math.random

  constructor(rng?: R) {
    if (rng) ow(rng, ow.object.instanceOf(RNG))

    this._cache = {}
    this.use(rng)
  }

  /**
   * @member {RNG} Underlying pseudo-random number generator
   */
  get rng() {
    return this._rng
  }

  /**
   * Creates a new `Random` instance, optionally specifying parameters to
   * set a new seed.
   *
   * @see RNG.clone
   *
   * @param {string} [seed] - Optional seed for new RNG.
   * @param {object} [opts] - Optional config for new RNG options.
   * @return {Random}
   */
  clone<T extends RNG>(...args:[T]):Random<RNG> {
    if (args.length) {
      return new Random(RNGFactory(...args))
    } else {
      return new Random(this.rng.clone())
    }
  }

  /**
   * Sets the underlying pseudorandom number generator used via
   * either an instance of `seedrandom`, a custom instance of RNG
   * (for PRNG plugins), or a string specifying the PRNG to use
   * along with an optional `seed` and `opts` to initialize the
   * RNG.
   *
   * @example
   * const random = require('random')
   *
   * random.use('example_seedrandom_string')
   * // or
   * random.use(seedrandom('kittens'))
   * // or
   * random.use(Math.random)
   *
   * @param {...*} args
   */
  use(...args:[RNG]) {
    this._rng = RNGFactory(...args)
  }

  /**
   * Patches `Math.random` with this Random instance's PRNG.
   */
  patch() {
    if (this._patch) {
      throw new Error('Math.random already patched')
    }

    this._patch = Math.random
    // TODO: Defaults added
    Math.random = this.uniform(0, 1)
  }

  /**
   * Restores a previously patched `Math.random` to its original value.
   */
  unpatch() {
    if (this._patch) {
      Math.random = this._patch
      delete this._patch
    }
  }

  // --------------------------------------------------------------------------
  // Uniform utility functions
  // --------------------------------------------------------------------------

  /**
   * Convenience wrapper around `this.rng.next()`
   *
   * Returns a floating point number in [0, 1).
   *
   * @return {number}
   */
  next = ():number => {
    return this._rng.next()
  }

  /**
   * Samples a uniform random floating point number, optionally specifying
   * lower and upper bounds.
   *
   * Convence wrapper around `random.uniform()`
   *
   * @param {number} [min=0] - Lower bound (float, inclusive)
   * @param {number} [max=1] - Upper bound (float, exclusive)
   * @return {number}
   */
  float = (min: number, max: number): number => {
    return this.uniform(min, max)()
  }

  /**
   * Samples a uniform random integer, optionally specifying lower and upper
   * bounds.
   *
   * Convence wrapper around `random.uniformInt()`
   *
   * @param {number} [min=0] - Lower bound (integer, inclusive)
   * @param {number} [max=1] - Upper bound (integer, inclusive)
   */
  int = (min: number, max: number) => {
    return this.uniformInt(min, max)()
  }

  /**
   * Samples a uniform random integer, optionally specifying lower and upper
   * bounds.
   *
   * Convence wrapper around `random.uniformInt()`
   *
   * @alias `random.int`
   *
   * @param {number} [min=0] - Lower bound (integer, inclusive)
   * @param {number} [max=1] - Upper bound (integer, inclusive)
   */
  integer = (min: number, max: number) => {
    return this.uniformInt(min, max)()
  }

  /**
   * Samples a uniform random boolean value.
   *
   * Convence wrapper around `random.uniformBoolean()`
   *
   * @alias `random.boolean`
   */
  bool = () => {
    return this.uniformBoolean()()
  }

  /**
   * Samples a uniform random boolean value.
   *
   * Convence wrapper around `random.uniformBoolean()`
   */
  boolean = ()=> {
    return this.uniformBoolean()()
  }

  // --------------------------------------------------------------------------
  // Uniform distributions
  // --------------------------------------------------------------------------

  /**
   * Generates a [Continuous uniform distribution](https://en.wikipedia.org/wiki/Uniform_distribution_(continuous)).
   *
   * @param {number} [min=0] - Lower bound (float, inclusive)
   * @param {number} [max=1] - Upper bound (float, exclusive)
   */
  uniform = (min: number, max: number) => {
    return this._memoize<() => number>('uniform', uniform, min, max)
  }

  /**
   * Generates a [Discrete uniform distribution](https://en.wikipedia.org/wiki/Discrete_uniform_distribution).
   *
   * @param {number} [min=0] - Lower bound (integer, inclusive)
   * @param {number} [max=1] - Upper bound (integer, inclusive)
   */
  uniformInt = (min: number, max: number) => {
    return this._memoize<() => number>('uniformInt', uniformInt, min, max)
  }

  /**
   * Generates a [Discrete uniform distribution](https://en.wikipedia.org/wiki/Discrete_uniform_distribution),
   * with two possible outcomes, `true` or `false.
   *
   * This method is analogous to flipping a coin.
   */
  uniformBoolean = () => {
    return this._memoize<() => boolean>('uniformBoolean', uniformBoolean)
  }

  // --------------------------------------------------------------------------
  // Normal distributions
  // --------------------------------------------------------------------------

  /**
   * Generates a [Normal distribution](https://en.wikipedia.org/wiki/Normal_distribution).
   *
   * @param {number} [mu=0] - Mean
   * @param {number} [sigma=1] - Standard deviation
   */
  normal = (mu: number, sigma: number) => {
    return normal(this, mu, sigma)
  }

  /**
   * Generates a [Log-normal distribution](https://en.wikipedia.org/wiki/Log-normal_distribution).
   *
   * @param {number} [mu=0] - Mean of underlying normal distribution
   * @param {number} [sigma=1] - Standard deviation of underlying normal distribution
   */
  logNormal = (mu: number, sigma: number) => {
    return logNormal(this, mu, sigma)
  }

  // --------------------------------------------------------------------------
  // Bernoulli distributions
  // --------------------------------------------------------------------------

  /**
   * Generates a [Bernoulli distribution](https://en.wikipedia.org/wiki/Bernoulli_distribution).
   *
   * @param {number} [p=0.5] - Success probability of each trial.
   */
  bernoulli = (p: number) => {
    return bernoulli(this, p)
  }

  /**
   * Generates a [Binomial distribution](https://en.wikipedia.org/wiki/Binomial_distribution).
   *
   * @param {number} [n=1] - Number of trials.
   * @param {number} [p=0.5] - Success probability of each trial.
   */
  binomial = (n: number, p: number) => {
    return binomial(this, n, p)
  }

  /**
   * Generates a [Geometric distribution](https://en.wikipedia.org/wiki/Geometric_distribution).
   *
   * @param {number} [p=0.5] - Success probability of each trial.
   */
  geometric = (p: number) => {
    return geometric(this, p)
  }

  // --------------------------------------------------------------------------
  // Poisson distributions
  // --------------------------------------------------------------------------

  /**
   * Generates a [Poisson distribution](https://en.wikipedia.org/wiki/Poisson_distribution).
   *
   * @param {number} [lambda=1] - Mean (lambda > 0)
   */
  poisson = (lambda: number) => {
    return poisson(this, lambda)
  }

  /**
   * Generates an [Exponential distribution](https://en.wikipedia.org/wiki/Exponential_distribution).
   *
   * @param {number} [lambda=1] - Inverse mean (lambda > 0)
   */
  exponential = (lambda: number)=> {
    return exponential(this, lambda)
  }

  // --------------------------------------------------------------------------
  // Misc distributions
  // --------------------------------------------------------------------------

  /**
   * Generates an [Irwin Hall distribution](https://en.wikipedia.org/wiki/Irwin%E2%80%93Hall_distribution).
   *
   * @param {number} [n=1] - Number of uniform samples to sum (n >= 0)
   */
  irwinHall = (n: number) => {
    return irwinHall(this, n)
  }

  /**
   * Generates a [Bates distribution](https://en.wikipedia.org/wiki/Bates_distribution).
   *
   * @param {number} [n=1] - Number of uniform samples to average (n >= 1)
   */
  bates = (n: number)=> {
    return bates(this, n)
  }

  /**
   * Generates a [Pareto distribution](https://en.wikipedia.org/wiki/Pareto_distribution).
   *
   * @param {number} [alpha=1] - Alpha
   */
  pareto = (alpha: number) => {
    return pareto(this, alpha)
  }

  // --------------------------------------------------------------------------
  // Internal
  // --------------------------------------------------------------------------

  /**
   * Memoizes distributions to ensure they're only created when necessary.
   *
   * Returns a thunk which that returns independent, identically distributed
   * samples from the specified distribution.
   *
   * @private
   *
   * @param {string} label - Name of distribution
   * @param {function} getter - Function which generates a new distribution
   * @param {...*} args - Distribution-specific arguments
   */
  _memoize = <T>(label: string | number, getter: (...args: any[]) => any, ...args: any[]): T => {
    const key = `${args.join(';')}`
    let value = this._cache[label]

    if (value === undefined || value.key !== key) {
      value = { key, distribution: getter(this, ...args) }
      this._cache[label] = value
    }

    return value.distribution
  }
}

// defaults to Math.random as its RNG
export default new Random()
