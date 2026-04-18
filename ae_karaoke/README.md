# 🎤 Karaoke Subtitle Pipeline
**Premiere Pro → After Effects カラオケ字幕自動生成パイプライン**

SRTファイルをJSONに変換し、After Effectsでカラオケ風（左から順に文字の色が変わる）字幕レイヤーを自動生成するツールセットです。

---

## 📁 ファイル構成

```
.
├── srt_to_karaoke_json.py   # SRT → JSON 変換スクリプト（Python）
├── karaoke_trackmate.jsx    # AE カラオケレイヤー自動生成スクリプト（ExtendScript）
└── README.md
```

---

## 🔧 動作環境

| ツール | バージョン |
|--------|-----------|
| Python | 3.8 以上 |
| After Effects | CC 2019 以上（ExtendScript対応） |
| Adobe Premiere Pro | 文字起こし・SRTエクスポート機能があるバージョン |

外部ライブラリは不要です（Python標準ライブラリのみ使用）。

---

## 🚀 使い方

### Step 1：Premiere Pro から SRT を書き出す

1. Premiere でシーケンスを開く
2. **ウィンドウ → テキスト → 文字起こし** で文字起こしを実行
3. 文字起こし結果を確認・修正
4. **ファイル → 書き出し → キャプション** を選択
5. ファイル形式：**SubRip 字幕形式（.srt）**、SRTスタイリング：**オフ** で書き出し

---

### Step 2：SRT → JSON 変換

ターミナルで以下を実行します。

```bash
python3 srt_to_karaoke_json.py 入力ファイル.srt 出力ファイル.json
```

**例：**
```bash
python3 srt_to_karaoke_json.py my_song.srt my_song_karaoke.json
```

#### オプション：色のカスタマイズ

色は RGB 各 0.0〜1.0 で指定します。

```bash
# ハイライト色をシアンに（デフォルトは黄色）
python3 srt_to_karaoke_json.py 曲.srt 曲.json --highlight-color 0.0 1.0 1.0

# ハイライト色をピンクに
python3 srt_to_karaoke_json.py 曲.srt 曲.json --highlight-color 1.0 0.4 0.7

# ベース色をグレーに変更
python3 srt_to_karaoke_json.py 曲.srt 曲.json --base-color 0.6 0.6 0.6
```

#### 出力JSONの構造（参考）

```json
[
  {
    "index": 1,
    "start_sec": 1.0,
    "end_sec": 3.5,
    "text": "こんにちは世界",
    "char_count": 7,
    "ms_per_char": 357.14,
    "highlight_color": [1.0, 0.9, 0.0],
    "base_color": [1.0, 1.0, 1.0],
    "char_timings": [ ... ]
  }
]
```

---

### Step 3：After Effects でカラオケレイヤーを自動生成

#### 事前設定（初回のみ）

AE のスクリプト実行権限を有効にします。

```
After Effects → 環境設定 → スクリプトとエクスプレッション
→「スクリプトによるファイルおよびネットワークへのアクセスを許可」にチェック
```

#### スクリプトの実行

1. After Effects でプロジェクトを開き、対象のコンポジションをアクティブにする
2. **ファイル → スクリプト → スクリプトファイルを実行...**
3. `karaoke_trackmate.jsx` を選択
4. ダイアログで Step 2 で生成した `.json` ファイルを指定
5. 完了メッセージが出たらOK

---

## 🎬 生成されるレイヤー構成

各字幕行につき **3レイヤー** が生成されます。

```
タイムライン（上から順）

  MATTE_1   白ソリッド  ScaleX: 0%→100% でアニメート ※非表示
  HL_1      黄テキスト  MATTE を Luma Matte として参照
  BASE_1    白テキスト  常時表示（未ハイライト部分）

  MATTE_2   ...（以下同様）
  HL_2
  BASE_2
```

**Track Matte方式**を採用しており、Text Animator APIを一切使わないためAEのバージョン差に影響されにくく安定しています。

---

## ✏️ タイミングの調整

### 個別に調整する

```
タイムラインで MATTE_xx を選択
→ キーボード「S」で Scale プロパティを表示
→ キーフレームをドラッグ
```

| やりたいこと | 操作 |
|---|---|
| 色変わり全体を遅らせる | 2つのキーフレームをまとめて右にドラッグ |
| 色変わりを早く終わらせる | 終点キーフレームを左に寄せる |
| ゆっくり色が変わるようにする | 2つのキーフレームの間隔を広げる |
| 一瞬で切り替わるようにする | 2つのキーフレームを同じ位置に重ねる |

### イージングをかける

キーフレームを右クリック → **キーフレーム補助 → イージーイーズ**

### 全行まとめて調整

タイムラインで `MATTE_` レイヤーを全選択 → `S` → 全キーフレームを選択してまとめてドラッグ

---

## 🎨 スタイルの変更

スクリプト冒頭の `CFG` オブジェクトを編集することでデフォルト値を変更できます。

```javascript
var CFG = {
    fontSize:   72,                    // フォントサイズ
    fontName:   "HiraginoSans-W6",     // フォント名（AE内表記）
    posYRatio:  0.82,                  // 縦位置（0=上端 / 1=下端）
    baseColor:  [1.0, 1.0, 1.0],      // ベース色（白）
    hlColor:    [1.0, 0.85, 0.0],     // ハイライト色（黄）
    fadeInDur:  0.08,                  // フェードイン秒数
    fadeOutDur: 0.08                   // フェードアウト秒数
};
```

AE上での変更は `BASE_xx` / `HL_xx` レイヤーの文字パネルから直接行うことも可能です。

---

## ⚠️ 既知の制限事項

- SRTは**行単位のタイムスタンプ**しか持たないため、文字単位のタイミングは行の尺を文字数で**均等分割**しています
- より精度の高い文字単位タイミングが必要な場合は [stable-ts](https://github.com/jianfch/stable-ts) との組み合わせを推奨します
- 日本語フォント名はAEの環境によって異なる場合があります。うまく適用されない場合は `fontName` をAEの文字パネルに表示されているフォント名に変更してください

---

## 📝 ライセンス

MIT License
