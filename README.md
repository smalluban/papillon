# papillon

[![Build Status](https://travis-ci.org/smalluban/papillon.svg?branch=master)](https://travis-ci.org/smalluban/papillon)
[![Coverage Status](https://coveralls.io/repos/smalluban/papillon/badge.svg?branch=master)](https://coveralls.io/r/smalluban/papillon?branch=master)

Papillon is a change detection library.

Library uses the fact that data changes in browser context can not be provided
more often then browser refresh frequency. Instead watching every single change,
library creates frozen states of objects between repaints and provides
the difference between these states.

## getting started

```bash
npm install papillon
bower install papillon
```

Packages point to compiled version of the library. They work with all major
package managers and global browser context.

```javascript
// load library (for example with browserify)
var papillon = require('papillon');

// load modules (works also in global context)
var Observer = papillon.Observer;
var State = papillon.State;
```

If you use ES6, import project and load source file instead:

```javascript
import { Observer, State } from 'papillon/papillon';
```
<!-- Start src/state.js -->

## state

This module provides singleton interface for storing objects states.
Only last state is cached and last changes between checks are provided.

Singleton pattern ensures low memory usage and consistent state between
objects that reference to themselves. Checking two objects that reference
to third one will check the third only once.

Module uses a special state counter that increase only before next
repaint. Checking object state multiply times before counter is changed
will return the same results.

### instance properties

* `state.target` - reference to object, which state is stored.
* `state.lastCheck` - value of state counter when object was checked
* `state.lastChange` - value of state counter when object has changed
* `state.changelog` - list of changes from last check

### changelog structure

```javascript
{
 one: { type: 'add' },
 two: { type: 'update', oldValue: 'some'},
 three: { type: 'delete', oldValue: 'before removed'},
 four: { type: 'modify', changelog: {...} }
}
```

#### record types

* `add` - define property, ex. `obj.asd = 'value'`
* `update` - change reference or change primitive value
* `delete` - remove property
* `modify` - nested changes in `Object` property, contains object changelog

### constructor

```javascript
var state = new State({ one: 'two' });
```

#### params:

* **Object** *target object*

### state.isChanged()

Checks if target object has changed from last state.
If it is true, method regenerates `changelog`.

<!-- End src/state.js -->

<!-- Start src/observer.js -->

## observer

This module provides interface to link callback method with object's properties
changes. Watched properties are redefined as getter/setter property.
Module will throw error for non-configurable properties.

Getting or setting watched property will trigger request for change detection
which will be executed before next repaint.

### constructor

```javascript
let host = {test: 'one'};
let observer = new Observer(host, 'test', changelog => {
  console.dir(changelog.test);
});

// Will trigger log in console before next repaint
host.test = 'two';
```

#### params:

* **Object** *host object*
* **String | Array&lt;String&gt;** *properties*
* **Function** *callback* - takes `changelog` object as argument

### observer.check()

Schedule change detection with `window.requestAnimationFrame`.

This method is automatically called when watched property is set or get.
You don't have to use this method directly. If your code changes
host properties by other reference, you have to schedule checking manually.

### observer.destroy()

Cancel scheduled checking request and revert watched properties to
original definition.

If your code not requires host object with state before loading
observer, you don't have to call this method.

After destroying Observer instance, accessing host properties will not
trigger `check()` method.

<!-- End src/observer.js -->

## contribution

Feel free to contribute project. Fork repository, clone and run:

```bash
npm install && npm run develop
```

Write some code, provide proper tests and pull request to this
repository.

## license

Papillon is released under the MIT License.
