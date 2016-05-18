define(['react'], function (React) {
    /**
     * <TimeMessage elapsed={100} />
     */
    var TimeMessage = React.createClass({
        displayName: 'TimeMessage',

        render: function render() {
            var elapsed = Math.round(this.props.elapsed / 100);
            var seconds = elapsed / 10 + (elapsed % 10 ? '' : '.0');

            return React.createElement(
                'p',
                null,
                'This test has been running for ',
                seconds,
                ' seconds.'
            );
        }
    });

    return TimeMessage;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzeC9UaW1lTWVzc2FnZS5qc3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxDQUFDLE9BQUQsQ0FBUCxFQUFrQixVQUFVLEtBQVYsRUFBaUI7Ozs7QUFJL0IsUUFBSSxjQUFjLE1BQU0sV0FBTixDQUFrQjtBQUFBOztBQUNoQyxnQkFBUSxrQkFBWTtBQUNoQixnQkFBSSxVQUFVLEtBQUssS0FBTCxDQUFXLEtBQUssS0FBTCxDQUFXLE9BQVgsR0FBcUIsR0FBaEMsQ0FBZDtBQUNBLGdCQUFJLFVBQVUsVUFBVSxFQUFWLElBQWdCLFVBQVUsRUFBVixHQUFlLEVBQWYsR0FBb0IsSUFBcEMsQ0FBZDs7QUFFQSxtQkFBTztBQUFBO2dCQUFBO2dCQUFBO2dCQUFtQyxPQUFuQztnQkFBQTtBQUFBLGFBQVA7QUFDSDtBQU4rQixLQUFsQixDQUFsQjs7QUFTQSxXQUFPLFdBQVA7QUFDSCxDQWREIiwiZmlsZSI6IlRpbWVNZXNzYWdlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZGVmaW5lKFsncmVhY3QnXSwgZnVuY3Rpb24gKFJlYWN0KSB7XHJcbiAgICAvKipcclxuICAgICAqIDxUaW1lTWVzc2FnZSBlbGFwc2VkPXsxMDB9IC8+XHJcbiAgICAgKi9cclxuICAgIHZhciBUaW1lTWVzc2FnZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcclxuICAgICAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIGVsYXBzZWQgPSBNYXRoLnJvdW5kKHRoaXMucHJvcHMuZWxhcHNlZCAvIDEwMCk7XHJcbiAgICAgICAgICAgIHZhciBzZWNvbmRzID0gZWxhcHNlZCAvIDEwICsgKGVsYXBzZWQgJSAxMCA/ICcnIDogJy4wJyApO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIDxwPlRoaXMgdGVzdCBoYXMgYmVlbiBydW5uaW5nIGZvciB7c2Vjb25kc30gc2Vjb25kcy48L3A+O1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBUaW1lTWVzc2FnZTtcclxufSk7XHJcbiJdfQ==
