define(['react', 'TimeMessage'], function (React, TimeMessage) {

    /**
     * <Timer start={aDate} />
     */
    var Timer = React.createClass({
        getInitialState: function () {
            return {
                now: new Date()
            };
        },

        componentDidMount: function () {
            var that = this;

            setInterval(function () {
                that.setState({now: new Date()});
            }, 50);
        },

        render: function () {
            var elapsed = this.state.now.getTime() - this.props.start.getTime();

            return <TimeMessage elapsed={elapsed} />;
        }
    });

    return Timer;
});
