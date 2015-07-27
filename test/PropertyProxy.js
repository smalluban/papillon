import PropertyProxy from '../src/PropertyProxy';

describe('PropertyProxy', ()=> {
  let spy;

  beforeEach(()=> {
    spy = jasmine.createSpy('callback');
  });

  it('work with properties from prototype chain', ()=> {
    let div = document.createElement('div');
    new PropertyProxy(div, 'textContent', spy).on();

    div.textContent = "new content";

    expect(spy).toHaveBeenCalledWith("new content");
  });

  it('throw for not writable property', ()=> {
    let parent = {}, child = Object.create(parent);
    Object.defineProperty(parent, 'test', {
      value: 'one'
    });

    expect(()=> new PropertyProxy(parent, 'test', spy).on()).toThrow();
    expect(()=> new PropertyProxy(child, 'test', spy).on()).toThrow();
  });

  it('replace value from prototype as native does', ()=> {
    let parent = { test: 'one'};
    let child = Object.create(parent);
    let proxy = new PropertyProxy(child, 'test', spy);

    proxy.on();
    child.test = 'two';
    proxy.off();

    expect(spy).toHaveBeenCalledWith("two");
    expect(child.test).toEqual('two');
    expect(parent.test).toEqual('one');
  });

  it('clean proxy for not defined and not set property', ()=> {
    let host = {};
    let proxy = new PropertyProxy(host, 'test', spy);

    proxy.on();
    proxy.off();

    expect(host.hasOwnProperty('test')).toEqual(false);
  });

  it('create not defined properties when set', ()=> {
    let host = {};
    let proxy = new PropertyProxy(host, 'test', spy);

    proxy.on();
    host.test = 'some value';
    proxy.off();

    expect(host.test).toEqual('some value');
  });
});
