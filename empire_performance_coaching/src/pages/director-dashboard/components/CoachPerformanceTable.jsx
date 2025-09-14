import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const CoachPerformanceTable = () => {
  const [sortBy, setSortBy] = useState('revenue');
  const [sortOrder, setSortOrder] = useState('desc');

  const coachData = [
    {
      id: 1,
      name: "Marcus Johnson",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      sessions: 42,
      revenue: 8400,
      rating: 4.9,
      utilization: 95,
      specialties: ["Youth Development", "Technical Skills"],
      status: "active"
    },
    {
      id: 2,
      name: "Sarah Williams",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      sessions: 38,
      revenue: 7600,
      rating: 4.8,
      utilization: 88,
      specialties: ["Goalkeeper Training", "Fitness"],
      status: "active"
    },
    {
      id: 3,
      name: "David Rodriguez",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      sessions: 35,
      revenue: 7000,
      rating: 4.7,
      utilization: 82,
      specialties: ["Tactical Training", "Team Play"],
      status: "active"
    },
    {
      id: 4,
      name: "Emily Chen",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      sessions: 29,
      revenue: 5800,
      rating: 4.6,
      utilization: 76,
      specialties: ["Individual Skills", "Mental Training"],
      status: "active"
    },
    {
      id: 5,
      name: "Michael Thompson",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      sessions: 25,
      revenue: 5000,
      rating: 4.5,
      utilization: 68,
      specialties: ["Strength Training", "Conditioning"],
      status: "inactive"
    }
  ];

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const sortedData = [...coachData]?.sort((a, b) => {
    const aValue = a?.[sortBy];
    const bValue = b?.[sortBy];
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    })?.format(value);
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return 'ArrowUpDown';
    return sortOrder === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-elevation-1">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Coach Performance</h3>
            <p className="text-sm text-muted-foreground">Individual coach metrics and earnings</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" iconName="Filter">
              Filter
            </Button>
            <Button variant="outline" size="sm" iconName="Download">
              Export CSV
            </Button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-medium text-foreground">Coach</th>
              <th 
                className="text-left p-4 font-medium text-foreground cursor-pointer hover:bg-muted transition-smooth"
                onClick={() => handleSort('sessions')}
              >
                <div className="flex items-center space-x-1">
                  <span>Sessions</span>
                  <Icon name={getSortIcon('sessions')} size={14} />
                </div>
              </th>
              <th 
                className="text-left p-4 font-medium text-foreground cursor-pointer hover:bg-muted transition-smooth"
                onClick={() => handleSort('revenue')}
              >
                <div className="flex items-center space-x-1">
                  <span>Revenue</span>
                  <Icon name={getSortIcon('revenue')} size={14} />
                </div>
              </th>
              <th 
                className="text-left p-4 font-medium text-foreground cursor-pointer hover:bg-muted transition-smooth"
                onClick={() => handleSort('rating')}
              >
                <div className="flex items-center space-x-1">
                  <span>Rating</span>
                  <Icon name={getSortIcon('rating')} size={14} />
                </div>
              </th>
              <th 
                className="text-left p-4 font-medium text-foreground cursor-pointer hover:bg-muted transition-smooth"
                onClick={() => handleSort('utilization')}
              >
                <div className="flex items-center space-x-1">
                  <span>Utilization</span>
                  <Icon name={getSortIcon('utilization')} size={14} />
                </div>
              </th>
              <th className="text-left p-4 font-medium text-foreground">Specialties</th>
              <th className="text-left p-4 font-medium text-foreground">Status</th>
              <th className="text-left p-4 font-medium text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedData?.map((coach, index) => (
              <tr key={coach?.id} className={`border-b border-border hover:bg-muted/30 transition-smooth ${index % 2 === 0 ? 'bg-background' : 'bg-muted/10'}`}>
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <Image 
                        src={coach?.avatar} 
                        alt={coach?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{coach?.name}</p>
                      <p className="text-sm text-muted-foreground">Coach ID: {coach?.id}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="font-medium text-foreground">{coach?.sessions}</span>
                </td>
                <td className="p-4">
                  <span className="font-medium text-foreground">{formatCurrency(coach?.revenue)}</span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-1">
                    <Icon name="Star" size={16} className="text-warning fill-current" />
                    <span className="font-medium text-foreground">{coach?.rating}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-smooth"
                        style={{ width: `${coach?.utilization}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-foreground">{coach?.utilization}%</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {coach?.specialties?.slice(0, 2)?.map((specialty, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                    {coach?.specialties?.length > 2 && (
                      <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                        +{coach?.specialties?.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    coach?.status === 'active' ?'bg-success/10 text-success' :'bg-muted text-muted-foreground'
                  }`}>
                    {coach?.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" iconName="Eye">
                      View
                    </Button>
                    <Button variant="ghost" size="sm" iconName="MoreHorizontal">
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {sortedData?.length} of {coachData?.length} coaches
          </p>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachPerformanceTable;