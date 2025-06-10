const socketIo = require('socket.io');
const liveUpdatesService = require('../services/analysis/liveUpdates');
const logger = require('../utils/logger');

function setupWebSocket(server) {
    const io = socketIo(server, {
        cors: {
            origin: process.env.NODE_ENV === 'production'
                ? [
                    'https://odd-genius.vercel.app',
                    'https://odd-genius-frontend.vercel.app',
                    'https://odd-genius.netlify.app',
                    'https://odd-genius-frontend.netlify.app'
                  ]
                : ["http://localhost:3000"],
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        logger.info('New client connected');

        socket.on('subscribeToMatch', (matchId) => {
            logger.info(`Client subscribed to match ${matchId}`);
            socket.join(`match_${matchId}`);
            liveUpdatesService.subscribeToMatch(matchId, socket);

            // Send initial match data
            liveUpdatesService.getLiveMatchData(matchId)
                .then(data => socket.emit('matchUpdate', data))
                .catch(error => logger.error(`Error sending initial match data: ${error.message}`));
        });

        socket.on('unsubscribeFromMatch', (matchId) => {
            logger.info(`Client unsubscribed from match ${matchId}`);
            socket.leave(`match_${matchId}`);
            liveUpdatesService.unsubscribeFromMatch(matchId, socket);
        });

        socket.on('disconnect', () => {
            logger.info('Client disconnected');
            // Clean up any remaining subscriptions
            Array.from(socket.rooms)
                .filter(room => room.startsWith('match_'))
                .forEach(room => {
                    const matchId = room.replace('match_', '');
                    liveUpdatesService.unsubscribeFromMatch(matchId, socket);
                });
        });
    });

    return io;
}

module.exports = setupWebSocket;
