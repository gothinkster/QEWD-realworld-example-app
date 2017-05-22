import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import React from 'react';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';
import store from './store';
import agent from './agent';


import { QEWD, QEWDProvider } from 'react-qewd';

let qewd = QEWD({
  application: 'qewd-conduit', // application name
  log: true,
  url: 'http://178.62.26.29:8080'
})

import App from './components/App';
import Article from './components/Article';
import Editor from './components/Editor';
import Home from './components/Home';
import Login from './components/Login';
import Profile from './components/Profile';
import ProfileFavorites from './components/ProfileFavorites';
import Register from './components/Register';
import Settings from './components/Settings';

function ProviderContainer(props) {
  agent.init(qewd);
  console.log('provider container!');
  return (
    <Provider store={store}>
      <div>
        {
          props.qewdProviderState.registered ?
            <Router history={hashHistory}>
              <Route path="/" component={App}>
                <IndexRoute component={Home} />
                <Route path="login" component={Login} />
                <Route path="register" component={Register} />
                <Route path="editor" component={Editor} />
                <Route path="editor/:slug" component={Editor} />
                <Route path="article/:id" component={Article} />
                <Route path="settings" component={Settings} />
                <Route path="@:username" component={Profile} />
                <Route path="@:username/favorites" component={ProfileFavorites} /> 
              </Route>
            </Router>
          :
            <div>
              Please wait...
            </div>
        }
      </div>
    </Provider>
  )
}

ReactDOM.render((
  <QEWDProvider qewd={qewd}>
    <ProviderContainer />
  </QEWDProvider>
), document.getElementById('root'));
