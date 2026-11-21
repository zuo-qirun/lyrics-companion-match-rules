# 示例规则包

这些 JSON 可以直接在应用内「匹配规则 → 导入 JSON」使用，也可以复制到自己的规则包里。

| 文件 | 对应场景 | 用到的能力 |
| --- | --- | --- |
| echo-split-artist-title.json | 回声音乐：歌手名塞进标题，歌手字段是文件夹名 | regex 条件、extract 动作、stripSuffix |
| byd-numeric-suffix.json | 比亚迪车机：标题带（01）这类序号，本地 LRC 没有序号 | 正则条件、stripSuffix 默认规则 |
| numeric-suffix.json | 通用：标题末尾带（01）/(01)/【01】或「 - 01」「 01」等数字序号 | 正则条件、stripSuffix 自定义正则、trim |
| dftc-empty-artist-split.json | DFTC/通知栏：歌手为空，标题是「歌手 - 歌名」 | empty 条件、extract 动作 |
| lxmusic-artist-alias.json | LX Music：A-Lin / 黄霄雲 等艺名与本名不一致 | aliasArtist 动作 |

校验：

~~~
node tools/validate-rules.mjs
~~~
