import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { rowId } from 'drizzle-orm/sqlite-core/expressions';
import { DrizzleAsyncProvider } from '../../drizzle/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../drizzle/schema';
import { menuTable } from '../../drizzle/schema';
import { inArray, asc } from 'drizzle-orm';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigEnum } from '../../enum/config.enum';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwt: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(DrizzleAsyncProvider) private conn: NodePgDatabase<typeof schema>,
  ) {}

  // 登录
  async signIn(userName: string, password: string) {
    console.log(`[AUTH] Login attempt for user: ${userName}`);
    const res = await this.userService.findOneByUserName(userName);
    console.log(`[AUTH] findOneByUserName result:`, res);
    if (!res) {
      throw new ForbiddenException('用户不存在，请注册');
    }
    const isPasswordValid = await argon2.verify(res.password, password);
    if (!isPasswordValid) {
      // 为了安全不要明确告诉用户是用户名还是密码错误
      throw new ForbiddenException('用户名或密码错误');
    }
    // 生成token
    return await this.jwt.signAsync({
      userName: userName,
      roles: rowId,
      sub: res.id,
    });
  }
  async signup(userName: string, password: string) {
    // 调用 UserService 的 create 方法来注册用户
    await this.userService.create({
      userName,
      password,
      email: '',
      mobile: '13800000000',
      sex: 1,
      departmentId: 1,
      available: true,
      telephone: '',
      lastLoginTime: new Date(),
      createdTime: new Date(),
      roleId: [2], // 默认分配普通用户角色
    });
    return { message: '注册成功' };
  }
  async signOut() {
    await this.cacheManager.del(ConfigEnum.AUTH_CODE);
  }

  async getMenuByUserAuthCode(authCode: string[]) {
    const data = await this.conn
      .select()
      .from(menuTable)
      .where(inArray(menuTable.code, authCode))
      .orderBy(asc(menuTable.orderNum), asc(menuTable.id));
    return data;
  }
}
