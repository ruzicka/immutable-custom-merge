import {createTestMerge, createTestMergeSchema} from './helper'

const testStack = (mapType, listType) => {
  const testMerge = createTestMerge(mapType, listType)
  const testMergeSchema = createTestMergeSchema(mapType, listType)

  describe(`${mapType} ${listType}`, () => {
    describe('simple stacks', () => {
      it('default stack merge', () => {
        testMerge([1, 2, 3], [4, 5], [4, 5])
      })
      it('default stack merge with objects', () => {
        testMerge([{a: 1, b: 2}, 3], [{a: 4, c: 2}, 4, 5], [{a: 4, c: 2}, 4, 5])
      })
    })

    describe('stacks with schema', () => {
      it('append stacks', () => {
        testMergeSchema([1, 2, 3], [4, 5], 'append', [1, 2, 3, 4, 5])
      })

      it('prepend stacks', () => {
        testMergeSchema([1, 2, 3], [4, 5], 'prepend', [4, 5, 1, 2, 3])
      })

      it('union stacks', () => {
        testMergeSchema([1, 2, 3], [3, 4, 5], 'union', [1, 2, 3, 4, 5])
      })
    })
  })
}

export default testStack
