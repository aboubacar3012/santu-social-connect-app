import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type EventFavoritesContextValue = {
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
};

const EventFavoritesContext = createContext<EventFavoritesContextValue | null>(null);

export function EventFavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState(() => new Set(['1', '3']));

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      isFavorite: (id: string) => favoriteIds.has(id),
      toggleFavorite,
    }),
    [favoriteIds, toggleFavorite],
  );

  return <EventFavoritesContext.Provider value={value}>{children}</EventFavoritesContext.Provider>;
}

export function useEventFavorites() {
  const ctx = useContext(EventFavoritesContext);
  if (!ctx) {
    throw new Error('useEventFavorites must be used within EventFavoritesProvider');
  }
  return ctx;
}
