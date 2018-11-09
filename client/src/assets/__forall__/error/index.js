import React, { Component } from 'react';
import './main.css';

import { cookieControl } from '../../../swissKnife';
import links from '../../../links';

class App extends Component {
    handleClick = () => {
        cookieControl.delete("userdata");
        window.location.href = links["REGISTER_PAGE"].absolute;
    }

    render() {
        return(
            <div className="io-glcrerr">
                <h1 className="io-glcrerr-title">Session is not authorized!</h1>
                <button onClick={ this.handleClick } className="io-glcrerr-logout definp">Logout</button>
            </div>
        );
    }
}

export default App;
