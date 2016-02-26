export default class LadderController {

    constructor ($log, $scope, poller) {
        'ngInject';
        this.$log = $log;

        this.selectedIndex = 0;

        this.poller = poller.get('api/ladder', {
            delay: 5000
        });

        this.poller.promise.then(null, null, response => {
            if (response.status == 200) {
                this.ladder = response.data;
                this.selectedPlayer = this.ladder[this.selectedIndex];
            }
        });

        $scope.$on('$destroy', () => {
            this.poller.remove();
        });
    }

    playerColor(index) {
        if (index) {
            return {
                "background-color": "#" + this.ladder[index].color
            }
        } else if (this.selectedPlayer) {
            return {
                "background-color": "#" + this.selectedPlayer.color
            }
        }
        return {};
    }

    selectPlayer(index) {
        this.selectedIndex = index;
        this.selectedPlayer = this.ladder[this.selectedIndex];
    }
}
