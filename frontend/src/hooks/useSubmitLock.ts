import { useCallback, useRef, useState } from "react";

/**
 * Synchronous + reactive submission lock.
 * Using a ref alongside React state blocks rapid double-clicks that fire within
 * the same render frame before `disabled={isSubmitting}` is committed to the DOM.
 */
export function useSubmitLock() {
  const lockRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const runWithLock = useCallback(
    async <T>(task: () => T | Promise<T>): Promise<T | undefined> => {
      if (lockRef.current) return undefined;
      lockRef.current = true;
      setIsSubmitting(true);
      try {
        return await Promise.resolve(task());
      } finally {
        lockRef.current = false;
        setIsSubmitting(false);
      }
    },
    []
  );

  return { isSubmitting, runWithLock };
}

