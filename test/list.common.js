import {createTestMerge, createTestMergeSchema, fromJS} from './helper'
import merge from '../src'

const testList = (mapType, listType) => {
  const testMerge = createTestMerge(mapType, listType)
  const testMergeSchema = createTestMergeSchema(mapType, listType)

  describe(`${mapType} ${listType}`, () => {
    describe('simple lists', () => {
      it('default list merge', () => {
        testMerge([1, 2, 3], [4, 5], [4, 5, 3])
      })
      it('default list merge 2', () => {
        testMerge([1, 2], [3, 4, 5], [3, 4, 5])
      })
      it('default list merge with objects', () => {
        testMerge([{a: 1, b: 2}, 3], [{a: 4, c: 2}, 4, 5], [{a: 4, b: 2, c: 2}, 4, 5])
      })
      it('nested lists', () => {
        testMerge([[{a: [1, 2, 3]}, {b: 2}], 3], [[{a: [5], c: 9}, {a: 5}], 8], [[{a: [5, 2, 3], c: 9}, {b: 2, a: 5}], 8])
      })
    })

    describe('lists with schema', () => {
      it('append on specific index', () => {
        testMergeSchema([[1, 2, 3], 2, 3], [[4, 5], 5], {0: 'append'}, [[1, 2, 3, 4, 5], 5, 3])
      })

      it('multiple custom ops on different indexes', () => {
        testMergeSchema([[1, 2, 3], 2, 3], [[4, 5], 5], {0: 'append', 1: (a, b) => a + b}, [[1, 2, 3, 4, 5], 7, 3])
      })

      it('wildcard', () => {
        testMergeSchema([{a: [1, 2]}, {a: [5, 6]}], [{a: [3]}, {a: [5]}], {'*': {a: 'append'}}, [{a: [1, 2, 3]}, {a: [5, 6, 5]}])
      })

      it('wildcard with some non-immutables should fail on last element', () => {
        const x = fromJS([{a: [1, 2]}, 2], mapType, listType)
        const y = fromJS([{a: [3]}, 3], mapType, listType)
        expect(() => merge(x, y, {'*': {a: 'append'}}))
          .toThrowError('Only immutable iterables can be merged using merge schema')
      })

      it('wildcard with custom func', () => {
        testMergeSchema([1, 2], [4, 5], {'*': (a, b) => a + b}, [5, 7])
      })

      it('nested wildcards', () => {
        testMergeSchema([[[1, 2], [3, 4]], [[4, 5], [5, 6]]], [[['a', 'b'], ['c', 'd']], [['e', 'f'], ['g', 'h']]],
          {'*': {'*': 'append'}},
          [[[1, 2, 'a', 'b'], [3, 4, 'c', 'd']], [[4, 5, 'e', 'f'], [5, 6, 'g', 'h']]])
      })
    })
  })
}

export default testList
