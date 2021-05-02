/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

const HomeView = React.lazy(() => import('../views/Home/index'));

const routes = {
  home: {
    path: '/home',
    component: HomeView,
    roles: ['USER'],
    exact: false,
  },
};

export default routes;
