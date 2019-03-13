import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import * as dotenv from 'dotenv';

@Module({
    imports: [MongooseModule.forRoot(dotenv.config().parsed.mongodbURI), UsersModule],
})
export class AppModule {}
