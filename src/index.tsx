import 'react-app-polyfill/ie9';
import 'react-app-polyfill/stable';
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App1 from './log';
import App4 from './App4';
import * as serviceWorker from './serviceWorker';

const Wrapper = () => {
  const [Apps] = useState([App1, App4]);
  const [currentApp, setApp] = useState(1);
  return (
    <div>
      <button
        onClick={() => {
          console.log('切换到 demo 0');
          setApp(0);
        }}
      >
        app1(audio+log)
      </button>
      <button
        onClick={() => {
          console.log('切换到 demo 1');
          setApp(1);
        }}
      >
        app2(native+log)
      </button>
      {`当前选择 ${currentApp}`}
      {React.createElement(Apps[currentApp])}
    </div>
  );
};
ReactDOM.render(
  <React.StrictMode>
    <Wrapper />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
