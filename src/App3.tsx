import React, { useEffect, useState, useRef } from 'react';
import request from './request';
import dd from 'dingtalk-jsapi';
import nx from '@feizheng/next-js-core2';
// import { Howl } from 'howler';
// import Wad from 'web-audio-daw';
import './App.scss';
import { fromCallback } from './from-callback';
import { mergeMap, timestamp, pairwise, map, scan } from 'rxjs/operators';
import { defer, from, interval, merge, of, Subscription } from 'rxjs';
import { loopFetch } from './loop-fetch';

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

const startRecord$ = (setTime, setRecording, setCanPlay) => {
  const recordTime = 30 * 1000;
  return fromCallback(dd.device.audio.startRecord).pipe(
    mergeMap(() => {
      const timer$ = interval(50).pipe(
        timestamp(),
        pairwise(),
        map(([a, b]) => {
          return b.timestamp - a.timestamp;
        }),
        scan((acc, cur) => acc - cur, recordTime),
        map((v) => {
          if (v > 0) {
            return setTime(v);
          } else {
            return setRecording(false);
          }
        })
      );
      return merge(
        defer(() => {
          setCanPlay(false);
          setRecording(true);
        }),
        timer$
      );
    })
  );
};
const stopRecord$ = (setAudio, setLooping, setCanPlay, stopRecord) => {
  return fromCallback(dd.device.audio.stopRecord).pipe(
    mergeMap((res: any) =>
      defer(async () => {
        setLooping(true);
        await fetch(
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
        );
        const loopResult = await loopFetch(
          () =>
            from(
              request(
                `https://app50100.eapps.dingtalkcloud.com/api/v1/audio/score/${res.mediaId}`
              )
            ),
          (res) => {
            return res.status === 'PROCESSING';
          },
          10000,
          1000
        ).toPromise();
        if (loopResult.status !== 'FINISHED') {
          if (loopResult === 'timeout') {
            throw new Error('查询评分结果超时');
          }
          throw new Error('评分结果异常');
        }

        const { audioUrl } = loopResult;
        setAudio({
          ...res,
          mp3: audioUrl,
        });
        setLooping(false);
        setCanPlay(true);
        stopRecord(false);
      })
    )
  );
};

let startRecord: Subscription;
let stopRecord: Subscription;
function App() {
  const [audio, setAudio] = useState({ mp3: '' });
  const [canPlay, setCanPlay] = useState(false);
  // const [sound, setSound] = useState({ play: nx.noop });
  const [recording, setRecording] = useState(false);
  const [looping, setLooping] = useState(false);
  const [leftTime, setTime] = useState(0);
  const audioRef = useRef(null);

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
    return () => {
      if (startRecord) {
        startRecord.unsubscribe();
      }
      if (stopRecord) {
        stopRecord.unsubscribe();
      }
    };
  }, []);

  return (
    <div className="App">
      <header className="status-loop">
        {looping ? '轮询中...' : '正常状态'}
      </header>
      {audio && (
        <audio
          onLoad={(e: any) => {
            alert('loaded!');
            setCanPlay(true);
            // setSound(audioRef.current);
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
            startRecord = startRecord$(
              setTime,
              setRecording,
              setCanPlay
            ).subscribe();
            // dd.device.audio.startRecord({
            //   onSuccess: (res: any) => {
            //     setRecording(true);
            //     setCanPlay(false);
            //   },
            // });
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
            startRecord.unsubscribe();
            stopRecord = stopRecord$(
              setAudio,
              setLooping,
              setCanPlay,
              setRecording
            ).subscribe();
            // dd.device.audio.stopRecord({
            //   onSuccess: (res: any) => {
            //     setAudio(res);
            //     setRecording(false);
            //     setLooping(true);
            //     // alert('start read_aload_text!');
            //     fetch(
            //       'https://app50100.eapps.dingtalkcloud.com/api/v1/audio/score?type=READ_ALOUD_TEXT',
            //       {
            //         method: 'POST',
            //         headers: {
            //           corpid: 'ding41b4dab8436fe2ffa1320dcb25e91351',
            //           'Content-Type': 'application/json',
            //         },
            //         body: JSON.stringify({
            //           coreType: 'en.sent.score',
            //           exerciseId: '500059929',
            //           mediaId: res.mediaId,
            //           refText: 'Mr Jones, this is Miss Green.',
            //           url: res.remoteUrl,
            //         }),
            //       }
            //     ).then((_) => {
            //       var looptimer = setInterval(() => {
            //         request(
            //           `https://app50100.eapps.dingtalkcloud.com/api/v1/audio/score/${res.mediaId}`
            //         ).then((response) => {
            //           const { status, audioUrl } = response;
            //           setAudio({
            //             ...res,
            //             mp3: audioUrl,
            //           });
            //           if (status === 'FINISHED') {
            //             // cleartimer:
            //             clearInterval(looptimer);
            //             setLooping(false);
            //             setCanPlay(true);
            //           }
            //         });
            //         // end loop
            //       }, 200);
            //     });
            //   },
            // });
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

      <p>
        <button
          disabled={!canPlay}
          className="btn btn-alo7"
          onClick={(e: any) => {
            if (audioRef && audioRef.current) {
              nx.get(audioRef, 'current').play();
            }
          }}
        >
          Alo7:播放录音
        </button>
      </p>

      <hr />
      <p>
        <div>{leftTime}</div>

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
