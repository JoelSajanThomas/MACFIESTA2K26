import { createContext, useCallback, useContext, useState } from "react";

const LoadingContext = createContext({
  isDone: false,
  markDone: () => {},
});

export function LoadingProvider({ children }) {
  const [isDone, setIsDone] = useState(false);
  const markDone = useCallback(() => setIsDone(true), []);

  return (
    <LoadingContext.Provider value={{ isDone, markDone }}>
      {children}
    </LoadingContext.Provider>
  );
}

// Context hook — intentional non-component export for providers.
// eslint-disable-next-line react-refresh/only-export-components
export function useLoading() {
  return useContext(LoadingContext);
}
