
import { createContext, useContext, useState } from 'react';

const ItemsContext = createContext(null);

const initialItems = [
  {
    id: 1,
    title: 'Black Backpack',
    type: 'lost',
    category: 'Bags',
    location: 'University Library',
    date: 'October 20',
    icon: '🎒'
  },
  {
    id: 2,
    title: 'Set of Keys',
    type: 'found',
    category: 'Keys',
    location: 'Campus Cafeteria',
    date: 'October 21',
    icon: '🔑'
  },
  {
    id: 3,
    title: 'Programming Book',
    type: 'lost',
    category: 'Books',
    location: 'Computer Lab',
    date: 'October 22',
    icon: '📚'
  }
];

export function ItemsProvider({ children }) {
  const [items, setItems] = useState(initialItems);
  const [foundRequests, setFoundRequests] = useState([]);

  function addItem(itemData) {
    const newItem = {
      ...itemData,
      id: Date.now(),
      icon: itemData.type === 'lost' ? '🔎' : '📦'
    };

    setItems((previous) => [newItem, ...previous]);
    return newItem;
  }

  function submitFoundRequest(requestData) {
    const item = items.find(
      (entry) => entry.id === requestData.itemId
    );

    if (!item || item.type !== 'lost') {
      return false;
    }

    const alreadyPending = foundRequests.some(
      (request) =>
        request.itemId === requestData.itemId &&
        request.status === 'PENDING'
    );

    if (alreadyPending) {
      return false;
    }

    setFoundRequests((previous) => [
      ...previous,
      {
        ...requestData,
        id: Date.now(),
        status: 'PENDING'
      }
    ]);

    return true;
  }

  function acceptFoundRequest(requestId) {
    const request = foundRequests.find(
      (entry) =>
        entry.id === requestId &&
        entry.status === 'PENDING'
    );

    if (!request) {
      return false;
    }

    const item = items.find(
      (entry) => entry.id === request.itemId
    );

    if (!item || item.type !== 'lost') {
      return false;
    }

    setItems((previous) =>
      previous.map((entry) =>
        entry.id === request.itemId
          ? { ...entry, type: 'found', icon: '📦' }
          : entry
      )
    );

    setFoundRequests((previous) =>
      previous.map((entry) =>
        entry.id === requestId
          ? { ...entry, status: 'ACCEPTED' }
          : entry
      )
    );

    return true;
  }

  function rejectFoundRequest(requestId) {
    const request = foundRequests.find(
      (entry) =>
        entry.id === requestId &&
        entry.status === 'PENDING'
    );

    if (!request) {
      return false;
    }

    setFoundRequests((previous) =>
      previous.map((entry) =>
        entry.id === requestId
          ? { ...entry, status: 'REJECTED' }
          : entry
      )
    );

    return true;
  }

  return (
    <ItemsContext.Provider
      value={{
        items,
        foundRequests,
        addItem,
        submitFoundRequest,
        acceptFoundRequest,
        rejectFoundRequest
      }}
    >
      {children}
    </ItemsContext.Provider>
  );
}

export function useItems() {
  const context = useContext(ItemsContext);

  if (!context) {
    throw new Error('useItems must be used inside ItemsProvider');
  }

  return context;
}
