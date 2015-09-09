# Papillon

[![Build Status](https://travis-ci.org/smalluban/papillon.svg?branch=master)](https://travis-ci.org/smalluban/papillon)
[![Coverage Status](https://coveralls.io/repos/smalluban/papillon/badge.svg?branch=master)](https://coveralls.io/r/smalluban/papillon?branch=master)

Papillon is a smart change detection library.

The library is using the fact, that changes of data in the context of the browser
cannot be provided more often than the refresh rate of the browser.

Instead of watching every change, the library creates a frozen states of objects
between repaints and provides the difference between these states.

## Getting started

```bash
npm install papillon
bower install papillon
```

Packages contain built version of the library. They work with all major
package managers and global browser context.

```javascript
// load library (for example with browserify)
let papillon = require('papillon');

// load modules (works also in global context)
let Observer = papillon.Observer;
let State = papillon.State;
```

If you use ES6 load source file:

```javascript
import { Observer, State } from 'papillon/papillon';
```

## State

This module provides an singleton interface for storing state of object.
Only last state and changes between this and the previous state are stored.

Singleton pattern ensures low memory usage and consistent states
for objects that reference to themselves.

Module uses a state counter that increase only before next
repaint. Checking state multiply times before counter is changed
yields the same results.

### Static methods

#### State.now()

```
let statestamp = State.now()
```

Returns the current value of the state counter.

### Instance

#### Constructor

```javascript
let state = new State({ one: 'two' });
```

Params:

* **Object** *target object*

#### Properties

* `state.target` - reference to object, which state is stored
* `state.lastCheck` - value of state counter when `target` was checked
* `state.lastChange` - value of state counter when `target` has changed
* `state.changelog` - list of changes between previous and current state

#### state.changelog

```javascript
{
 one: { type: 'set', oldKey: 'five' },
 two: { type: 'set', oldValue: 'some'},
 three: { type: 'delete', oldValue: 'before removed'},
 four: { type: 'modify', changelog: {...} }
}
```

* `set` - Set reference or primitive value.
* `delete` - Deleted property.
* `modify` - Nested changes of `Object` property in `changelog`.
* `oldValue` - Property value from last state.
* `oldKey` - Property key from last state which value was moved to this property. 
    Paremeter is set only when new value of old property has changed. In another 
    words, it is set only for _relocated_ properties, not copied.

#### state.isChanged()

Checks if target object has changed from last state.
If it is true, method regenerates `changelog`.

## Observer

This module connects changes of observed object properties with callback action.
Callback method is called with `changelog` state property.

Observed property is redefined as getter/setter. Getting or setting
that property will trigger request for `state` change detection
before next repaint.

#### Constructor

```javascript
let host = {test: 'one'};
let observer = new Observer(host, 'test', changelog => {
  console.dir(changelog.test);
});

// Will trigger log in console before next repaint
host.test = 'two';
```

Params:

* **Object** *host object*
* **String | Array&lt;String&gt;** *properties* - one or more properties
* **Function** *callback* - takes `changelog` object as argument

#### observer.check()

Schedule change detection with `window.requestAnimationFrame`.

This method is called when the observed property is set or get.
You do not have to use this method directly. If your code changes
object by other reference then observed property, you have to schedule
checking manually.

#### observer.destroy()

Cancel scheduled checking request and revert observed properties to
original definition. If your code do not requires object with original
definition of observed properties you do not have to call this method.

After destroying `Observer` instance, accessing properties will not
trigger `check()` method.

## Contribution

Feel free to contribute project. Fork repository, clone and run:

```bash
npm install && npm run develop
```

Write some code, provide proper tests and pull request to this
repository.

## License

Papillon is released under the MIT License.
