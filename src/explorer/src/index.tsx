import * as React from 'react';
import * as ReactDOM from 'react-dom';
import 'vis/dist/vis-network.min.css';
import 'vis/index-network';
import App from './components/App';
import './index.css';

ReactDOM.render(
  <App />,
  document.getElementById('root') as HTMLElement
);
