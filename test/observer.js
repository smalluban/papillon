import Observer from '../src/observer';

describe('Observer', ()=>{
  describe('constructor', ()=> {
    it('throw error for invalid arguments', ()=> {
      expect(Observer).toThrow();
      expect(Observer.bind(null, {})).toThrow();
      expect(Observer.bind(null, {}, 'one'));
      expect(Observer.bind(null, undefined, 'one', ()=> {}));
    });

    it('throw error for non-configurable properties', ()=> {
      let host = {};
      Object.defineProperty(host, 'one', {
        value: 'test'
      });
      let test = ()=> {
        new Observer(host, 'one', ()=> {});
      };
      expect(test).toThrow();
    });
  });

  it('create property descriptor', ()=> {
    let observer = new Observer({one: 'one'}, 'one', ()=>{});
    expect(observer.properties[0].property).toEqual('one');
    expect(observer.properties[0].descriptor).toBeDefined();
  });

  it('create getter/setter descriptor', ()=> {
    let host = {};
    let getter = ()=> {};
    Object.defineProperty(host, 'some', {
      configurable: true,
      get: getter,
      set: getter
    });
    let observer = new Observer(host, 'some', ()=> {});

    expect(observer.properties[0].property).toEqual('some');
    expect(observer.properties[0].descriptor.get).toEqual(getter);
    expect(observer.properties[0].descriptor.set).toEqual(getter);
  });

  describe('reflect changes with host object', ()=> {
    let host, list, value;

    beforeEach(()=> {
      value = 'one';
      host = {
        one: 'one',
        get two() { return value; },
        set two(newVal) { value = newVal; }
      };
      let observer = new Observer(host, ['one', 'two'], ()=> {});
      list = observer.state.target;
    });

    it('link watched property to list object', ()=> {
      expect(list.one).toEqual('one');
      host.one = 'new value';
      expect(list.one).toEqual('new value');
    });

    it('link watched getter/setter property to list object', ()=> {
      expect(host.two).toEqual('one');
      expect(list.two).toEqual('one');
      host.two = 'new value';
      expect(list.two).toEqual('new value');
      expect(value).toEqual('new value');
    });
  });

  describe('check method', ()=> {
    let host, observer, spy;

    beforeEach(()=> {
      host = { one: 'two' };
      observer = new Observer(host, 'one', ()=> {});
      spyOn(observer, 'check');
    });

    it('called when getting watched property', ()=> {
      let temp = host.one;
      expect(observer.check).toHaveBeenCalled();
    })
  });

  describe('callback', ()=> {
    let host, spy;

    beforeEach(()=> {
      host = { one: 'two'};
      spy = jasmine.createSpy('spy');
      new Observer(host, 'one', spy);
    });

    it('called when property changed before next repaint', (done)=> {
      host.one = 'new value';
      window.requestAnimationFrame(()=> {
        expect(spy).toHaveBeenCalled();
        done();
      });
    });

    it('called with proper changelog', (done)=> {
      host.one = 'new value';
      window.requestAnimationFrame(()=> {
        expect(spy).toHaveBeenCalledWith({
          one: { type: 'update', oldValue: 'two' }
        });
        done();
      });
    });

    it('not called when not watched property changed', (done)=> {
      host.two = 'new value';
      window.requestAnimationFrame(()=> {
        expect(spy).not.toHaveBeenCalled();
        done();
      });
    });
  });

  describe('destroy', ()=> {
    let host, observer, getter, spy;

    beforeEach(()=> {
      getter = ()=> 'one';
      host = { one: 'one'};
      spy = jasmine.createSpy('callback');
      Object.defineProperty(host, 'two', {
        get: getter,
        set: getter,
        configurable: true
      });
      observer = new Observer(host, ['one', 'two'], spy);
    });

    it('revert property to oryginal definition', ()=> {
      let desc = Object.getOwnPropertyDescriptor(host, 'one');
      expect(desc.get).toBeDefined();
      observer.destroy();
      desc = Object.getOwnPropertyDescriptor(host, 'one');
      expect(desc.get).not.toBeDefined();
    });

    it('revert property with actual value', ()=> {
      host.one = 'two';
      observer.destroy();
      expect(host.one).toEqual('two');
    });

    it('revert property getter/setter methods', ()=> {
      observer.destroy();
      let desc = Object.getOwnPropertyDescriptor(host, 'two');
      expect(desc.get).toEqual(getter);
    });

    it('cancel callback call', (done)=> {
      host.one = 'two';
      observer.destroy();
      window.requestAnimationFrame(()=> {
        expect(spy).not.toHaveBeenCalled();
        done();
      });
    });

  });
});
