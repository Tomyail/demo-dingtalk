import React, { useEffect, useState, useRef } from 'react';
import request from './request';
import dd from 'dingtalk-jsapi';
import nx from '@feizheng/next-js-core2';
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
  const [audio, setAudio] = useState({ mp3: '' });
  const [canPlay, setCanPlay] = useState(false);
  // const [sound, setSound] = useState({ play: nx.noop });
  const [recording, setRecording] = useState(false);
  const [looping, setLooping] = useState(false);
  const audioRef = useRef(null);

  let startTime = 0;

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
      <header className="status-loop">
        {looping ? '轮询中...' : '正常状态'}
      </header>
      {audio && (
        <audio
          onLoadedMetadata={(e) => {
            //@ts-ignore
            console.log('mp3文件获取的时长', audioRef.current.duration * 1000);
           
          }}
          className="react-audio"
          hidden
          ref={audioRef}
          src={audio.mp3}
        >
          NOT SUPPORT AUDIO.
        </audio>
      )}
      <p>
        <button
          disabled={recording}
          className="btn"
          onClick={(e: any) => {
            console.log('====================================\n');
            if (audioRef.current) {
              //@ts-ignore
              audioRef.current.pause();
            }
            x = Date.now();
            dd.device.audio.startRecord({
              onSuccess: (res: any) => {
                startTime = Date.now() - x;
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
                setLooping(true);
                // alert('start read_aload_text!');
                fetch(
                  'https://app50100.eapps.dingtalkcloud.com/api/v1/audio/score?type=READ_ALOUD_TEXT',
                  {
                    method: 'POST',
                    headers: {
                      corpid: 'ding41b4dab8436fe2ffa1320dcb25e91351',
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      coreType: 'en.sent.score',
                      exerciseId: '500059929',
                      mediaId: res.mediaId,
                      refText: 'Mr Jones, this is Miss Green.',
                      url: res.remoteUrl,
                    }),
                  }
                ).then((_) => {
                  var looptimer = setInterval(() => {
                    request(
                      `https://app50100.eapps.dingtalkcloud.com/api/v1/audio/score/${res.mediaId}`
                    ).then((response) => {
                      const { status, audioUrl } = response;
                      setAudio({
                        ...res,
                        mp3: audioUrl,
                      });
                      if (status === 'FINISHED') {
                        // cleartimer:
                        clearInterval(looptimer);
                        setLooping(false);
                        setCanPlay(true);
                      }
                    });
                    // end loop
                  }, 200);
                });
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
            console.log('点击播放 native 声音')
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

      <p>
        <button
          disabled={!canPlay}
          className="btn btn-alo7"
          onClick={(e: any) => {
            if (audioRef && audioRef.current) {
              console.log('点击播放 audio 声音');
              nx.get(audioRef, 'current').play();
            }
          }}
        >
          Alo7:播放录音
        </button>
      </p>

      <hr />
      <p>
        <button
          className="btn"
          disabled={!canPlay}
          onClick={(e: any) => {
            copyToClipboard(JSON.stringify(audio));
          }}
        >
          复制 Audio 链接
        </button>
      </p>
    </div>
  );
}

export default App;
