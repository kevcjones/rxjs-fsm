import { assert, expect } from 'chai';
import 'mocha';
import { take } from 'rxjs/operators';
import { RxjsFsm } from './rxjs-fsm';

describe('RxjsFsm', () => {
  it('should create', () => {
    const fsm = new RxjsFsm();
    assert.isDefined(fsm);
  });

  it('should let you define a default state', () => {
    const fsm = new RxjsFsm();
    fsm.add('OFF', [{ when: 'TOUCH', goto: 'ON' }]);
    fsm.init('OFF');
    expect(fsm.state).to.equal('OFF');
  });

  it('should allow us to toggle state', () => {
    const fsm = new RxjsFsm();
    fsm.add('OFF', [{ when: 'TOUCH', goto: 'ON' }]);
    fsm.add('ON', [{ when: 'TOUCH', goto: 'OFF' }]);
    fsm.init('OFF');
    expect(fsm.state).to.equal('OFF');
    fsm.send('TOUCH');
    expect(fsm.state).to.equal('ON');
  });

  it('should allow us to reset', () => {
    const fsm = new RxjsFsm();
    fsm.add('OFF', [{ when: 'TOUCH', goto: 'ON' }]);
    fsm.add('ON', [{ when: 'TOUCH', goto: 'OFF' }]);
    fsm.init('OFF');
    expect(fsm.state).to.equal('OFF');
    fsm.send('TOUCH');
    expect(fsm.state).to.equal('ON');
    fsm.reset();
    fsm.init('OFF');
  });

  it('should allow us to subscribe to state changes', done => {
    const fsm = new RxjsFsm();
    fsm.add('OFF', [{ when: 'TOUCH', goto: 'ON' }]);
    fsm.add('ON', [{ when: 'TOUCH', goto: 'OFF' }]);
    fsm.init('OFF');
    fsm
      .on('ON')
      .pipe(take(1))
      .subscribe({
        next: state => {
          expect(state).to.equal('ON');
          expect(fsm.state).to.equal('ON');
          done();
        },
      });
    fsm.send('TOUCH');
  });

  it('should fire an exception if an invalid event is used ', done => {
    const fsm = new RxjsFsm();
    fsm.add('OFF', [{ when: 'TOUCH', goto: 'ON' }]);
    fsm.add('ON', [{ when: 'TOUCH', goto: 'OFF' }]);
    fsm.init('OFF');
    fsm
      .onException()
      .pipe(take(1))
      .subscribe({
        next: exception => {
          assert.isOk(exception);
          done();
        },
      });
    fsm.send('SMASH');
  });

  it('should list only a hard reset event when listing an unknown state', () => {
    const fsm = new RxjsFsm();
    fsm.add('OFF', [{ when: 'TOUCH', goto: 'ON' }]);
    fsm.add('ON', [{ when: 'TOUCH', goto: 'OFF' }]);
    fsm.init('OFF');
    expect(fsm.listTransitions('UNKNOWN')).to.eql(['_hard_reset_event_']);
  });

  it('should fail silently if you try to remove a non existant state', () => {
    const fsm = new RxjsFsm();
    fsm.add('OFF', [{ when: 'TOUCH', goto: 'ON' }]);
    fsm.add('ON', [{ when: 'TOUCH', goto: 'OFF' }]);
    fsm.init('OFF');
    fsm.remove('MEH');
    expect(fsm.state).to.equal('OFF');
  });

  it('should let us remove a state ', () => {
    const fsm = new RxjsFsm();
    fsm.add('OFF', [{ when: 'TOUCH', goto: 'ON' }]);
    fsm.add('ON', [{ when: 'TOUCH', goto: 'OFF' }, { when: 'SURGE', goto: 'BLOWN' }]);
    fsm.add('BLOWN', [{ when: 'CHANGEFUSE', goto: 'ON' }]);
    fsm.init('ON');
    expect(fsm.state).to.equal('ON');
    expect(fsm.listTransitions()).to.eql(['TOUCH', 'SURGE']);
    let success = fsm.send('SURGE');
    expect(success).to.be.true;
    expect(fsm.state).to.equal('BLOWN');
    fsm.send('CHANGEFUSE');
    expect(fsm.state).to.equal('ON');
    fsm.remove('BLOWN');
    expect(fsm.state).to.equal('ON');
    success = fsm.send('SURGE');
    expect(success).to.be.false;
    fsm.reset();
    expect(fsm.state).to.equal('ON');
    expect(fsm.listTransitions()).to.eql(['TOUCH']);
  });
});
