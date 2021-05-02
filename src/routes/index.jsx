import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Redirect,
  Route
} from 'react-router-dom';
import _ from 'lodash';
import routes from './routesUrls';

const App = () => {
  return (
    <Router>
      <React.Suspense fallback={<div>Loading...</div>}>
        <Switch>
          { _.map(routes, (route) => {
            const Component = route.component;
            return (
              <Route key={route.path} path={route.path} exact={route.exact}>
                <Component path={route.path} />
              </Route>
            );
          })}
          <Route path="/" exact>
            <Redirect to="/home" />
          </Route>
          <Route path="*">
              <div>404</div>
          </Route>
        </Switch>
      </React.Suspense>
    </Router>
  );
};

export default App;
