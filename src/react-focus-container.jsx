var React = require('react'),
    rUtils = require('react-utils'),
    $ = require('jquery'),
    _ = require('lodash'),
    t = require('types'),
    logging = require('logging');


var logger = logging.getLogger('WidgetFocusMixin').setLevel('debug');


/**
 * This component standardizes focus in/out behaviour for widgets that have a
 * hide/fadeout/slideout/etc. behaviour that should be triggered when an element
 * outside of the widget becomes the activeElement.
 *
 * The component will add event listeners for focusin/focusout (jQuery-style
 * events) across the DOM. Whenever the activeElement transitions from
 * (to) an element within (outside) the widget to (from) an element
 * outside (within) the widget, the "onWidgetFocusOut" ("onWidgetFocusIn")
 * callback prop and the "_onWidgetFocusOut" ("_onWidgetFocusIn") method
 * will be invoked, if they exist.
 *
 * NOTE: When using the component, ensure that its child node's top-level
 * component is capable of acquiring focus (by default, only the "a", "input",
 * "button", "iframe" and "select" elements can acquire focusKeep but any
 * element can be given the ability to acquire focus by providing the "tabIndex"
 * prop; leave it "0" to not specify any ordering).
 *
 * @param {function} onFocusIn
 * @param {function} onFocusOut
 * @param {Node} children
 */
class FocusContainer extends React.Component {
    componentDidMount() {
        var focusInHandler = this._onDocumentFocusIn,
            focusOutHandler = this._onDocumentFocusOut,
            domNode;

        domNode = rUtils.findDOMNode(this);

        this.setState({
            _widgetContainsFocus: containsFocus(domNode)
        }, function() {
            $(document).on('focusin', focusInHandler).on('focusout',
                                                         focusOutHandler);
        });
    }

    componentWillUnmount() {
        var $document = $(document),
            focusInHandler = this._onDocumentFocusIn,
            focusOutHandler = this._onDocumentFocusOut;

        focusInHandler && $(document).off('focusin', focusInHandler);
        focusOutHandler && $(document).off('focusout', focusOutHandler);
    }

    render() {
        t.shape(this.props, {onFocusIn: 'func',
                             onFocusOut: 'func'});
        return this.props.children;
    }

    _onDocumentFocusIn = (jqEvent) => {
        var domNode = rUtils.findDOMNode(this);

        if (!this.state._widgetContainsFocus && containsFocus(domNode)) {
            logger.debug('Acquired focus.');

            this.setState({
                _widgetContainsFocus: true
            }, _.bind(function() {
                this.props.onFocusIn(jqEvent);
            }, this));
        }
    };

    _onDocumentFocusOut = (jqEvent) => {
        // The handler is defered since document.activeElement does not get set
        // to the new element until the end of the current thread of execution.
        _.defer(function(that) {
            var domNode;

            domNode = rUtils.findDOMNode(that);

            if (that.state._widgetContainsFocus && !containsFocus(domNode)) {
                logger.debug('Lost focus.');

                that.setState({
                    _widgetContainsFocus: false
                }, function() {
                    that.props.onFocusOut(jqEvent);
                });
            }
        }, this);
    };
}


/**
 * Returns true if container is either equal to element or contains
 * element, otherwise false.
 */
var containsElement = function(container, element) {
    if (container === element) { return true; }
    return $(container).has(element).length > 0;
};


/**
 * Returns true if the DOM node either has focus or is the parent of
 * the current element with focus.
 */
var containsFocus = function(container) {
    var activeEl = document.activeElement;
    if (!activeEl) {
        logger.warning(
            "document.activeElement is unexpectedly not an object:",
            activeEl);
    }
    return containsElement(container, activeEl);
};


module.exports = FocusContainer;
