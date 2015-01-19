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
        var re = /\[(.*?)\]/g;

        var match;

        while(match = re.exec(task.description)) {
            var number = parseFloat(match[1]);
            if(!isNaN(number))
                return number;
        }

        return null;
    }

    return Task;
}]);
