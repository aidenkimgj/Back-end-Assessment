import express from 'express';
import cors from 'cors';

// Routes

import postsRoute from './routes/api/posts';
import pingRoute from './routes/api/ping';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api/ping', pingRoute);
app.use('/api/posts', postsRoute);

export default app;
