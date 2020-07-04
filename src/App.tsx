import React, { useEffect } from 'react';
import request from './request';
import dd from 'dingtalk-jsapi';
import './App.scss';

declare var nx: any;


function App() {
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
          'device.audio.paly',
        ]
      });
      // alert(
      //   JSON.stringify(sign)
      // );
      dd.config(sign);
    })
  }, []);
  return (
    <div className="App">
      <p>
        <button className="btn" onClick={(e: any) => {
          dd.device.audio.startRecord({
            onSuccess: (res: any) => {
              console.log('start record!');
            }
          })
        }}>DD:开始录音</button>
      </p>

      <p>
        <button className="btn" onClick={(e: any) => {
          dd.device.audio.onRecordEnd({
            onSuccess: (res: any) => {
              alert(
                JSON.stringify(res)
              );
            }
          })
        }}>DD:停止录音</button>
      </p>
      <p>
        <button className="btn" onClick={(e: any) => {
          console.log('click!');
        }}>DD:播放录音</button>
      </p>
    </div>
  );
}

export default App;
