define(['react'], function (React) {
    /**
     * <TimeMessage elapsed={100} />
     */
    var TimeMessage = React.createClass({
        render: function () {
            var elapsed = Math.round(this.props.elapsed / 100);
            var seconds = elapsed / 10 + (elapsed % 10 ? '' : '.0' );

            return <p>This test has been running for {seconds} seconds.</p>;
        }
    });

    return TimeMessage;
});
