[![npm version](https://badge.fury.io/js/immutable-custom-merge.svg)](https://badge.fury.io/js/immutable-custom-merge)
[![Build Status](https://travis-ci.org/ruzicka/immutable-custom-merge.svg?branch=master)](https://travis-ci.org/ruzicka/immutable-custom-merge)
[![Coverage Status](https://coveralls.io/repos/github/ruzicka/immutable-custom-merge/badge.svg?branch=master)](https://coveralls.io/github/ruzicka/immutable-custom-merge?branch=master)

# immutable-custom-merge

Allows deep merging of Immutable objects with custom merging strategy fine-tuned
per property.

```javascript
import {fromJS} from 'immutable'
import merge from 'immutable-custom-merge'

const object1 = fromJS({
  a: [1, 2, 3],
  b: {
    c: [1, 2, 3],
    d: 4,
    e: 5
  },
  c: [1, 2, 3]
})

const object2 = fromJS({
  a: [3, 4],
  b: {
    c: [3, 4],
    d: 8,
    e: 6
  },
  c: [3, 4]
})

// defines how properties should be merged in case of collisions
const mergeSchema = {
  a: 'append',
  b: {
    c: 'union',
    e: (a, b) => a + b
  }
}

const result = merge(object1, object2, mergeSchema)
```

```javascript
// resulted object:
{
  a: [1, 2, 3, 3, 4], //colliding arrays were appended
  b: {
    c: [1, 2, 3, 4],  // union of items
    d: 8,             // no rule for property means later overrides former
    e: 11             // custom function to solve collisions
  },
  c: [3, 4, 3]        // no rule - default Immutable merge
}

```
