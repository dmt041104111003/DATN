import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './guards';
import { AuthController as AgentAuthController } from './agent/auth.controller';
import { AuthController as EnterpriseAuthController } from './enterprise/auth.controller';
import { AgentAuthService } from './agent/auth.service';
import { AuthService } from './auth.service';
import { AuthService as EnterpriseAuthService } from './enterprise/auth.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [EnterpriseAuthController, AgentAuthController],
  providers: [AuthService, EnterpriseAuthService, AgentAuthService, JwtStrategy],
  exports: [AuthService, EnterpriseAuthService, AgentAuthService, JwtModule, PassportModule],
})
export class AuthModule {}
