angular.module('PivotalApp', []);

angular.module('PivotalApp').config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push(function() {
        var baseUrl = "https://www.pivotaltracker.com/services/v5/";
        return {
            request: function(request) {
                request.url = baseUrl + request.url
                return request;
            }
        };
    });
}]);

angular.module('PivotalApp').controller('Main', ['$scope', '$http', function($scope, $http) {
    $scope.tasksOnly = false;
    var loadMembers = function() {
        $http.get('projects/' + $scope.projectId + '/memberships', {}).success(function(response) {
            $scope.members = response;
        });
    };

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

    $scope.loadWork = function() {
        $http.get('projects/' + $scope.projectId + '/stories', {
            params: {
                filter: 'owner:' + $scope.member.person.id
            }
        }).success(function(response) {
            $scope.stories = response;
            $scope.stories.forEach(function(story) {
                getTasks(story).success(function(tasks) {
                    story.tasks = tasks.map(function(t) {
                        t.hours = parseTaskHours(t);
                        return t;
                    });
                });
            });
        });
    };

    var getTasks = function(story) {
        return $http.get('projects/' + $scope.projectId + '/stories/' + story.id + '/tasks');
    };

    $scope.$watch('stories', function(stories) {
        if (!stories)
            return;
        var tasks = stories.map(function(story) {
            return story.tasks;
        }).filter(function(task) {
            return typeof(task) != "undefined";
        });
        tasks = tasks.reduce(function(a, b) {
            return a.concat(b);
        }, []);
        $scope.completedTaskCount = $scope.getCompletedTaskTotal(tasks);
        $scope.totalTaskCount = $scope.getTaskTotal(tasks);
    }, true);

    $scope.getCompletedTaskTotal = function(tasks) {
        if (!tasks)
            return;

        return tasks.map(function(t) {
            return t.complete ? t.hours : 0;
        }).filter(function(t) {
            return t != null;
        }).reduce(function(a, b) {
            return a + b;
        }, 0);
    };

    $scope.getTaskTotal = function(tasks) {
        if (!tasks)
            return;

        return tasks.map(function(t) {
            return t.hours;
        }).filter(function(t) {
            return t != null;
        }).reduce(function(a, b) {
            return a + b;
        }, 0);
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
