/**
 * Created with JetBrains WebStorm.
 * User: Tony_Zhang
 * Date: 14-1-28
 * Time: 下午2:59
 * To change this template use File | Settings | File Templates.
 */

angular.module('hypervideo.directives', [])

    .directive("xvideo", function (DataProvider, $compile, $timeout, $templateCache, $http) {
        var activityMaterial = DataProvider.activityMaterial;
        var problemMaterial = DataProvider.problemMaterial;
        var videoArray = [];
        videoArray.push(activityMaterial.video.url);
        for (var i = 0; i < problemMaterial.length; i++) {
            if (typeof problemMaterial[i].correct_video != "undefined")
                videoArray.push(problemMaterial[i].correct_video.url);
            if (typeof problemMaterial[i].wrong_video != "undefined")
                videoArray.push(problemMaterial[i].wrong_video.url);
        }


        return {
            restrict: "E",
            link: function ($scope, $element) {
                var templateUrl = '/partials/_videoTemplate.html';
                var loadVideoPromise = $http.get(templateUrl, {cache: $templateCache}).success(function (contents) {
                    $element.html(contents);
                    $compile($element.contents())($scope);
                });
                loadVideoPromise.then(function () {
                    $scope.videos = videoArray;
                    $scope.showVideo = {};
                    //get all the video DOM elements and stor them into an array
                    var videoDOMMap = {};
                    var videoDOMMapPromise = $timeout(function () {
                        videoDOMMap[activityMaterial.video.url] = $element.contents()[0].children[0];
                        var j = 1;
                        for (var i = 0; i < problemMaterial.length; i++) {
                            if (typeof problemMaterial[i].correct_video != "undefined")
                                videoDOMMap[problemMaterial[i].correct_video.url] = $element.contents()[0].children[j++];
                            if (typeof problemMaterial[i].wrong_video != "undefined")
                                videoDOMMap[problemMaterial[i].wrong_video.url] = $element.contents()[0].children[j++];
                        }
                    }, 0);

                    videoDOMMapPromise.then(function () {
                        var video = videoDOMMap[activityMaterial.video.url];
                        var popcorn = Popcorn('#video_0');
                        $scope.showVideo[activityMaterial.video.url] = true;
                        video.play();
                        //add listener for dynamically setting up the width and height of the containers
                        video.addEventListener('loadedmetadata', function () {
                            var videoWidth = this.videoWidth;
                            var videoHeight = this.videoHeight;
                            $(".videoContainer").css("height", function () {
                                return videoHeight;
                            });
                            $(".videoContainer").css("width", function () {
                                return videoWidth;
                            });
                            $(".problemContainer").css("width", function () {
                                return videoWidth - 40;
                            });
                        });
                        var currentProblem;
                        var pausedTime = '0', enterTime = 0, submitTime = 0, duration = 0;
                        $scope.showChoice = [];
                        $scope.isSelected = [];
                        $scope.choiceMsg = [];
                        angular.forEach(problemMaterial, function (problem) {
                            popcorn.cue(problem.show_time, function () {
                                video.pause();
                                video.removeAttribute('controls');
                                pausedTime = video.currentTime;
                                currentProblem = problem;
                                $scope.$apply(function () {
                                    $scope.choices = problem.choices;
                                    $scope.showProblem = true;
                                    enterTime = Date.now();
                                    console.log("Student starts tackling the problem at time: " + enterTime);
                                    // dynamically set the "left" css attribute
                                    $timeout(function () {
                                        for (var i = 0; i < problem.choices.length; i++)
                                            $("#choiceContainer_" + i).css("left", function () {
                                                var marginLeft = ($(".videoContainer").width() -
                                                    problem.choices.length * 160) / 2;
                                                return marginLeft + 160 * i;
                                            });
                                    }, 0);
                                    if (problem.type == "singlechoice") {
                                        for (var i = 0; i < problem.choices.length; i++)
                                            $scope.choiceMsg[i] = String.fromCharCode(65 + i)
                                    } else {
                                        $scope.choiceMsg[0] = "正确";
                                        $scope.choiceMsg[1] = "错误";
                                    }
                                })
                            })
                        });

                        var hyperVideo = function (videoObj, index) {
                            $scope.showVideo[activityMaterial.video.url] = false;
                            $scope.showVideo[videoObj.url] = true;
                            $scope.hasSelected = true;
                            var subVideo = videoDOMMap[videoObj.url];
                            subVideo.setAttribute('controls', 'controls');
                            subVideo.play();
                            subVideo.addEventListener("ended", function () {
                                subVideo.pause();
                                $scope.$apply(function () {
                                    $scope.showProblem = false;
                                    $scope.showVideo[videoObj.url] = false;
                                    $scope.showVideo[activityMaterial.video.url] = true;
                                    $scope.hasSelected = false;
                                    $scope.isSelected[index] = null;
                                })
                                if (typeof videoObj.jump != "undefined")
                                    pausedTime = videoObj.jump;
                                video.src = video.currentSrc;
                                video.setAttribute('controls', 'controls');
                                video.load();
                                video.play();
                            })
                        };
                        $scope.chooseOption = function (index) {
                            /**
                             * TODO Mixpanel submit answer
                             */
                            $scope.isSelected[index] = "selected";
                            submitTime = Date.now();
                            duration = submitTime - enterTime;
                            console.log("Student finishes the problem at time: " + submitTime);
                            console.log("Student spent time: " + duration);
                            console.log("Does student get the right answer: " + currentProblem.choices[index].is_correct);
                            if (currentProblem.choices[index].is_correct) {
                                if (typeof currentProblem.correct_video != "undefined") {
                                    hyperVideo(currentProblem.correct_video, index);
                                } else {
                                    $scope.showProblem = false;
                                    $scope.isSelected[index] = null;
                                    currentProblem++;
                                    video.src = video.currentSrc;
                                    video.setAttribute('controls', 'controls');
                                    video.load();
                                    video.play();
                                }
                            } else {
                                if (typeof currentProblem.wrong_video != "undefined") {
                                    hyperVideo(currentProblem.wrong_video, index);
                                } else {
                                    $scope.showProblem = false;
                                    $scope.isSelected[index] = null;
                                    currentProblem++;
                                    video.src = video.currentSrc;
                                    video.setAttribute('controls', 'controls');
                                    video.load();
                                    video.play();
                                }
                            }
                        };

                        //add listener for resume mainstream video
                        video.addEventListener('canplay', function () {
                            video.currentTime = pausedTime;
                        });
                    })
                })
            }
        }
    });

