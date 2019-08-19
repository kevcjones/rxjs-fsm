import { Observable } from 'rxjs';
export declare type RxjsFsmStateType = string | number;
export declare type RxjsFsmEventType = string | number;
export interface RxjsFsmTransition {
    when: RxjsFsmEventType;
    goto: RxjsFsmStateType;
}
export declare class RxjsFsm {
    private stateMap;
    private stateUpdate$;
    private defaultState;
    state: RxjsFsmStateType;
    stateRead$: Observable<RxjsFsmStateType>;
    init(defaultState: RxjsFsmStateType): void;
    private create;
    reset(): void;
    on(stateName: RxjsFsmStateType): Observable<RxjsFsmStateType>;
    send(eventName: string): void;
    listTransitions(stateName: RxjsFsmStateType): string[];
    onException(): Observable<RxjsFsmStateType>;
    add(name: RxjsFsmStateType, transitions: RxjsFsmTransition[]): any;
    remove(name: RxjsFsmStateType): void;
}
