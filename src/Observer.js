import State from './state';
import PropertyObserver from './PropertyObserver';

export default class Observer {
  constructor(host, keys, callback) {
    if (!host || !keys || !callback) {
      throw new TypeError('Invalid arguments');
    }

    this.callback = callback;
    this.revert = [];

    this.state = new State(
      [].concat(keys).reduce( (list, key) => {
        let observer = new PropertyObserver(host, key);
        list[key] = host[key];

        this.revert.push(observer.observe((value)=> {
          list[key] = value;
          this.check();
        }));

        return list;
      }, {})
    );
  }

  check() {
    if (!this.requestId && !this.checking) {
      this.requestId = window.requestAnimationFrame(()=> {
        this.checking = true;

        if (this.state.isChanged()) {
          this.callback(this.state.changelog);
        }

        this.checking = this.requestId = void 0;
      });
    }
  }

  destroy() {
    if (this.requestId) {
      window.cancelAnimationFrame(this.requestId);
    }
    this.revert.forEach(cb => cb());
  }
}
