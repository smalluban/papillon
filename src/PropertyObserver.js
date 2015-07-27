import PropertyProxy from './PropertyProxy';

let register = new WeakMap();

class PropertyObserver {
  static singleton(host, key, target) {
    let instance = register.get(host);
    if (instance) {
      if (instance[key]) {
        return instance[key];
      } else {
        instance[key] = target;
      }
    } else {
      register.set(host, { [key]: target });
    }

    return target;
  }

  constructor(host, key) {
    let singleton = PropertyObserver.singleton(host, key, this);
    if (singleton !== this) {
      return singleton;
    }

    this.proxy = new PropertyProxy(host, key,
      (value)=> this.getters.forEach(cb => cb(value)),
      (newValue)=> this.setters.forEach(cb => cb(newValue))
    );

    this.getters = new Set();
    this.setters = new Set();
  }

  observe(get, set) {
    if (!this.getters.size) {
      this.proxy.on();
    }

    this.getters.add(get);
    this.setters.add(set || get);

    return ()=> {
      this.unobserve(get, set);
    };
  }

  unobserve(get, set) {
    this.getters.delete(get);
    this.setters.delete(set || get);

    if (!this.getters.size && !this.setters.size) {
      this.proxy.off();
    }
  }
}

export default PropertyObserver;
