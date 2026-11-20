#!/usr/bin/env node
// 把 wiki/ 目录下的 Markdown 同步发布到 GitHub Wiki 仓库。
// 用法：node tools/publish-wiki.mjs
// 前置：Wiki 首页已在网页端创建（GitHub 限制，首次需手动点一次）。
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'wiki');
const repo =
  process.env.WIKI_REPO ||
  'https://github.com/zuo-qirun/lyrics-companion-match-rules.wiki.git';
const work = mkdtempSync(join(tmpdir(), 'lc-wiki-'));

if (!existsSync(source)) {
  console.error('未找到 wiki/ 目录');
  process.exit(1);
}

try {
  execFileSync('git', ['clone', '--depth', '1', repo, work], { stdio: 'inherit' });
  for (const name of readdirSync(source)) {
    if (name.endsWith('.md')) cpSync(join(source, name), join(work, name));
  }
  execFileSync('git', ['-C', work, 'add', '-A'], { stdio: 'inherit' });
  const status = execFileSync('git', ['-C', work, 'status', '--porcelain'], {
    encoding: 'utf8',
  });
  if (!status.trim()) {
    console.log('Wiki 内容无变化。');
  } else {
    execFileSync('git', ['-C', work, 'commit', '-m', 'Sync wiki pages from wiki/'], {
      stdio: 'inherit',
    });
    execFileSync('git', ['-C', work, 'push'], { stdio: 'inherit' });
    console.log('Wiki 已同步。');
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
