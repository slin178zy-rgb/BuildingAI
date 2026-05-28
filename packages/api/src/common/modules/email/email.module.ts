import { TypeOrmModule } from "@buildingai/db/@nestjs/typeorm";
import { EmailConfig } from "@buildingai/db/entities/email-config.entity";
import { Module } from "@nestjs/common";

import { EmailService } from "./services/email.service";

@Module({
    imports: [TypeOrmModule.forFeature([EmailConfig])],
    providers: [EmailService],
    exports: [EmailService],
})
export class EmailModule {}
