import {createTestMergeError} from './helper'

const testMergeError = createTestMergeError('Map', 'List');
const testMergeErrorSet = createTestMergeError('Map', 'Set');
const testMergeErrorStack = createTestMergeError('Map', 'Stack');

describe('errors', () => {
  it('unkown merge function', () => {
    testMergeError({a: [1, 2, 3]}, {a: [3, 4, 5]}, {a: 'unknown'}, 'Unknown merge function \'unknown\'')
  })

  it('append non-iterables', () => {
    testMergeError({a: 1}, {a: 2}, {a: 'append'}, "Non-iterable passed to 'append' merge function")
  })

  it('prepend non-iterables', () => {
    testMergeError({a: 1}, {a: 2}, {a: 'prepend'}, "Non-iterable passed to 'prepend' merge function")
  })

  it('merge set with schema', () => {
    testMergeErrorSet([1, 2, 3], [4, 5], {0: 'append'}, "Sets and Stacks can't be merged with schema")
  })

  it('merge stack with schema', () => {
    testMergeErrorStack([1, 2, 3], [4, 5], {0: 'append'}, "Sets and Stacks can't be merged with schema")
  })

  // it('union on maps', () => {
  //   testMergeError(
  //     {a: {x: 1}},
  //     {a: {y: 2}},
  //     {'*': 'union'},
  //     `Non-indexed passed to 'union' merge function`)
  // })
})
