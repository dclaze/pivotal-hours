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

angular.module('PivotalApp').controller('Main', ['$scope', '$http', 'Story', 'Task', function($scope, $http, Story, Task) {
    $scope.tasksOnly = false;
    var loadMembers = function() {
        $http.get('projects/' + $scope.project_id + '/memberships', {}).success(function(response) {
            $scope.members = response;
        });
    };

    var init = function() {
        $scope.token = localStorage.getItem("token");
        $http.defaults.headers.common["X-TrackerToken"] = $scope.token;
        $scope.project_id = localStorage.getItem("project_id");
        if ($scope.token && $scope.project_id)
            loadMembers();
    };
    init();

    $scope.updateProjectId = function(project_id) {
        localStorage.setItem("project_id", project_id);
        if ($scope.token && $scope.project_id)
            loadMembers();
    };

    $scope.updateToken = function(token) {
        localStorage.setItem("token", token);
        $http.defaults.headers.common["X-TrackerToken"] = $scope.token;
        if ($scope.token && $scope.project_id)
            loadMembers();
    };

    $scope.$watch('member.person.id', function(personId) {
        if (personId)
            $scope.stories = Story.query({
                project_id: $scope.project_id,
                filter: "owner:" + $scope.member.person.id
            });
        else
            $scope.stories = [];
    });

    $scope.getSumOfCompletedHours = function() {
        return ($scope.stories || [])
            .map(function(s) {
                return s.getCompletedTaskTotal();
            })
            .reduce(function(a, b) {
                return a + b;
            }, 0);
    };

    $scope.getTotalHours = function() {
        return ($scope.stories || [])
            .map(function(s) {
                return s.getTaskTotal();
            })
            .reduce(function(a, b) {
                return a + b;
            }, 0);
    };
}]);
