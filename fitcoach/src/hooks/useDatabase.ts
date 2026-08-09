/** Initialise la base au montage racine et expose l'état de chargement. */
import { useEffect, useState } from 'react';
import { initDatabase } from '@/db';

export function useDatabase(): { ready: boolean; error: string | null } {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    initDatabase()
      .then(() => mounted && setReady(true))
      .catch((e) => mounted && setError(String(e?.message ?? e)));
    return () => {
      mounted = false;
    };
  }, []);

  return { ready, error };
}
