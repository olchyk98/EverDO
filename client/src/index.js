import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './libs/fontawesome';
import * as serviceWorker from './serviceWorker';

import { cookieControl } from './swissKnife';
import links from './links';
import client from './apollo';

import Nav from './assets/nav';
import Register from './assets/register';
import Home from './assets/home';

import { BrowserRouter, Switch, Redirect } from 'react-router-dom';
import { Route } from 'react-router';
import { ApolloProvider } from 'react-apollo';

const NeedleRoute = ({ path, condition, component: Component, redirect, ...settings }) => {
    return <Route path={ path } { ...settings } component={props => {
        if(condition) {
            return <Component { ...props } />
        } else {
            return <Redirect to={ redirect } />
        }
    }} />
}

ReactDOM.render((
    <ApolloProvider client={ client }>
        <BrowserRouter>
            <React.Fragment>
                {
                    (cookieControl.get("userdata")) ? (
                        <Nav />
                    ) : null
                }
                <Switch>
                    <NeedleRoute
                        path={ links["HOME_PAGE"].router }
                        condition={ cookieControl.get("userdata") }
                        component={ Home }
                        redirect={ links["REGISTER_PAGE"].router }
                        exact
                    />
                    <NeedleRoute
                        path={ links["REGISTER_PAGE"].router }
                        condition={ !cookieControl.get("userdata") }
                        component={ Register }
                        redirect={ links["HOME_PAGE"].router }
                        exact
                    />
                    <Redirect from="/" to={
                        (cookieControl.get("userdata")) ? (
                            links["HOME_PAGE"].router
                        ) : (
                            links["REGISTER_PAGE"].router
                        )
                    } />
                </Switch>
            </React.Fragment>
        </BrowserRouter>
    </ApolloProvider>
), document.getElementById('root'));
serviceWorker.unregister();
