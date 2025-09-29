import React, { useState } from 'react';
import Icon from '../../../../shared/components/AppIcon';
import Button from '../../../../shared/components/ui/Button';

const TodaysSchedule = ({ sessions, onAttendanceToggle, onNotesUpdate, onCashToggle }) => {
  const [expandedSession, setExpandedSession] = useState(null);
  const [sessionNotes, setSessionNotes] = useState({});

  const handleExpandSession = (sessionId) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId);
  };

  const handleNotesChange = (sessionId, notes) => {
    setSessionNotes(prev => ({
      ...prev,
      [sessionId]: notes
    }));
  };

  const handleNotesSave = (sessionId) => {
    const notes = sessionNotes?.[sessionId] || '';
    onNotesUpdate(sessionId, notes);
  };

  const getSessionStatus = (session) => {
    const now = new Date();
    const sessionStart = new Date(session.startTime);
    const sessionEnd = new Date(session.endTime);
    
    if (now < sessionStart) return 'upcoming';
    if (now >= sessionStart && now <= sessionEnd) return 'active';
    return 'completed';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'text-warning bg-warning/10';
      case 'active': return 'text-success bg-success/10';
      case 'completed': return 'text-muted-foreground bg-muted';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Today's Schedule</h2>
        <div className="text-sm text-muted-foreground">
          {sessions?.length} session{sessions?.length !== 1 ? 's' : ''} scheduled
        </div>
      </div>
      {sessions?.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <Icon name="Calendar" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No sessions today</h3>
          <p className="text-muted-foreground">Enjoy your day off!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions?.map((session) => {
            const status = getSessionStatus(session);
            const isExpanded = expandedSession === session?.id;
            const attendingCount = session?.players?.filter(p => p?.attended)?.length;
            
            return (
              <div key={session?.id} className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex flex-col">
                        <span className="text-lg font-semibold text-foreground">
                          {new Date(session.startTime)?.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round((new Date(session.endTime) - new Date(session.startTime)) / (1000 * 60))} min
                        </span>
                      </div>
                      <div className="h-8 w-px bg-border"></div>
                      <div>
                        <h3 className="font-medium text-foreground">{session?.title}</h3>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <Icon name="MapPin" size={14} className="mr-1" />
                          {session?.location}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                        {status?.charAt(0)?.toUpperCase() + status?.slice(1)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExpandSession(session?.id)}
                        iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
                        iconPosition="right"
                      >
                        {attendingCount}/{session?.players?.length} attending
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Icon name="Users" size={16} className="text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {session?.players?.length} player{session?.players?.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {session?.isCashPayment && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-success/10 rounded-full">
                          <Icon name="DollarSign" size={14} className="text-success" />
                          <span className="text-xs font-medium text-success">Cash</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {status === 'active' || status === 'completed' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onCashToggle(session?.id, !session?.isCashPayment)}
                          iconName="DollarSign"
                          iconPosition="left"
                        >
                          {session?.isCashPayment ? 'Remove Cash' : 'Mark Cash'}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t border-border bg-muted/30">
                    <div className="p-4 space-y-4">
                      {/* Player Roster */}
                      <div>
                        <h4 className="font-medium text-foreground mb-3">Player Attendance</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {session?.players?.map((player) => (
                            <div key={player?.id} className="flex items-center justify-between p-2 bg-card rounded border border-border">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                  <span className="text-primary-foreground text-sm font-medium">
                                    {player?.name?.split(' ')?.map(n => n?.[0])?.join('')}
                                  </span>
                                </div>
                                <span className="text-sm font-medium text-foreground">{player?.name}</span>
                              </div>
                              <button
                                onClick={() => onAttendanceToggle(session?.id, player?.id, !player?.attended)}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-smooth ${
                                  player?.attended
                                    ? 'bg-success border-success text-success-foreground'
                                    : 'border-border hover:border-success'
                                }`}
                              >
                                {player?.attended && <Icon name="Check" size={14} />}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Session Notes */}
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Session Notes</h4>
                        <div className="space-y-2">
                          <textarea
                            value={sessionNotes?.[session?.id] || session?.notes || ''}
                            onChange={(e) => handleNotesChange(session?.id, e?.target?.value)}
                            placeholder="Add notes about this session, player performance, or observations..."
                            className="w-full h-24 px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                              {session?.lastUpdated && `Last updated: ${new Date(session.lastUpdated)?.toLocaleString()}`}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleNotesSave(session?.id)}
                              iconName="Save"
                              iconPosition="left"
                            >
                              Save Notes
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TodaysSchedule;