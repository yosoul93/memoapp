import { renderHook, act } from '@testing-library/react';
import { usePromiseControl } from '../hooks/usePromiseControl';

describe('usePromiseControl', () => {
  it('initializes with default values', () => {
    const mockFn = jest.fn();
    const { result } = renderHook(() => usePromiseControl({ fn: mockFn }));

    expect(result.current).toEqual({
      value: null,
      resolving: false,
      resolvedCount: 0,
      rejectedCount: 0,
      resolve: expect.any(Function),
      instantResolve: expect.any(Function),
      cancel: expect.any(Function),
      setValue: expect.any(Function),
      reset: expect.any(Function),
    });
  });

  it('resolves with resolve()', async () => {
    const mockFn = jest.fn().mockResolvedValue('resolved');
    const { result } = renderHook(() =>
      usePromiseControl({ fn: mockFn })
    );

    await act(async () => {
      await result.current.resolve();
    });

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(result.current).toMatchObject({
      value: 'resolved',
      resolving: false,
      resolvedCount: 1,
    });
  });

  it('handles instantResolve()', async () => {
    const mockFn = jest.fn().mockResolvedValue('instant');
    const { result } = renderHook(() =>
      usePromiseControl({ fn: mockFn })
    );

    await act(async () => {
      await result.current.instantResolve();
    });

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(result.current).toMatchObject({
      value: 'instant',
      resolvedCount: 1,
    });
  });

  it('cancels a pending resolve', () => {
    jest.useFakeTimers();
    const mockFn = jest.fn().mockResolvedValue('should not resolve');
    const { result } = renderHook(() =>
      usePromiseControl({ fn: mockFn, delay: 500 })
    );

    act(() => {
      result.current.resolve();
      result.current.cancel();
      jest.advanceTimersByTime(500);
    });

    expect(mockFn).not.toHaveBeenCalled();
    expect(result.current.resolving).toBe(false);
    jest.useRealTimers();
  });

  it('handles rejection', async () => {
    const mockFn = jest.fn().mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() =>
      usePromiseControl({ fn: mockFn })
    );

    await act(async () => {
      try {
        await result.current.resolve();
      } catch {}
      await Promise.resolve();
    });

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(result.current).toMatchObject({
      rejectedCount: 1,
      resolving: false,
    });
  });

  it('resets state with reset()', async () => {
    const mockFn = jest.fn().mockResolvedValue('resolved');
    const { result } = renderHook(() =>
      usePromiseControl({ fn: mockFn })
    );

    await act(async () => {
      await result.current.resolve();
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current).toEqual({
      value: null,
      resolving: false,
      resolvedCount: 0,
      rejectedCount: 0,
      resolve: expect.any(Function),
      instantResolve: expect.any(Function),
      cancel: expect.any(Function),
      setValue: expect.any(Function),
      reset: expect.any(Function),
    });
  });

  it('handles resolve with parameters', async () => {
    const mockFn = jest.fn((a: number, b: number) => Promise.resolve(a + b));
    const { result } = renderHook(() =>
      usePromiseControl({ fn: mockFn })
    );

    await act(async () => {
      await result.current.resolve(5, 10);
    });

    expect(mockFn).toHaveBeenCalledWith(5, 10);
    expect(result.current.value).toBe(15);
    expect(result.current.resolvedCount).toBe(1);
    expect(result.current.resolving).toBe(false);
  });

  it('prevents concurrent resolves when noConcurrency is true', async () => {
    const resolveOrder: number[] = [];
    const mockFn = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => {
        resolveOrder.push(resolveOrder.length + 1);
        resolve(`result-${resolveOrder.length}`);
      }, 100))
    );

    const { result } = renderHook(() =>
      usePromiseControl({ fn: mockFn, noConcurrency: true })
    );

    await act(async () => {
      const promise1 = result.current.resolve();
      const promise2 = result.current.resolve();
      await Promise.all([promise1, promise2]);
    });

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(resolveOrder).toEqual([1]);
  });

  it('allows concurrent resolves when noConcurrency is false', async () => {
    const resolveOrder: number[] = [];
    const mockFn = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => {
        resolveOrder.push(resolveOrder.length + 1);
        resolve(`result-${resolveOrder.length}`);
      }, 100))
    );

    const { result } = renderHook(() =>
      usePromiseControl({ fn: mockFn, noConcurrency: false })
    );

    await act(async () => {
      await result.current.resolve();
      await result.current.resolve();
    });

    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(resolveOrder).toEqual([1, 2]);
  });

  it('handles delay in resolve()', async () => {
    jest.useFakeTimers();
    const mockFn = jest.fn().mockResolvedValue('delayed');
    const { result } = renderHook(() =>
      usePromiseControl({ fn: mockFn, delay: 500 })
    );

    let resolvePromise: Promise<void>;
    act(() => {
      resolvePromise = result.current.resolve();
      jest.advanceTimersByTime(500);
    });

    await act(async () => {
      await resolvePromise;
    });

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(result.current.value).toBe('delayed');
    jest.useRealTimers();
  });


  it('does not resolve on mount when resolveOnMounted is false', () => {
    const mockFn = jest.fn();
    const { result } = renderHook(() =>
      usePromiseControl({ fn: mockFn, resolveOnMounted: false })
    );

    expect(mockFn).not.toHaveBeenCalled();
    expect(result.current.value).toBeNull();
    expect(result.current.resolving).toBe(false);
  });

  it('handles instantResolve() with delay=0', async () => {
    jest.useFakeTimers();
    const mockFn = jest.fn().mockResolvedValue('instant');
    const { result } = renderHook(() =>
      usePromiseControl({ fn: mockFn })
    );

    act(() => {
      result.current.instantResolve();
      jest.runAllTimers();
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(result.current.value).toBe('instant');
    expect(result.current.resolving).toBe(false);
    jest.useRealTimers();
  });

  it('allows setting value directly with setValue', () => {
    const mockFn = jest.fn();
    const { result } = renderHook(() =>
      usePromiseControl({ fn: mockFn })
    );

    act(() => {
      result.current.setValue('direct');
    });

    expect(result.current.value).toBe('direct');
    expect(result.current.resolving).toBe(false);
    expect(result.current.resolvedCount).toBe(0);
    expect(result.current.rejectedCount).toBe(0);
  });

  it('allows updating value via setValue function', () => {
    const mockFn = jest.fn();
    const { result } = renderHook(() =>
      usePromiseControl({ fn: mockFn, initialValue: 10 })
    );

    act(() => {
      result.current.setValue((prev: number) => prev + 5);
    });

    expect(result.current.value).toBe(15);
  });

  it('resets while resolving', async () => {
    jest.useFakeTimers();
    const mockFn = jest.fn().mockResolvedValue('resolved');
    const { result } = renderHook(() =>
      usePromiseControl({ fn: mockFn, delay: 500 })
    );

    act(() => {
      result.current.resolve();
      jest.advanceTimersByTime(250); // Halfway through delay
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.value).toBeNull();
    expect(result.current.resolving).toBe(false);
    expect(result.current.resolvedCount).toBe(0);
    expect(result.current.rejectedCount).toBe(0);

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockFn).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('handles multiple rapid resolves with noConcurrency=false', async () => {
    const mockFn = jest.fn().mockResolvedValue('done');
    const { result } = renderHook(() =>
      usePromiseControl({ fn: mockFn, noConcurrency: false })
    );

    await act(async () => {
      await result.current.resolve();
      await result.current.resolve();
      await result.current.resolve();
    });

    expect(mockFn).toHaveBeenCalledTimes(3);
    expect(result.current.resolvedCount).toBe(3);
    expect(result.current.resolving).toBe(false);
  });

  it('cleans up on unmount', async () => {
    jest.useFakeTimers();
    const mockFn = jest.fn().mockResolvedValue('cleanup');
    const { result, unmount } = renderHook(() =>
      usePromiseControl({ fn: mockFn, delay: 500 })
    );

    act(() => {
      result.current.resolve();
      unmount();
      jest.advanceTimersByTime(500);
    });

    expect(mockFn).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('handles multiple cancellations correctly', async () => {
    jest.useFakeTimers();
    const mockFn = jest.fn().mockResolvedValue('should not resolve');
    const { result } = renderHook(() =>
      usePromiseControl({ fn: mockFn, delay: 500 })
    );

    act(() => {
      result.current.resolve();
      result.current.cancel();
      result.current.cancel(); 
      jest.advanceTimersByTime(500);
    });

    expect(mockFn).not.toHaveBeenCalled();
    expect(result.current.resolving).toBe(false);
    jest.useRealTimers();
  });

  it('throws error on rejected promise', async () => {
    const mockFn = jest.fn().mockRejectedValue(new Error('Test Error'));
    const { result } = renderHook(() =>
      usePromiseControl({ fn: mockFn })
    );

    await act(async () => {
      try {
        await result.current.resolve();
      } catch (e) {
        // Expected rejection
      }
      await Promise.resolve();
    });

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(result.current.rejectedCount).toBe(1);
    expect(result.current.resolving).toBe(false);
  });

  it('resets counts after multiple resolves and rejections', async () => {
    const mockFn = jest
      .fn()
      .mockResolvedValueOnce('first')
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('second');
    const { result } = renderHook(() =>
      usePromiseControl({ fn: mockFn })
    );

    await act(async () => {
      await result.current.resolve();
    });

    expect(result.current.value).toBe('first');
    expect(result.current.resolvedCount).toBe(1);
    expect(result.current.rejectedCount).toBe(0);

    await act(async () => {
      try {
        await result.current.resolve();
      } catch {}
      await Promise.resolve();
    });

    expect(result.current.resolvedCount).toBe(1);
    expect(result.current.rejectedCount).toBe(1);

    await act(async () => {
      await result.current.resolve();
    });

    expect(result.current.value).toBe('second');
    expect(result.current.resolvedCount).toBe(2);
    expect(result.current.rejectedCount).toBe(1);

    act(() => {
      result.current.reset();
    });

    expect(result.current.value).toBeNull();
    expect(result.current.resolving).toBe(false);
    expect(result.current.resolvedCount).toBe(0);
    expect(result.current.rejectedCount).toBe(0);
  });

});