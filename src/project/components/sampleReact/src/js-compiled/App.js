define(['react', 'TimeMessage'], function (React, TimeMessage) {

    /**
     * <Timer start={aDate} />
     */
    var Timer = React.createClass({
        displayName: 'Timer',

        getInitialState: function getInitialState() {
            return {
                now: new Date()
            };
        },

        componentDidMount: function componentDidMount() {
            var that = this;

            setInterval(function () {
                that.setState({ now: new Date() });
            }, 50);
        },

        render: function render() {
            var elapsed = this.state.now.getTime() - this.props.start.getTime();

            return React.createElement(TimeMessage, { elapsed: elapsed });
        }
    });

    return Timer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2pzeC9BcHAuanN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sQ0FBQyxPQUFELEVBQVUsYUFBVixDQUFQLEVBQWlDLFVBQVUsS0FBVixFQUFpQixXQUFqQixFQUE4Qjs7Ozs7QUFLM0QsUUFBSSxRQUFRLE1BQU0sV0FBTixDQUFrQjtBQUFBOztBQUMxQix5QkFBaUIsMkJBQVk7QUFDekIsbUJBQU87QUFDSCxxQkFBSyxJQUFJLElBQUo7QUFERixhQUFQO0FBR0gsU0FMeUI7O0FBTzFCLDJCQUFtQiw2QkFBWTtBQUMzQixnQkFBSSxPQUFPLElBQVg7O0FBRUEsd0JBQVksWUFBWTtBQUNwQixxQkFBSyxRQUFMLENBQWMsRUFBQyxLQUFLLElBQUksSUFBSixFQUFOLEVBQWQ7QUFDSCxhQUZELEVBRUcsRUFGSDtBQUdILFNBYnlCOztBQWUxQixnQkFBUSxrQkFBWTtBQUNoQixnQkFBSSxVQUFVLEtBQUssS0FBTCxDQUFXLEdBQVgsQ0FBZSxPQUFmLEtBQTJCLEtBQUssS0FBTCxDQUFXLEtBQVgsQ0FBaUIsT0FBakIsRUFBekM7O0FBRUEsbUJBQU8sb0JBQUMsV0FBRCxJQUFhLFNBQVMsT0FBdEIsR0FBUDtBQUNIO0FBbkJ5QixLQUFsQixDQUFaOztBQXNCQSxXQUFPLEtBQVA7QUFDSCxDQTVCRCIsImZpbGUiOiJBcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJkZWZpbmUoWydyZWFjdCcsICdUaW1lTWVzc2FnZSddLCBmdW5jdGlvbiAoUmVhY3QsIFRpbWVNZXNzYWdlKSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiA8VGltZXIgc3RhcnQ9e2FEYXRlfSAvPlxyXG4gICAgICovXHJcbiAgICB2YXIgVGltZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XHJcbiAgICAgICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBub3c6IG5ldyBEYXRlKClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcblxyXG4gICAgICAgICAgICBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnNldFN0YXRlKHtub3c6IG5ldyBEYXRlKCl9KTtcclxuICAgICAgICAgICAgfSwgNTApO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgZWxhcHNlZCA9IHRoaXMuc3RhdGUubm93LmdldFRpbWUoKSAtIHRoaXMucHJvcHMuc3RhcnQuZ2V0VGltZSgpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIDxUaW1lTWVzc2FnZSBlbGFwc2VkPXtlbGFwc2VkfSAvPjtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gVGltZXI7XHJcbn0pO1xyXG4iXX0=
