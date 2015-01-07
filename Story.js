angular.module('PivotalApp').factory('Story', ['$resource', 'Task', function($resource, Task) {
    var Story = $resource('projects/:projectId/stories', {}, {
        query: {
            isArray: true,
            transformResponse: function(response) {
                var stories = JSON.parse(response);
                stories.forEach(function(story) {
                    story.tasks = Task.query({projectId: story.project_id, storyId: story.id});
                });
                return stories;
            }
        }
    });

    Story.prototype.getCompletedTaskTotal = function() {
        return this.tasks
            .filter(function(t) {return t.complete;})
            .map(function(t) {return t.hours || 0;})
            .reduce(function(a, b) {return a + b;}, 0);
    };

    Story.prototype.getTaskTotal = function() {
        return this.tasks
            .map(function(t) {return t.hours || 0;})
            .reduce(function(a, b) {return a + b;}, 0);
    };

    return Story;
}]);
