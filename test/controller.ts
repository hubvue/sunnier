import {
  Inject,
  Get,
  Post,
  Put,
  Delete,
  Controller
} from '../src/index'
import {UserInstance} from './constants'

@Inject(UserInstance)
@Controller()
export class UserController {
  private _user;
  constructor(user) {
    this._user = user;
  }
  @Get('/', {
    before: [before1, before2, before3],
    after: [after1, after2, after3]
  })
  async getUser(ctx: any, next: Function): Promise<any> {
    console.log('middle')
    const result = this._user.getUser(1);
    ctx.body = {
      code: 200,
      data: result
    };
    await next()
  }
}

async function before1(ctx, next) {
  console.log(1)
  await next()
}
async function before2(ctx, next) {
  console.log(2)
  await next()
}
async function before3(ctx, next) {
  console.log(3)
  await next()
}
async function after1(ctx, next) {
  console.log(4)
  await next()
}
async function after2(ctx, next) {
  console.log(5)
  await next()
}

async function after3(ctx, next) {
  console.log(6)
  await next()
}