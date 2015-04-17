import State from '../src/state';

describe('State', ()=> {
  describe('`now` static method', ()=> {
    it('update timestamp with next repaint', (done)=> {
      let count = State.now();
      window.requestAnimationFrame(()=> {
        expect(State.now()).toEqual(count + 1);
        done();
      });
    });
  });

  describe('`is` static method', ()=> {
    it('returns true for the same object', ()=> {
      let obj = {};
      expect(State.is(obj, obj)).toEqual(true);
    });

    it('returns true for -0 and +0', ()=> {
      expect(State.is(-0,-0)).toEqual(true);
    });

    it('returns false for NaN and computed NaN', ()=> {
      expect(State.is(NaN, 0/0)).toEqual(true);
    });
  });

  describe('instance', ()=> {
    let state, obj;

    beforeEach(()=> {
      obj = {};
      state = new State(obj);
    });

    it('throw for not an object as target', ()=> {
      expect(State.bind(null, 'text')).toThrow();
    });

    it('returns the same object for equal arguments', (done)=> {
      let obj = {};
      let check = new State(obj).lastCheck;
      window.requestAnimationFrame(()=> {
        expect(check).toEqual(new State(obj).lastCheck);
        done();
      });
    });

    it('is not changed when initialized', ()=> {
      expect(state.isChanged()).toEqual(false);
    });

    it('is not changed for next repaint', (done)=> {
      expect(state.isChanged()).toEqual(false);
      window.requestAnimationFrame(()=> {
        expect(state.isChanged()).toEqual(false);
        done();
      });
    });

    describe('changelog property', ()=> {
      it('contains `delete` type', (done)=> {
        let obj = {one: 'one'}, state = new State(obj);
        delete obj.one;

        window.requestAnimationFrame(()=> {
          expect(state.isChanged()).toEqual(true);
          expect(state.changelog).toEqual({
            one: {
              type: 'delete', oldValue: 'one'
            }
          });
          done();
        });
      });

      it('contains `add` type for primitive value', (done)=> {
        window.requestAnimationFrame(()=> {
          obj.one = 'one';
          expect(state.isChanged()).toEqual(true);
          expect(state.changelog).toEqual({
            one: { type: 'add' }
          });
          done();
        });
      });

      it('contains `add` type for object value', (done)=> {
        let obj = {}, state = new State(obj);

        window.requestAnimationFrame(()=> {
          obj.one = { two: 'three' };

          expect(state.isChanged()).toEqual(true);
          expect(state.changelog).toEqual({
            one: { type: 'add' }
          });
          done();
        });
      });

      it('contains `modify` type for object value', (done)=> {
        let obj = { one: { two: null } }, state = new State(obj);

        window.requestAnimationFrame(()=> {
          obj.one.two = 'three';
          expect(state.isChanged()).toEqual(true);
          expect(state.changelog).toEqual({
            one: { type: 'modify', changelog: {
              two: { type: 'update', oldValue: null }
            } }
          });
          done();
        });
      });
    });
  });
});
