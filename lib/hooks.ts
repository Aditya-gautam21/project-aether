import { useState, useCallback } from "react";

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
    // State to store our value
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === "undefined") {
            return initialValue;
        }
        try {
            // Get from local storage by key
            const item = window.localStorage.getItem(key);
            // Parse stored json or if none return initialValue
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.log(error);
            return initialValue;
        }
    });

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = useCallback((value: T | ((val: T) => T)) => {
        try {
            // Allow value to be a function so we have same API as useState
            setStoredValue((prev) => {
                const valueToStore = value instanceof Function ? value(prev) : value;
                // Save to local storage
                if (typeof window !== "undefined") {
                    window.localStorage.setItem(key, JSON.stringify(valueToStore));
                }
                return valueToStore;
            });
        } catch (error) {
            console.log(error);
        }
    }, [key]);

    return [storedValue, setValue];
}
