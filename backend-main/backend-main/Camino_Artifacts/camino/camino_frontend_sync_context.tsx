
// React context to sync dashboard data
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SyncContext = createContext(null);

export const SyncProvider = ({ children }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const socket = io('https://your-signalr-endpoint');
    socket.on('newData', setData);
    return () => socket.disconnect();
  }, []);

  return <SyncContext.Provider value={data}>{children}</SyncContext.Provider>;
};

export const useSyncData = () => useContext(SyncContext);
