// ============================================================
// karaoke_trackmate.jsx
// After Effects カラオケ字幕 — Track Matte ワイプ方式
//
// Shape keyframe / Text Animator API を一切使わない最安定版
//
// 仕組み（各字幕行につき3レイヤー構成）:
//   [1] MATTE_xx  白ソリッド: ScaleX 0→100% でアニメート（左から右へ）
//   [2] HL_xx     黄テキスト: 上のMATTEをLuma Matteとして参照
//   [3] BASE_xx   白テキスト: 常時表示（まだ歌っていない部分）
// ============================================================

(function () {

    // ---- JSON polyfill (ExtendScript ES3) ----
    if (typeof JSON === "undefined") { JSON = {}; }
    if (typeof JSON.parse !== "function") {
        JSON.parse = function (s) {
            if (/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(
                    s.replace(/"(\\.|[^"\\])*"/g, "")))
                throw new SyntaxError("JSON parse error");
            return eval("(" + s + ")");
        };
    }
    // ---- polyfill end ----

    // ---- 設定 ----
    var CFG = {
        fontSize:   72,
        fontName:   "HiraginoSans-W6",
        posYRatio:  0.82,
        baseColor:  [1.0, 1.0, 1.0],
        hlColor:    [1.0, 0.85, 0.0],
        fadeInDur:  0.08,
        fadeOutDur: 0.08
    };

    // ---- 前提チェック ----
    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) {
        alert("コンポジションをアクティブにして実行してください。");
        return;
    }

    // ---- JSON ファイル選択 ----
    var jf = File.openDialog("カラオケJSONを選択", "JSON:*.json,All:*.*");
    if (!jf) return;
    jf.encoding = "UTF-8";
    jf.open("r");
    var raw = jf.read();
    jf.close();
    if (raw.charCodeAt(0) === 0xFEFF) raw = raw.substring(1);

    var caps;
    try { caps = JSON.parse(raw); }
    catch (e) { alert("JSON解析エラー:\n" + e.message); return; }
    if (!caps || !caps.length) { alert("データがありません。"); return; }

    app.beginUndoGroup("Karaoke TrackMatte");

    var W    = comp.width;
    var H    = comp.height;
    var fps  = comp.frameRate;
    var posY = H * CFG.posYRatio;

    function snap(sec) { return Math.round(sec * fps) / fps; }

    // ---- テキストスタイル設定ヘルパー ----
    function styleText(layer, color) {
        var sp = layer.property("ADBE Text Properties")
                      .property("ADBE Text Document");
        var td = sp.value;
        td.resetCharStyle();
        td.fontSize      = CFG.fontSize;
        td.fillColor     = color;
        td.applyStroke   = false;
        td.font          = CFG.fontName;
        td.justification = ParagraphJustification.CENTER_JUSTIFY;
        sp.setValue(td);
    }

    // ---- Opacity フェード設定ヘルパー ----
    function setFade(layer, startSec, endSec) {
        var dur = endSec - startSec;
        var fi  = Math.min(CFG.fadeInDur,  dur * 0.15);
        var fo  = Math.min(CFG.fadeOutDur, dur * 0.15);
        var op  = layer.property("ADBE Transform Group").property("ADBE Opacity");
        op.setValueAtTime(startSec,       0);
        op.setValueAtTime(startSec + fi,  100);
        op.setValueAtTime(endSec   - fo,  100);
        op.setValueAtTime(endSec,         0);
    }

    // ---- 各キャプション処理 ----
    var okCount  = 0;
    var errCount = 0;

    for (var i = 0; i < caps.length; i++) {
        var cap      = caps[i];
        var startSec = snap(cap.start_sec);
        var endSec   = snap(cap.end_sec);
        var durSec   = endSec - startSec;
        var txt      = cap.text;
        var idx      = cap.index || (i + 1);

        if (durSec <= 0 || !txt) continue;

        try {
            // --------------------------------------------------
            // レイヤー追加順（後から追加したものほど上に来る）
            // 最終的な上→下の順: MATTE → HL → BASE
            // --------------------------------------------------

            // ③ BASE レイヤー（白テキスト・最下層）
            var baseLayer = comp.layers.addText(txt);
            baseLayer.name      = "BASE_" + idx;
            baseLayer.startTime = startSec;
            baseLayer.outPoint  = endSec;
            baseLayer.label     = 6;
            styleText(baseLayer, CFG.baseColor);
            baseLayer.property("ADBE Transform Group")
                     .property("ADBE Position")
                     .setValue([W / 2, posY]);
            setFade(baseLayer, startSec, endSec);

            // ② HL レイヤー（黄テキスト・BASEの上）
            var hlLayer = comp.layers.addText(txt);
            hlLayer.name      = "HL_" + idx;
            hlLayer.startTime = startSec;
            hlLayer.outPoint  = endSec;
            hlLayer.label     = 3;
            styleText(hlLayer, CFG.hlColor);
            hlLayer.property("ADBE Transform Group")
                   .property("ADBE Position")
                   .setValue([W / 2, posY]);
            setFade(hlLayer, startSec, endSec);

            // ① MATTE レイヤー（白ソリッド・HL の上）
            //    ScaleX: 0→100% で左から右へワイプ
            var matteLayer = comp.layers.addSolid(
                [1.0, 1.0, 1.0],   // 白
                "MATTE_" + idx,
                W, H, 1.0          // コンポと同サイズ
            );
            matteLayer.startTime = startSec;
            matteLayer.outPoint  = endSec;
            matteLayer.label     = 1;

            // アンカーポイントをソリッドの左端中央に移動
            var anchor = matteLayer.property("ADBE Transform Group")
                                   .property("ADBE Anchor Point");
            anchor.setValue([0, H / 2]);

            // ポジションも左端に合わせる
            var pos = matteLayer.property("ADBE Transform Group")
                                .property("ADBE Position");
            pos.setValue([0, H / 2]);

            // ScaleX: startSec→0%, endSec→100% (リニア)
            var scale = matteLayer.property("ADBE Transform Group")
                                  .property("ADBE Scale");
            scale.setValueAtTime(startSec, [0,   100, 100]);
            scale.setValueAtTime(endSec,   [100, 100, 100]);

            var ks = scale.nearestKeyIndex(startSec);
            var ke = scale.nearestKeyIndex(endSec);
            scale.setInterpolationTypeAtKey(ks, KeyframeInterpolationType.LINEAR);
            scale.setInterpolationTypeAtKey(ke, KeyframeInterpolationType.LINEAR);

            // MATTE を非表示（Matteとして使うだけ）
            matteLayer.enabled = false;

            // HL に Track Matte（Luma Matte）を設定
            // AEでは直上のレイヤーがMatteになる
            hlLayer.trackMatteType = TrackMatteType.LUMA;

            okCount++;

        } catch (err) {
            errCount++;
        }
    }

    app.endUndoGroup();

    var msg = "完了！ " + okCount + " 件処理しました。";
    if (errCount > 0) msg += "\n⚠️ " + errCount + " 件エラー";
    msg += "\n\n【構成】各字幕 = MATTE + HL + BASE の3レイヤー";
    msg += "\n\n【調整】";
    msg += "\n・フォント/色: BASE_xx / HL_xx の文字パネル";
    msg += "\n・縦位置: BASE/HL の Position Y";
    msg += "\n・スピード: MATTE_xx の Scale キーフレーム";
    alert(msg);

})();
