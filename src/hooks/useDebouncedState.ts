import { useState, useEffect } from "react";

export default function useDebouncedState<T>(initialValue: T, delayTime: number): [T, T, React.Dispatch<T>] {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);
  useEffect(() => {
    const debounce = setTimeout(() => {
      setDebouncedValue(value);
    }, delayTime);
    return () => {
      clearTimeout(debounce);
    };
  }, [value, delayTime]);
  return [debouncedValue, value, setValue];
}
