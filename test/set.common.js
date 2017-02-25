import {createTestMerge, createTestMergeSchema} from './helper'

const testSet = (mapType, listType) => {
  const testMerge = createTestMerge(mapType, listType)
  const testMergeSchema = createTestMergeSchema(mapType, listType)

  describe(`${mapType} ${listType}`, () => {
    describe('simple sets', () => {
      it('default set merge', () => {
        testMerge([1, 2, 3], [4, 5], [1, 2, 3, 4, 5])
      })
      it('default set merge 2', () => {
        testMerge([1, 2], [3, 4, 5], [1, 2, 3, 4, 5])
      })
      it('default set merge 3', () => {
        testMerge([1, 2, 3, 4], [3, 4, 5], [1, 2, 3, 4, 5])
      })
      it('default set merge with objects', () => {
        testMerge([{a: 1, b: 2}, 3], [{a: 4, c: 2}, 4, 5], [{a: 1, b: 2}, 3, {a: 4, c: 2}, 4, 5])
      })
      it('nested sets', () => {
        testMerge([[{a: [1, 2, 3]}, {b: 2}], 3], [[{a: [5], c: 9}, {a: 5}], 8], [[{a: [1, 2, 3]}, {b: 2}], 3, [{a: [5], c: 9}, {a: 5}], 8])
      })
    })

    describe('set with schema', () => {
      it('appending sets', () => {
        testMergeSchema([1, 2, 3], [4, 5], 'append', [1, 2, 3, 4, 5])
      })
      it('prepending sets', () => {
        testMergeSchema([1, 2, 3], [4, 5], 'prepend', [4, 5, 1, 2, 3])
      })
      it('union sets', () => {
        testMergeSchema([1, 2, 3], [3, 4, 5], 'union', [1, 2, 3, 4, 5])
      })
    })
  })
}

export default testSet
