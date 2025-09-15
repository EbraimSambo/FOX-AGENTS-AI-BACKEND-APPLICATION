/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get } from '@nestjs/common';

@Controller()
export class TestController { 

    @Get()
    async test(){
        return ""
    }
}
