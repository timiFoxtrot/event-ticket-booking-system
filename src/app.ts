import express from 'express';
import bodyParser from 'body-parser';
import eventRoutes from './routes/event';
import { handleErrors } from './middlewares/error';

const app = express();

app.use(bodyParser.json());
app.use('/api', eventRoutes);

app.use(handleErrors);

export default app;
