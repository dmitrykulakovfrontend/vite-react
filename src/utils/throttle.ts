// eslint-disable-next-line @typescript-eslint/no-explicit-any
function throttle<T extends (...args: any[]) => void>(
  callback: T,
  delay: number,
) {
  let throttled = false;

  return (...args: Parameters<T>) => {
    if (throttled) return;
    throttled = true;
    setTimeout(() => {
      callback(...args);
      throttled = false;
    }, delay);
  };
}

export default throttle;
