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
  const [recording, setRecording] = useState(false);
  const [looping, setLooping] = useState(false);

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
      <header className="status-loop">{looping ? '轮询中...' : '正常状态'}</header>
      <p>
        <button disabled={recording} className="btn" onClick={(e: any) => {
          dd.device.audio.startRecord({
            onSuccess: (res: any) => {
              setRecording(true);
              setCanPlay(false);
            }
          })
        }}>DD/Alo7:开始录音</button>
      </p>

      <p>
        <button disabled={!recording} className="btn" onClick={(e: any) => {
          dd.device.audio.stopRecord({
            onSuccess: (res: any) => {
              setAudio(res);
              setRecording(false);
              // alert('start read_aload_text!');
              fetch('https://app50100.eapps.dingtalkcloud.com/api/v1/audio/score?type=READ_ALOUD_TEXT', {
                method: 'POST',
                headers: {
                  corpid: 'ding41b4dab8436fe2ffa1320dcb25e91351',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  coreType: "en.sent.score",
                  exerciseId: "500059929",
                  mediaId: res.mediaId,
                  refText: "Mr Jones, this is Miss Green.",
                  url: res.remoteUrl
                })
              }).then(_ => {

                setLooping(true);
                var looptimer = setInterval(() => {
                  request(`https://app50100.eapps.dingtalkcloud.com/api/v1/audio/score/${res.mediaId}`).then(response => {
                    const { status, audioUrl } = response;
                    if (status === 'FINISHED') {
                      // cleartimer:
                      clearInterval(looptimer);
                      setLooping(false);
                      const instance = new Howl({
                        src: [audioUrl],
                        // autoplay: true,
                        html5: true,
                        loop: false,
                        volume: 1,
                        onend: function () {
                          console.log('Finished!');
                        }
                      });

                      // alert('audioUrl: \n' + audioUrl);

                      setSound(instance);

                      instance.once('load', function () {
                        setCanPlay(true);
                        // instance.play();
                      });

                    }
                  })
                  // end loop
                }, 200);


              });



            }
          })
        }}>DD/Alo7:停止录音</button>
      </p>
      <p>
        <button disabled={!canPlay} className="btn" onClick={(e: any) => {
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
