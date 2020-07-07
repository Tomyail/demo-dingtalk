import React, { useEffect, useState } from 'react';
import request from './request';
import dd from 'dingtalk-jsapi';
import nx from '@feizheng/next-js-core2';
import { Howl, Howler } from 'howler';
import './App.scss';

function copyToClipboard(text: string) {
    const input: any = document.createElement('input');
    input.style.position = 'fixed';
    input.style.opacity = 0;
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('Copy');
    document.body.removeChild(input);
};

function App() {
    const [audio, setAudio] = useState({});
    const [canPlay, setCanPlay] = useState(false);
    const [recording, setRecording] = useState(false);

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
                    'device.audio.download',
                    'device.audio.play',
                ]
            });

            dd.config(sign);
        })
    }, []);

    return (
        <div className="App">
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
                            setCanPlay(true);

                        }
                    })
                }}>DD/Alo7:停止录音</button>
            </p>
            <p>
                <button disabled={!canPlay} className="btn" onClick={(e: any) => {
                    const mediaId = nx.get(audio, 'mediaId');

                    dd.device.audio.download({
                        mediaId,
                        onSuccess: () => {
                            dd.device.audio.play({
                                localAudioId: nx.get(audio, 'mediaId')
                            });
                        }
                    })

                }}>DD:播放录音</button>
            </p>
        </div>
    );
}

export default App;
