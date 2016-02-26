export class ReportsController {
    constructor ($log, $scope, poller, moment) {
        'ngInject';
        this.$log = $log;

        this.poller = poller.get('api/reports', {
            delay: 5000
        });

        this.poller.promise.then(null, null, response => {
            if (response.status == 200) {
                this.reports = response.data;
                this.reports.forEach(report => {
                    report.moment = moment(report.date).format("D/M HH:mm");
                })
            }
        });

        $scope.$on('$destroy', () => {
            this.poller.remove();
        });
    }

    playerColor(data) {
        return {
            "border-color": "#" + data.color
        }
    }
}
