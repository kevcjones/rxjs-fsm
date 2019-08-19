"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lib_1 = require("../lib");
var chai_1 = require("chai");
require("mocha");
var operators_1 = require("rxjs/operators");
var rxjs_1 = require("rxjs");
describe('RxjsFsm', function () {
    it('should create', function () {
        var fsm = new lib_1.RxjsFsm();
        chai_1.assert.isDefined(fsm);
    });
    it('should let you define a default state', function () {
        var fsm = new lib_1.RxjsFsm();
        fsm.add('OFF', [{ when: 'TOUCH', goto: 'ON' }]);
        fsm.init('OFF');
        chai_1.expect(fsm.state).to.equal('OFF');
    });
    it('should allow us to toggle state', function (done) {
        var fsm = new lib_1.RxjsFsm();
        fsm.add('OFF', [{ when: 'TOUCH', goto: 'ON' }]);
        fsm.add('ON', [{ when: 'TOUCH', goto: 'OFF' }]);
        fsm.init('OFF');
        chai_1.expect(fsm.state).to.equal('OFF');
        fsm
            .on('ON')
            .pipe(operators_1.take(1))
            .subscribe(function (state) {
            chai_1.expect(fsm.state).to.equal(state);
            chai_1.expect(fsm.state).to.equal('ON');
            done();
        });
        fsm.send('TOUCH');
    });
    it('should allow us to reset', function (done) {
        var fsm = new lib_1.RxjsFsm();
        fsm.add('OFF', [{ when: 'TOUCH', goto: 'ON' }]);
        fsm.add('ON', [{ when: 'TOUCH', goto: 'OFF' }]);
        fsm.init('OFF');
        chai_1.expect(fsm.state).to.equal('OFF');
        var off$ = fsm.on('OFF');
        var on$ = fsm.on('ON');
        var events = [];
        rxjs_1.merge(on$, off$).subscribe(function (next) {
            events.push(next);
            if (events.length == 2) {
                chai_1.expect(events).to.eql(['ON', 'OFF']);
                done();
            }
        });
        fsm.send('TOUCH');
        fsm.send('TOUCH');
    });
});
