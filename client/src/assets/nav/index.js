import React, { Component } from 'react';
import './main.css';

import { gql } from 'apollo-boost';

import { cookieControl } from '../../swissKnife';
import placeholder from '../__forall__/placeholder.gif';
import { apiPath } from '../../apiPath';
import client from '../../apollo';
import links from '../../links';

class Button extends Component {
    render() {
        return(
            <button className={ `mo-nav-menu-btn definp${ (!this.props.active) ? "" : " active" }` }>
                { this.props.icon }
            </button>
        );
    }
}

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            user: false
        }
    }

    componentDidMount() {
        let { id, authToken } = cookieControl.get("userdata");

        client.query({
            query: gql`
                query($id: ID!, $authToken: String!) {
                    user(id: $id, authToken: $authToken) {
                        id,
                        avatar,
                        name
                    }
                }
            `,
            variables: {
                id, authToken
            }
        }).then(({ data: { user } }) => {
            if(!user) return null; // !PX: Show error message

            this.setState(() => ({
                user
            }));
        });
    }

    render() {
        return(
            <div className="mo-nav">
                <div className="mo-nav-menu mo-nav-section">
                    <div className="mo-nav-menu-logo definp"><i className="fas fa-toggle-on" /></div>
                    {
                        [
                            {
                                icon: <i className="fas fa-home" />,
                                url: links["HOME_PAGE"].absolute
                            },
                            {
                                icon: <i className="fas fa-trash" />
                            },
                            {
                                icon: <i className="fas fa-cog" />
                            },
                            {
                                icon: <i className="fas fa-door-closed" />
                            }
                        ].map(({ icon, url }, index) => (
                            <Button
                                key={ index }
                                icon={ icon }
                                active={ "/"+window.location.pathname.split("/")[1] === url }
                            />
                        ))
                    }
                </div>
                <div className="mo-nav-account mo-nav-section">
                    <div className="mo-nav-account-mat">
                        <img
                            src={ (this.state.user) ? apiPath + this.state.user.avatar : placeholder }
                            alt={ (this.state.user) ? this.state.user.name : "" }
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default App;