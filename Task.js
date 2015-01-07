angular.module('PivotalApp').factory('Task', ['$resource', function($resource) {
    var Task = $resource('projects/:projectId/stories/:storyId/tasks', {}, {
        query: {
            isArray: true,
            transformResponse: function(response) {
                var tasks = JSON.parse(response);
                tasks.forEach(function(t) {
                    t.hours = parseTaskHours(t);
                });
                return tasks;
            }
        }
    });

    function parseTaskHours(task) {
        var match = task.description.match(/\[(\s*\d+\s*)\]/);
        if (match) {
            var value = match[1].trim();
            var number = Number.parseInt(value);
            return isNaN(number) ? null : number;
        }
        return null;
    }

    return Task;
}]);
