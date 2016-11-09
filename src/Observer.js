import State from './State';
import PropertyObserver from './PropertyObserver';

class Observer {
  static requestAnimationFrame(cb) {
    if (!this._request) {
      this._callbacks = new Set().add(cb);
      this._request = window.requestAnimationFrame(()=> {
        this._callbacks.forEach(cb => cb());
        this._request = this._callbacks = undefined;
      });
    } else {
      this._callbacks.add(cb);
    }

    return cb;
  }

  static cancelAnimationFrame(cb) {
    if (this._callbacks) {
      this._callbacks.delete(cb);
    }
  }

  constructor(host, keys, callback) {
    if (!host || !keys || !callback) {
      throw new TypeError('Invalid arguments');
    }

    this.revert = [];
    this.state = new State(
      [].concat(keys).reduce( (list, key) => {
        let observer = new PropertyObserver(host, key);
        list[key] = host[key];

        this.revert.push(observer.observe((value)=> {
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
