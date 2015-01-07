angular.module('PivotalApp').factory('Task', ['$resource', function($resource) {
    var Task = $resource('projects/:project_id/stories/:story_id/tasks/:id', {
            id:'@id',
            story_id:'@story_id'
        }, {
        query: {
            isArray: true,
            transformResponse: function(response) {
                var tasks = JSON.parse(response);
                tasks.forEach(initTask);
                return tasks;
            }
        },
        saveComplete: {
            method: 'PUT',
            transformRequest: function(task) {
                return JSON.stringify({
                    id: task.id,
                    story_id: task.story_id,
                    complete: task.complete
                });
            },
            transformResponse: function(response) {
                var task = JSON.parse(response);
                initTask(task);
                return task;
            }
        }
    });

    function initTask(task) {
        task.hours = parseHours(task);
    }

    function parseHours(task) {
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
