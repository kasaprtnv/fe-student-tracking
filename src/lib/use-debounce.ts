import React from 'react';

/**
 * Debounce hook - delays updating a value until after the specified delay has passed
 * Useful for reducing API calls during rapid user input (e.g., search, filtering)
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns The debounced value
 *
 * @example
 * const debouncedSearchQuery = useDebounce(searchQuery, 500);
 * // searchQuery updates immediately, but debouncedSearchQuery updates 500ms after user stops typing
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
