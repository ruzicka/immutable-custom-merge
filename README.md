[![npm version](https://badge.fury.io/js/immutable-custom-merge.svg)](https://badge.fury.io/js/immutable-custom-merge)
[![Build Status](https://travis-ci.org/ruzicka/immutable-custom-merge.svg?branch=master)](https://travis-ci.org/ruzicka/immutable-custom-merge)
[![Coverage Status](https://coveralls.io/repos/github/ruzicka/immutable-custom-merge/badge.svg?branch=master)](https://coveralls.io/github/ruzicka/immutable-custom-merge?branch=master)

# immutable-custom-merge

Deep merging of Immutable structures with custom per-property merging strategy.

## Example usage
```javascript
import {fromJS} from 'immutable'
import merge from 'immutable-custom-merge'

const object1 = fromJS({
  a: [1, 2, 3],
  b: {
    x: [1, 2, 3],
    y: ['a', 'b'],
  },
  c: [1, 2, 3],
  d: 4,
  e: 5
  
})

const object2 = fromJS({
  a: [3, 4],
  b: {
    x: [3, 4],
    y: ['b', 'c'],
  },
  c: [3, 4],
  d: 8,
  e: 6
})

// defines how properties should be merged in case of collisions
const mergeSchema = {
  a: 'append',        // colliding iterables should be appended
  b: {
    '*': 'union',     // 'union' function will be applied on every key under `b`
  },
  e: (a, b) => a + b  // use custom defined function to merge values under this key
}

// merge two immutable Maps using the schema
const result = merge(object1, object2, mergeSchema)
```

Result of the above merging would be Immutable Map having this structure:

```javascript
{
  a: [1, 2, 3, 3, 4],   // colliding array was appended
  b: {
    x: [1, 2, 3, 4],    // union of items
    y: ['a', 'b', 'c']  // union of items
  },
  c: [3, 4, 3],         // no rule - default Immutable merge
  d: 8,                 // no rule for property means later overrides former
  e: 11                 // custom function to solve collisions
}
```

## `mergeDeep(val1, val2, schema)`

`immutable-custom-merge` exports just one function. It performs deep merge of `val1` into `val2`, using provided `schema` to determine how to
merge specific keys if there's a collision.

* `val1`: **required** Immutable structure (most typically 
[Map](https://facebook.github.io/immutable-js/docs/#/Map)) to be merged with 
second argument. Beyond Maps it supports other Immutable types where deep 
merging makes sense.
* `val2`: **required** Immutable structure to be merged into `val1`
* `schema`: structured js object defining merge strategy for specific keys 
of input parameters. String with the name of one of pre-defined merge 
functions or custom merge function. If `schema` is string or function, 
first two arguments doesn't need to be immutables. If schema is not supplied
at all, it falls back to standard immutable `mergeDeep` function. 
If schema is not supplied and first argument is non-immutable, it just
returns second argument.   

## Defining merge schema

Basically, you need to specify merge function for certain (sub)keys of your input
data that you want to merge differently from how native immutable merge function does it. 

Schema bellow only defines special behaviour for sub-key `messages`. Every other key
will be treated as it would be merged by native `mergeDeep` function.
```javascript
const mergeSchema = {
  result: {
    messages: 'append'
  } 
}
```

There are two kinds of merge functions that can be specified in the schema. _Pre-defined_ and _custom_ merge functions. 
Merge function is called when key (for which it is defined in _merge schema_) is present in both `val1`
and `val2`. Merging function receives values of this keys as it's arguments (first one is `val1's`, second one is `val2's`).
 
### Wildcard key
If you need to apply some merge function on every (sub)item, you can specify `'*'` instead of a
key. This is quite usefull in situation when you store similar structured records
in Map-like objects (maybe you use `normalizr`?): 
 
```javascript
const object1 = fromJS({
  books: {
    '111': {
      id: '111',
      author: '888' 
    },  
    '222': {
      id: '222',
      author: '999' 
    }  
  },
  authors: {
    ...
  }
  
})
```

You may want to merge book records into your store, but some sources may list a book
with more authors so you might need to keep all of them. You would use this schema
to merge in new data:

```javascript
const mergeSchema = {
  books: {
    '*': {
      author: 'union'
    }
  } 
}
```
 
### Pre-defined merging functions
There are some pre-defined function to choose from:
#### append
Works with Immutable Iterables. Appends items of second parameter to the end of the first one
```javascript
const object1 = fromJS({ a: [1, 2, 3] })
const object2 = fromJS({ a: [3, 4] })
const mergeSchema = { a: 'append' }
const result = merge(object1, object2, mergeSchema)

// result: { a: [1, 2, 3, 3, 4] }
```

#### prepend
Same as append but items are prepended
```javascript
const object1 = fromJS({ a: [1, 2, 3] })
const object2 = fromJS({ a: [3, 4] })
const mergeSchema = { a: 'prepend' }
const result = merge(object1, object2, mergeSchema)

// result: { a: [3, 4, 1, 2, 3] }
```

#### union

Same as append but only items that are not already in the list are appended
```javascript
const object1 = fromJS({ a: [1, 2, 3] })
const object2 = fromJS({ a: [3, 4] })
const mergeSchema = { a: 'union' }
const result = merge(object1, object2, mergeSchema)

// result: { a: [1, 2, 3, 4] }
```

### Custom merging functions

Instead of using predefined function, you can supply your own. It will receive two
arguments, conflicting values.

```javascript
const object1 = fromJS({ a: 3 })
const object2 = fromJS({ a: 5 })
const mergeSchema = { a: (a, b) => a + b }
const result = merge(object1, object2, mergeSchema)

// result: { a: 8 }
```
