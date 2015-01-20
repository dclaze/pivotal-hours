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

    function loadMembers() {
        $http.get('projects/' + $scope.project_id + '/memberships', {}).success(function(response) {
            $scope.members = response;
        });
    }

    function loadProjects() {
        $http.get('projects').success(function(projects) {
            $scope.projects = projects;
            if(!$scope.project_id)
                $scope.project_id = projects[0].id;
        });
    }

    function loadMe() {
        $http.get('me').success(function(response) {
            $scope.me = response;
        });
    }

    var init = function() {
        $scope.token = localStorage.getItem("token");
        $scope.project_id = localStorage.getItem("project_id");
    };

    init();

    $scope.$watch('project_id', function(project_id) {
        if(project_id)
            localStorage.setItem("project_id", project_id);
        else
            localStorage.removeItem("project_id");
    });

    $scope.$watch('token', function(token) {
        $http.defaults.headers.common["X-TrackerToken"] = $scope.token;

        if(token) {
            localStorage.setItem("token", token);
            loadProjects();
            loadMe();
        }
        else
            localStorage.removeItem("token", token);
    });

    $scope.$watchGroup(['token', 'project_id'], function(stuff) {
        if(stuff[0] && stuff[1])
            loadMembers();
    });

    $scope.$watchGroup(['members', 'me'], function(membersAndMe) {
        var members = membersAndMe[0];
        var me = membersAndMe[1];

        if(me && members) {
            var match = members.filter(function(member) {
                return member.person.id == me.id;
            })[0];

            if(match)
                $scope.member = match;
        }
    });

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
