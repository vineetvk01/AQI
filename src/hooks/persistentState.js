import { useState } from "react";

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      console.log('No Item exists')
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      if(value instanceof Function){
        setStoredValue((prev) => {
          const valueToStore = value(prev);
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          return valueToStore;
        });
      }else {
        setStoredValue(value);
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;
