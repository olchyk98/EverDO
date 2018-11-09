import React, { Component } from 'react';
import './main.css';

import client from '../../apollo';
import { cookieControl } from '../../swissKnife';
import links from '../../links';

import { gql } from 'apollo-boost';

import image from "./background.jpg";

class Input extends Component {
    render() {
        return(
            <div className="rn-register-form-input">
                <div className="rn-register-form-input-image">
                    { this.props.icon }
                </div>
                <input
                        type={ this.props.type }
                        placeholder={ this.props.placeholder }
                        className="rn-register-form-input-mat definp"
                        required={ this.props.required }
                        onChange={ ({ target: { value } }) => this.props.onInput(value) }
                    />
            </div>
        );
    }
}

class File extends Component {
    render() {
        return(
            <React.Fragment>
                <input
                    type="file"
                    className="hidden"
                    id={ this.props.id }
                    accept={ this.props.accept }
                    onChange={ ({ target: { files } }) => this.props.onUpload(files[0]) }
                    required={ this.props.required }
                />
                <label className="rn-register-form-upload" htmlFor={ this.props.id }>
                    { this.props.title }
                </label>
            </React.Fragment>
        );
    }
}

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            stage: "LOGIN_STAGE", // LOGIN_STAGE, REGISTER_STAGE
            data: {
                login: {
                    login: "",
                    password: ""
                },
                register: {
                    login: "",
                    password: "",
                    name: "",
                    avatar: ""
                }
            },
            errs: {
                login: {
                    active: false,
                    message: ""
                },
                register: {
                    active: false,
                    message: ""
                }
            },
            fetching: false
        }
    }

    updateValue = (stage, section, value) => {
        this.setState(({ data }) => ({
            data: {
                ...data,
                [stage]: {
                    ...data[stage],
                    [section]: value
                }
            }
        }));
    }

    setStage = stage => {
        this.setState(() => ({
            stage,
            errs: {
                login: {
                    active: false,
                    message: ""
                },
                register: {
                    active: false,
                    message: ""
                }
            }
        }));
    }

    register = e => {
        e.preventDefault();
        let { login, password, avatar, name } = this.state.data.register;

        this.setState(() => ({
            fetching: true
        }));

        client.mutate({
            mutation: gql`
                mutation($login: String!, $password: String!, $name: String!, $avatar: Upload!) {
                    registerUser(login: $login, password: $password, name: $name, avatar: $avatar) {
                        id,
                        lastAuthToken
                    }
                }
            `,
            variables: {
                login, password, avatar, name
            }
        }).then(({ data: { registerUser } }) => {
            if(!registerUser) {
                return this.setState(({ errs }) => ({
                    fetching: false,
                    errs: {
                        ...errs,
                        register: {
                            active: true,
                            message: "User with this login already exists"
                        }
                    }
                }));
            }

            let { id, lastAuthToken } = registerUser;
            cookieControl.set("userdata", {
                id,
                authToken: lastAuthToken
            });

            window.location.href = links["HOME_PAGE"].absolute;
        });
    }
    
    login = e => {
        e.preventDefault();
        let { login, password } = this.state.data.login;

        this.setState(() => ({
            feching: true
        }));

        client.mutate({
            mutation: gql`
                mutation($login: String!, $password: String!) {
                    loginUser(login: $login, password: $password) {
                        id,
                        lastAuthToken
                    }
                }
            `,
            variables: {
                login, password
            }
        }).then(({ data: { loginUser } }) => {
            if(!loginUser) {
                return this.setState(({ errs }) => ({
                    fetching: false,
                    errs: {
                        ...errs,
                        login: {
                            active: true,
                            message: "Invalid login or password"
                        }
                    }
                }));
            }

            let { id, lastAuthToken } = loginUser;
            cookieControl.set("userdata", {
                id,
                authToken: lastAuthToken
            });

            window.location.href = links["HOME_PAGE"].absolute;
        });
    }

    render() {
        return(
            <div className="rn-register">
                <div className="rn-register-form" instage={ this.state.stage }>
                    <form className="rn-register-form-login rn-register-form-stage" onSubmit={ this.login }>
                        <p className="rn-register-form-title">Login</p>
                        <p className={ `rn-register-form-err${ (!this.state.errs.login.active) ? "" : " visible" }` }>{ this.state.errs.login.message }</p>
                        <Input
                            icon={ <i className="far fa-user" /> }
                            type="text"
                            placeholder="Login"
                            required={ true }
                            onInput={ value => this.updateValue("login", "login", value) }
                        />
                        <Input
                            icon={ <i className="fas fa-key" /> }
                            type="password"
                            placeholder="Password"
                            required={ true }
                            onInput={ value => this.updateValue("login", "password", value) }
                        />
                        <button type="submit" className="rn-register-form-submit definp">Login</button>
                        <div className="rn-register-form-transition">
                            <span className="rn-register-form-transition-title">Don't have account yet?</span>
                            <button disabled={ this.state.fetching } onClick={ () => this.setStage("REGISTER_STAGE") } type="button" className="rn-register-form-transition-btn definp">Register</button>
                        </div>
                    </form>
                    <form className="rn-register-form-register rn-register-form-stage" onSubmit={ this.register }>
                        <p className="rn-register-form-title">Register</p>
                        <p className={ `rn-register-form-err${ (!this.state.errs.register.active) ? "" : " visible" }` }>{ this.state.errs.register.message }</p>
                        <Input
                            icon={ <i className="far fa-user" /> }
                            type="text"
                            placeholder="Login"
                            required={ true }
                            onInput={ value => this.updateValue("register", "login", value) }
                        />
                        <Input
                            icon={ <i className="fas fa-key" /> }
                            type="password"
                            placeholder="Password"
                            required={ true }
                            onInput={ value => this.updateValue("register", "password", value) }
                        />
                        <Input
                            icon={ <i className="far fa-id-card" /> }
                            type="text"
                            placeholder="Name"
                            required={ true }
                            onInput={ value => this.updateValue("register", "name", value) }
                        />
                        <File
                            id="rn-register-form-register-avatar"
                            accept="image/*"
                            onUpload={ image => this.updateValue("register", "avatar", image) }
                            title="Image"
                            required={ true }
                        />
                        <p className="rn-register-form-subterms">
                            By signing up, I agree to the placePass <a href="#" target="_blank">Terms Of Service</a> and <span href="#" target="_blank">Privacy Policy</span>
                        </p>
                        <button type="submit" className="rn-register-form-submit definp">Register</button>
                        <div className="rn-register-form-transition">
                            <span className="rn-register-form-transition-title">Already have an account?</span>
                            <button disabled={ this.state.fetching } onClick={ () => this.setStage("LOGIN_STAGE") } type="button" className="rn-register-form-transition-btn definp">Login</button>
                        </div>
                    </form>
                </div>
                <img className="rn-register-bg" src={ image } alt="" />
            </div>
        );
    }
}

export default App;