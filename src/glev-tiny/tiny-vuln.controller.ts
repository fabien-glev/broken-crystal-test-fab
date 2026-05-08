/**
 * Glev tiny-vuln controller — minimal demo for fast local iteration.
 *
 * Only 2 sinks (exec + eval) to keep the LLM fan-out wallclock under
 * the 5-minute window of the ngrok free tunnel. Wired into AppModule so
 * the routes are reachable — both findings should be marked EXPLOITABLE.
 */
import { Body, Controller, Post, Query, UnauthorizedException } from '@nestjs/common';
import { exec } from 'child_process';

const ADMIN_KEY = 'glev-tiny-DO-NOT-USE-IN-PROD';

interface ExecBody {
  cmd: string;
}

interface FilterBody<T = unknown> {
  expr: string;
  items: T[];
}

@Controller('glev-tiny')
export class GlevTinyController {
  // CWE-78 — OS Command Injection
  @Post('exec')
  runShell(@Body() body: ExecBody, @Query('key') key?: string): Promise<string> {
    if (key !== ADMIN_KEY) throw new UnauthorizedException();
    return new Promise((resolve, reject) => {
      exec(body.cmd, (err, stdout) => (err ? reject(err) : resolve(stdout)));
    });
  }

  // CWE-94 — Code Injection via eval
  @Post('eval')
  applyFilter(@Body() body: FilterBody): unknown[] {
    return body.items.filter((item) =>
      Boolean(eval(`(${body.expr})(${JSON.stringify(item)})`))
    );
  }
}
