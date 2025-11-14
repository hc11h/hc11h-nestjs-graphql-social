import { Injectable } from '@nestjs/common';
import { Stats } from 'fs';
import { uptime } from 'process';
import { timestamp } from 'rxjs';

@Injectable()
export class AppService {
  getHello(): { status: number; message: string } {
    return {
      status: 200,
      message: 'OK',
    };
  }
  getHealth():Record<string, any> {
    return{
      status:200,
      uptime:process.uptime(),
      timestamp: new Date().toDateString(),
    }
  };
}


