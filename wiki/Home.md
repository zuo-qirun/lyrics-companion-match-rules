# 匹配规则文档

Lyrics Companion 用「匹配规则」把不规范的播放器元数据清洗成可用于搜索的歌名/歌手。规则是 JSON 数据，不需要更新 APK。

## 快速开始

1. 在应用内打开「匹配规则」，选择当前播放器曲目。
2. 用「图形向导」新增条件与动作，或切到「JSON 代码」直接写。
3. 预览清洗结果，保存并启用；需要共享时提交到规则市场。
4. 没有安装应用时，用主仓库的 Issue 表单提交：  
   https://github.com/zuo-qirun/Lyrics-Companion/issues/new?template=match_rule.yml

## 文档目录

- [[规则格式]]：规则包字段、作用域与版本
- [[条件与动作]]：when 条件与 then 动作的完整参考
- [[示例库]]：回声、比亚迪、DFTC、LX Music 场景
- [[提交与审核]]：应用内提交、Issue 提交与审核标准
- [[版本与兼容]]：minVersionCode、版本号与降级策略
- [[常见问题]]：写错动作字段、正则安全、误伤处理

## 仓库与接口

- 模板仓库：https://github.com/zuo-qirun/lyrics-companion-match-rules
- 示例规则包：https://github.com/zuo-qirun/lyrics-companion-match-rules/tree/main/examples
- JSON Schema：https://github.com/zuo-qirun/lyrics-companion-match-rules/blob/main/schema/rule-pack.schema.json
- 规则市场目录：https://lyrics-companion.zuoqirun.top/api/match-rules/catalog.json
