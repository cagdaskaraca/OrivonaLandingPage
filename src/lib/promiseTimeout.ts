export class PromiseTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PromiseTimeoutError";
  }
}

/** Rejects if `promise` does not settle within `ms`. Clears timer on success/failure. */
export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  timeoutMessage: string,
): Promise<T> {
  if (ms <= 0) return promise;

  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new PromiseTimeoutError(timeoutMessage));
    }, ms);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}
