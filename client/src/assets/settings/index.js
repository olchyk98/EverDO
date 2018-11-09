import React, { Component } from 'react';
import './main.css';

import { gql } from 'apollo-boost';

import { apiPath } from '../../apiPath';
import { cookieControl } from '../../swissKnife';
import links from '../../links';
import client from '../../apollo';

class Field extends Component {
    render() {
        return(
            <div className={ `rn-settings-input${ (this.props.type !== "password") ? "" : " pass" }` }>
                <span className="rn-settings-input-title">{ this.props.placeholder }</span>
                <input
                    className="rn-settings-input-mat definp" type={ this.props.type }
                    defaultValue={ this.props.defaultValue }    
                />
            </div>
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
        {
            let { id, authToken } = cookieControl.get("userdata");
            client.query({
                query: gql`
                    query($id: ID!, $authToken: String!) {
                        user(id: $id, authToken: $authToken) {
                            id,
                            login,
                            name,
                            avatar
                        }
                    }
                `,
                variables: {
                    id, authToken
                }
            }).then(({ data: { user } }) => {
                if(!user) return null;

                this.setState(() => ({ user }));
            }).catch(()=>null);
        }
    }

    logout = () => {
        cookieControl.delete("userdata");
        window.location.href = links["REGISTER_PAGE"].absolute;
    }

    render() {
        return(
            <div className="rn rn-settings">
                <h1 className="rn-settings-title">Settings</h1>
                <form className="rn-settings-account">
                    <div className="rn-settings-avatar">
                        <img className="rn-settings-avatar-mat" src={ apiPath + this.state.user.avatar } alt="" />
                        <input type="file" className="hidden" id="rn-settings-avatar-edit" />
                        <label htmlFor="rn-settings-avatar-edit" className="rn-settings-avatar-edit definp">
                            <i className="fas fa-pencil-alt" />
                        </label>
                    </div>
                    <Field
                        type="text"
                        placeholder="Login"
                        defaultValue={ this.state.user.login }
                    />
                    <Field
                        type="text"
                        placeholder="Name"
                        defaultValue={ this.state.user.name }
                    />
                    <Field
                        type="password"
                        placeholder="Password"
                        defaultValue="password"
                    />
                </form>
                <button type="submit" className="definp rn-settings-submit">Save</button>
                <button type="button" className="definp rn-settings-logout" onClick={ this.logout }>
                    <i className="fas fa-sign-out-alt" />
                    <span>Logout</span>
                </button>
            </div>
        );
    }
}

export default App;