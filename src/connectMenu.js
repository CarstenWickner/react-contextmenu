import React, { Component } from 'react';

import ContextMenuTrigger from './ContextMenuTrigger';
import listener from './globalEventListener';
import { copyExcludingKeys } from './helpers';

// collect ContextMenuTrigger's expected props to NOT pass them on as part of the context
const ignoredTriggerProps = Object.keys(ContextMenuTrigger.propTypes);

// expect the id of the menu to be responsible for as outer parameter
export default function (menuId) {
    // expect menu component to connect as inner parameter
    // <Child/> is presumably a wrapper of <ContextMenu/>
    return function (Child) {
        // return wrapper for <Child/> that forwards the ContextMenuTrigger's additional props
        return class ConnectMenu extends Component {
            constructor(props) {
                super(props);
                this.state = { target: null, trigger: null };
            }

            componentDidMount() {
                this.listenId = listener.register(this.handleShow, this.handleHide);
            }

            componentWillUnmount() {
                if (this.listenId) {
                    listener.unregister(this.listenId);
                }
            }

            handleShow = (e) => {
                if (e.detail.id === menuId) {
                    const target = e.detail.target;
                    // the onShow event's detail.data object holds all ContextMenuTrigger props
                    const trigger = copyExcludingKeys(e.detail.data, ignoredTriggerProps);
                    this.setState({ target, trigger });
                }
            }

            handleHide = () => {
                this.setState({ target: null, trigger: null });
            }

            render() {
                return (
                    <Child
                        {...this.props}
                        id={menuId}
                        target={this.state.target}
                        trigger={this.state.trigger} />
                );
            }
        };
    };
}
