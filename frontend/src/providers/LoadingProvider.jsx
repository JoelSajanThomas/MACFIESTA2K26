import { createContext, useCallback, useContext, useState } from "react";

const LoadingContext = createContext({
  isDone: false,
  markDone: () => {},
});

export function LoadingProvider({ children }) {
  const [isDone, setIsDone] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      if (sessionStorage.getItem("macfiesta_entered") === "true") return true;
      const path = window.location.pathname;
      if (path && path !== "/" && !path.startsWith("/?")) return true;
    } catch {
      // ignore storage access errors
    }
    return false;
  });

  const markDone = useCallback(() => {
    setIsDone(true);
    try {
      sessionStorage.setItem("macfiesta_entered", "true");
    } catch {
      // ignore
    }
  }, []);

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
