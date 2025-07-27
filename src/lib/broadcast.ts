
'use client';

const CHANNEL_NAME = 'pdprahari_data_updates';
let channel: BroadcastChannel | null = null;

// Ensure this runs only on the client
if (typeof window !== 'undefined') {
    channel = new BroadcastChannel(CHANNEL_NAME);
}

export function postDataUpdate() {
  if (channel) {
    channel.postMessage({ type: 'DATA_UPDATED' });
  }
}

export function addDataUpdateListener(callback: () => void) {
  if (channel) {
    const messageHandler = (event: MessageEvent) => {
      if (event.data && event.data.type === 'DATA_UPDATED') {
        callback();
      }
    };
    channel.addEventListener('message', messageHandler);

    // Return a cleanup function
    return () => {
      channel.removeEventListener('message', messageHandler);
    };
  }
  // Return a no-op cleanup function if channel isn't available
  return () => {};
}

    