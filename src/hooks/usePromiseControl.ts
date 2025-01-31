import { useEffect, useRef, useState } from 'react';

type Fn = (...args: any) => Promise<any>;

interface UsePromiseControlArgs<F extends Fn> {
  fn: F;
  initialValue?: Awaited<ReturnType<F>>;
  resolveOnMounted?: boolean;
  delay?: number;
  noConcurrency?: boolean;
  resetAtResolve?: boolean;
}

/** manage promise result value and loading state for you. This only keep latest result so previous resolving will be canceled.
 *  @param args.fn function return the target promise
 *  @param args.initialValue intial value of state. Default is `null`.
 *  @param args.resolveOnMounted resolve the promise when hook is mounted or not. Default is `false`.
 *  @param args.delay resolve the promise with delay. If there is new resolver comes before delay, current will be canceled. Default is `0`.
 *  @param args.noConcurrency if there is resovling promise, prevent resolve another one at same time. Default is `true`.
 *  @param args.resetAtResolve reset value to `initialValue` when start to resolve
 */
export function usePromiseControl<F extends Fn>(
  args: UsePromiseControlArgs<F>,
) {
  type FnReturn = Awaited<ReturnType<F>> | null;
  type FnParams = Parameters<F>;
  const {
    fn,
    initialValue = null,
    resolveOnMounted = false,
    delay = 0,
    noConcurrency = true,
    resetAtResolve = false,
  } = args;
  const timeoutId = useRef<number>(null);
  const [state, setState] = useState({
    value: initialValue ,
    resolving: false,
    resolvedCount: 0,
    rejectedCount: 0,
  });

  const stepper = useRef(0);

  const nextStep = () => {
    stepper.current += 1;
    return stepper.current;
  };

  const isCurrentStep = (v: number) => v === stepper.current;

  const cancel = (keepResolving = false) => {
    // move to next step to cancel current promise
    nextStep();
    if (timeoutId.current !== null) {
      window.clearTimeout(timeoutId.current);
    }
    if (keepResolving) return;
    setState((prev) => ({ ...prev, resolving: false }));
  };

  const resolveFn = async (params: FnParams, timeout: number) => {
    if (noConcurrency && state.resolving) return Promise.resolve();
    const step = nextStep();
    await new Promise(resolve => setTimeout(resolve, timeout));
    if (!isCurrentStep(step)) return Promise.resolve();
    setState((prev) => {
      if (resetAtResolve) prev.value = initialValue;
      return { ...prev, resolving: true };
    });
    return fn(...params)
      .then((value) => {
        if (!isCurrentStep(step)) return;
        setState((prev) => ({
          ...prev,
          resolving: false,
          resolvedCount: prev.resolvedCount + 1,
          value,
        }));
      })
      .catch((e) => {
        setState((prev) => ({
          ...prev,
          resolving: false,
          rejectedCount: prev.rejectedCount + 1,
        }));
        throw e;
      });
  };

  useEffect(() => {
    if (!resolveOnMounted) return undefined;
    resolveFn([] as unknown as FnParams, delay);
    return cancel;
  }, []);

  const returnObj = {
    ...state,
    resolve: (...params: FnParams) => resolveFn(params, delay),
    instantResolve: (...params: FnParams) => resolveFn(params, 0),
    cancel,
    setValue: (v: FnReturn | ((prev: FnReturn) => FnReturn)) => {
      let value: FnReturn;
      if (v instanceof Function) {
        value = v(state.value);
      } else value = v;
      setState({ ...state, value });
    },
    reset: () => {
      returnObj.cancel();
      setState({
        value: initialValue,
        resolving: false,
        resolvedCount: 0,
        rejectedCount: 0,
      });
    },
  };

  return returnObj;
}