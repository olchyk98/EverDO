import React, { Component } from 'react';
import './main.css';

import { gql } from 'apollo-boost';

import client from '../../apollo';
import { cookieControl } from '../../swissKnife';
import loadingBG from '../__forall__/placeholder.gif';
import { convertTime } from '../../swissKnife';
import { apiPath } from '../../apiPath';

import ErrorWindow from '../__forall__/error';

const noteContentClip = 25;
const markLabels = {
    ACCEPT_LABEL: "Accepted",
    CANCEL_MARK: "Rejected",
    PLAN_MARK: "Scheduled",
    MARKED_LABEL: "Marked",
    SEARCH_LABEL: "Searching"
}

let fileExtIcons = {};
{
    const a = "__forall__/fileImages";
    fileExtIcons = {
        ai: require(`../${ a }/ai.svg`),
        avi: require(`../${ a }/avi.svg`),
        css: require(`../${ a }/css.svg`),
        csv: require(`../${ a }/csv.svg`),
        dbf: require(`../${ a }/dbf.svg`),
        doc: require(`../${ a }/doc.svg`),
        dwg: require(`../${ a }/dwg.svg`),
        exe: require(`../${ a }/exe.svg`),
        fla: require(`../${ a }/fla.svg`),
        html: require(`../${ a }/html.svg`),
        iso: require(`../${ a }/iso.svg`),
        js: require(`../${ a }/js.svg`),
        jpg: require(`../${ a }/jpg.svg`),
        json: require(`../${ a }/json.svg`),
        mp3: require(`../${ a }/mp3.svg`),
        mp4: require(`../${ a }/mp4.svg`),
        pdf: require(`../${ a }/pdf.svg`),
        png: require(`../${ a }/png.svg`),
        ppt: require(`../${ a }/ppt.svg`),
        psd: require(`../${ a }/psd.svg`),
        rtf: require(`../${ a }/rtf.svg`),
        svg: require(`../${ a }/svg.svg`),
        txt: require(`../${ a }/txt.svg`),
        xls: require(`../${ a }/xls.svg`),
        xml: require(`../${ a }/xml.svg`),
        zip: require(`../${ a }/zip.svg`),
        undefined: require(`../${ a }/file.svg`),
        search: require(`../${ a }/search.svg`)
    }

    fileExtIcons.jpeg = fileExtIcons.jpg;
}

class Project extends Component {
    handleClick = () => {
        this.props.onCall(this.props.id)
    }

    render() {
        return(
            <button
                className={ `rn-home-topics-mat-target-topic-sections-btn definp${ (!this.props.active) ? "" : " active" }` }
                onClick={ this.handleClick }>
                { this.props.name }
            </button>
        );
    }
}

class Topic extends Component {
    constructor(props) {
        super(props);

        this.nameInput = React.createRef();
    }

    submitName = () => {
        let { innerText: value } = this.nameInput;
        if(!value.replace(/ /g).length || value === this.props.name) {
            this.nameInput.innerText = this.props.name;
        } else {
            this.props.submitName(value);
        }
    }

    render() {
        return(
            <div className="rn-home-topics-mat-target-topic">
                <div className={ `rn-home-topics-mat-target-topic-title ${ this.props.color }` }>
                    <div className="rn-home-topics-mat-target-topic-title-color" onClick={ this.props.toggleColor } />
                    <span
                        className="rn-home-topics-mat-target-topic-title-mat editableanimation"
                        onKeyPress={e => {
                            if(e.key.toLowerCase() === "enter") {
                                e.preventDefault();
                                this.nameInput.blur();
                            }
                        }}
                        contentEditable={ true }
                        suppressContentEditableWarning={ true }
                        ref={ ref => this.nameInput = ref }
                        onBlur={ this.submitName }>
                        { this.props.name }
                    </span>
                    <button
                        className="rn-home-topics-mat-target-topic-title-remove definp"
                        onClick={ this.props.onDelete }>
                        <i className="fas fa-trash" />
                    </button>
                </div>
                <div className="rn-home-topics-mat-target-topic-sections">
                    {
                        this.props.projects.map(({ id, name }) => (
                            <Project
                                key={ id }
                                id={ id }
                                name={ name }
                                active={ this.props.activeID === id }
                                onCall={ this.props.onProjectCall }
                            />
                        ))
                    }
                    {
                        (!this.props.isReceivingTopic) ? null : (
                            <PlaceholderTopic />
                        )
                    }
                    <button className="rn-home-topics-mat-target-topic-sections-new definp" onClick={ this.props.onCreateDoc }>
                        <i className="fas fa-plus" />
                        <span>New project</span>
                    </button>
                </div>
            </div>
        );
    }
}

class PlaceholderTopic extends Component {
    render() {
        return(
            <div className="rn-home-topics-mat-target-topic">
                <img className="rn-home-screen-topicplaceholder placeholder rn-home-screen-placeholder" src={ loadingBG } alt="placeholder loading" />
                {
                    (this.props.off !== true) ? null : (
                        <React.Fragment>
                            <img className="rn-home-screen-projectplaceholder placeholder rn-home-screen-placeholder" src={ loadingBG } alt="placeholder loading" />
                            <img className="rn-home-screen-projectplaceholder placeholder rn-home-screen-placeholder" src={ loadingBG } alt="placeholder loading" />
                            <img className="rn-home-screen-projectplaceholder placeholder rn-home-screen-placeholder" src={ loadingBG } alt="placeholder loading" />
                            <img className="rn-home-screen-projectplaceholder placeholder rn-home-screen-placeholder" src={ loadingBG } alt="placeholder loading" />
                        </React.Fragment>
                    )
                }
            </div>
        )
    }
}

class Topics extends Component {
    render() {
        if(this.props.isLoading) return(
            <div className="rn-home-topics rn-home-screen">
                <PlaceholderTopic />
                <PlaceholderTopic />
            </div>
        );

        return(
            <div className="rn-home-topics rn-home-screen">
                <div className="rn-home-topics-mat">
                    <div className="rn-home-topics-mat-target">
                        {
                            this.props.data.map(({ id, color, name, projects }) => (
                                <Topic
                                    key={ id }
                                    id={ id }
                                    color={ color }
                                    name={ name }
                                    projects={ projects }
                                    onProjectCall={ this.props.onProjectCall }
                                    submitName={ value => this.props.onSubmitTopicName(value, id) }
                                    onDelete={ () => this.props.onDeleteTopic(id) }
                                    onCreateDoc={ () => this.props.onCreateProject(id) }
                                    isReceivingTopic={ this.props.projectsInQuery.includes(id) }
                                    activeID={ this.props.activeID }
                                    toggleColor={ () => this.props.toggleTopicColor(id) }
                                />
                            ))
                        }
                        {
                            (new Array(this.props.topicsInQuery)).fill("*").map((_, i) => (
                                <PlaceholderTopic
                                    key={ i }
                                    off={ true }
                                />
                            ))
                        }
                    </div>
                </div>
                <div className="rn-home-topics-new" onClick={ this.props.onCreateTopic }>
                    <button className="rn-home-topics-new-mat definp">
                        <i className="fas fa-plus" />
                    </button>
                </div>
            </div>
        );
    }
}

class DisplayTitleNavBtn extends Component {
    constructor(props) {
        super(props);

        this.matRef = React.createRef();
    }

    componentDidMount() {
        if(this.props.active) {
            this.handleClick();
        }
    }

    handleClick = () => {
        let a = this.matRef;
        this.props._onClick(a.offsetLeft, a.offsetWidth, this.props.reqStage);
    }

    render() {
        return(
            <button
                className={ `rn-home-display-title-nav-btn counteranimation definp${ (!this.props.active) ? "" : " active" }` }
                ref={ ref => this.matRef = ref }
                onClick={ this.handleClick }>
                {
                    (!parseInt(this.props.events)) ? null : (
                        <span className="rn-home-display-title-nav-btn-counter counter">
                            <span>{ this.props.events }</span>
                        </span>
                    )
                }
                <span className="rn-home-display-title-nav-btn-title">{ this.props.name }</span>
            </button>
        );
    }
}

class DisplayTitleNav extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showNextArrow: false,
            showPrevArrow: false
        }

        this.matRef = this.navSliderRef = React.createRef();
    }

    componentDidMount() {
        this.validateScroll();
    }

    validateScroll = () => {
        let { scrollWidth, offsetWidth, scrollLeft } = this.matRef;
        let a = scrollWidth > offsetWidth; // scrollable

        if(!a) return;

        this.setState(() => ({
            showNextArrow: scrollLeft < scrollWidth - offsetWidth,
            showPrevArrow: scrollLeft > 0
        }));
    }

    nextScroll = () => { // !XXX
        if(!this.state.showNextArrow) return;

        this.matRef.scrollTo({
            left: this.matRef.scrollWidth,
            behavior: "smooth"
        });
    }

    prevScroll = () => { // !XXX
        if(!this.state.showPrevArrow) return;

        this.matRef.scrollTo({
            left: 0,
            behavior: "smooth"
        });
    }

    moveNavSlider = (position, width, stage) => {
        let a = width / 100 * 75;
        this.navSliderRef.style.cssText = `width: ${ a }px; left: ${ position + (width - a) / 2 }px;`;
        this.props.onSet(stage);
    }

    render() {
        return(
            <div className="rn-home-display-title-navtarget">
                <div className="rn-home-display-title-nav" ref={ ref => this.matRef = ref } onScroll={ this.validateScroll }>
                    <div className="rn-home-display-title-nav-slider"
                        ref={ ref => this.navSliderRef = ref }
                    />
                    <DisplayTitleNavBtn
                        active={ true }
                        name="Todos"
                        events={ this.props.todosInt }
                        _onClick={ this.moveNavSlider }
                        reqStage="TODOS_STAGE"
                    />
                    <DisplayTitleNavBtn
                        active={ false }
                        name="Notes"
                        events={ this.props.notebooksInt }
                        _onClick={ this.moveNavSlider }
                        reqStage="NOTES_STAGE"
                    />
                    <DisplayTitleNavBtn
                        active={ false }
                        name="Files"
                        events={ this.props.filesInt }
                        _onClick={ this.moveNavSlider }
                        reqStage="FILES_STAGE"
                    />
                </div>
                <button
                    className={ `rn-home-display-title-nav-scroll prev definp${ (this.state.showPrevArrow) ? " visible" : "" }` }
                    onClick={ this.prevScroll }>
                    <i className="fas fa-chevron-right" />
                </button>
                <button
                    className={ `rn-home-display-title-nav-scroll next definp${ (this.state.showNextArrow) ? " visible" : "" }` }
                    onClick={ this.nextScroll }>
                    <i className="fas fa-chevron-right" />
                </button>
            </div>
        );
    }
}

class DisplayTodoTaskLabel extends Component {
    render() {
        return(
            <span className="rn-home-display-mat-topic-task-content-mat-labels-label counter">
                <span
                    style={{
                        animationDelay: this.props.amDelay + "s"
                    }}
                >{ this.props.text }</span>
            </span>
        );
    }
}

class DisplayTodoTask extends Component {
    constructor(props) {
        super(props);

        this.state = {
            source: {
                isDone: null
            },
            data: {
                name: ""
            }
        }

        this.nameInput = React.createRef();
    }

    convertLabels = () => {
        let a = [];

        this.props.labels.forEach(io => {
            a.push(markLabels[io] || "Labeled");
        });

        return a;
    }

    getSource = req => {
        let a = this.state.source[req];
        return (a === null) ? this.props[req] : a;
    }

    doTask = () => {
        let a = !this.getSource("isDone");

        this.setState(({ source }) => ({
            source: {
                ...source,
                isDone: a
            }
        }));

        let { id, authToken } = cookieControl.get("userdata");
        client.mutate({
            mutation: gql`
                mutation($id: ID!, $authToken: String!, $targetID: ID!, $value: Boolean!) {
                    doTask(id: $id, authToken: $authToken, targetID: $targetID, value: $value)
                }
            `,
            variables: {
                id, authToken,
                targetID: this.props.id,
                value: a
            }
        });
    }

    submitName = () => {
        let { innerText: value } = this.nameInput,
            a = this.props.name;
        if(!value.replace(/ /g).length || value === a) {
            this.nameInput.innerText = a;
        } else {
            this.props.onSubmitName(value);
        }
    }

    render() {
        return(
            <div
                className={ `rn-home-display-mat-topic-task driftanimation counteranimation${ (!this.props.isSelected) ? "" : " active" }${ (!this.getSource("isDone")) ? "" : " done" }` }
                style={{
                    animationDelay: this.props.initAmDelay
                }}>
                <div className="rn-home-display-mat-topic-task-display">
                    <div className="rn-home-display-mat-topic-task-display-mat">
                        <i className="fas fa-check" />
                    </div>
                </div>
                <div className="rn-home-display-mat-topic-task-content">
                    <div
                        className="rn-home-display-mat-topic-task-content-selector"
                        onClick={ this.props.onSelect }
                    />
                    <div className="rn-home-display-mat-topic-task-content-mat">
                        <span className={ `rn-home-display-mat-topic-task-content-mat-checkbox${ (!this.getSource("isDone")) ? "" : " active" }` }
                            onClick={ this.doTask }>
                            <i className="fas fa-check" />
                        </span>
                        <span
                            className="rn-home-display-mat-topic-task-content-mat-title editableanimation definp"
                            contentEditable={ true }
                            suppressContentEditableWarning={ true }
                            ref={ ref => this.nameInput = ref }
                            onKeyPress={e => {
                                if(e.key.toLowerCase() === "enter") {
                                    e.preventDefault();
                                    this.nameInput.blur();
                                }
                            }}
                            onBlur={ this.submitName }>
                            { this.props.name }
                        </span>
                        <div className="rn-home-display-mat-topic-task-content-mat-labels">
                            {
                                this.convertLabels().map((session, index) => (
                                    <DisplayTodoTaskLabel
                                        key={ index }
                                        text={ session }
                                        amDelay={ index * .25 }
                                    />
                                ))
                            }
                        </div>
                    </div>
                    <div className="rn-home-display-mat-topic-task-content-controls">
                        <span className="rn-home-display-mat-topic-task-content-leftime">{ convertTime(parseInt(this.props.time), "ago", false) }</span>
                        <button className="definp rn-home-display-mat-topic-task-controls-remove" onClick={ this.props.onDelete }>
                            <i className="fas fa-trash" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

class DisplayTodo extends Component {
    constructor(props) {
        super(props);

        this.nameInput = React.createRef();
    }

    submitName = () => {
        let { innerText: value } = this.nameInput,
            a = this.props.title;

        if(!value.replace(/ /g).length || a === value) {
            this.nameInput.innerText = a;
        } else {
            this.props.onSubmitTodoName(value);
        }
    }

    render() {
        return(
            <div className="rn-home-display-mat-topic">
                <div className="rn-home-display-mat-topic-title">
                    <h2
                        className="editableanimation"
                        contentEditable={ true }
                        suppressContentEditableWarning={ true }
                        ref={ ref => this.nameInput = ref }
                        onKeyPress={e => {
                            if(e.key.toLowerCase() === "enter") {
                                e.preventDefault();
                                this.nameInput.blur();
                            }
                        }}
                        onBlur={ this.submitName }>
                            { this.props.title }
                        </h2>
                    <button className="definp rn-home-display-mat-topic-title-btn" onClick={ this.props.onDelete }><i className="fas fa-trash" /></button>
                </div>
                <div className="rn-home-display-mat-topic-tasks">
                    {
                        (!this.props.isReceivingTask) ? null : (
                            <img src={ loadingBG } alt="placeholder loading" className="placeholder rn-home-display-mat-subplaceholder" />
                        )
                    }
                    {
                        this.props.tasks.map(({ id, name, isDone, labels, time }, index) => (
                            <DisplayTodoTask
                                key={ id }
                                id={ id }
                                name={ name }
                                isDone={ isDone }
                                labels={ labels }
                                time={ time }
                                initAmDelay={ index * .25 }
                                isSelected={ this.props.selectedTasks.includes(id) }
                                onSelect={ () => this.props.onSelectTask(id) }
                                onDelete={ () => this.props.onDeleteTask(this.props.id, id) }
                                onSubmitName={ value => this.props.onSubmitTaskName(value, this.props.id, id) }
                            />
                        ))
                    }
                    <button className="definp rn-home-display-mat-topic-tasks-new" onClick={ this.props.onNewTask }>
                        <i className="fas fa-plus" />
                        <span>Add item</span>
                    </button>
                </div>
            </div>
        );
    }
}

class DisplayMark extends Component {
    render() {
        return(
            <button
                style={ this.props.styles }
                className="definp rn-home-display-marks-mat-btn zoominitam"
                onClick={ this.props.onAction }>
                { this.props.icon }
            </button>
        );
    }
}

class DisplayArticlePlaceholder extends Component {
    render() {
        return(
            <div style={{ marginTop: "30px", display: "flex", flexDirection: "column" }}> {/* transition here */}
                <img src={ loadingBG } alt="placeholder loading" className="placeholder rn-home-display-mat-placeholder" />
                <img src={ loadingBG } alt="placeholder loading" className="placeholder rn-home-display-mat-subplaceholder" />
                <img src={ loadingBG } alt="placeholder loading" className="placeholder rn-home-display-mat-subplaceholder" />
                <img src={ loadingBG } alt="placeholder loading" className="placeholder rn-home-display-mat-subplaceholder" />
                <img src={ loadingBG } alt="placeholder loading" className="placeholder rn-home-display-mat-subplaceholder" />
                <img src={ loadingBG } alt="placeholder loading" className="placeholder rn-home-display-mat-subplaceholder" />
                <img src={ loadingBG } alt="placeholder loading" className="placeholder rn-home-display-mat-subplaceholder" />
                <img src={ loadingBG } alt="placeholder loading" className="placeholder rn-home-display-mat-subplaceholder" />
                <img src={ loadingBG } alt="placeholder loading" className="placeholder rn-home-display-mat-subplaceholder" />
                <img src={ loadingBG } alt="placeholder loading" className="placeholder rn-home-display-mat-subplaceholder" />
            </div>
        );
    }
}

class DisplayNotes extends Component {
    constructor(props) {
        super(props);

        this.nameInput = React.createRef();
    }

    submitName = () => {
        let { innerText: value } = this.nameInput,
            a = this.props.title;

        if(!value.replace(/ /g).length || a === value) {
            this.nameInput.innerText = a;
        } else {
            this.props.onSubmitNotesName(value);
        }
    }

    render() {
        return(
            <div className="rn-home-display-mat-topic">
                <div className="rn-home-display-mat-topic-title rn-home-display-mat-topic-taskstitle">
                    <h2
                        className="editableanimation"
                        contentEditable={ true }
                        suppressContentEditableWarning={ true }
                        ref={ ref => this.nameInput = ref }
                        onKeyPress={e => {
                            if(e.key.toLowerCase() === "enter") {
                                e.preventDefault();
                                this.nameInput.blur();
                            }
                        }}
                        onBlur={ this.submitName }>
                            { this.props.title }
                        </h2>
                    <div>
                        <button className="definp rn-home-display-mat-topic-title-btn note" onClick={ this.props.onNewNote }>
                            <i className="fas fa-sticky-note" />
                        </button>
                        <button className="definp rn-home-display-mat-topic-title-btn trashbin" onClick={ this.props.onDeleteNotebook }>
                            <i className="fas fa-trash" />
                        </button>
                    </div>
                </div>
                <div className="rn-home-display-mat-topic-tasks rn-home-display-mat-topic-notes">
                    {
                        (!this.props.isReceivingNote) ? null : (
                            <img src={ loadingBG } alt="" className="rn-home-display-mat-placeholder-note placeholder" />
                        )
                    }
                    {
                        (this.props.notes) ? (
                            this.props.notes.map(({ id, time, content, title, label }) => (
                                <DisplayNotesNote
                                    key={ id }
                                    id={ id }
                                    time={ time }
                                    label={ label }
                                    title={ title }
                                    content={ content }
                                    selected={ this.props.selectedNotes.includes(id) }
                                    onSelect={ () => this.props.onSelect(id) }
                                    onOpen={ () => this.props.onOpen(id) }
                                    onDelete={ () => this.props.onDeleteNote(id) }
                                />
                            ))
                        ) : null
                    }
                </div>
            </div>
        );
    }
}

class DisplayNotesNote extends Component {
    clipContent(a) {
        { // remove html tags
            let ka = document.createElement('div');
            ka.innerHTML = a;
            a = ka.textContent;
        }

        // remove special symbols
        let b = [".", ",", "-", "_"],
            c = a.split(" ").length === noteContentClip;

        function d() {
            let e = a.length - 1;
            if(b.includes(a[e])) {
                a = a.substring(0, e);
                d();
            }
        }
        d();


        // submit
        return (c) ? a + "..." : a;
    }

    render() {
        return(
            <div className={ `rn-home-display-mat-topic-notes-note counteranimation${ (this.props.selected) ? " selected" : "" }` } onClick={ (!this.props.onSelected) ? this.props.onSelect : null }>
                <div className="rn-home-display-mat-topic-notes-note-secdisp" onClick={ this.props.onSelect } />
                <button className={ `rn-home-display-mat-topic-notes-note-secdisp-open definp${ (this.props.selected) ? " visible" : "" }` } onClick={ this.props.onOpen }>
                    <i className="fas fa-expand" />
                </button>
                <div className="rn-home-display-mat-topic-notes-note-target">
                    <div className="rn-home-display-mat-topic-notes-note-info">
                        <span className="rn-home-display-mat-topic-notes-note-info-crtime">{ convertTime(parseInt(this.props.time), "ago") }</span>
                        {
                            (this.props.label) ? (
                                <span className="rn-home-display-mat-topic-notes-note-info-label counter">
                                    <span>{ markLabels[this.props.label] || "Labeled" }</span>
                                </span>
                            ) : null
                        }
                    </div>
                    <div className="rn-home-display-mat-topic-notes-note-title">
                        <h3>{ this.props.title }</h3>
                    </div>
                    <p className="rn-home-display-mat-topic-notes-note-content">
                        { this.clipContent(this.props.content) }
                    </p>
                </div>
                <button className={ `rn-home-display-mat-topic-notes-note-secdisp-delete definp${ (this.props.selected) ? " visible" : "" }` } onClick={ this.props.onDelete }>
                    <i className="fas fa-trash" />
                </button>
            </div>
        );
    }
}

class DisplayNotebookPlaceholder extends Component {
    render() {
        return(
            <div className="rn-home-display-mat rn-home-display-placeholder">
                <div className="active">
                    <img src={ loadingBG } alt="" className="rn-home-display-mat-placeholder-topicnote placeholder" />
                    {
                        (!this.props.off) ? (
                            <React.Fragment>
                                <img src={ loadingBG } alt="" className="rn-home-display-mat-placeholder-note placeholder" />
                                <img src={ loadingBG } alt="" className="rn-home-display-mat-placeholder-note placeholder" />
                                <img src={ loadingBG } alt="" className="rn-home-display-mat-placeholder-note placeholder" />
                            </React.Fragment>
                        ) : null
                    }
                </div>
            </div>
        );
    }
}

class DisplayFilesFile extends Component {
    constructor(props) {
        super(props);

        this.nameInput = React.createRef();
    }

    getImage(ext) {
        let a = fileExtIcons;
        return (a[ext] || a["undefined"]);
    }

    submitName = () => {
        let { innerText: value } = this.nameInput,
            a = this.props.name;
        
        if(!value.replace(/ /g).length || value === a) {
            this.nameInput.innerText = a;
        } else {
            this.props.onSubmitName(this.nameInput.innerText);
        }
    }

    render() {
        return(
            <div
                className={ `rn-home-display-filesin-file driftanimation counteranimation${ (!this.props.isSelected) ? "" : " selected"  }` }
                style={{
                    animationDelay: this.props.initAmDelay
                }}>
                <div className="rn-home-display-filesin-file-selector"
                    onClick={ this.props.onSelect }
                />
                <div className="rn-home-display-filesin-file-info">
                    <div className="rn-home-display-filesin-file-info-icon">
                        <img alt="" src={ this.getImage(this.props.format) } />
                    </div>
                    <div className="rn-home-display-filesin-file-info-name">
                        <span
                            className="editableanimation"
                            ref={ ref => this.nameInput = ref }
                            onKeyPress={e => {
                                if(e.key.toLowerCase() === "enter") {
                                    e.preventDefault();
                                    this.nameInput.blur();
                                }
                            }}
                            contentEditable={ true }
                            suppressContentEditableWarning={ true }
                            onBlur={ this.submitName }>
                            { this.props.name }
                        </span>
                        <span>.{ this.props.format }</span>
                    </div>
                    {
                        (this.props.label) ? (
                            <span className="rn-home-display-filesin-file-info-label counter">
                                <span>{ this.props.label }</span>
                            </span>
                        ) : null
                    }
                </div>
                <div className="rn-home-display-filesin-file-control">
                    <a
                        href={ apiPath + this.props.url }
                        className="rn-home-display-filesin-file-control-btn delete definp"
                        download>
                        <i className="fas fa-download" />
                    </a>
                    <button className="rn-home-display-filesin-file-control-btn open definp" onClick={ this.props.onOpen }>
                        <i className="fas fa-box-open" />
                    </button>
                    <button className="rn-home-display-filesin-file-control-btn delete definp" onClick={ this.props.onDelete }>
                        <i className="fas fa-trash" />
                    </button>
                </div>
            </div>
        );
    }
}

class DisplayFiles extends Component {
    render() {
        return(
            <div className="rn-home-display-filesin">
                {
                    (this.props.isReceivingFile && !this.props.isErr) ? (
                        <DisplayArchivePlaceholder
                            off={ true }
                        />
                    ) : null
                }
                {
                    (this.props.isErr) ? (
                        <DisplayArchivePlaceholderErr
                            onClose={ this.props.onErrorClose }
                            content={ this.props.isErr }
                        />
                    ) : null
                }
                {
                    this.props.data.map((session, index) => (
                        <DisplayFilesFile
                            key={ session.id }
                            {...session}
                            initAmDelay={ index * .1 + "s" }
                            onSubmitName={ value => this.props.onSubmitFileName(value, session.id) }
                            onDelete={ () => this.props.onDeleteFile(session.id) }
                            isSelected={ this.props.selectedFiles.includes(session.id) }
                            onSelect={ () => this.props.onFileSelect(session.id) }
                            onOpen={ () => this.props.onFileOpen(session.url) }
                        />       
                    ))
                }
            </div>
        );
    }
}

class DisplayArchivePlaceholder extends Component {
    render() {
        return(
            <React.Fragment>
                <img className="placeholder rn-home-display-filesin-placeholder" alt="" src={ loadingBG } />
                {
                    (!this.props.off) ? (
                        <React.Fragment>
                            <img className="placeholder rn-home-display-filesin-placeholder " alt="" src={ loadingBG } />
                            <img className="placeholder rn-home-display-filesin-placeholder " alt="" src={ loadingBG } />
                        </React.Fragment>
                    ) : null
                }
            </React.Fragment>
        );
    }
}

class DisplayArchivePlaceholderErr extends Component {
    render() {
        return(
            <div className="rn-home-display-filesin-errplc">
                <div className="rn-home-display-filesin-errplc-icon">
                    <i className="fas fa-times" />
                </div>
                <div className="rn-home-display-filesin-errplc-info">
                    <h4>Error</h4>
                    <p>{ this.props.content }</p>
                </div>
                <button className="rn-home-display-filesin-errplc-close definp" onClick={ this.props.onClose }>
                    <i className="fas fa-times" />
                </button>
            </div>
        );
    }
}

class Display extends Component {
    constructor(props) {
        super(props);

        this.nameInput = React.createRef();
    }

    submitName = () => {
        let { innerText: value } = this.nameInput,
            a = this.props.data.name;
        
        if(!value.replace(/ /g).length || value === a) {
            this.nameInput.innerText = a;
        } else {
            this.props.onSubmitProjectName(value);
        }
    }

    requestStage = stage => {
        if(this.props.isLoading) return;
        this.props.requestProjectStage(stage);
    }
    
    render() {
        if(this.props.error) return(
            <div className="rn-home-display rn-home-screen">
                <p className="rn-home-display-alert">{ this.props.data.message }</p>
            </div>
        );

        if(this.props.isEmpty) return(
            <div className="rn-home-display rn-home-screen">
                <p className="rn-home-display-alert">Your project will be displayed here</p>
            </div>
        );

        if(this.props.isLoading) return(
            <div className="rn-home-display rn-home-screen">
                <div className="rn-home-display-title">
                    <div className="rn-home-display-title-mat editableanimation">
                        <img src={ loadingBG } alt="placeholder loading" className="placeholder rn-home-display-title-placeholder" />
                    </div>
                    <img src={ loadingBG } alt="placeholder loading" className="placeholder rn-home-display-title-subplaceholder" />  
                </div>
                <div className="rn-home-display-mat">
                    <DisplayArticlePlaceholder />
                    <DisplayArticlePlaceholder />
                    <DisplayArticlePlaceholder />
                    <DisplayArticlePlaceholder />
                    <DisplayArticlePlaceholder />
                    <DisplayArticlePlaceholder />
                </div>
                <div className="rn-home-display-marks">
                    <div className="rn-home-display-marks-mat">
                        <img src={ loadingBG } alt="placeholder loading" className="placeholder rn-home-display-marks-mat-placeholder" />
                        <img src={ loadingBG } alt="placeholder loading" className="placeholder rn-home-display-marks-mat-placeholder" />
                        <img src={ loadingBG } alt="placeholder loading" className="placeholder rn-home-display-marks-mat-placeholder" />
                        <img src={ loadingBG } alt="placeholder loading" className="placeholder rn-home-display-marks-mat-placeholder" />
                    </div>
                    <div className="rn-home-display-marks-new">
                        <img src={ loadingBG } alt="placeholder loading" className="placeholder rn-home-display-marks-mat-placeholder" />
                    </div>
                </div>
            </div>
        );

        return(
            <div className="rn-home-display rn-home-screen">
                <div className="rn-home-display-title">
                    {
                        (!this.props.fileUploading) ? null : (
                            <p className="rn-home-display-title-alertion">New file in progress. Please, don't close the application.</p>
                        )
                    }
                    <div className="rn-home-display-title-mat">
                        <h1
                            suppressContentEditableWarning={ true }
                            contentEditable={ true }
                            className="editableanimation"
                            onKeyPress={e => {
                                if(e.key.toLowerCase() === "enter") {
                                    e.preventDefault();
                                    this.nameInput.blur();
                                }
                            }}
                            ref={ ref => this.nameInput = ref }
                            onBlur={ this.submitName }>
                            { this.props.data.name }
                        </h1>
                        <button className="rn-home-display-title-remove definp" onClick={ this.props.onDeleteProject }>
                            <i className="fas fa-trash" />
                        </button>
                    </div>
                    <DisplayTitleNav
                        todosInt={ this.props.data.todosInt }
                        notebooksInt={ this.props.data.notebooksInt }
                        filesInt={ this.props.data.filesInt }
                        onSet={ this.requestStage }
                    />
                </div>
                <div className="rn-home-display-mat">
                    <div className={ (this.props.stage === "TODOS_STAGE") ? "active" : "" }>
                        {
                            (new Array(this.props.todosInQuery || 0)).fill("*").map((_, index) => (
                                <DisplayArticlePlaceholder
                                    key={ index }
                                />
                            ))
                        }
                        {
                            this.props.data.todos.map(({ id, title, tasks }) => (
                                <DisplayTodo
                                    key={ id }
                                    id={ id }
                                    title={ title }
                                    tasks={ tasks }
                                    isReceivingTask={ this.props.tasksInQuery.includes(id) }
                                    onSelectTask={ this.props.onSelectTask }
                                    selectedTasks={ this.props.selectedTasks }
                                    onDeleteTask={ this.props.onDeleteTask }
                                    onDelete={ () => this.props.onDeleteTodo(id) }
                                    onSubmitTaskName={ this.props.onSubmitTaskName }
                                    onSubmitTodoName={ value => this.props.onSubmitTodoName(id, value) }
                                    onNewTask={ () => this.props.onCreateTask(id) }
                                />
                            ))
                        }
                    </div>
                    <div className={ (this.props.stage === "NOTES_STAGE") ? "active" : "" }>
                        {
                            (this.props.data.notebooks && !this.props.stagesInQuery.includes("NOTES_STAGE")) ? (
                                this.props.data.notebooks.map(({ id, name, notes }) => (
                                    <DisplayNotes
                                        key={ id }
                                        title={ name }
                                        notes={ notes }
                                        selected={ this.props.selectedNotes.includes(id) }
                                        onSelect={ this.props.onSelectNote }
                                        onDelete={ () => null }
                                        onSubmitNotesName={ value => this.props.onSubmitNotesName(id, value) }
                                        selectedNotes={ this.props.selectedNotes }
                                        onOpen={ this.props.onOpenNote }
                                        onDeleteNote={ noteID => this.props.onDeleteNote(id, noteID) }
                                        onDeleteNotebook={ () => this.props.onDeleteNotebook(id) }
                                        onNewNote={ () => this.props.onCreateNote(id) }
                                        isReceivingNote={ this.props.notesInQuery.includes(id) }
                                    />
                                ))
                            ) : (
                                <DisplayNotebookPlaceholder />
                            )
                        }
                        {
                            (new Array(this.props.notebooksInQuery)).fill("*").map((_, index) => (
                                <DisplayNotebookPlaceholder
                                    key={ index }
                                    off={ true }
                                />
                            ))
                        }
                    </div>
                    <div className={ (this.props.stage === "FILES_STAGE") ? "active" : "" }>
                        {
                            (this.props.data.files && !this.props.stagesInQuery.includes("FILES_STAGE")) ? (
                                <DisplayFiles
                                    data={ this.props.data.files }
                                    isReceivingFile={ this.props.fileUploading }
                                    isErr={ this.props.fileError }
                                    onErrorClose={ this.props.onFilesErrClose }
                                    onSubmitFileName={ this.props.onSubmitFileName }
                                    onDeleteFile={ this.props.onDeleteFile }
                                    onFileSelect={ this.props.onFileSelect }
                                    selectedFiles={ this.props.selectedFiles }
                                    onFileOpen={ this.props.onFileOpen }
                                />
                            ) : (
                                <div className="rn-home-display-filesin">
                                    <DisplayArchivePlaceholder />
                                </div>
                            )
                        }
                    </div>
                </div>
                <div className="rn-home-display-marks">
                    <div className="rn-home-display-marks-mat">
                        {
                            [
                                {
                                    icon: <i className="fas fa-check" />,
                                    styles: {
                                        color: "#50C21D",
                                        background: "#DEFAD0"
                                    },
                                    name: "ACCEPT_LABEL"
                                },
                                {
                                    icon: <i className="fas fa-times" />,
                                    styles: {
                                        color: "#EB164B",
                                        background: "#FFE6E9"
                                    },
                                    name: "CANCEL_MARK"
                                },
                                {
                                    icon: <i className="far fa-calendar" />,
                                    styles: {
                                        color: "#E11DE6",
                                        background: "#FFEAFF"
                                    },
                                    name: "PLAN_MARK"
                                },
                                {
                                    icon: <i className="fas fa-tag" />,
                                    styles: {
                                        color: "#07D0AD",
                                        background: "#DBFCF5"
                                    },
                                    name: "MARKED_LABEL"
                                },
                                {
                                    icon: <i className="fas fa-search" />,
                                    styles: {
                                        color: "#4E58D1",
                                        background: "#EAEEFD"
                                    },
                                    name: "SEARCH_LABEL"
                                }
                            ].map(({ styles, icon, name }, index) => (
                                <DisplayMark
                                    key={ index }
                                    styles={{
                                        ...styles,
                                        animationDelay: index * .25 + "s",
                                    }}
                                    icon={ icon }
                                    onAction={ () => this.props.submitLabelAction(name) }
                                />
                            ))
                        }
                    </div>
                    <div className="rn-home-display-marks-new">
                        <div className="rn-home-display-marks-new-list">
                            <button className="rn-home-display-marks-new-list-btn definp" onClick={ this.props.onCreateList }>
                                <i className="fas fa-list" />
                                <span>Todo</span>
                            </button>
                            <button className="rn-home-display-marks-new-list-btn definp" onClick={ this.props.onCreateNotebook }>
                                <i className="fas fa-book-open" />
                                <span>Notes</span>
                            </button>
                            <input
                                type="file"
                                id="rn-home-display-marks-new-list-btnupload"
                                className="hidden"
                                onChange={ ({ target: { files } }) => this.props.onUploadFile(files[0]) } // on upload
                            />
                            <label
                                className="rn-home-display-marks-new-list-btn definp"
                                htmlFor="rn-home-display-marks-new-list-btnupload">
                                <i className="fas fa-file" />
                                <span>File</span>
                            </label>
                        </div>
                        <DisplayMark
                            styles={{
                                color: "#0382FF",
                                background: "#E1F1FF"
                            }}
                            icon={ <i className="fas fa-plus" /> }
                        />
                    </div>
                </div>
            </div>
        );
    }
}

class TexteditorPlaceholder extends Component {
    render() {
        return(
            <img
                src={ loadingBG }
                alt=""
                className="placeholder"
                style={{
                    height: this.props.height,
                    width: this.props.width
                }}
            />
        );
    }
}

class Texteditor extends Component {
    constructor(props) {
        super(props);

        this.titleRef = this.contentRef = React.createRef();
    }

    preventTags = (a, ea) => {
        return ea.preventDefault();

        // let f = ea.clipboardData.getData("Text");

        // {
        //     let b = document.createElement("div");
        //     b.innerHTML = f;
        //     if(b.textContent === b.innerHTML) return;
        // }

        // let b = this[a].innerHTML, // html
        //     c = window.getSelection().anchorOffset,
        //     d = b.substring(0, c),
        //     e = b.substring(c + 1, b.length),
        //     g = document.createElement('div');d

        // g.innerHTML = f;
        
        // this[a].innerHTML = d + g.textContent + e;asd
    }

    validateContent = a => {
        if(this[a].innerHTML === "<br>") this[a].innerHTML = "";
    }

    componentDidUpdate() {
        if(this.props.data) this.contentRef.innerHTML = this.props.data.content;
    }

    render() {
        if(this.props.data === null) return null;

        if(this.props.data === false) return(
            <div className="rn-home-txted active">
                <div className="rn-home-txted-mat placeholder">
                    <TexteditorPlaceholder
                        height="40px"
                        width="600px"
                    />
                    <TexteditorPlaceholder
                        height="20px"
                        width="480px"
                    />
                    <TexteditorPlaceholder
                        height="20px"
                        width="515px"
                    />
                    <TexteditorPlaceholder
                        height="20px"
                        width="425px"
                    />
                    <TexteditorPlaceholder
                        height="20px"
                        width="550px"
                    />
                    <TexteditorPlaceholder
                        height="20px"
                        width="175px"
                    />
                </div>
            </div>
        );

        return(
            <div className={ `rn-home-txted${ (!this.props.active) ? "" : " active" }` }>
                <button className="rn-home-txted-menu definp" onClick={ () => this.props._onSubmit(this.titleRef.innerText, this.contentRef.innerHTML) }>
                    Save and Exit
                </button>

                <div className="rn-home-txted-mat">
                    <p
                        type="text"
                        className="rn-home-txted-mat-title definp"
                        placeholder="Type your title"
                        contentEditable={ true }
                        suppressContentEditableWarning={ true }
                        onKeyDown={ () => this.validateContent("titleRef") }
                        spellCheck="false"
                        ref={ ref => this.titleRef = ref }
                        onPaste={ e => this.preventTags("titleRef", e) }>
                        { this.props.data.title }
                    </p>
                    <p
                        placeholder="Start typing your note"
                        className="rn-home-txted-mat-content definp"
                        contentEditable={ true }
                        suppressContentEditableWarning={ true }
                        onKeyDown={ () => this.validateContent("contentRef") }
                        spellCheck="false"
                        ref={ ref => this.contentRef = ref }
                        onPaste={ e => this.preventTags("contentRef", e) }>
                    </p>
                </div>
            </div>
        );
    }
}

class Demonstration extends Component {
    constructor(props) {
        super(props)
        
        this.state = {
            type: "NOT_LOADED",
            content: ""
        }
    }

    componentWillUpdate(a) {
        let b = this.props.data;
        if((!b && a.data && a.data.content) || (b && a.data && a.data.content && b.url !== a.data.url)) { // display: text
            this.setState(() => ({
                type: "TEXT_DATA",
                content: a.data.content
            }));
        } else if((!b && a.data && a.data.url && !a.data.content) || (b && a.data && !a.data.content && a.data.url && a.data.url !== b.url)) { // XXX
            // Try to get image
            let image = document.createElement("img");
            image.src = apiPath + a.data.url;
            image.onload = () => {
                this.setState(() => ({
                    type: "IMAGE_DATA",
                    content: image.src
                }));
            } // display: image file
            image.onerror = () => this.setState(() => ({
                type: "ERROR_TYPE"
            })); // !call error: this file cannot be readed
        }
    }

    getContent = () => {
        if(this.props.isLoading) {
            return(
                <div className={ `rn-home-demonstration${ (!this.props.active) ? "" : " view" }` }>
                    <div className="rn-home-demonstration-alertion-loader" />
                </div>
            );
        } else { // loaded
            let a = "";
            switch(this.state.type) {
                case 'NOT_LOADED':
                    a = (
                        <div className={ `rn-home-demonstration${ (!this.props.active) ? "" : " view" }` }>
                            <p className="rn-home-demonstration-alertion">We didn't receive information about your file.</p>
                        </div>
                    );
                break;
                case 'TEXT_DATA':
                    a = (
                        <div className={ `rn-home-demonstration text${ (!this.props.active) ? "" : " view" }` }>
                            <p className="rn-home-demonstration-text" ref={ref =>{
                                if(!ref) return null;
                                ref.innerHTML = this.state.content.replace(/\n/g, "<div />");
                            }} />
                        </div>
                    );
                break;
                case 'IMAGE_DATA':
                    a = (
                        <div className={ `rn-home-demonstration${ (!this.props.active) ? "" : " view" }` }>
                            <img
                                className="rn-home-demonstration-image"
                                src={ this.state.content } 
                                alt="user file"
                            />
                        </div>
                    );
                break;
                case 'ERROR_TYPE':
                default:
                    a = (
                        <div className={ `rn-home-demonstration${ (!this.props.active) ? "" : " view" }` }>
                            <p className="rn-home-demonstration-alertion">So... I think that we don't support this type of files.</p>
                        </div>
                    );
                break;
            }

            return a;
        }
    }

    render() {
        return(
            <React.Fragment>
                <div
                    className={ `rn-home-demonstrationbg${ (!this.props.active) ? "" : " view" }` }
                    onClick={() => {
                        this.setState(() => ({
                            type: "NOT_LOADED",
                            content: ""
                        }), this.props.onClose);
                    }}
                />
                { this.getContent() }
            </React.Fragment>
        );
    }
}

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            criticalError: false,
            stage: "TODOS_STAGE", // ? TODOS_STAGE, NOTES_STAGE, FILES_STAGE
            topics: false,
            project: null,
            noteEditor: false,
            demonstrationView: false,
            demonstrationData: null,
            noteEditorData: null,
            fileUploading: false,
            fileError: false,
            selectedTasks: [],
            selectedNotes: [],
            selectedFiles: [],
            projectsInQuery: [],
            notebooksInQuery: 0,
            topicsInQuery: 0,
            todosInQuery: 0,
            tasksInQuery: [],
            stagesInQuery: [],
            notesInQuery: []
        }
    }

    componentDidMount() {
        let { id, authToken } = cookieControl.get("userdata");

        client.query({
            query: gql`
                query($id: ID!, $authToken: String!) {
                    user(id: $id, authToken: $authToken) {
                        id,
                        topics {
                            id,
                            name,
                            color,
                            projects {
                                id,
                                name
                            }
                        }
                    }
                }
            `,
            variables: {
                id, authToken
            }
        }).then(({ data: { user } }) => {
            if(!user) {
                return this.setState(() => ({
                    criticalError: true
                }));
            }

            let { topics } = user;
            this.setState(() => ({
                topics
            }));
        });
    }

    alertError = (message = "") => {
        const defErr = "Something wrong. Could you restart the application, please?";

        client.clearStore();
        this.setState(() => ({
            project: {
                error: true,
                message: message || defErr
            }
        }));
    }

    fetchProject = targetID => {
        if(this.state.project && this.state.project.id && targetID === this.state.project.id) return;
        
        this.setState(() => ({
            project: false,
            selectedTasks: []
        }));

        let { id, authToken } = cookieControl.get("userdata");
        client.query({
            query: gql`
                query($id: ID!, $authToken: String!, $targetID: ID!) {
                    project(targetID: $targetID, id: $id, authToken: $authToken) {
                        id,
                        name,
                        todosInt,
                        notebooksInt,
                        filesInt,
                        todos {
                            id,
                            title,
                            tasks {
                                id,
                                name,
                                isDone,
                                labels,
                                time
                            }
                        },
                        topic {
                            id
                        }
                    }
                }
            `,
            variables: {
                id, authToken, targetID
            }
        }).then(({ data: { project } }) => {
            if(!project) {
                client.clearStore();
                return this.alertError("We encountered an error while opening your project. Please, try again.");
            }

            this.setState(() => ({
                project
            }));
        }).catch(() => this.alertError());
    }

    selectTask = id => {
        this.setState(({ selectedTasks }) => {
            let a = Array.from(selectedTasks);

            if(!selectedTasks.includes(id)) a.push(id); // add
            else a.splice(a.findIndex(io => io === id), 1); // delete

            return {
                selectedTasks: a
            }
        })
    }

    spreadLabel = label => {
        if(this.state.stage === "TODOS_STAGE") { // TODOS_STAGE, NOTES_STAGE, FILES_STAGE
            let a = this.state.selectedTasks;
            if(!a.length) return;

            {
                let b = Array.from(this.state.project.todos),
                    c = "forEach",
                    d = "includes";

                b[c](({ tasks }, _) => {
                    tasks[c]((ic, id, ie) => {
                        if(a[d](ic.id)) {
                            if(ic.labels[d](label)) ie[id].labels.splice(ic.labels.findIndex(io => io === label), 1);
                            else ie[id].labels.push(label);
                        }
                    });
                });

                this.setState(({ project }) => ({
                    project: {
                        ...project,
                        todos: b
                    }
                }));
            }

            let { id, authToken } = cookieControl.get("userdata");
            client.mutate({
                mutation: gql`
                    mutation($id: ID!, $authToken: String!, $targetsID: [String!]!, $label: String!) {
                        updateTaskLabel(id: $id, authToken: $authToken, targetsID: $targetsID, label: $label)
                    }
                `,
                variables: {
                    id, authToken, label,
                    targetsID: a,
                }
            }).then(({ data: { updateTaskLabel: data } }) => {
                if(!data) {
                    return this.alertError();
                }
            }).catch(() => this.alertError());
        } else if(this.state.stage === "NOTES_STAGE") {
            let a = this.state.selectedNotes;
            if(!a.length) return;

            {
                let b = Array.from(this.state.project.notebooks),
                    c = "forEach",
                    d = "includes";

                b[c](({ notes }, ib) => {
                    notes[c]((ic, id, ie) => {
                        if(a[d](ic.id)) {
                            ie[id].label = label;
                        }
                    });
                });

                this.setState(({ project }) => ({
                    project: {
                        ...project,
                        notes: b
                    }
                }));

                let { id, authToken } = cookieControl.get("userdata");
                client.mutate({
                    mutation: gql`
                        mutation($id: ID!, $authToken: String!, $label: String!, $targetsID: [ID!]!) {
                            updateNoteLabel(id: $id, authToken: $authToken, label: $label, targetsID: $targetsID)
                        }
                    `,
                    variables: {
                        id, authToken, label,
                        targetsID: a
                    }
                }).then(({ data: { updateNoteLabel: note } }) => {
                    if(!note) return this.alertError();
                }).catch(() => this.alertError());
            }
        } else if(this.state.stage === "FILES_STAGE") {
            let a = this.state.selectedFiles;
            if(!a.length) return null;

            {
                let b = Array.from(this.state.project.files);
                b.forEach(({ id: io }, ia, ik) => {
                    if(a.includes(io)) {
                        ik[ia].label = label;
                    }
                });

                this.setState(({ project }) => ({
                    project: {
                        ...project,
                        files: b
                    }
                }));
            }

            let { id, authToken } = cookieControl.get("userdata");
            client.mutate({
                mutation: gql`
                    mutation($id: ID!, $authToken: String!, $label: String!, $targetsID: [ID!]!) {
                        updateFileLabel(id: $id, authToken: $authToken, label: $label, targetsID: $targetsID)
                    }
                `,
                variables: {
                    id, authToken, label,
                    targetsID: this.state.selectedFiles
                }
            }).catch(() => this.alertError());
        }
    }

    deleteTodo = targetID => {
        let a = Array.from(this.state.project.todos);
        a.splice(a.findIndex( ({ id }) => id === targetID ), 1);

        this.setState(({ project, project: { todosInt } }) => ({
            project: {
                ...project,
                todosInt: todosInt - 1,
                todos: a
            }
        }));

        let { id, authToken } = cookieControl.get("userdata");
        client.mutate({
            mutation: gql`
                mutation($id: ID!, $authToken: String!, $targetID: ID!) {
                    deleteTodo(id: $id, authToken: $authToken, targetID: $targetID)
                }
            `,
            variables: {
                id, authToken, targetID
            }
        }).then(({ data: { deleteTodo } }) => {
            if(!deleteTodo) {
                return this.alertError();
            }
        }).catch(() => this.alertError());
    }

    deleteTask = (todoID, targetID) => {
        let a = Array.from(this.state.project.todos),
            b = a[a.findIndex( ({ id }) => id === todoID )].tasks;
        b.splice(b.findIndex( ({ id }) => id === targetID ), 1);

        this.setState(({ project }) => ({
            project: {
                ...project,
                todos: a
            }
        }));

        let { id, authToken } = cookieControl.get("userdata");
        client.mutate({
            mutation: gql`
                mutation($id: ID!, $authToken: String!, $targetID: ID!) {
                    deleteTask(id: $id, authToken: $authToken, targetID: $targetID)
                }
            `,
            variables: {
                id, authToken, targetID
            }
        }).then(({ data: { deleteTask } }) => {
            if(!deleteTask) {
                return this.alertError();
            }
        }).catch(() => this.alertError());
    }

    submitTaskName = (value, todoID, taskID) => {
        let a = Array.from(this.state.project.todos),
            b = a[a.findIndex( ({ id }) => id === todoID )].tasks;

        b[b.findIndex( ({ id }) => id === taskID )].name = value;

        this.setState(({ project }) => ({
            project: {
                ...project,
                todos: a
            }
        }));

        let { id, authToken } = cookieControl.get("userdata");
        client.mutate({
            mutation: gql`
                mutation($id: ID!, $authToken: String!, $targetID: ID!, $value: String!) {
                    setTaskName(id: $id, authToken: $authToken, targetID: $targetID, value: $value)
                }              
            `,
            variables: {
                id, authToken, value,
                targetID: taskID
            }
        }).then(({ data: { setTaskName: data } }) => {
            if(!data) {
                return this.alertError("");
            }
        }).catch(() => this.alertError());
    }

    submitTodoName = (targetID, value) => {
        let a = Array.from(this.state.project.todos);
        a[a.findIndex( ({ id }) => id === targetID )].title = value;

        this.setState(({ project }) => ({
            project: {
                ...project,
                todos: a
            }
        }));

        let { id, authToken } = cookieControl.get("userdata");
        client.mutate({
            mutation: gql`
                mutation($id: ID!, $authToken: String!, $targetID: ID!, $value: String!) {
                    setTodoName(id: $id, authToken: $authToken, targetID: $targetID, value: $value)
                }              
            `,
            variables: {
                id, authToken,
                value, targetID
            }
        }).then(({ data: { setTodoName: data } }) => {
            if(!data) {
                return this.alertError("");
            }
        }).catch(() => this.alertError());
    }

    submitProjectName = value => {
        let a = Array.from(this.state.topics),
            b = this.state.project,
            c = a[a.findIndex( ({ id }) => b.topic.id === id )].projects;

        c[c.findIndex( ({ id }) => id === b.id )].name = value;

        this.setState(({ project }) => ({
            project: {
                ...project,
                name: value
            },
            topics: a
        }));

        let { id, authToken } = cookieControl.get("userdata");
        client.mutate({
            mutation: gql`
                mutation($id: ID!, $authToken: String!, $targetID: ID!, $value: String!) {
                    setProjectName(id: $id, authToken: $authToken, targetID: $targetID, value: $value)
                }              
            `,
            variables: {
                id, authToken,
                value,
                targetID: b.id
            }
        }).then(({ data: { setProjectName: data } }) => {
            if(!data) {
                return this.alertError("");
            }
        }).catch(() => this.alertError());
    }

    deleteCurrentProject = () => {
        let a = Array.from(this.state.topics),
        b = this.state.project,
        c = a[a.findIndex( ({ id }) => b.topic.id === id )].projects;

        c.splice(c.findIndex( ({ id }) => id === b.id ), 1);

        this.setState(() => ({
            project: null,
            topics: a
        }));

        let { id, authToken } = cookieControl.get("userdata");
        client.mutate({
            mutation: gql`
                mutation($id: ID!, $authToken: String!, $targetID: ID!) {
                    deleteProject(id: $id, authToken: $authToken, targetID: $targetID)
                }
            `,
            variables: {
                id, authToken,
                targetID: b.id
            }
        }).then(({ data: { deleteProject: data } }) => {
            if(!data) {
                return this.alertError("");
            }
        }).catch(() => this.alertError());
    }

    submitTopicName = (value, targetID) => {
        let a = Array.from(this.state.topics);
        a[a.findIndex( ({ id }) => id === targetID )].name = value;

        this.setState(() => ({
            topics: a
        }));

        let { id, authToken } = cookieControl.get("userdata");
        client.mutate({
            mutation: gql`
                mutation($id: ID!, $authToken: String!, $targetID: ID!, $value: String!) {
                    setTopicName(id: $id, authToken: $authToken, targetID: $targetID, value: $value)
                }
            `,
            variables: {
                id, authToken,
                targetID, value

            }
        }).then(({ data: { setTopicName: data } }) => {
            if(!data) {
                return this.alertError("");
            }
        }).catch(() => this.alertError());
    }

    deleteTopic = targetID => {
        let a = Array.from(this.state.topics);
        a.splice(a.findIndex( ({ id }) => id === targetID ), 1);

        this.setState(() => ({
            topics: a,
            project: null
        }));

        let { id, authToken } = cookieControl.get("userdata");
        client.mutate({
            mutation: gql`
                mutation($id: ID!, $authToken: String!, $targetID: ID!) {
                    deleteTopic(id: $id, authToken: $authToken, targetID: $targetID)
                }
            `,
            variables: {
                id, authToken,
                targetID
            }
        }).then(({ data: { deleteTopic: data } }) => {
            if(!data) {
                return this.alertError();
            }
        }).catch(console.log); // () => this.alertError()
    }

    createTopic = () => {
        let upQ = v => {
            this.setState(({ topicsInQuery }) => ({
                topicsInQuery: topicsInQuery + v
            }));
        }

        upQ(1);

        let color = "";
        {
            let a = ["green", "blue", "purple", "red"];
            color = a[Math.floor(Math.random() * a.length)];
        }

        let { id, authToken } = cookieControl.get("userdata");
        client.mutate({
            mutation: gql`
                mutation($id: ID!, $authToken: String!, $color: String!) {
                    addTopic(id: $id, authToken: $authToken, color: $color) {
                        id,
                        name,
                        color,
                        projects {
                            id,
                            name
                        }
                    }
                }
            `,
            variables: {
                id, authToken, color
            }
        }).then(({ data: { addTopic: topic } }) => {
            upQ(-1);

            this.setState(({ topics }) => ({
                topics: [
                    ...topics,
                    topic
                ]
            }));
        });
    }

    createProject = topicID => {
        let pQr = pl => {
            if(pl) {
                if(this.state.projectsInQuery.includes(topicID)) return;

                this.setState(({ projectsInQuery }) => ({
                    projectsInQuery: [
                        ...projectsInQuery,
                        topicID
                    ]
                }));
            } else {
                let a = Array.from(this.state.projectsInQuery);
                a.splice(a.findIndex(io => io === topicID), 1);

                this.setState(() => ({
                    projectsInQuery: a
                }))
            }
        }

        pQr(true);

        let name = "";
        {
            let a = ["Project", "The Project", "Data", "Default"];
            name = a[Math.floor(Math.random() * a.length)];
        }

        let { id, authToken } = cookieControl.get("userdata");
        client.mutate({
            mutation: gql`
                mutation($id: ID!, $authToken: String!, $name: String!, $topicID: ID!) {
                    addProject(id: $id, authToken: $authToken, name: $name, topicID: $topicID) {
                        id,
                        name
                    }
                }
            `,
            variables: {
                id, authToken,
                name, topicID
            }
        }).then(({ data: { addProject: project } }) => {
            pQr(false);

            let a = Array.from(this.state.topics);
            a[a.findIndex( ({ id }) => id === topicID )].projects.push(project);
            
            this.setState(() => ({
                topics: a
            }));
        }).catch(() => this.alertError());
    }

    createList = () => {
        let rQp = pl => {
            this.setState(({ todosInQuery }) => ({
                todosInQuery: (pl) ? todosInQuery + 1 : todosInQuery - 1
            }))
        }

        rQp(true);

        let title = "";
        {
            let a = ["Todo", "Todo List", "Tasks", "List"];
            title = a[Math.floor(Math.random() * a.length)];
        }

        let { id, authToken } = cookieControl.get("userdata");
        client.mutate({
            mutation: gql`
                mutation($id: ID!, $authToken: String!, $projectID: ID!, $title: String!) {
                    addTodo(id: $id, authToken: $authToken, projectID: $projectID, title: $title) {
                        id,
                        title,
                        tasks {
                            id,
                            name,
                            isDone,
                            labels,
                            time
                        }
                    }
                }
            `,
            variables: {
                id, authToken, title,
                projectID: this.state.project.id
            }
        }).then(({ data: { addTodo: todo } }) => {
            rQp(false);

            if(!todo) {
                return this.alertError();
            }

            this.setState(({ project, project: { todos, todosInt } }) => ({
                project: {
                    ...project,
                    todosInt: todosInt + 1,
                    todos: [
                        todo,
                        ...todos
                    ]
                }
            }));
        }).catch(() => this.alertError());
    }

    createTask = todoID => {
        let pQr = pl => {
            if(pl) {
                if(this.state.tasksInQuery.includes(todoID)) return;

                this.setState(({ tasksInQuery }) => ({
                    tasksInQuery: [
                        ...tasksInQuery,
                        todoID
                    ]
                }));
            } else {
                let a = Array.from(this.state.tasksInQuery);
                a.splice(a.findIndex(io => io === todoID), 1);

                this.setState(() => ({
                    tasksInQuery: a
                }))
            }
        }

        pQr(true);

        let name = "";
        {
            let a = ["Task"];
            // name = a[Math.floor(Math.random() * a.length)];
            name = a[0];
        }

        let { id, authToken } = cookieControl.get("userdata");
        client.mutate({
            mutation: gql`
                mutation($id: ID!, $authToken: String!, $todoID: ID!, $name: String!) {
                    addTask(id: $id, authToken: $authToken, todoID: $todoID, name: $name) {
                        id,
                        name,
                        isDone,
                        labels,
                        time
                    }
                }
            `,
            variables: {
                id, authToken,
                todoID, name
            }
        }).then(({ data: { addTask: todo } }) => {
            pQr(false);

            if(!todo) {
                return this.alertError();
            }

            let a = Array.from(this.state.project.todos);
            a[a.findIndex( ({ id }) => id === todoID )].tasks.push(todo);

            this.setState(({ project }) => ({
                project: {
                    ...project,
                    todos: a
                }
            }));
        }).catch(() => this.alertError());
    }
    
    toogleTopicColor = topicID => {
        let a = {
            "red":"purple",
            "purple":"green",
            "green":"blue",
            "blue":"red"
        }

        let b = Array.from(this.state.topics);
        let c = b[b.findIndex( ({ id }) => id === topicID )];
        let d = a[c.color];
        c.color = d;

        this.setState(() => ({
            topics: b
        }));

        let { id, authToken } = cookieControl.get("userdata");
        client.mutate({
            mutation: gql`
                mutation($id: ID!, $authToken: String!, $targetID: ID!, $color: String!) {
                    updateTopicColor(id: $id, authToken: $authToken, targetID: $targetID, color: $color)
                }
            `,
            variables: {
                id, authToken,
                color: d,
                targetID: topicID
            }
        })
    }

    requestProjectStage = stage => { // TODOS_STAGE, NOTES_STAGE, FILES_STAGE
        let a = this.state.project;
        if(!a) return null;
        let { id, authToken } = cookieControl.get("userdata");

        this.setState(() => ({ stage }));

        let rQa = (pl, stage) => {
            if(pl) {
                this.setState(({ stagesInQuery }) => ({
                    stagesInQuery: [
                        ...stagesInQuery,
                        [stage]
                    ]
                }));
            } else {
                let a = Array.from(this.state.stagesInQuery);
                a.splice(a[a.findIndex( io => io === stage )], 1);

                this.setState(() => ({
                    stagesInQuery: a
                }));
            }
        }
        
        switch(stage) {
            case 'TODOS_STAGE':
                if(a.todos) return null;
                // Empty
            break;
            case 'NOTES_STAGE':
                if(a.notebooks) return null;

                rQa(true, "NOTES_STAGE");

                client.query({
                    query: gql`
                        query($id: ID!, $authToken: String!, $targetID: ID!, $limit: Int) {
                            project(id: $id, authToken: $authToken, targetID: $targetID) {
                                id,
                                notebooks {
                                    id,
                                    name,
                                    notes {
                                        id,
                                        title,
                                        time,
                                        label,
                                        content(limit: $limit)
                                    }
                                }
                            }
                        }
                    `,
                    variables: {
                        id, authToken,
                        targetID: a.id,
                        limit: noteContentClip
                    }
                }).then(({ data: { project: { notebooks } } }) => {
                    if(!notebooks) return this.alertError();
                    rQa(false, "NOTES_STAGE");

                    this.setState(({ project }) => ({
                        project: {
                            ...project,
                            notebooks
                        }
                    }));
                }).catch(() => this.alertError());
            break;
            case 'FILES_STAGE':
                if(a.files) return null;

                rQa(true, "FILES_STAGE");

                client.query({
                    query: gql`
                        query($id: ID!, $authToken: String!, $targetID: ID!) {
                            project(id: $id, authToken: $authToken, targetID: $targetID) {
                               id,
                               files {
                                    id,
                                    format,
                                    label,
                                    name,
                                    url
                               } 
                            }
                        }
                    `,
                    variables: {
                        id, authToken,
                        targetID: a.id
                    }
                }).then(({ data: { project: { files } } }) => {
                    if(!files) return this.alertError();
                    rQa(false, "FILES_STAGE");

                    this.setState(({ project }) => ({
                        project: {
                            ...project,
                            files
                        }
                    }));
                }).catch(() => this.alertError());
            break;
            default:break;
        }
    }

    submitNotesName = (notebookID, name) => {
        let a = Array.from(this.state.project.notebooks);
        a[a.findIndex( ({ id }) => id === notebookID )].name = name;
        this.setState(({ project }) => ({
            project: {
                ...project,
                notebooks: a
            }
        }));

        let { id, authToken } = cookieControl.get("userdata");
        client.mutate({
            mutation: gql`
                mutation($id: ID!, $authToken: String!, $name: String!, $targetID: ID!) {
                    updateNotebookName(id: $id, authToken: $authToken, name: $name, targetID: $targetID)
                }
            `,
            variables: {
                id, authToken,
                name: name,
                targetID: notebookID
            }
        }).catch(() => this.alertError());
    }

    selectNote = id => {
        let a = Array.from(this.state.selectedNotes);
        if(!a.includes(id)) { // add
            a.push(id);
        } else { // splice
            a.splice(a.findIndex( io => io === id ), 1);
        }

        this.setState(() => ({
            selectedNotes: a
        }));
    }

    deleteNote = (notebookID, noteID) => {
        let a = Array.from(this.state.project.notebooks),
            b = a[a.findIndex( ({ id }) => id === notebookID )].notes;
        b.splice(b.findIndex( ({ id }) => id === noteID ), 1);

        this.setState(({ project }) => ({
            project: {
                ...project,
                notebooks: a
            }
        }));

        let { id, authToken } = cookieControl.get("userdata");
        client.mutate({
            mutation: gql`
                mutation($id: ID!, $authToken: String!, $targetID: ID!) {
                    deleteNote(id: $id, authToken: $authToken, targetID: $targetID)
                }
            `,
            variables: {
                id, authToken,
                targetID: noteID
            }
        }).then(({ data: { deleteNote } }) => {
            if(!deleteNote) return this.alertError();
        }).catch(() => this.alertError());
    }

    deleteNotebook = targetID => {
        let a = Array.from(this.state.project.notebooks);
        a.splice(a.findIndex( ({ id }) => id === targetID ), 1);

        this.setState(({ project, project: { notebooksInt } }) => ({
            project: {
                ...project,
                notebooks: a,
                notebooksInt: notebooksInt - 1
            }
        }));

        let { id, authToken } = cookieControl.get("userdata");
        client.mutate({
            mutation: gql`
                mutation($id: ID!, $authToken: String!, $targetID: ID!) {
                    deleteNotebook(id: $id, authToken: $authToken, targetID: $targetID)
                }
            `,
            variables: {
                id, authToken,
                targetID
            }
        }).then(({ data: { deleteNotebook } }) => {
            if(!deleteNotebook) return this.alertError();
        }).catch(() => this.alertError());
    }

    createNotebook = () => {
        let qRp = fl => {
            this.setState(({ notebooksInQuery: a }) => ({
                notebooksInQuery: (fl) ? a + 1 : a - 1
            }));
        }

        qRp(true);

        let name = "";
        {
            let a  = ["Notebook", "Notes", "New notes pack", "Notes Pack"];
            name = a[Math.floor(Math.random() * a.length)];
        }

        let { id, authToken } = cookieControl.get("userdata");
        client.mutate({
            mutation: gql`
                mutation($id: ID!, $authToken: String!, $name: String!, $projectID: ID!, $limit: Int) {
                    addNotebook(id: $id, authToken: $authToken, name: $name, projectID: $projectID) {
                        id,
                        name,
                        notes {
                            id,
                            title,
                            time,
                            label,
                            content(limit: $limit)
                        }
                    }
                }
            `,
            variables: {
                id, authToken, name,
                projectID: this.state.project.id,
                limit: noteContentClip
            }
        }).then(({ data: { addNotebook: notebook } }) => {
            qRp(false);

            if(!notebook) return this.alertError();
            if(!this.state.project.notebooks) return null;

            this.setState(({ project, project: { notebooks, notebooksInt } }) => ({
                project: {
                    ...project,
                    notebooks: [
                        notebook,
                        ...notebooks
                    ],
                    notebooksInt: notebooksInt + 1
                }
            }));
        }).catch(() => this.alertError());
    }

    createNote = notebookID => {
        let qSi = fl => {
            if(fl) {
                if(this.state.notesInQuery.includes(notebookID)) return;
                this.setState(({ notesInQuery }) => ({
                    notesInQuery: [
                        ...notesInQuery,
                        notebookID
                    ]
                }));
            } else {
                let a = Array.from(this.state.notesInQuery);
                a.splice(a.findIndex( io => io === notebookID ), 1);

                this.setState(() => ({
                    notesInQuery: a
                }));
            }
        }

        qSi(true);

        let title = "";
        {
            let a = ["New note", "Note", "Information", "Data"];
            title = a[Math.floor(Math.random() * a.length)];
        }

        let { id, authToken } = cookieControl.get("userdata");
        client.mutate({
            mutation: gql`
                mutation($id: ID!, $authToken: String!, $title: String!, $notebookID: ID!, $content: String!, $limit: Int) {
                    addNote(id: $id, authToken: $authToken, title: $title, notebookID: $notebookID, content: $content) {
                        id,
                        title,
                        time,
                        label,
                        content(limit: $limit)
                    }
                }
            `,
            variables: {
                id, authToken,
                title, notebookID,
                content: "",
                limit: noteContentClip
            }
        }).then(({ data: { addNote: note } }) => {
            if(!note) return this.alertError();

            qSi(false);

            let a = Array.from(this.state.project.notebooks);
            a[a.findIndex( ({ id }) => id === notebookID )].notes.unshift(note); // not working -> updated

            this.setState(({ project }) => ({
                project: {
                    ...project,
                    notes: a
                }
            }));
        }).catch(() => this.alertError());
    }
    
    openNote = async targetID => {
        this.setState(() => ({
            noteEditor: true,
            noteEditorData: false
        }));

        await client.clearStore();

        let { id, authToken } = cookieControl.get("userdata");
        client.query({
            query: gql`
                query($id: ID!, $authToken: String!, $targetID: ID!) {
                    note(id: $id, authToken: $authToken, targetID: $targetID) {
                        id,
                        title,
                        content,
                        notebook {
                            id
                        }
                    }
                }
            `,
            variables: {
                id, authToken,
                targetID
            }
        }).then(({ data: { note } }) => {
            if(!note) return this.alertError();

            this.setState(() => ({
                noteEditorData: note
            }));
        }).catch(() => this.alertError());
    }

    updateNote = (title, content) => {
        this.setState(() => ({
            noteEditor: false
        }));

        let a = this.state.noteEditorData;

        if(
            a.title === title &&
            a.content === content
        ) return null;

        let { id, authToken } = cookieControl.get("userdata");
        client.mutate({
            mutation: gql`
                mutation($id: ID!, $authToken: String!, $targetID: ID!, $title: String!, $content: String!) {
                    updateNote(id: $id, authToken: $authToken, targetID: $targetID, title: $title, content: $content)
                }
            `,
            variables: {
                id, authToken,
                targetID: a.id,
                title, content
            }
        }).then(({ data: { updateNote: data } }) => {
            if(!data) return this.alertError();

            let b = Array.from(this.state.project.notebooks),
                c = b[b.findIndex( ({ id }) => id === a.notebook.id )].notes,
                d = c[c.findIndex( ({ id }) => id === a.id )];

            d.title = title;
            d.content = content;

            this.setState(({ project }) => ({
                project: {
                    ...project,
                    notebooks: b
                }
            }));
        }).catch(() => this.alertError());
    }
    
    uploadFile = file => {
        if(!file) return;

        let rQa = pl => {
            this.setState(() => ({
                fileUploading: pl
            }));
        }

        rQa(true);
        this.setState(() => ({
            fileError: false
        }));

        let { id, authToken } = cookieControl.get("userdata");
        client.mutate({
            mutation: gql`
                mutation($id: ID!, $authToken: String!, $projectID: ID!, $file: Upload!) {
                    createFile(id: $id, authToken: $authToken, projectID: $projectID, file: $file) {
                        id,
                        format,
                        label,
                        name,
                        url
                    }
                }
            `,
            variables: {
                id, authToken, file,
                projectID: this.state.project.id
            }
        }).then(({ data: { createFile: file } }) => {
            rQa(false);
            if(!file) return this.setState(() => ({
                fileError: "An error occurred while uploading a new file"
            }));

            if(!this.state.project.files) return null;
            this.setState(({ project, project: { files, filesInt } }) => ({
                project: {
                    ...project,
                    files: [
                        file,
                        ...files
                    ],
                    filesInt: filesInt + 1
                }
            }));
        }).catch(() => this.setState({ fileError: true })); // alertError? fileErr!
    }

    submitFileName = (name, targetID) => {
        let a = Array.from(this.state.project.files);
        a[a.findIndex( ({ id }) => id === targetID )].name = name;
        this.setState(({ project }) => ({
            project: {
                ...project,
                files: a
            }
        }));

        let { id, authToken } = cookieControl.get("userdata");
        client.mutate({
            mutation: gql`
                mutation($id: ID!, $authToken: String!, $name: String!, $targetID: ID!) {
                    updateFileName(id: $id, authToken: $authToken, name: $name, targetID: $targetID)
                }
            `,
            variables: {
                id, authToken,
                name, targetID
            }
        }).catch(() => this.alertError())
    }

    deleteFile = targetID => {
        let a = Array.from(this.state.project.files);
        a.splice(a.findIndex( ({ id }) => id === targetID ), 1);
        this.setState(({ project }) => ({
            project: {
                ...project,
                files: a
            }
        }));

        let { id, authToken } = cookieControl.get("userdata");
        client.mutate({
            mutation: gql`
                mutation($id: ID!, $authToken: String!, $targetID: ID!) {
                    deleteFile(id: $id, authToken: $authToken, targetID: $targetID)
                }
            `,
            variables: {
                id, authToken,
                targetID
            }
        }).catch(() => this.alertError());
    }

    selectFile = id => {
        if(!this.state.selectedFiles.includes(id)) { // add
            this.setState(({ selectedFiles: a }) => ({
                selectedFiles: [
                    ...a,
                    id
                ]
            }));
        } else { // remove
            let a = Array.from(this.state.selectedFiles);
            a.splice(a.findIndex( io => io === id ), 1);
            this.setState(() => ({
                selectedFiles: a
            }));
        }
    }

    openFile = url => {
        // Ok, this can be realized using XMLHttpRequest, but it's still not support docx and pdf and it's imposible to validate creator.
        // However, It's faster than API-Read.
        // -Changable -> API-Read

        this.setState(() => ({
            demonstrationView: true,
            demonstrationData: false
        }));

        // have special files support, but slower
        let { id, authToken } = cookieControl.get("userdata");
        client.query({
            query: gql`
                query($id: ID!, $authToken: String!, $url: String!) {
                    readTextFile(id: $id, authToken: $authToken, url: $url)
                }
            `,
            variables: {
                id, authToken,
                url
            }
        }).then(({ data: { readTextFile: text } }) => {
            if(!text) return this.setState(() => ({
                fileError: "We cannot open this file. Please, try later."
            }));

            this.setState(() => ({
                demonstrationData: {
                    url,
                    content: (text.indexOf("�") === -1) ? text : ""
                }
            }))
        }).catch(() => this.alertError());

        // have not special files support, but faster
        // var a = new XMLHttpRequest();
        // a.open('GET', apiPath + url, true);
        // a.send(null);
        // a.onreadystatechange = function () {
        //     if(a.readyState === 4 && a.status === 200) {
        //         this.setState(() => ({
        //             demonstrationData: {
        //                 url,
        //                 content: a.responseText
        //             }
        //         }));
        //     }
        // }
    }

    render() {
        if(this.state.criticalError) return <ErrorWindow />

        return(
            <div className="rn rn-home">
                <Topics
                    isLoading={ this.state.topics === false }
                    data={ this.state.topics || [] }
                    onProjectCall={ this.fetchProject }
                    onSubmitTopicName={ this.submitTopicName }
                    onDeleteTopic={ this.deleteTopic }
                    onCreateTopic={ this.createTopic }
                    topicsInQuery={ this.state.topicsInQuery }
                    projectsInQuery={ this.state.projectsInQuery }
                    onCreateProject={ this.createProject }
                    activeID={ this.state.project ? this.state.project.id : -1 }
                    toggleTopicColor={ this.toogleTopicColor }
                />
                <Display
                    error={ (this.state.project && this.state.project.error) ? true:false }
                    isEmpty={ this.state.project === null }
                    isLoading={ this.state.project === false }
                    data={ this.state.project }
                    onSelectTask={ this.selectTask }
                    selectedTasks={ this.state.selectedTasks }
                    todosInQuery={ this.state.todosInQuery }
                    tasksInQuery={ this.state.tasksInQuery }
                    submitLabelAction={ this.spreadLabel }
                    onDeleteTask={ this.deleteTask }
                    onDeleteTodo={ this.deleteTodo }
                    onSubmitTaskName={ this.submitTaskName }
                    onSubmitTodoName={ this.submitTodoName }
                    onSubmitProjectName={ this.submitProjectName }
                    onDeleteProject={ this.deleteCurrentProject }
                    onCreateList={ this.createList }
                    onCreateTask={ this.createTask }
                    requestProjectStage={ this.requestProjectStage }
                    onSubmitNotesName={ this.submitNotesName }
                    stagesInQuery={ this.state.stagesInQuery }
                    onSelectNote={ this.selectNote }
                    selectedNotes={ this.state.selectedNotes }
                    stage={ this.state.stage }
                    onOpenNote={ this.openNote }
                    onDeleteNote={ this.deleteNote }
                    onDeleteNotebook={ this.deleteNotebook }
                    onCreateNotebook={ this.createNotebook }
                    notebooksInQuery={ this.state.notebooksInQuery }
                    onCreateNote={ this.createNote }
                    notesInQuery={ this.state.notesInQuery }
                    fileUploading={ this.state.fileUploading }
                    fileError={ this.state.fileError }
                    onUploadFile={ this.uploadFile }
                    onFilesErrClose={ () => this.setState({ fileError: false, fileUploading: false }) }
                    onSubmitFileName={ this.submitFileName }
                    onDeleteFile={ this.deleteFile }
                    selectedFiles={ this.state.selectedFiles }
                    onFileSelect={ this.selectFile }
                    onFileOpen={ this.openFile }
                />
                <Texteditor
                    active={ this.state.noteEditor }
                    data={ this.state.noteEditorData }
                    _onSubmit={ this.updateNote }
                />
                <Demonstration
                    active={ this.state.demonstrationView }
                    data={ this.state.demonstrationData }
                    isLoading={ this.state.demonstrationData === false }
                    onClose={ () => this.setState({ demonstrationView: false, demonstrationData: null }) }
                />
            </div>
        );
    }
}

export default App;