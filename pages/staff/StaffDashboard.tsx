import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { HoldListItem } from '../../components/staff/HoldListItem';
import { NEXT_PATIENT_STAFF_VIEW, STAFF_STATS, HOLD_LIST } from '../../data/mockData';
import { TokenStatus } from '../../types';
import { getTokenStatusLabel, getTokenStatusColor, getNextToken, getQueueCount } from '../../utils/tokenStatus';

interface Token {
  tokenNumber: number;
  name: string;
  token: string;
  position: number;
  status: TokenStatus;
}

interface UndoAction {
  tokenNumber: number;
  previousStatus: TokenStatus;
  action: 'served' | 'no-show';
  nextActiveTokenNumber?: number; // Track the next patient's token number that was called
}

export const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [holdList, setHoldList] = useState(HOLD_LIST);
  const [isQueueFrozen, setIsQueueFrozen] = useState(false);
  const [lastAction, setLastAction] = useState<UndoAction | null>(null);
  
  // Mock token queue data
  const [tokens, setTokens] = useState<Token[]>([
    { tokenNumber: 1234, name: 'John Doe', token: 'TKN-1234', position: 1, status: 'active' },
    { tokenNumber: 1235, name: 'Alice Johnson', token: 'TKN-1235', position: 2, status: 'waiting' },
    { tokenNumber: 1236, name: 'Robert Smith', token: 'TKN-1236', position: 3, status: 'waiting' },
    { tokenNumber: 1237, name: 'Linda Taylor', token: 'TKN-1237', position: 4, status: 're-enter' },
    { tokenNumber: 1238, name: 'Michael Brown', token: 'TKN-1238', position: 5, status: 'waiting' },
  ]);

  const [currentActive, setCurrentActive] = useState<Token | null>(tokens.find(t => t.status === 'active') || null);
  const [selectedCategory, setSelectedCategory] = useState<TokenStatus | null>(null);

  const getCategoryTokens = (category: TokenStatus): Token[] => {
    return tokens.filter(t => t.status === category);
  };

  const handleMarkServed = () => {
    if (currentActive) {
      // Get the next patient that will be called
      const nextToken = getNextToken(tokens.filter(t => ['waiting', 're-enter'].includes(t.status)));
      
      // Store the undo action with the next patient info
      setLastAction({
        tokenNumber: currentActive.tokenNumber,
        previousStatus: 'active',
        action: 'served',
        nextActiveTokenNumber: nextToken?.tokenNumber,
      });
      setTokens(prev => prev.map(t =>
        t.tokenNumber === currentActive.tokenNumber ? { ...t, status: 'served' } : t
      ));
      callNextPatient();
    }
  };

  const handleMarkNoShow = () => {
    if (currentActive) {
      // Get the next patient that will be called
      const nextToken = getNextToken(tokens.filter(t => ['waiting', 're-enter'].includes(t.status)));
      
      // Store the undo action with the next patient info
      setLastAction({
        tokenNumber: currentActive.tokenNumber,
        previousStatus: 'active',
        action: 'no-show',
        nextActiveTokenNumber: nextToken?.tokenNumber,
      });
      setTokens(prev => prev.map(t =>
        t.tokenNumber === currentActive.tokenNumber ? { ...t, status: 'no-show' } : t
      ));
      callNextPatient();
    }
  };

  const handleUndo = () => {
    if (lastAction) {
      setTokens(prev => {
        let updated = [...prev];
        
        // Restore the original token to 'active' status
        updated = updated.map(t =>
          t.tokenNumber === lastAction.tokenNumber ? { ...t, status: lastAction.previousStatus } : t
        );
        
        // If there was a next patient called, revert them from 'active' back to 'waiting' or 're-enter'
        if (lastAction.nextActiveTokenNumber) {
          updated = updated.map(t => {
            if (t.tokenNumber === lastAction.nextActiveTokenNumber) {
              // Find the original status of this token before it was made active
              const nextToken = prev.find(tk => tk.tokenNumber === lastAction.nextActiveTokenNumber);
              // The patient was either waiting or re-enter, check which one
              return { ...t, status: t.status === 'active' ? 'waiting' : t.status };
            }
            return t;
          });
        }
        
        return updated;
      });
      
      // Restore current active token to the original one
      const undoToken = tokens.find(t => t.tokenNumber === lastAction.tokenNumber);
      if (undoToken) {
        setCurrentActive(undoToken);
      }
      
      setLastAction(null);
    }
  };

  const handleReEnter = (tokenNumber: number) => {
    setTokens(prev => prev.map(t =>
      t.tokenNumber === tokenNumber ? { ...t, status: 're-enter' } : t
    ));
  };

  const callNextPatient = () => {
    // Don't call next patient if queue is frozen
    if (isQueueFrozen) return;
    
    const nextToken = getNextToken(tokens.filter(t => ['waiting', 're-enter'].includes(t.status)));
    if (nextToken) {
      setTokens(prev => prev.map(t =>
        t.tokenNumber === nextToken.tokenNumber ? { ...t, status: 'active' } : t
      ));
      setCurrentActive(nextToken);
    }
  };

  const reEnterTokens = tokens.filter(t => t.status === 're-enter');
  const waitingTokens = tokens.filter(t => t.status === 'waiting');
  const servedTokens = tokens.filter(t => t.status === 'served');
  const noShowTokens = tokens.filter(t => t.status === 'no-show');
  const queueCount = getQueueCount(tokens);

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Queue Status Banner */}
        {isQueueFrozen && (
          <div className="mb-8 p-4 bg-blue-100 border-l-4 border-l-blue-600 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⏸</span>
              <div>
                <p className="font-bold text-blue-700">Queue is Currently Frozen</p>
                <p className="text-sm text-blue-600">New patients are not being called. Click "Resume Queue" to continue.</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Main Queue Operations */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Active Token Panel */}
            {currentActive && (
              <Card className="p-0 border-l-4 border-l-green-600 overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-green-50 to-white">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">Serving Now</p>
                      <h2 className="text-3xl font-bold text-slate-900 mt-1">{currentActive.name}</h2>
                      <p className="text-green-600 font-mono text-xl mt-1">{currentActive.token}</p>
                    </div>
                    <div className="bg-green-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                      Active
                    </div>
                  </div>
                  
                  <div className="flex gap-4 mt-6">
                    <Button 
                      onClick={handleMarkServed} 
                      className="flex-1 py-3 text-lg bg-green-600 hover:bg-green-700"
                    >
                      Mark Served
                    </Button>
                    <Button 
                      onClick={handleMarkNoShow}
                      className="flex-1 py-3 text-lg bg-red-600 text-white hover:bg-red-700"
                    >
                      Mark No-Show
                    </Button>
                    <button
                      onClick={() => setIsQueueFrozen(!isQueueFrozen)}
                      className={`flex-1 py-3 text-lg font-semibold rounded-lg transition ${
                        isQueueFrozen 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-slate-300 text-slate-700 hover:bg-slate-400'
                      }`}
                    >
                      {isQueueFrozen ? '▶ Resume Queue' : '⏸ Freeze Queue'}
                    </button>
                  </div>

                  {/* Undo Button */}
                  {lastAction && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-amber-900">Last action: {lastAction.action === 'served' ? 'Marked Served' : 'Marked No-Show'}</p>
                          <p className="text-xs text-amber-700">Click "Undo" to revert this action</p>
                        </div>
                        <button
                          onClick={handleUndo}
                          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-semibold transition whitespace-nowrap"
                        >
                          ↶ Undo
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Re-Enter Tokens Section */}
            {reEnterTokens.length > 0 && (
              <Card className="p-6 border-l-4 border-l-yellow-400 bg-yellow-50">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  Re-Enter Tokens (Priority)
                  <span className="bg-yellow-300 text-black text-xs px-2 py-0.5 rounded-full font-bold">{reEnterTokens.length}</span>
                </h3>
                <div className="space-y-2">
                  {reEnterTokens.map(token => (
                    <div key={token.tokenNumber} className="bg-white p-3 rounded-lg flex justify-between items-center border border-yellow-200">
                      <div>
                        <p className="font-semibold text-slate-900">{token.name}</p>
                        <p className="text-sm text-yellow-700 font-mono">{token.token}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-yellow-300 text-black text-xs px-2 py-1 rounded font-bold">PRIORITY</span>
                        {token.status !== 'active' && (
                          <button
                            onClick={() => {
                              setTokens(prev => prev.map(t =>
                                t.tokenNumber === token.tokenNumber ? { ...t, status: 'active' } : t.status === 'active' ? { ...t, status: 'waiting' } : t
                              ));
                              setCurrentActive(token);
                            }}
                            className="px-3 py-1 text-xs bg-yellow-400 text-black rounded hover:bg-yellow-500 font-bold transition"
                          >
                            Call Now
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Queue Statistics - Clickable Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button
                onClick={() => setSelectedCategory('waiting')}
                className="p-4 text-center bg-blue-50 hover:bg-blue-100 rounded-lg border-2 border-blue-300 transition cursor-pointer"
              >
                <p className="text-slate-500 text-xs uppercase font-bold">Queue Count</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{queueCount}</p>
              </button>
              <button
                onClick={() => setSelectedCategory('served')}
                className="p-4 text-center bg-green-50 hover:bg-green-100 rounded-lg border-2 border-green-300 transition cursor-pointer"
              >
                <p className="text-slate-500 text-xs uppercase font-bold">Served</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{servedTokens.length}</p>
              </button>
              <button
                onClick={() => setSelectedCategory('no-show')}
                className="p-4 text-center bg-red-50 hover:bg-red-100 rounded-lg border-2 border-red-300 transition cursor-pointer"
              >
                <p className="text-slate-500 text-xs uppercase font-bold">No-Show</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{noShowTokens.length}</p>
              </button>
              <button
                onClick={() => setSelectedCategory('re-enter')}
                className="p-4 text-center bg-yellow-50 hover:bg-yellow-100 rounded-lg border-2 border-yellow-300 transition cursor-pointer"
              >
                <p className="text-slate-500 text-xs uppercase font-bold">Re-enter</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{reEnterTokens.length}</p>
              </button>
            </div>

            {/* Category Modal */}
            {selectedCategory && (
              <Card className="p-6 bg-white border-2 border-slate-300">
                <div className="flex justify-between items-center mb-4 pb-4 border-b">
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedCategory === 'waiting' && 'Waiting Queue'}
                    {selectedCategory === 'served' && 'Served Patients'}
                    {selectedCategory === 'no-show' && 'No-Show Patients'}
                    {selectedCategory === 're-enter' && 'Re-Enter Queue'}
                  </h3>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-slate-400 hover:text-slate-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {getCategoryTokens(selectedCategory).length > 0 ? (
                    getCategoryTokens(selectedCategory).map((token, idx) => (
                      <div key={token.tokenNumber} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">#{idx + 1} - {token.name}</p>
                          <p className="text-sm text-slate-600 font-mono">{token.token}</p>
                        </div>
                        <span className="px-3 py-1 text-xs font-bold rounded bg-slate-300 text-slate-700">
                          {token.tokenNumber}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      No patients in this category.
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Waiting Tokens */}
            {!selectedCategory && (
              <>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    Waiting Queue
                    <span className="bg-blue-300 text-black text-xs px-2 py-0.5 rounded-full">{waitingTokens.length}</span>
                  </h3>
                  <div className="bg-white rounded-xl border border-slate-200 p-4 max-h-[400px] overflow-y-auto space-y-2">
                    {waitingTokens.length > 0 ? (
                      waitingTokens.map((token, idx) => (
                        <div key={token.tokenNumber} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">#{idx + 1} - {token.name}</p>
                            <p className="text-sm text-slate-600 font-mono">{token.token}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-400">
                        No patients in queue.
                      </div>
                    )}
                  </div>
                </div>

                {/* Hold List */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    Patients on Hold 
                    <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full">{holdList.length}</span>
                  </h3>
                  
                  <div className="bg-white rounded-xl border border-slate-200 p-4 max-h-[300px] overflow-y-auto">
                    {holdList.length > 0 ? (
                      holdList.map(item => (
                        <HoldListItem key={item.id} item={item} onResume={() => setHoldList(prev => prev.filter(h => h.id !== item.id))} />
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-400">
                        No patients currently on hold.
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* RIGHT COLUMN: Controls */}
          <div className="space-y-6">
            <Card className="p-6 sticky top-24">
              <h3 className="text-lg font-bold text-slate-900 mb-6 border-b pb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <Button 
                  fullWidth 
                  onClick={callNextPatient}
                  className="justify-between flex items-center"
                >
                  <span>Call Next Patient</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Button>
                
                <Button fullWidth variant="danger" className="mt-4" onClick={() => navigate('/')}>
                  Log Out
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};