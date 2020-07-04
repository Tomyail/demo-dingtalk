import React, { useEffect, useState } from 'react';
import request from './request';
import dd from 'dingtalk-jsapi';
import nx from '@feizheng/next-js-core2';
import './App.scss';

function App() {
  const [audio, setAudio] = useState({});
  useEffect(() => {
    const url = `https://dth-api-beta.alo7.com/api/v1/ding_talk/signature_config?url=${window.location.href.split('#')[0]}`;

    request(url).then(res => {
      var sign = Object.assign(res, {
        agentId: res.agentIds[0],
        debug: true,
        jsApiList: [
          'device.audio.startRecord',
          'device.audio.stopRecord',
          'device.audio.onRecordEnd',
          'device.audio.play',
        ]
      });

      dd.config(sign);
    })
  }, []);

  return (
    <div className="App">
      <p>
        <button className="btn" onClick={(e: any) => {
          dd.device.audio.startRecord({
            onSuccess: (res: any) => {
            }
          })
        }}>DD:开始录音</button>
      </p>

      <p>
        <button className="btn" onClick={(e: any) => {
          dd.device.audio.stopRecord({
            onSuccess: (res: any) => {
              alert(
                JSON.stringify(res)
              );
              setAudio(res);
            }
          })
        }}>DD:停止录音</button>
      </p>
      <p>
        <button className="btn" onClick={(e: any) => {
          dd.device.audio.play({
            localAudioId: nx.get(audio, 'mediaId')
          });
        }}>DD:播放录音</button>
      </p>
    </div>
  );
}

export default App;
