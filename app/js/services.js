/**
 * Created with JetBrains WebStorm.
 * Author: Zhenghan
 * Date: 13-8-1
 * Time: 下午9:27
 * To change this template use File | Settings | File Templates.
 */
angular.module('hypervideo.services', [])
    .factory("DataProvider", function () {
        var activityMaterial =
        {
            title: "example_video",
            type: "hypervideo",
            video: {
                url: "/resources/main_video.mp4"
            }
        }

        var problemMaterial =
            [
                {
                    id: "p1",
                    title: "vocab test no.1",
                    type: "singlechoice",
                    body: "Choose the antonym of 'unswerving'.",
                    show_time: 5,
                    correct_video: {
                        url: "/resources/insert_2.mp4"
                    },
                    choices: [
                        {
                            id: "p1c1",
                            body: "tenacious",
                            is_correct: false
                        },
                        {
                            id: "p1c2",
                            body: "indomitable",
                            is_correct: false
                        },
                        {
                            id: "p1c3",
                            body: "persistent",
                            is_correct: false
                        },
                        {
                            id: "p1c4",
                            body: "craven",
                            is_correct: true
                        }
                    ]
                },
                {
                    id: "p2",
                    title: "vocab test no.2",
                    type: "binarychoice",
                    body: "Choose the synonym of 'impecunious'.",
                    show_time: 10,
                    wrong_video: {
                        url: "/resources/insert_1.mp4",
                        jump: 20
                    },
                    choices: [
                        {
                            id: "p2c1",
                            body: "generosity",
                            is_correct: true
                        },
                        {
                            id: "p2c2",
                            body: "impoverished",
                            is_correct: false
                        }
                    ]
                }
            ]
        return {
            activityMaterial: activityMaterial,
            problemMaterial: problemMaterial
        }
    })
