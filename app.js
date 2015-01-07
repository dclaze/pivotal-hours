angular.module('PivotalApp', ['ngResource']);

angular.module('PivotalApp').config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push(function() {
        var baseUrl = "https://www.pivotaltracker.com/services/v5/";
        return {
            request: function(request) {
                request.url = baseUrl + request.url;
                return request;
            }
        };
    });
}]);

angular.module('PivotalApp').controller('Main', ['$scope', '$http', '$resource', function($scope, $http, $resource) {
    $scope.tasksOnly = false;
    var loadMembers = function() {
        $http.get('projects/' + $scope.projectId + '/memberships', {}).success(function(response) {
            $scope.members = response;
        });
    };

    var Story = $resource('projects/:projectId/stories', {}, {
        query: {
            isArray: true,
            transformResponse: function(response) {
                var stories = JSON.parse(response);
                stories.forEach(function(story) {
                    story.tasks = Task.query({projectId: $scope.projectId, storyId: story.id});
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

    var init = function() {
        $scope.token = localStorage.getItem("token");
        $scope.projectId = localStorage.getItem("projectId");
        $http.defaults.headers.common["X-TrackerToken"] = $scope.token;
        if ($scope.projectId)
            loadMembers();
    };
    init();

    $scope.updateToken = function(token) {
        localStorage.setItem("token", token);
        $http.defaults.headers.common["X-TrackerToken"] = $scope.token;
    };

    $scope.updateProjectId = function(projectId) {
        localStorage.setItem("projectId", projectId);
    };

    $scope.$watch('member.person.id', function(personId) {
        if(personId)
            $scope.stories = Story.query({
                projectId: $scope.projectId,
                filter: "owner:"+$scope.member.person.id
            });
        else
            $scope.stories = [];
    });

    $scope.getSumOfCompletedHours = function() {
        return ($scope.stories || [])
            .map(function(s) { return s.getCompletedTaskTotal(); })
            .reduce(function(a, b) {return a + b;}, 0);
    };

    $scope.getTotalHours = function() {
        return ($scope.stories || [])
            .map(function(s) {return s.getTaskTotal(); })
            .reduce(function(a, b) {return a + b;}, 0);
    };

    var parseTaskHours = function(task) {
        var match = task.description.match(/\[(\s*\d+\s*)\]/);
        if (match) {
            var value = match[1].trim();
            var number = Number.parseInt(value);
            return isNaN(number) ? null : number;
        }
        return null;};

}]);
