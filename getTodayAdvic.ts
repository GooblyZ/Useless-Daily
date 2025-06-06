import { adviceList } from './adviceList';

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getTodayAdvice(): string {
  const today = new Date().toISOString().slice(0, 10);
  let userID = localStorage.getItem('user-id');

  if (!userID) {
    userID = crypto.randomUUID();
    localStorage.setItem('user-id', userID);
  }

  const hash = simpleHash(today + userID);
  const index = hash % adviceList.length;
  return adviceList[index];
}
