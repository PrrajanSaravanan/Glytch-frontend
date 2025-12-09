import { TokenStatus } from '../types';

export const getTokenStatusLabel = (status: TokenStatus): string => {
  switch (status) {
    case 'waiting':
      return 'Waiting';
    case 'active':
      return 'Active';
    case 'served':
      return 'Served';
    case 'no-show':
      return 'You were marked as No-Show';
    case 're-enter':
      return 'Re-entered — You will be called next';
    default:
      return 'Unknown';
  }
};

export const getTokenStatusColor = (status: TokenStatus): { bg: string; text: string; badge: string } => {
  switch (status) {
    case 'waiting':
      return { bg: 'bg-blue-100', text: 'text-blue-700', badge: 'bg-blue-300' };
    case 'active':
      return { bg: 'bg-green-100', text: 'text-green-700', badge: 'bg-green-400' };
    case 'served':
      return { bg: 'bg-slate-100', text: 'text-slate-700', badge: 'bg-slate-300' };
    case 'no-show':
      return { bg: 'bg-red-100', text: 'text-red-700', badge: 'bg-red-300' };
    case 're-enter':
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', badge: 'bg-yellow-300' };
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-700', badge: 'bg-slate-300' };
  }
};

export const getNextToken = (tokens: Array<{ tokenNumber: number; status: TokenStatus }>) => {
  // Re-enter tokens have priority
  const reEnterTokens = tokens.filter(t => t.status === 're-enter');
  if (reEnterTokens.length > 0) {
    return reEnterTokens.reduce((min, token) =>
      token.tokenNumber < min.tokenNumber ? token : min
    );
  }

  // Otherwise, pick from waiting tokens
  const waitingTokens = tokens.filter(t => t.status === 'waiting');
  if (waitingTokens.length > 0) {
    return waitingTokens.reduce((min, token) =>
      token.tokenNumber < min.tokenNumber ? token : min
    );
  }

  return null;
};

export const getQueueCount = (tokens: Array<{ status: TokenStatus }>) => {
  return tokens.filter(t => t.status === 'waiting' || t.status === 're-enter').length;
};
