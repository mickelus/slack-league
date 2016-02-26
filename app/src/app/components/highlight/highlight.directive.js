export default function highlight($log, $animate) {
    'ngInject';

    let directive = {
        restrict: 'A',
        scope: {
            model: '=highlight'
        },
        link: linkFunc
    }

    return directive;

    function linkFunc(scope, element) {
        $log.debug("link");
        let watcher = scope.$watch('model', (newValue, oldValue) => {
            $log.debug("change", newValue, oldValue);
            if (newValue && oldValue) {
                if (newValue > oldValue) {
                    highlight(element, "increase");
                } else if (newValue < oldValue) {
                    highlight(element, "decrease");
                }
            }
            
        });

        scope.$on("$destroy", watcher);
    }

    function highlight(element, className) {
        element.addClass("highlight");
        $animate.addClass(element, className).then(() => $animate.removeClass(element, className).then(() => element.removeClass("highlight")));
    }
}