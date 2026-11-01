import { useEffect, useState } from 'react';

export function useEscrowStream(wsUrl: string) {
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    setConnected(Boolean(wsUrl));
  }, [wsUrl]);
  return { connected };
}
