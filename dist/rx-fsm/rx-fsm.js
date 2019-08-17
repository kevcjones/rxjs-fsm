"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var EXCEPTION_STATE = '_exception_';
var HARD_RESET_EVENT = '_hard_reset_event_';
var RxFsm = /** @class */ (function () {
    function RxFsm() {
    }
    RxFsm.prototype.start = function (defaultState) {
        this.defaultState = defaultState;
        this.init();
        return this.stateRead$;
    };
    RxFsm.prototype.init = function () {
        var _this = this;
        if (this.stateUpdate$) {
            this.stateUpdate$.complete();
        }
        this.stateUpdate$ = new rxjs_1.Subject();
        this.stateRead$ = this.stateUpdate$.asObservable().pipe(operators_1.startWith(this.defaultState), operators_1.scan(function (machineState, transition) {
            if (transition === HARD_RESET_EVENT)
                return _this.defaultState;
            var nextMachineState = _this.stateMap[machineState][transition];
            return nextMachineState ? nextMachineState : EXCEPTION_STATE;
        }));
    };
    RxFsm.prototype.reset = function () {
        this.stateUpdate$.next(HARD_RESET_EVENT);
    };
    RxFsm.prototype.on = function (stateName) {
        return this.stateRead$.pipe(operators_1.filter(function (state) { return state === stateName; }));
    };
    RxFsm.prototype.send = function (eventName) {
        this.stateUpdate$.next(eventName);
    };
    RxFsm.prototype.transitions = function (stateName) {
        if (!this.stateMap[stateName])
            return [HARD_RESET_EVENT];
        return Object.keys(this.stateMap[stateName]);
    };
    RxFsm.prototype.onException = function () {
        return this.on(EXCEPTION_STATE);
    };
    RxFsm.prototype.add = function (name, transitions) {
        if (!this.stateMap) {
            this.stateMap = {};
        }
        this.stateMap[name] = transitions.reduce(function (transitionMap, next) {
            transitionMap[next.when] = next.goto;
            return transitionMap;
        }, {});
        return this;
    };
    return RxFsm;
}());
exports.RxFsm = RxFsm;
