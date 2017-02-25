import {is} from 'immutable'
import {createTestMerge, createTestMergeSchema, fromJS} from './helper'
import merge from '../src'

const testMap = (mapType, listType) => {
  const testMerge = createTestMerge(mapType, listType)
  const testMergeSchema = createTestMergeSchema(mapType, listType)

  describe(`${mapType} ${listType}`, () => {
    describe('flat Maps', () => {
      it('non-conflicting properties', () => {
        testMerge({a: 1}, {b: 3}, {a: 1, b: 3})
      })

      it('conflicting properties A', () => {
        testMerge({a: 1}, {a: 4}, {a: 4})
      })

      it('conflicting properties B', () => {
        testMerge({a: 1, b: 3}, {a: 4}, {a: 4, b: 3})
      })

      it('conflicting properties C', () => {
        testMerge({a: 1}, {a: 4, b: 3}, {a: 4, b: 3})
      })

      it('conflicting properties D', () => {
        testMerge({a: 1, b: 3}, {a: 4, c: 5}, {a: 4, b: 3, c: 5})
      })
    })

    describe('deep merge', () => {
      it('non-conflicting properties', () => {
        testMerge({a: {c: 4}}, {b: {d: 5}}, {a: {c: 4}, b: {d: 5}})
      })
      it('conflicting root properties', () => {
        testMerge({a: {c: 4}}, {a: {d: 5}}, {a: {c: 4, d: 5}})
      })
      it('conflicting nested properties A', () => {
        testMerge({a: {c: 4}}, {a: {c: 5}}, {a: {c: 5}})
      })
      it('conflicting nested properties B', () => {
        testMerge({a: {c: 4, d: 1}}, {a: {c: 5}}, {a: {c: 5, d: 1}})
      })
      it('conflicting nested properties C', () => {
        testMerge({a: {c: 4}}, {a: {c: 5, d: 1}}, {a: {c: 5, d: 1}})
      })
      it('conflicting iterable with non-iterable A', () => {
        testMerge({a: 1}, {a: {c: 5}}, {a: {c: 5}})
      })
      it('conflicting iterable with non-iterable B', () => {
        testMerge({a: {c: 5}}, {a: 1}, {a: 1})
      })
      // it('conflicting Map and List', () => {
      //   testMerge({a: {c: 5}}, {a: [3, 4, 5]}, {a: {c: 5, '0': 3, '1': 4, '2': 5}})
      // });
    })

    describe('merge with schema', () => {
      it('empty schema', () => {
        testMergeSchema({a: 1}, {b: 2}, {}, {a: 1, b: 2})
      })
      it('empty schema 2', () => {
        testMergeSchema({a: 1}, {b: 2}, {b: {}}, {a: 1, b: 2})
      })
      if (listType === 'List' || listType === 'Stack') {
        it('appending arrays', () => {
          testMergeSchema(
            {a: [1, 2, 3]},
            {a: [3, 4, 5]},
            {a: 'append'},
            {a: [1, 2, 3, 3, 4, 5]},
          )
        })
      } else if (listType === 'Set' || listType === 'OrderedSet') {
        it('appending arrays', () => {
          testMergeSchema(
            {a: [1, 2, 3]},
            {a: [3, 4, 5]},
            {a: 'append'},
            {a: [1, 2, 3, 4, 5]},
          )
        })
      }
      it('appending maps', () => {
        testMergeSchema(
          {a: {x: 1}},
          {a: {y: 2}},
          {'*': 'append'},
          {a: {x: 1, y: 2}})
      })
      if (listType === 'List' || listType === 'Stack') {
        it('prepending arrays', () => {
          testMergeSchema(
            {a: [1, 2, 3]},
            {a: [3, 4, 5]},
            {a: 'prepend'},
            {a: [3, 4, 5, 1, 2, 3]},
          )
        })
      } else if (listType === 'Set' || listType === 'OrderedSet') {
        it('prepending arrays', () => {
          testMergeSchema(
            {a: [1, 2, 3]},
            {a: [3, 4, 5]},
            {a: 'prepend'},
            {a: [3, 4, 5, 1, 2]},
          )
        })
      }
      it('prepending maps', () => {
        testMergeSchema(
          {a: {x: 1}},
          {a: {y: 2}},
          {'*': 'prepend'},
          {a: {y: 2, x: 1}})
      })
      it('union arrays', () => {
        testMergeSchema(
          {a: [1, 2, 3]},
          {a: [3, 4, 5]},
          {a: 'union'},
          {a: [1, 2, 3, 4, 5]},
        )
      })

      it('custom function on conflicting non-iterables', () => {
        testMergeSchema({a: 1}, {a: 2}, {a: (param1, param2) => param1 + param2}, {a: 3})
      })

      it('custom function on deep conflicting non-iterables', () => {
        testMergeSchema({a: {b: 1}}, {a: {b: 2}}, {a: {b: (param1, param2) => param1 + param2}}, {a: {b: 3}})
      })

      if (listType === 'List' || listType === 'Stack') {
        it('custom function List/Stack', () => {
          testMergeSchema(
            {a: [1, 2, 3]},
            {a: [3, 4, 5]},
            {a: (param1, param2) => param1.interleave(param2)},
            {a: [1, 3, 2, 4, 3, 5]},
          )
        })
      } else if (listType === 'Set' || listType === 'OrderedSet') {
        it('custom function Set/OrderedSet', () => {
          testMergeSchema(
            {a: [1, 2, 3]},
            {a: [3, 4, 5]},
            {a: (param1, param2) => param1.subtract(param2)},
            {a: [1, 2]},
          )
        })
      }
    })

    describe('schema with wildcard', () => {
      it('simple wildcard schema with array func', () => {
        testMergeSchema(
          {a: {x: [1, 2]}},
          {a: {x: [2, 3]}},
          {'*': {x: 'union'}},
          {a: {x: [1, 2, 3]}},
        )
      })
      it('simple wildcard schema with non-iterables func', () => {
        testMergeSchema(
          {a: {x: 1, y: 5}, b: {x: 1}, c: {z: 4}},
          {a: {x: 2, z: 6}, c: {x: 4}},
          {'*': {x: (param1, param2) => param1 + param2}},
          {a: {x: 3, y: 5, z: 6}, b: {x: 1}, c: {z: 4, x: 4}},
        )
      })
      it('appending arrays', () => {
        testMergeSchema(
          {
            a: {
              b: {
                c: [1, 2],
              },
              e: {
                g: 6,
                f: [6, 7],
              },
            },
          },
          {
            a: {
              b: {
                c: [3, 4],
                d: 'a',
              },
            },
          },
          {
            a: {
              '*': {
                c: 'append',
              },
            },
          },
          {
            a: {
              b: {
                c: [1, 2, 3, 4],
                d: 'a',
              },
              e: {
                g: 6,
                f: [6, 7],
              },
            },
          },
        )
      })
    })

    describe('merge with deeply nested', () => {
      it('complex Map', () => {
        testMergeSchema(
          {
            a: {
              b: [1, 2, 3],
              c: {
                d: 1,
                e: ['a', 'b'],
              },
            },
          },
          {
            a: {
              b: [4, 5],
              c: {
                e: ['c'],
              },
              d: 4,
            },
            f: 2,
          },
          {
            a: {
              b: 'append',
              c: {
                e: 'prepend',
              },
            },
          },
          {
            a: {
              b: [1, 2, 3, 4, 5],
              c: {
                d: 1,
                e: ['c', 'a', 'b'],
              },
              d: 4,
            },
            f: 2,
          },
        )
      })
    })

    describe('merge with non-iterables', () => {
      it('simple obj', () => {
        const a = fromJS({a: 2, c: 4}, mapType, listType)
        const b = {a: 3, b: 5}
        const merged = merge(a, b)
        const expected = fromJS({a: 3, c: 4, b: 5}, mapType, listType)
        expect(is(merged, expected)).toEqual(true)
      })

      it('should mimic native merge when two non-iterable objects are in conflict', () => {
        const x = fromJS({}).set('a', {a:[1, 2, 3], b: 3})
        const y = fromJS({}).set('a', {a:[4, 5], c: 2})

        expect(is(merge(x, y), x.mergeDeep(y))).toEqual(true)
      })

      it("should throw when two non-iterable objects are in conflict and there's a schema", () => {
        const x = fromJS({}).set('a', {a:[1, 2, 3], b: 3})
        const y = fromJS({}).set('a', {a:[4, 5], c: 2})

        expect(() => merge(x, y, {a: { a: 'append'}}))
          .toThrowError('Only immutable iterables can be merged using merge schema')
      })
    })
  })
}

export default testMap
