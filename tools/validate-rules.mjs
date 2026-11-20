import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const examplesDir = path.join(root, "examples");
const ACTIONS = new Set(["extract", "replace", "set", "clear", "trim", "stripSuffix", "aliasArtist"]);
const FIELDS = new Set(["title", "artist", "album", "package", "source"]);
const WRITABLE = new Set(["title", "artist", "album"]);
const SOURCES = new Set(["netease", "qqmusic", "kugou", "kuwo", "soda", "migu"]);
const CONDITION_OPS = new Set(["equals", "equalsAny", "contains", "containsAny", "startsWith", "endsWith", "regex", "empty"]);
const ID_PATTERN = /^[a-z0-9][a-z0-9._-]{2,63}$/;

const errors = [];
function fail(file, message) {
  errors.push(file + "：" + message);
}

function checkRegex(file, label, pattern, patternCount) {
  if (typeof pattern !== "string") return fail(file, label + " 必须是字符串");
  if (pattern.length > 200) return fail(file, label + " 超过 200 字符");
  if (pattern.includes("(?<")) return fail(file, label + " 不能使用命名捕获组");
  for (const digit of ["1", "2", "3", "4", "5", "6", "7", "8", "9"]) {
    if (pattern.includes("\\" + digit)) return fail(file, label + " 不能使用反向引用");
  }
  for (const nested of ["(.*)+", "(.+)+", "(.*)*", "(.+)*", "(.{0,})+", "(.{1,})+"]) {
    if (pattern.includes(nested)) return fail(file, label + " 不能使用嵌套量词");
  }
  patternCount.count += 1;
  if (patternCount.count > 64) fail(file, label + " 正则数量超过 64");
}

function validatePack(file, pack) {
  if (!pack || typeof pack !== "object") return fail(file, "必须是 JSON 对象");
  if (pack.schemaVersion !== 1) fail(file, "schemaVersion 必须为 1");
  if (typeof pack.id !== "string" || !ID_PATTERN.test(pack.id)) fail(file, "id 不合法");
  if (typeof pack.name !== "string" || pack.name.length < 1 || pack.name.length > 40) fail(file, "name 长度必须为 1–40");
  if (!Number.isInteger(pack.version) || pack.version < 1 || pack.version > 9999) fail(file, "version 必须为 1–9999 整数");
  if (pack.minVersionCode !== undefined && (!Number.isInteger(pack.minVersionCode) || pack.minVersionCode < 0 || pack.minVersionCode > 999999)) {
    fail(file, "minVersionCode 必须为 0–999999 整数");
  }
  const scope = pack.scope || {};
  if (scope.packages && (!Array.isArray(scope.packages) || scope.packages.length > 20)) fail(file, "scope.packages 必须是最多 20 项的数组");
  if (scope.sources && (!Array.isArray(scope.sources) || scope.sources.some((s) => !SOURCES.has(s)))) fail(file, "scope.sources 取值不合法");
  if (!Array.isArray(pack.rules) || pack.rules.length < 1 || pack.rules.length > 64) fail(file, "rules 数量必须为 1–64");
  if (Buffer.byteLength(JSON.stringify(pack), "utf8") > 32 * 1024) fail(file, "整包超过 32KB");
  const ids = new Set();
  const patterns = {count: 0};
  for (const rule of pack.rules || []) {
    if (!rule || typeof rule !== "object") { fail(file, "规则必须是对象"); continue; }
    if (typeof rule.id !== "string" || rule.id.length < 1 || rule.id.length > 40) fail(file, "规则 id 长度必须为 1–40");
    else if (ids.has(rule.id)) fail(file, "规则 id 重复：" + rule.id);
    else ids.add(rule.id);
    if (rule.when !== undefined && (!Array.isArray(rule.when) || rule.when.length > 6)) fail(file, "规则 " + rule.id + " 的 when 最多 6 个条件");
    for (const condition of rule.when || []) {
      if (!FIELDS.has(condition.field)) fail(file, "条件 field 不合法：" + condition.field);
      if (!CONDITION_OPS.has(condition.op)) fail(file, "条件 op 不合法：" + condition.op);
      if (condition.op === "regex") checkRegex(file, "规则 " + rule.id + " 的条件正则", condition.value, patterns);
    }
    if (!Array.isArray(rule.then) || rule.then.length < 1 || rule.then.length > 8) fail(file, "规则 " + rule.id + " 的 then 数量必须为 1–8");
    for (const action of rule.then || []) {
      if (action.op !== undefined) fail(file, "规则 " + rule.id + " 的动作必须用 type 字段，不能写 op");
      if (!ACTIONS.has(action.type)) fail(file, "规则 " + rule.id + " 的动作 type 不合法：" + action.type);
      if (action.field !== undefined && !WRITABLE.has(action.field)) fail(file, "动作 field 只能作用于 title/artist/album");
      if (action.pattern !== undefined) checkRegex(file, "规则 " + rule.id + " 的动作正则", action.pattern, patterns);
      if (action.type === "extract") {
        const targets = action.targets || {};
        const keys = Object.keys(targets);
        if (keys.length < 1 || keys.length > 3 || keys.some((key) => !WRITABLE.has(key))) fail(file, "extract targets 只能作用于 title/artist/album");
        for (const key of keys) {
          if (!Number.isInteger(targets[key]) || targets[key] < 1 || targets[key] > 9) fail(file, "extract 组号必须是 1–9");
        }
      }
      if (action.type === "aliasArtist") {
        const entries = Object.entries(action.map || {});
        if (entries.length < 1 || entries.length > 50) fail(file, "aliasArtist map 必须包含 1–50 项");
      }
    }
  }
}

const names = fs.readdirSync(examplesDir).filter((name) => name.endsWith(".json"));
if (names.length === 0) {
  fail("examples", "没有找到示例规则包");
}
for (const name of names) {
  const file = "examples/" + name;
  try {
    validatePack(file, JSON.parse(fs.readFileSync(path.join(examplesDir, name), "utf8")));
  } catch (error) {
    fail(file, "JSON 解析失败：" + error.message);
  }
}

if (errors.length > 0) {
  console.error("校验失败：");
  for (const error of errors) console.error("- " + error);
  process.exit(1);
}
console.log("校验通过：" + names.length + " 个示例规则包");
