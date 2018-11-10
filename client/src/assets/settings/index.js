import React, { Component } from 'react';
import './main.css';

import { gql } from 'apollo-boost';

import { apiPath } from '../../apiPath';
import { cookieControl } from '../../swissKnife';
import links from '../../links';
import client from '../../apollo';
import loadingPlaceholder from '../__forall__/placeholder.gif';

class Field extends Component {
    render() {
        if(this.props.isLoading) return (
            <div className="rn-settings-input placeholder">
                <img src={ loadingPlaceholder } alt="loading placeholder" />
            </div>
        )

        return(
            <div className={ `rn-settings-input${ (this.props._type !== "password") ? "" : " pass" }` }>
                <span className="rn-settings-input-title">{ this.props._placeholder }</span>
                <input
                    className="rn-settings-input-mat definp" type={ this.props._type }
                    defaultValue={ this.props._defaultValue }
                    onChange={ ({ target: { value } }) => this.props._onChange(value) }
                />
            </div>
        );
    }
}

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: {
                login: "",
                name: "",
                password: "",
                avatar: null
            },
            previewAvatar: null,
            isFetching: false,
            changed: false,
            apiError: ""
        }
    }

    componentDidMount() {
        {
            this.setState(() => ({
                isFetching: true
            }));
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

                this.setState(() => ({
                    data: {
                        login: user.login,
                        name: user.name,
                        password: user.password
                    },
                    previewAvatar: apiPath + user.avatar,
                    isFetching: false
                }));
            }).catch(()=>null);
        }
    }

    logout = () => {
        cookieControl.delete("userdata");
        window.location.href = links["REGISTER_PAGE"].absolute;
    }

    setValue = (value, field) => {
        this.setState(({ data }) => ({
            data: {
                ...data,
                [field]: value
            },
            changed: true
        }));
    }

    setAvatar = a => {
        URL.revokeObjectURL(this.state.previewAvatar);
        this.setState(() => ({
            previewAvatar: URL.createObjectURL(a),
            changed: true
        }), () => this.setValue(a, "avatar"));
    }

    submitData = e => {
        e.preventDefault();
        if(!this.state.changed) return;

        this.setState(() => ({
            apiError: ""
        }));

        let { id, authToken } = cookieControl.get("userdata");
        let { login, password, name, avatar } = this.state.data;

        client.mutate({
            mutation: gql`
                mutation($id: ID!, $authToken: String!, $login: String!, $password: String!, $name: String!, $avatar: Upload!) {
                    updateUserData(id: $id, authToken: $authToken, login: $login, password: $password, name: $name, avatar: $avatar) {
                        id
                    }
                }
            `,
            variables: {
                id, authToken,
                login, name,
                avatar: avatar || "",
                password: password || ""
            }
        }).then(({ data: { updateUserData: data } }) => {
            if(!data) return this.setState(() => ({
                apiError: "An error occurred while we tried to update your account info."
            }));

            client.clearStore();
        }).catch(() => {
            this.setState(() => ({
                apiError: "Something wrong. We couldn't upload the new data :("
            }));
        });
    }

    render() {
        return(
            <div className="rn rn-settings">
                <h1 className="rn-settings-title">Settings</h1>
                <form className="rn-settings-account" onSubmit={ this.submitData }>
                    <p className={ `rn-settings-account-error${ (!this.state.apiError) ? "" : " visible" }` }>
                        { this.state.apiError }
                    </p>
                    <div className="rn-settings-avatar">
                        <img className="rn-settings-avatar-mat" src={ (!this.state.isFetching) ? this.state.previewAvatar || "" : loadingPlaceholder } alt="" />
                        <input
                            type="file"
                            className="hidden"
                            id="rn-settings-avatar-edit"
                            onChange={ ({ target: { files } }) => this.setAvatar(files[0]) }
                        />
                        <label htmlFor="rn-settings-avatar-edit" className="rn-settings-avatar-edit definp">
                            <i className="fas fa-pencil-alt" />
                        </label>
                    </div>
                    <Field
                        _type="text"
                        _placeholder="Login"
                        _defaultValue={ this.state.data.login }
                        _onChange={ value => this.setValue(value, "login") }
                        isLoading={ this.state.isFetching }
                    />
                    <Field
                        _type="text"
                        _placeholder="Name"
                        _defaultValue={ this.state.data.name }
                        _onChange={ value => this.setValue(value, "name") }
                        isLoading={ this.state.isFetching }
                    />
                    <Field
                        _type="password"
                        _placeholder="Password"
                        _defaultValue="password"
                        _onChange={ value => this.setValue(value, "password") }
                        isLoading={ this.state.isFetching }
                    />
                    <button type="submit" className="definp rn-settings-submit">Save</button>
                </form>
                <button type="button" className="definp rn-settings-logout" onClick={ this.logout }>
                    <i className="fas fa-sign-out-alt" />
                    <span>Logout</span>
                </button>
            </div>
        );
    }
}

export default App;