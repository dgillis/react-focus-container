'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

var FocusContainer = function (_React$Component) {
    _inherits(FocusContainer, _React$Component);

    function FocusContainer() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, FocusContainer);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = FocusContainer.__proto__ || Object.getPrototypeOf(FocusContainer)).call.apply(_ref, [this].concat(args))), _this), _this._onDocumentFocusIn = function (jqEvent) {
            var domNode = rUtils.findDOMNode(_this);

            if (!_this.state._widgetContainsFocus && containsFocus(domNode)) {
                logger.debug('Acquired focus.');

                _this.setState({
                    _widgetContainsFocus: true
                }, _.bind(function () {
                    this.props.onFocusIn(jqEvent);
                }, _this));
            }
        }, _this._onDocumentFocusOut = function (jqEvent) {
            // The handler is defered since document.activeElement does not get set
            // to the new element until the end of the current thread of execution.
            _.defer(function (that) {
                var domNode;

                domNode = rUtils.findDOMNode(that);

                if (that.state._widgetContainsFocus && !containsFocus(domNode)) {
                    logger.debug('Lost focus.');

                    that.setState({
                        _widgetContainsFocus: false
                    }, function () {
                        that.props.onFocusOut(jqEvent);
                    });
                }
            }, _this);
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(FocusContainer, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var focusInHandler = this._onDocumentFocusIn,
                focusOutHandler = this._onDocumentFocusOut,
                domNode;

            domNode = rUtils.findDOMNode(this);

            this.setState({
                _widgetContainsFocus: containsFocus(domNode)
            }, function () {
                $(document).on('focusin', focusInHandler).on('focusout', focusOutHandler);
            });
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            var $document = $(document),
                focusInHandler = this._onDocumentFocusIn,
                focusOutHandler = this._onDocumentFocusOut;

            focusInHandler && $(document).off('focusin', focusInHandler);
            focusOutHandler && $(document).off('focusout', focusOutHandler);
        }
    }, {
        key: 'render',
        value: function render() {
            t.shape(this.props, { onFocusIn: 'func',
                onFocusOut: 'func' });
            return this.props.children;
        }
    }]);

    return FocusContainer;
}(React.Component);

/**
 * Returns true if container is either equal to element or contains
 * element, otherwise false.
 */


var containsElement = function containsElement(container, element) {
    if (container === element) {
        return true;
    }
    return $(container).has(element).length > 0;
};

/**
 * Returns true if the DOM node either has focus or is the parent of
 * the current element with focus.
 */
var containsFocus = function containsFocus(container) {
    var activeEl = document.activeElement;
    if (!activeEl) {
        logger.warning("document.activeElement is unexpectedly not an object:", activeEl);
    }
    return containsElement(container, activeEl);
};

module.exports = FocusContainer;