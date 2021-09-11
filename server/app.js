import express from 'express';
import cors from 'cors';

// Routes
import ping from './api/ping';
import posts from './api/posts';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api/ping', ping);
app.use('/api/posts', posts);

export default app;
