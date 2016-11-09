import State from './State';
import PropertyObserver from './PropertyObserver';

let request;
let callbacks;

class Observer {
  static requestAnimationFrame(cb) {
    if (!request) {
      callbacks = new Set().add(cb);
      request = window.requestAnimationFrame(() => {
        callbacks.forEach(c => c());
        request = callbacks = undefined;
      });
    } else {
      callbacks.add(cb);
    }

    return cb;
  }

  static cancelAnimationFrame(cb) {
    if (callbacks) {
      callbacks.delete(cb);
    }
  }

  constructor(host, keys, callback) {
    if (!host || !keys || !callback) {
      throw new TypeError('Invalid arguments');
    }

    this.revert = [];
    this.state = new State(
      [].concat(keys).reduce((list, key) => {
        const observer = new PropertyObserver(host, key);
        list[key] = host[key];

        this.revert.push(observer.observe(value => {
          if (!State.is(list[key], value)) {
            list[key] = value;
            this.check();
          } else if (State.isObject(value)) {
            this.check();
          }
        }));

        return list;
      }, {})
    );

    this.callback = () => {
      if (this.state.isChanged()) {
        callback(this.state.changelog);
      }
    };
  }

  check() {
    Observer.requestAnimationFrame(this.callback);
  }

  destroy() {
    Observer.cancelAnimationFrame(this.callback);

    this.revert.forEach(cb => cb());
  }
}

export default Observer;
