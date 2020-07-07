import 'react-app-polyfill/ie9';
import 'react-app-polyfill/stable';
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App0 from './App';
import App1 from './log';
import App2 from './App2';
import App3 from './App3';
import * as serviceWorker from './serviceWorker';

const Wrapper = () => {
  const [Apps] = useState([App1, App2, App3]);
  const [currentApp, setApp] = useState(1);
  return (
    <div>
      <button onClick={() => setApp(0)}>app1(audio+log)</button>
      <button onClick={() => setApp(1)}>app2(audio)</button>
      <button onClick={() => setApp(2)}>app3(audio+rxjs)</button>
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
