'use strict';

var _priv = {};

_priv.addTask = function _add_task(currentConfig, taskList, cb) {

    var newTasks = [];

    (function nextTask(tasks) {

        var task = tasks.shift();
        var taskParts = task.split(':');

        var taskType = taskParts[0];
        var taskName = taskParts[1];

        if (taskType !== 'clean' && currentConfig[taskType].hasOwnProperty(taskName)) {

            newTasks.push({
                fullName: task,
                type: taskType,
                name: taskName
            })
        }

        if (tasks.length !== 0) {

            nextTask(tasks);
        }
        else {

            cb(newTasks);
        }

    })(taskList.concat());

}

var tasks = function _tasks() {

    var setOrder = function _set_order(rm, next) {

        var options = rm.options;
        var grunt = rm.grunt;

        var currentConfig = grunt.config.get();

        var prodBuild = currentConfig.prod;

        // Variable to keep track of the tasks as they are added back to the queue
        var taskCallOrder = [];

        // Flush out unneded object items
        delete currentConfig.pkg;
        delete currentConfig.prod;
        delete currentConfig.jsBanner;
        delete currentConfig.cssBanner;
        delete currentConfig.componentFinder;

        var originalConfig = options.originalGrunt;

        // Flush out unneded object items
        delete originalConfig.pkg;
        delete originalConfig.prod;
        delete originalConfig.jsBanner;
        delete originalConfig.cssBanner;

        // First clear the current queue.
        grunt.task.clearQueue();

        // Manually call all of the clears
        //grunt.task.run(['clean']);

        // Add clear to the task call array
        taskCallOrder.push('clean');

        delete currentConfig.clean;
        delete originalConfig.clean;

        // Check to see if this is a production build, if so we need to remove some additional tasks.
        if (prodBuild) {

            // If this is prod build remove a few tasks completely
            for (var i = 0, len = options.prodIgnoreTasks.length; i < len; i++) {

                delete currentConfig[options.prodIgnoreTasks[i]];
                delete originalConfig[options.prodIgnoreTasks[i]];
            }

        }

        // Start by looping through and finding all the tasks that need to be executed.
        (function nextComponent(components) {

            var componentName = components.shift();
            var componentDef = rm.options.components[componentName];

            //console.log(componentName);

            if (!componentDef.buildTasks) {

                componentDef.buildTasks = [];
            }

            if (!componentDef.distTask) {

                componentDef.distTask = [];
            }

            var defaultTasks = componentDef.buildTasks.concat(componentDef.distTask.concat());

            // Lets see if we have any dist tasks to execute first.
            if (defaultTasks.length) {

                _priv.addTask(currentConfig, defaultTasks, function(addList) {

                    // Check to see if a list of options was returned
                    if (addList) {

                        (function nextTask(tasks) {

                            var taskObj = tasks.shift();

                            // Add the task to the execute queue
                            grunt.task.run(taskObj.fullName);

                            // Add this task to the list of task we called.
                            taskCallOrder.push(taskObj.fullName);

                            // Remove the task from the running config.
                            delete currentConfig[taskObj.type][taskObj.name];

                            // check to see if we can dump the running task type config because its empty.
                            if (currentConfig[taskObj.type].length <= 1) {

                                if (currentConfig[taskObj.type].length === 0) {

                                    delete currentConfig[taskObj.type];
                                }
                                else if (currentConfig[taskObj.type].length === 1 && currentConfig.hasOwnProperty('options')) {

                                    delete currentConfig[taskObj.type];
                                }

                            }

                            if (tasks.length !== 0) {

                                nextTask(tasks);
                            }

                        })(addList.concat())

                    }

                });
            }

            if (components.length !== 0) {

                nextComponent(components);
            }
            else {

                var remainingTasks = Object.keys(currentConfig);

                // Loop through and remove the run last list.
                for (var i = 0, len = options.configOrder.last.length; i < len; i++) {

                    var taskName = options.configOrder.last[i];

                    var taskPos = remainingTasks.indexOf(taskName);

                    if (taskPos !== -1) {

                        remainingTasks.splice(taskPos, 1);
                    }

                }

                // Check and run any remaining tasks other than the last run list.
                if (remainingTasks.length !== 0) {

                    // Loop though any remaining unclaimed tasks
                    (function nextTasks(tasks) {

                        var task = tasks.shift();

                        if (typeof currentConfig[task] === "object" && options.runAll.indexOf(task) === -1) {

                            var subTasks = Object.keys(currentConfig[task]);

                            if (subTasks.length !== 0) {

                                (function nextSubTask(subTasks) {

                                    var subTask = subTasks.shift();

                                    if (subTask !== "options") {

                                        grunt.task.run(task + ":" + subTask);

                                        // Add subtask to the task call array
                                        taskCallOrder.push(task + ":" + subTask);

                                    }

                                    if (subTasks.length !== 0) {

                                        nextSubTask(subTasks);
                                    }

                                })(subTasks.concat())

                            }
                        }

                        // Double check to see if this is a task that we only allow an all or nothing build to be created
                        if (options.runAll.indexOf(task) !== -1 && currentConfig[task]) {

                            grunt.task.run(task);

                            // Add all related tasks to the task call array
                            taskCallOrder.push(task);

                        }

                        if (tasks.length !== 0) {

                            nextTasks(tasks);
                        }
                        else {

                            // Loop through and run any last items tasks
                            (function nextTasks(tasks) {

                                var task = tasks.shift();

                                if (typeof currentConfig[task] === "object" && options.runAll.indexOf(task) === -1) {

                                    var subTasks = Object.keys(currentConfig[task]);

                                    if (subTasks.length !== 0) {

                                        (function nextSubTask(subTasks) {

                                            var subTask = subTasks.shift();

                                            if (subTask !== "options") {

                                                grunt.task.run(task + ":" + subTask);

                                                // Add subtask to the task call array
                                                taskCallOrder.push(task + ":" + subTask);
                                            }

                                            if (subTasks.length !== 0) {

                                                nextSubTask(subTasks);
                                            }

                                        })(subTasks.concat())

                                    }

                                }

                                // Double check to see if this is a task that we only allow an all or nothing build to be created
                                if (options.runAll.indexOf(task) !== -1 && currentConfig[task]) {

                                    grunt.task.run(task);

                                    // Add all related tasks to the task call array
                                    taskCallOrder.push(task);
                                }

                                if (tasks.length !== 0) {

                                    nextTasks(tasks);
                                }
                                else {

                                    rm.options['taskRunList'] = taskCallOrder;

                                    next(rm);
                                }

                            })(options.configOrder.last);
                        }

                    })(remainingTasks);
                }
                else {

                    // Check to see if any last run items remain and run those.
                    if (options.configOrder.last.length !== 0) {

                        (function nextTasks(tasks) {

                            var task = tasks.shift();

                            if (typeof currentConfig[task] === "object" && options.runAll.indexOf(task) === -1) {

                                var subTasks = Object.keys(currentConfig);

                                if (subTasks.length !== 0) {

                                    (function nextSubTask(subTasks) {

                                        var subTask = subTasks.shift();

                                        if (subTask !== "options") {

                                            grunt.task.run(task + ":" + subTask);

                                            // Add subtask to the task call array
                                            taskCallOrder.push(task + ":" + subTask);
                                        }

                                        if (subTasks.length !== 0) {

                                            nextSubTask(subTasks);
                                        }

                                    })(subTasks.concat())

                                }

                            }

                            // Double check to see if this is a task that we only allow an all or nothing build to be created
                            if (options.runAll.indexOf(task) !== -1 && currentConfig[task]) {

                                grunt.task.run(task);

                                // Add all related tasks to the task call array
                                taskCallOrder.push(task);
                            }

                            if (tasks.length !== 0) {

                                nextTasks(tasks);
                            }
                            else {

                                rm.options['taskRunList'] = taskCallOrder;

                                next(rm);
                            }

                        })(options.configOrder.last);

                    }

                }

                rm.options['taskRunList'] = taskCallOrder;

                next(rm);

            }

        })(Object.keys(options.components))

    };

    return {
        setOrder: setOrder
    }
}

// Export the manager function as a module
module.exports = exports = new tasks();