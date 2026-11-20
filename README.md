# Lyrics Companion · 元数据匹配规则

这里是 [Lyrics Companion](https://github.com/zuo-qirun/Lyrics-Companion) 的匹配规则配套仓库（模板）：  
用 JSON 描述「怎样从播放器给的标题/歌手/专辑里，清洗出真正用于搜歌词的歌名与歌手」。

规则数据只保存在应用服务器，**不提交到本仓库**；本仓库只放格式文档、JSON Schema、可直接复制的示例规则包和提交/审核说明。

## 相关链接

- 文档 Wiki：https://github.com/zuo-qirun/lyrics-companion-match-rules/wiki
- 示例规则包：examples/
- JSON Schema：schema/rule-pack.schema.json
- 提交规则（Issue Form）：https://github.com/zuo-qirun/Lyrics-Companion/issues/new?template=match_rule.yml
- 主仓库：https://github.com/zuo-qirun/Lyrics-Companion
- 线上规则市场目录：https://lyrics-companion.zuoqirun.top/api/match-rules/catalog.json

## 一分钟了解

规则包是一个 JSON 文件，包含若干条规则；每条规则由 **when 条件**（全部满足才执行）和 **then 动作**（依次执行）组成：

~~~json
{
  "schemaVersion": 1,
  "id": "echo.split-artist-title",
  "name": "回声：歌手塞进歌名",
  "version": 1,
  "author": "your-name",
  "description": "把「歌手 - 歌名」拆开，并去掉末尾的（01）序号",
  "minVersionCode": 0,
  "scope": {"packages": ["com.example.echo"], "sources": []},
  "rules": [
    {
      "id": "split-dash",
      "when": [
        {"field": "title", "op": "regex", "value": "(.{1,40})\\s*[-–—]\\s*(.{1,80})"},
        {"field": "artist", "op": "equalsAny", "value": ["车载音乐", "未知歌手"]}
      ],
      "then": [
        {"type": "extract", "pattern": "(.{1,40})\\s*[-–—]\\s*(.{1,80})",
         "targets": {"artist": 1, "title": 2}}
      ]
    },
    {
      "id": "strip-index",
      "when": [{"field": "title", "op": "regex", "value": "[（(]\\d{1,3}[)）]\\s*$"}],
      "then": [{"type": "stripSuffix"}]
    }
  ]
}
~~~

要点：

- 条件对象用 <code>op</code>，动作对象用 <code>type</code>（这是最容易写错的地方）。
- 正则只用编号组 <code>(...)</code>，**不要用命名组** <code>(?&lt;name&gt;...)</code>，也不要用反向引用。
- 原始元数据永远是第一候选；规则只负责追加清洗后的候选，不会覆盖播放器原始值。
- 个人规则可以只在本地生效；提交到市场后由管理员审核，通过后其他用户可一键下载启用。

## Wiki 文档

Wiki 正文源文件维护在本仓库的 [`wiki/`](wiki/) 目录（`Home.md`、`_Sidebar.md` 及各专题页），发布时同步到 GitHub Wiki：

```powershell
node tools/publish-wiki.mjs
```

首次使用前需在 Wiki 网页端点一次「Create the first page」（GitHub 不允许通过 API 创建 Wiki 仓库）：https://github.com/zuo-qirun/lyrics-companion-match-rules/wiki/_new

## 目录结构

~~~
README.md                 本文件
CONTRIBUTING.md           贡献与审核说明
examples/                 可直接导入应用的示例规则包
schema/rule-pack.schema.json  规则包 JSON Schema
tools/validate-rules.mjs  示例校验脚本（CI 使用）
tools/publish-wiki.mjs    将 wiki/ 同步发布到 GitHub Wiki
wiki/                     Wiki 正文源文件（Home、_Sidebar 及各专题页）
~~~

## 许可证

与主项目一致，GPL-3.0。见 LICENSE。
