import React, { useEffect, useState } from 'react';
import { 
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { format } from 'date-fns';
import { League } from '../../types/league';
import { fetchLeagues } from '../../services/api';

interface LeagueListState {
  leagues: League[];
  loading: boolean;
  error: string | null;
}

export const LeagueList: React.FC = () => {
  const [state, setState] = useState<LeagueListState>({
    leagues: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const getLeagues = async () => {
      try {
        const response = await fetchLeagues();
        setState(prev => ({
          ...prev,
          leagues: response.data,
          loading: false
        }));
      } catch (err) {
        setState(prev => ({
          ...prev,
          error: 'Failed to fetch leagues',
          loading: false
        }));
      }
    };

    getLeagues();
  }, []);

  const renderLeagueCard = (league: League) => (
    <Grid item xs={12} sm={6} md={4} key={league.id}>
      <Card 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          '&:hover': {
            boxShadow: 6
          }
        }}
      >
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {league.name}
          </Typography>
          <Typography color="textSecondary" gutterBottom>
            {league.game}
          </Typography>
          <Typography variant="body2">
            Start Date: {format(new Date(league.startDate), 'MMM dd, yyyy')}
          </Typography>
          <Typography variant="body2">
            Prize Pool: ${league.prizePool.toLocaleString()}
          </Typography>
          <Typography variant="body2" color={league.isLive ? 'success.main' : 'info.main'}>
            Status: {league.isLive ? 'Live' : 'Upcoming'}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );

  if (state.loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (state.error) {
    return (
      <Box m={2}>
        <Alert severity="error">{state.error}</Alert>
      </Box>
    );
  }

  const liveLeagues = state.leagues.filter(league => league.isLive);
  const upcomingLeagues = state.leagues.filter(league => !league.isLive);

  return (
    <Box sx={{ p: 3 }}>
      {/* Live Leagues Section */}
      <Typography variant="h4" gutterBottom color="primary">
        Live Leagues
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {liveLeagues.length > 0 ? (
          liveLeagues.map(renderLeagueCard)
        ) : (
          <Grid item xs={12}>
            <Typography color="textSecondary">No live leagues at the moment</Typography>
          </Grid>
        )}
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Upcoming Leagues Section */}
      <Typography variant="h4" gutterBottom color="primary">
        Upcoming Leagues
      </Typography>
      <Grid container spacing={3}>
        {upcomingLeagues.length > 0 ? (
          upcomingLeagues.map(renderLeagueCard)
        ) : (
          <Grid item xs={12}>
            <Typography color="textSecondary">No upcoming leagues</Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default LeagueList;