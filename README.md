# object-formatter [![Build Status](https://travis-ci.org/airtoxin/object-formatter.svg?branch=master)](https://travis-ci.org/airtoxin/object-formatter/branches) [![npm version](https://badge.fury.io/js/object-formatter.svg)](http://badge.fury.io/js/object-formatter)

format object safely

## Install

`npm i --save object-formatter`

## Usage

```javascript
import ObjectFormatter from 'object-formatter';
const fmt = new ObjectFormatter();

const object = {
    a: 'lorem',
    b: 'hoge',
    c: {
        ca: 'foo',
        cb: [ 1, 2, 3 ]
    },
    d: [
        { aa: 'a-a', bb: 'b-b' },
        { aa: 'a--', bb: 'b--' },
        { aa: '---', cc: 'ccc' }
    ]
};

const schema = {
    raw: 'raw value',
    foo: '@a',
    bar: '@b.c.d="ipsum"',
    baz: {
        raw: 111,
        a: '@c.cb',
        b: '@c.c.c',
        c: [ '@d', {
            hoge: '@aa',
            fuga: '@bb="b default"'
        } ],
        d: [ '@d', '@cc="c default"' ]
    }
};

fmt.format(schema, object);
// ->
// {
//     raw: 'raw value',
//     foo: 'lorem',
//     bar: 'ipsum',
//     baz: {
//         raw: 111,
//         a: [ 1, 2, 3 ],
//         b: undefined,
//         c: [
//             { hoge: 'a-a', fuga: 'b-b' },
//             { hoge: 'a--', fuga: 'b--' },
//             { hoge: '---', fuga: 'b default' }
//         ],
//         d: [ 'c default', 'c default', 'ccc' ]
//     }
// }
```

more examples, see [test file](test/object-formatter.js)

## Documents

`object-formatter` only export ObjectFormatter class as default.

```js
import ObjectFormtatter from 'object-formatter';
```

### Constructor

#### ObjectFormatter(accessorSymbol='@', defaultValue=undefined)

### Instance methods

#### `fmt.format(schema, object)` -> `object`

It format the object according to the schema definition.


### Schema definitions

The schema must be an object. 
Schema's keys will be the key of the formatted object with no modifications. 
Schema's value means new value. 
If value is not a string, that value will be the value of the formatted object with no modifications. 
If value is a string but not start with fmt.accessor(`@`), that value will also be the value of the formatted object with no modifications.
If value is string and start with fmt.accessor(`@`), it means new value's path. 
If path doesn't exists on object, this definition will return fmt.default(`undefined`).

#### Simple accessor (path string)

##### `@path.to.value`

It accesses `object.path.to.value`. 
Fields of object are separate with `.` like a javascript.

```javascript
const object = { a: { b: ['this', 'is', 'a.b'] } };
fmt.format({ result: '@a.b' }, object);
// -> { result: ['this', 'is', 'a.b'] }
```

##### `@path.to.value="temporary default"`

`=` means temporary default value. 
That definition accesses `object.path.to.value` and returns exact value, or `'temporary default'` value when path doesn't exist.

```javascript
const object = { a: { b: ['this', 'is', 'a.b'] } };
fmt.format({ result: '@a.b.c="not exists"' }, object);
// -> { result: 'not exists' }
```

#### Collection accessor

The array value that 1st arg is path string and 2nd arg is schema object or path string, is collection accessor (collection is objected array). 
1st arg path string defines object's collection path. 
Its accessor returns array or collection or default value.

##### `["@path.to.collection", path]`

It returns array (maybe not collection). 
2nd arg's path refers to collection's element object.

```javascript
const object = { a: [{ b: 1 }, { b: 2 }, { b:3 }] };
fmt.format({ result: ['@a', '@b'] });
// -> { result: [1, 2, 3] }
```

##### `["@path.to.collection", schema]`

It returns collection. 
2nd arg's schema object is schema of collection's element object.

```javascript
const object = { a: [{ b: 1 }, { b: 2 }, { b:3 }] };
fmt.format({ result: ['@a', { new_b: '@b' }] });
// -> { result: [{ new_b: 1 }, { new_b: 2 }, { new_b: 3 }] }
```
