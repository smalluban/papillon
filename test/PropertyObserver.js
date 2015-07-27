import PropertyObserver from '../src/PropertyObserver';

describe('PropertyObserver', ()=> {
  let host, observer, spy;

  beforeEach(()=> {
    spy = jasmine.createSpy('callback');
    host = { test: 'test'};
    observer = new PropertyObserver(host, 'test');
  });

  it ('is singleton', ()=> {
    let observer2 = new PropertyObserver(host, 'test');

    expect(observer).toEqual(observer2);
  });

  it('adds observer', ()=> {
    observer.observe(spy);
    host.test;

    expect(spy).toHaveBeenCalled();
  });

  it('removes observer', ()=> {
    observer.observe(spy);
    host.test;

    observer.unobserve(spy);
    host.test;

    expect(spy.calls.count()).toEqual(1);
  });

});
