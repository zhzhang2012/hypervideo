angular.module("hypervideo", ['ngAnimate', 'ngRoute', 'hypervideo.controllers', 'hypervideo.directives', 'hypervideo.services'])

    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                controller: 'videoCtrl',
                templateUrl: '/partials/video.html'
            })
    });








