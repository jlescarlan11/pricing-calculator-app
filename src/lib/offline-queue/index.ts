export const offlineQueue = {
  add: (item: any) => { console.log('Added to offline queue', item); },
  process: () => { console.log('Processing offline queue'); },
};
