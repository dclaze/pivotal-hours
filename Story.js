angular.module('PivotalApp').factory('Story', ['$resource', 'Task', 'Comment', function($resource, Task, Comment) {
    var Story = $resource('projects/:project_id/stories', {}, {
        query: {
            isArray: true,
            transformResponse: function(response) {
                var stories = JSON.parse(response);
                stories.forEach(function(story) {
                    story.tasks = Task.query({project_id: story.project_id, story_id: story.id});
					story.comments = Comment.query({project_id: story.project_id, story_id: story.id});
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
