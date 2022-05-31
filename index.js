import express, {json} from 'express';
import cors from 'cors';
import usersRouter from './routes/user-routes.js';
import authRouter from './routes/auth-routes.js';
import dataRouter from './routes/aoi-routes.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { dirname,join } from 'path';
import { fileURLToPath } from 'url';


dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(json());
app.use(cookieParser());
app.use('/', express.static(join(__dirname, '../uploads')))
app.use('/api/auth',authRouter);
app.use('/api/users', usersRouter);
app.use('/api/data', dataRouter);


app.listen(PORT, ()=> {
  console.log(`Server is listening on port:${PORT}`);
})