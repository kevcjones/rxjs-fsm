"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var EXCEPTION_STATE = '_exception_';
var HARD_RESET_EVENT = '_hard_reset_event_';
var RxjsFsm = /** @class */ (function () {
    function RxjsFsm() {
    }
    RxjsFsm.prototype.init = function (defaultState) {
        this.defaultState = defaultState;
        this.create();
    };
    RxjsFsm.prototype.create = function () {
        if (this.stateUpdate$) {
            this.stateUpdate$.complete();
        }
        this.stateUpdate$ = new rxjs_1.BehaviorSubject(this.defaultState);
        this.stateRead$ = this.stateUpdate$.asObservable().pipe(operators_1.share());
    };
    RxjsFsm.prototype.injectEvent = function (event) {
        var nextMachineState = event === HARD_RESET_EVENT
            ? this.defaultState
            : this.stateMap[this.stateUpdate$.value][event] || EXCEPTION_STATE;
        this.stateUpdate$.next(nextMachineState);
    };
    Object.defineProperty(RxjsFsm.prototype, "state", {
        get: function () {
            return this.stateUpdate$.value;
        },
        enumerable: true,
        configurable: true
    });
    RxjsFsm.prototype.reset = function () {
        this.injectEvent(HARD_RESET_EVENT);
        return this.stateUpdate$.value !== EXCEPTION_STATE;
    };
    RxjsFsm.prototype.on = function (stateName) {
        return this.stateRead$.pipe(operators_1.filter(function (state) { return state === stateName; }));
    };
    RxjsFsm.prototype.send = function (eventName) {
        this.injectEvent(eventName);
        return this.stateUpdate$.value !== EXCEPTION_STATE;
    };
    RxjsFsm.prototype.listTransitions = function (stateName) {
        if (!this.stateMap[stateName || this.state])
            return [HARD_RESET_EVENT];
        return Object.keys(this.stateMap[stateName || this.state]);
    };
    RxjsFsm.prototype.onException = function () {
        return this.on(EXCEPTION_STATE);
    };
    RxjsFsm.prototype.add = function (name, transitions) {
        if (!this.stateMap) {
            this.stateMap = {};
        }
        this.stateMap[name] = transitions.reduce(function (transitionMap, next) {
            transitionMap[next.when] = next.goto;
            return transitionMap;
        }, {});
        return this;
    };
    RxjsFsm.prototype.remove = function (name) {
        var _this = this;
        if (!this.stateMap || !this.stateMap[name]) {
            return;
        }
        // delete the state
        delete this.stateMap[name];
        // clean up the states with transitions to this one
        Object.keys(this.stateMap).forEach(function (state) {
            var stateRef = _this.stateMap[state];
            Object.keys(stateRef).forEach(function (transition) {
                if (stateRef[transition] === name) {
                    delete stateRef[transition];
                }
            });
        });
    };
    return RxjsFsm;
}());
exports.RxjsFsm = RxjsFsm;
