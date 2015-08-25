class PropertyProxy {
  constructor(host, key, get, set) {
    this.host = host;
    this.key = key;
    this.getter = get;
    this.setter = set || get;
  }

  getOwnDescriptor() {
    let desc = Object.getOwnPropertyDescriptor(this.host, this.key);

    if (desc) {
      if (!desc.configurable) {
        throw new TypeError(
          `Cannot create proxy for not configurable property '${this.key}'`);
      }
      if (!desc.get && !desc.set && !desc.writable) {
        throw new TypeError(
          `Cannot create proxy for readonly property '${this.key}'`);
      }
    }

    return desc;
  }

  getProtoDescriptor() {
    let desc, host = Object.getPrototypeOf(this.host);

    while(host) {
      desc = Object.getOwnPropertyDescriptor(host, this.key);
      if (desc) {
        break;
      } else {
        host = Object.getPrototypeOf(host);
      }
    }

    if (desc) {
      if (!desc.get && !desc.set) {
        desc.get = ()=> {
          delete this.host[this.key];
          let value = this.host[this.key];
          this.on();
          return value;
        };
        desc.set = (newVal)=> {
          delete this.host[this.key];
          this.host[this.key] = newVal;
          this.on();
        };
      }
    }

    return desc;
  }

  on() {
    let desc = this.getOwnDescriptor();

    if (desc) {
      this.ownProperty = true;
    } else {
      this.ownProperty = false;
      desc = this.getProtoDescriptor();
    }

    if (!desc) {
      this.ownProperty = true;
      this.notDefined = true;
      desc = {
        enumerable: true,
        writable: true,
        configurable: true
      };
    }

    this.desc = desc;
    this.value = this.host[this.key];

    Object.defineProperty(this.host, this.key, {
      configurable: true,
      enumerable: this.desc.enumerable,
      get: this.get.bind(this),
      set: this.set.bind(this)
    });
  }

  off() {
    if (this.ownProperty) {
      if (this.notDefined) {
        delete this.host[this.key];
      } else {
        if (!this.desc.get && !this.desc.set) {
          this.desc.value = this.value;
        }
        Object.defineProperty(this.host, this.key, this.desc);
      }
    } else {
      delete this.host[this.key];
    }
  }

  get() {
    if (this.desc.get) {
      this.value = this.desc.get.call(this.host);
    }
    this.getter(this.value);
    return this.value;
  }

  set(newValue) {
    this.notDefined = false;

    if (this.desc.set) {
      this.desc.set.call(this.host, newValue);
    }

    if (this.desc.writable || this.desc.get || this.desc.set) {
      this.value = newValue;
    }

    this.setter(this.value);
  }
}

export default PropertyProxy;
