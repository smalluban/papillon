let map = new WeakMap();
let timestamp = 0;
let request = false;

export default class State {

  static now() {
    if (!request) {
      timestamp = timestamp + 1;
      request = window.requestAnimationFrame(
        ()=> request = undefined
      );
    }
    return timestamp;
  }

  static isObject(target) {
    return typeof(target) === 'object' && target !== null;
  }

  static is(v1, v2) {
    if (v1 === 0 && v2 === 0) {
      return 1 / v1 === 1 / v2;
    }
    if (v1 !== v1) {
      return v2 !== v2;
    }
    return v1 === v2;
  }

  constructor(target) {
    if (!State.isObject(target)) {
      throw new TypeError('Invalid arguments');
    }
    let state = map.get(target);
    if (state) { return state; }
    map.set(target, this);

    this.cache = Object.keys(target).reduce((cache, key)=> {
      let value = cache[key] = target[key];
      if (State.isObject(value)) {
        new State(value);
      }
      return cache;
    }, {});

    this.target = target;
    this.lastCheck = State.now();
    this.lastChange = 0;
  }

  isChanged() {
    let timestamp = State.now();

    if (timestamp > this.lastCheck) {
      let changed = false;

      this.lastCheck = timestamp;
      this.changelog = {};

      Object.keys(this.cache).forEach((key)=> {
        if (!this.target.hasOwnProperty(key)) {
          let value = this.cache[key];
          this.changelog[key] = { type: 'delete', oldValue: value };
          changed = true;
        }
      });

      this.cache = Object.keys(this.target).reduce((cache, key)=> {
        let value = this.target[key];

        if (!this.cache.hasOwnProperty(key)) {
          this.changelog[key] = { type:'set' };
          changed = true;
        } else if (!State.is(value, this.cache[key])) {
          this.changelog[key] = this.changelog[key] || { type: 'set'};
          this.changelog[key].oldValue = this.cache[key];
          changed = true;
        }

        if (State.isObject(value)) {
          let nestedState = new State(value);
          if (nestedState.isChanged()) {
            changed = true;
            if (!this.changelog[key]) {
              this.changelog[key] = { type: 'modify' };
              this.changelog[key].changelog = nestedState.changelog;
            }
          }
        }

        cache[key] = this.target[key];
        return cache;
      }, {});

      if (changed) {
        this.lastChange = this.lastCheck;
      } else {
        this.changelog = undefined;
      }
    }

    return this.lastChange === timestamp;
  }
}
