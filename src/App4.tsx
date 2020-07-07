import React, { useEffect, useState } from 'react';
import request from './request';
import dd from 'dingtalk-jsapi';
import nx from '@feizheng/next-js-core2';
import { Howl, Howler } from 'howler';
import './App.scss';

var x;
function copyToClipboard(text: string) {
  const input: any = document.createElement('input');
  input.style.position = 'fixed';
  input.style.opacity = 0;
  input.value = text;
  document.body.appendChild(input);
  input.select();
  document.execCommand('Copy');
  document.body.removeChild(input);
}

function App() {
  const [audio, setAudio] = useState({});
  const [canPlay, setCanPlay] = useState(false);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    const url = `https://dth-api-beta.alo7.com/api/v1/ding_talk/signature_config?url=${
      window.location.href.split('#')[0]
    }`;

    request(url).then((res) => {
      var sign = Object.assign(res, {
        agentId: res.agentIds[0],
        debug: true,
        jsApiList: [
          'device.audio.startRecord',
          'device.audio.stopRecord',
          'device.audio.onRecordEnd',
          'device.audio.download',
          'device.audio.play',
        ],
      });

      dd.config(sign);
    });
  }, []);

  return (
    <div className="App">
      <p>
        <button
          disabled={recording}
          className="btn"
          onClick={(e: any) => {
            console.log('====================================\n');
            x = Date.now();
            dd.device.audio.startRecord({
              onSuccess: (res: any) => {
                const startTime = Date.now() - x;
                console.log('开始录音到收到录音成功的耗时(a):', startTime);
                x = Date.now();

                setRecording(true);
                setCanPlay(false);
              },
            });
          }}
        >
          DD/Alo7:开始录音
        </button>
      </p>

      <p>
        <button
          disabled={!recording}
          className="btn"
          onClick={(e: any) => {
            var expectRecordTime = Date.now() - x;
            console.log('成功开始录音到准备停止录音耗时(b):', expectRecordTime);
            x = Date.now();
            dd.device.audio.stopRecord({
              onSuccess: (res: any) => {
                console.log(
                  '准备停止录音到收到录音停止成功耗时(c):',
                  Date.now() - x
                );
                x = Date.now();
                console.log('钉钉返回的实际录音时长(d):', res.duration * 1000);
                console.warn(
                  '理论录音时长 和实际录音时长的差值(e = b - d):',
                  expectRecordTime - res.duration * 1000
                );

                setAudio(res);
                setRecording(false);
                setCanPlay(true);
              },
            });
          }}
        >
          DD/Alo7:停止录音
        </button>
      </p>
      <p>
        <button
          disabled={!canPlay}
          className="btn"
          onClick={(e: any) => {
            const mediaId = nx.get(audio, 'mediaId');

            dd.device.audio.download({
              mediaId,
              onSuccess: () => {
                dd.device.audio.play({
                  localAudioId: nx.get(audio, 'mediaId'),
                });
              },
            });
          }}
        >
          DD:播放录音
        </button>
      </p>
    </div>
  );
}

export default App;
