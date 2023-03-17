import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

export const Database = MongooseModule.forRoot(process.env.DB_URL);
