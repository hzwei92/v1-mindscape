import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './index.css';
import { ApolloClient, ApolloProvider, createHttpLink, InMemoryCache, split } from '@apollo/client';
import { createRestartableClient } from './graphql/createRestartableClient';
import { DEV_SERVER_URI, DEV_WS_SERVER_URI } from './constants';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { BrowserRouter } from 'react-router-dom';

const wsClient = createRestartableClient({
  url: process.env.NODE_ENV === 'production'
    ? window.location.origin.replace(/^http/, 'ws') + '/graphql'
    : `${DEV_WS_SERVER_URI}/graphql`,
  connectionParams: () => {
    const cookies = document.cookie.split('; ');
    let authCookie;
    cookies.some(cookie => {
      authCookie = cookie.match(/^Authentication=.*$/);
      return !!authCookie;
    })
    if (authCookie && authCookie[0]) {
      return {
        Authentication: (authCookie[0] as string).split('=')[1]
      };
    }
    return {};
  },
});

const wsLink = new GraphQLWsLink(wsClient);

const httpLink = createHttpLink({
  uri: process.env.NODE_ENV === 'production'
    ? '/graphql'
    : `${DEV_SERVER_URI}/graphql`,
  credentials: process.env.NODE_ENV === 'production'
    ? 'same-origin'
    : 'include'
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ApolloProvider client={client}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ApolloProvider>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
