import React, { useEffect, useState } from 'react';
import request from './request';
import dd from 'dingtalk-jsapi';
import nx from '@feizheng/next-js-core2';
import { Howl } from 'howler';
import './App.scss';

function App() {
  const [audio, setAudio] = useState({});
  const [canPlay, setCanPlay] = useState(false);
  const [sound, setSound] = useState({ play: nx.noop });

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
      <header>
        Audio Data: {JSON.stringify(audio)};
      </header>
      <p>
        <button className="btn" onClick={(e: any) => {
          dd.device.audio.startRecord({
            onSuccess: (res: any) => {
            }
          })
        }}>DD/Alo7:开始录音</button>
      </p>

      <p>
        <button className="btn" onClick={(e: any) => {
          dd.device.audio.stopRecord({
            onSuccess: (res: any) => {
              setAudio(res);
              request('https://app50100.eapps.dingtalkcloud.com/api/v1/audio/score/%40lATPGpNyb46GgdHOCwNDls58ABDa').then(res => {
                // alert(
                //   JSON.stringify(res)
                // );
                const { status, audioUrl } = res;
                if (status === 'FINISHED') {
                  const sound = new Howl({
                    html5: false,
                    src: [audioUrl],
                    // autoplay: true,
                    // loop: true,
                    volume: 1
                  });

                  alert('audioUrl' + audioUrl);

                  setSound(sound);

                  sound.once('load', function () {
                    setCanPlay(true);
                  });

                }
              })
            }
          })
        }}>DD/Alo7:停止录音</button>
      </p>
      <p>
        <button className="btn" onClick={(e: any) => {
          dd.device.audio.play({
            localAudioId: nx.get(audio, 'mediaId')
          });
        }}>DD:播放录音</button>
      </p>

      <hr />

      <p>
        <button disabled={!canPlay} className="btn btn-alo7" onClick={(e: any) => {
          sound && sound.play();
        }}>Alo7:播放录音</button>
      </p>
    </div>
  );
}

export default App;
