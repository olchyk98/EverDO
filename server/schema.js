const {
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLNonNull,
    GraphQLList,
    GraphQLID,
    GraphQLString,
    GraphQLInt,
    GraphQLBoolean
} = require('graphql');
const { GraphQLUpload } = require('apollo-server');

const fileSystem = require('fs');
// const textReader = require('textract');

const settings = require('./settings');

const User = require('./models/user');

const Topic = require('./models/topic');
const Project = require('./models/project');

const Todo = require('./models/todo');
const Notebook = require('./models/notebook');

const Task = require('./models/task');
const Note = require('./models/note');
const File = require('./models/file');

function validateAccount(_id, authToken) {
    return User.findOne({
        _id,
        authTokens: {
            $in: [authToken]
        }
    });
}

function generateNoise(length = 256) {
    let a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        b = () => Math.floor(Math.random() * a.length),
        c = "";
    
    for(let ma = 0; ma < length; ma++) {
        c += a[b()];
    }

    return c;
}

function getExtension(filename) {
    return filename.match(/[^\\]*\.(\w+)$/)[1];
}

let str = a => a.toString();

const UserType = new GraphQLObjectType({
    name: "User",
    fields: () => ({
        id: { type: GraphQLID },
        login: { type: GraphQLString },
        password: { type: GraphQLString },
        name: { type: GraphQLString },
        avatar: { type: GraphQLString },
        registeredTime: { type: GraphQLString },
        authTokens: { type: new GraphQLList(GraphQLString) },
        lastAuthToken: {
            type: GraphQLString,
            resolve({ authTokens }) {
                let a = authTokens;
                return a[a.length - 1];
            }
        },
        topics: {
            type: new GraphQLList(TopicType),
            resolve: ({ id }) => Topic.find({ creatorID: id })
        }
    })
});

const TopicType = new GraphQLObjectType({
    name: "Topic",
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        color: { type: GraphQLString },
        time: { type: GraphQLString },
        creatorID: { type: GraphQLID },
        projects: {
            type: new GraphQLList(ProjectType),
            resolve: ({ id }) => Project.find({ topicID: id })
        },
        creator: {
            type: UserType,
            resolve: ({ creatorID }) => User.findById(creatorID)
        }
    })
});

const ProjectType = new GraphQLObjectType({
    name: "Project",
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        topicID: { type: GraphQLString },
        creatorID: { type: GraphQLID },
        topic: {
            type: TopicType,
            resolve: ({ topicID }) => Topic.findById(topicID)
        },
        todos: {
            type: new GraphQLList(TodoType),
            resolve: ({ id }) => Todo.find({ projectID: id }).sort({ time: -1 })
        },
        notebooks: {
            type: new GraphQLList(NotebookType),
            resolve: ({ id }) => Notebook.find({ projectID: id }).sort({ time: -1 })
        },
        files: {
            type: new GraphQLList(FileType),
            resolve: ({ id }) => File.find({ projectID: id }).sort({ time: -1 })
        },
        todosInt: {
            type: GraphQLInt,
            resolve: ({ id }) => Todo.count({ projectID: id })
        },
        notebooksInt: {
            type: GraphQLInt,
            resolve: ({ id }) => Notebook.count({ projectID: id })
        },
        filesInt: {
            type: GraphQLInt,
            resolve: ({ id }) => File.count({ projectID: id })
        },
        creator: {
            type: UserType,
            resolve: ({ creatorID }) => User.findById(creatorID)
        }
    })
});

const TodoType = new GraphQLObjectType({
    name: "Todo",
    fields: () => ({ // title, creatorID
        id: { type: GraphQLID },
        title: { type: GraphQLString },
        projectID: { type: GraphQLID },
        creatorID: { type: GraphQLID },
        topicID: { type: GraphQLID },
        project: {
            type: ProjectType,
            resolve: ({ projectID }) => Project.findById(projectID)
        },
        topic: {
            type: TopicType,
            resolve: ({ topicID }) => Topic.findById(topicID)
        },
        tasks: {
            type: new GraphQLList(TaskType),
            resolve: ({ id }) => Task.find({ todoID: id })
        },
        creator: {
            type: UserType,
            resolve: ({ creatorID }) => User.findById(creatorID)
        }
    })
});

const TaskType = new GraphQLObjectType({
    name: "Task",
    fields: () => ({
        id: { type: GraphQLID },
        todoID: { type: GraphQLID },
        projectID: { type: GraphQLID },
        topicID: { type: GraphQLID },
        name: { type: GraphQLString },
        time: { type: GraphQLString },
        creatorID: { type: GraphQLID },
        // ACCEPT_LABEL, CANCEL_MARK, PLAN_MARK, MARKED_LABEL, SEARCH_LABEL
        labels: { type: new GraphQLList(GraphQLString) },
        isDone: { type: GraphQLBoolean },
        project: {
            type: ProjectType,
            resolve: ({ projectID }) => Project.findById(projectID)
        },
        topic: {
            type: TopicType,
            resolve: ({ topicID }) => Topic.findById(topicID)
        },
        todo: {
            type: TodoType,
            resolve: ({ todoID }) => Todo.findById(todoID)
        },
        creator: {
            type: UserType,
            resolve: ({ creatorID }) => User.findById(creatorID)
        }
    })
});

const NotebookType = new GraphQLObjectType({
    name: "Notebook",
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        creatorID: { type: GraphQLID },
        projectID: { type: GraphQLID },
        topicID: { type: GraphQLID },
        creator: {
            type: UserType,
            resolve: ({ creatorID }) => User.findById(creatorID)
        },
        project: {
            type: ProjectType,
            resolve: ({ projectID }) => Project.findById(projectID)
        },
        topic: {
            type: TopicType,
            resolve: ({ topicID }) => Topic.findById(topicID)
        },
        notes: {
            type: new GraphQLList(NoteType),
            resolve: ({ id }) => Note.find({ notebookID: id })
        }
    })
});

const NoteType = new GraphQLObjectType({
    name: "Note",
    fields: () => ({
        id: { type: GraphQLID },
        title: { type: GraphQLString },
        time: { type: GraphQLString },
        creatorID: { type: GraphQLID },
        projectID: { type: GraphQLID },
        topicID: { type: GraphQLID },
        notebookID: { type: GraphQLID },
        label: { type: GraphQLString },
        content: {
            type: GraphQLString,
            args: {
                limit: { type: GraphQLInt }
            },
            resolve: ({ content }, { limit }) => (limit) ? content.split(" ").slice(0, limit).join(" ") : content
        },
        creator: {
            type: UserType,
            resolve: ({ creatorID }) => User.findById(creatorID)
        },
        project: {
            type: ProjectType,
            resolve: ({ projectID }) => Project.findById(projectID)
        },
        topic: {
            type: TopicType,
            resolve: ({ topicID }) => Topic.findById(topicID)
        },
        notebook: {
            type: NotebookType,
            resolve: ({ notebookID }) => Notebook.findById(notebookID)
        }
    })
});

const FileType = new GraphQLObjectType({
    name: "File",
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLID },
        time: { type: GraphQLString },
        url: { type: GraphQLString },
        format: { type: GraphQLString },
        projectID: { type: GraphQLID },
        topicID: { type: GraphQLID },
        label: { type: GraphQLString },
        project: {
            type: ProjectType,
            resolve: ({ projectID }) => Project.findById(projectID)
        },
        topic: {
            type: TopicType,
            resolve: ({ topicID }) => Topic.findById(topicID)
        },
        creator: {
            type: UserType,
            resolve: ({ creatorID }) => User.findById(creatorID)
        }
    })
});

const RootQuery = new GraphQLObjectType({
    name: "rootQuery",
    fields: {
        users: {
            type: new GraphQLList(UserType),
            resolve: () => User.find({})
        },
        user: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                authToken: { type: new GraphQLNonNull(GraphQLString) },
                targetID: { type: GraphQLID }
            },
            async resolve(_, { id, authToken, targetID }) {
                // Validate account
                let user = await validateAccount(id, authToken);
                if(!user || !user._id) return null;

                // Send user
                return (targetID) ? User.findById(targetID) : user;
            }
        },
        topics: {
            type: new GraphQLList(TopicType),
            resolve: () => Topic.find({})
        },
        topic: {
            type: TopicType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                authToken: { type: new GraphQLNonNull(GraphQLString) },
                targetID: { type: new GraphQLNonNull(GraphQLID) }
            },
            async resolve(_, { id, authToken, targetID }) {
                // Validate account
                let user = await validateAccount(id, authToken);
                if(!user || !user._id) return;

                // Send topic
                return Topic.findById(targetID) || null;
            }
        },
        projects: {
            type: new GraphQLList(ProjectType),
            resolve: () => Project.find({})
        },
        project: {
            type: ProjectType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                authToken: { type: new GraphQLNonNull(GraphQLString) },
                targetID: { type: new GraphQLNonNull(GraphQLID) }
            },
            async resolve(_, { id, authToken, targetID }) {
                // Validate account
                let user = await validateAccount(id, authToken);
                if(!user || !user._id) return;

                // Send project
                return Project.findById(targetID) || null;
            }
        },
        todos: {
            type: new GraphQLList(TodoType),
            resolve: () => Todo.find({})
        },
        todo: {
            type: TodoType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                authToken: { type: new GraphQLNonNull(GraphQLString) },
                targetID: { type: new GraphQLNonNull(GraphQLID) }
            },
            async resolve(_, { id, authToken, targetID }) {
                // Validate account
                let user = await validateAccount(id, authToken);
                if(!user || !user._id) return;

                // Send todo
                return Todo.findById(targetID) || null;
            }
        },
        tasks: {
            type: new GraphQLList(TaskType),
            resolve: () => Task.find({})
        },
        task: {
            type: TaskType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                authToken: { type: new GraphQLNonNull(GraphQLString) },
                targetID: { type: new GraphQLNonNull(GraphQLID) }
            },
            async resolve(_, { id, authToken, targetID }) {
                // Validate account
                let user = await validateAccount(id, authToken);
                if(!user || !user._id) return;

                // Send task
                return Task.findById(targetID) || null;
            }
        },
        note: {
            type: NoteType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                authToken: { type: new GraphQLNonNull(GraphQLString) },
                targetID: { type: new GraphQLNonNull(GraphQLID) }
            },
            async resolve(_, { id, authToken, targetID }) {
                // Validate account
                let user = await validateAccount(id, authToken);
                if(!user) return null;

                // Submit
                return Note.findOne({
                    _id: targetID,
                    creatorID: user._id
                });
            }
        },
        readTextFile: {
            type: GraphQLString,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                authToken: { type: new GraphQLNonNull(GraphQLString) },
                url: { type: new GraphQLNonNull(GraphQLString) }
            },
            async resolve(_, { id, authToken, url }) {
                // ? Comment validation lines, if you don't need owner validation
                // Validate account
                let user = await validateAccount(id, authToken);
                if(!user) return null;

                // Validate file
                let file = await File.findOne({ url });
                if(!file || str(file.creatorID) !== str(user._id)) return null;

                url = '.'+url;
                let data = "";

                data = await (new Promise((resolve, reject) => { // basic es6 promise
                    if(fileSystem.existsSync(url)) {
                        fileSystem.readFile(url, 'utf8', (__, text) => resolve(text));
                        // textReader.fromFileWithPath(url, (__, text) => resolve(text));
                    } else {
                        reject("File is not exists!");
                    }
                }));

                return data;
            }
        }
    }
});

const RootMutation = new GraphQLObjectType({
    name: "rootMutation",
    fields: {
        registerUser: {
            type: UserType,
            args: {
                login: { type: new GraphQLNonNull(GraphQLString) },
                password: { type: new GraphQLNonNull(GraphQLString) },
                name: { type: new GraphQLNonNull(GraphQLString) },
                avatar: { type: new GraphQLNonNull(GraphQLUpload) }
            },
            async resolve(_, { login, password, name, avatar }) {
                // Get user with this login
                let clone = await User.findOne({ login });
                if(clone) return null;

                // Receive file
                let path = "";
                {
                    let { stream, filename } = await avatar;

                    path = `${ settings.paths.avatars }${ generateNoise(128) }.${ getExtension(filename) }`;
                    stream.pipe(fileSystem.createWriteStream('.' + path));
                }
                if(!path) return null;

                // Create a new user
                let authToken = generateNoise();
                let user = await (new User({
                    login, password, name,
                    avatar: path,
                    registeredTime: new Date(),
                    authTokens: [authToken],
                    lastAuthToken: authToken
                }).save());

                // Send user
                return user;
            }
        },
        loginUser: {
            type: UserType,
            args: {
                login: { type: new GraphQLNonNull(GraphQLString) },
                password: { type: new GraphQLNonNull(GraphQLString) }
            },
            async resolve(_, { login, password }) {
                // Generate a new token
                let authToken = generateNoise();

                // Submit generated token
                let user = await User.findOneAndUpdate({ login, password },
                    {
                        $push: {
                            authTokens: authToken
                        }
                    }
                );

                // Validate submition
                if(!user) return null;

                { // Validate authTokens limit
                    let a = user.authTokens,
                        b = settings.authTokensLimit;
                    if(a.length >= b) {
                        let c = await user.updateOne({
                            $pullAll: {
                                authTokens: a.slice(0, a.length - (b - 1))
                            }
                        });
                    }
                }

                // Send updated account
                return {
                    id: user._doc._id.toString(),
                    ...user._doc,
                    authTokens: [
                        ...user._doc.authTokens,
                        authToken
                    ],
                    lastAuthToken: authToken
                };
            }
        },
        addTopic: {
            type: TopicType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                authToken: { type: new GraphQLNonNull(GraphQLString) },
                color: { type: new GraphQLNonNull(GraphQLString) }
            },
            async resolve(_, { id: _id, authToken, name, color }) {
                // Validate account
                let user = await validateAccount(_id, authToken);
                if(!user) return null;

                // Add a new topic
                let topic = await (new Topic({
                    color,
                    name: "New Project",
                    creatorID: user._id,
                    time: new Date()
                }).save());

                // Submit topic
                return topic;
            }
        },
        addProject: {
            type: ProjectType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                authToken: { type: new GraphQLNonNull(GraphQLString) },
                name: { type: new GraphQLNonNull(GraphQLString) },
                topicID: { type: new GraphQLNonNull(GraphQLID) }
            },
            async resolve(_, { id, authToken, name, topicID }) {
                // Validate user
                let user = await validateAccount(id, authToken);
                if(!user) return null;

                // Validate topic and owner
                let topic = await Topic.findById(topicID);
                if(!topic || str(topic.creatorID) !== str(user._id)) return null;

                // Create project
                let project = await (new Project({
                    name, topicID,
                    creatorID: user._id
                }).save());
                if(!project) return null;

                // Submit project
                return project;
            }
        },
        addTodo: {
            type: TodoType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                authToken: { type: new GraphQLNonNull(GraphQLString) },
                projectID: { type: new GraphQLNonNull(GraphQLID) },
                title: { type: new GraphQLNonNull(GraphQLString) }
            },
            async resolve(_, { id, authToken, projectID, title }) {
                // Validate user
                let user = await validateAccount(id, authToken);
                if(!user) return null;

                // Validate project and owner
                let project = await Project.findById(projectID);
                if(!project || str(project.creatorID) !== str(user._id)) return null;
                
                // Create TODO
                let todo = await (new Todo({
                    title, projectID,
                    creatorID: user._id,
                    topicID: project.topicID,
                    time: new Date()
                }).save());

                // Submit TODO
                return todo;
            }
        },
        addTask: {
            type: TaskType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                authToken: { type: new GraphQLNonNull(GraphQLString) },
                todoID: { type: new GraphQLNonNull(GraphQLID) },
                name: { type: new GraphQLNonNull(GraphQLString) }
            },
            async resolve(_, { id, authToken, todoID, name }) {
                // Validate user
                let user = await validateAccount(id, authToken);
                if(!user) return null;

                // Validate todo and owner
                let todo = await Todo.findById(todoID);
                if(!todo || str(todo.creatorID) !== str(user._id)) return null;

                // Create task
                let task = await (new Task({
                    todoID, name,
                    time: new Date(),
                    creatorID: user._id,
                    labels: [],
                    isDone: false,
                    projectID: todo.projectID,
                    topicID: todo.topicID
                }).save());

                // Submit task
                return task;
            }
        },
        doTask: {
            type: GraphQLBoolean,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                authToken: { type: new GraphQLNonNull(GraphQLString) },
                targetID: { type: new GraphQLNonNull(GraphQLID) },
                value: { type: new GraphQLNonNull(GraphQLBoolean) }
            },
            async resolve(_, { id, authToken, targetID, value }) {
                // Validate user
                let user = await validateAccount(id, authToken);
                if(!user) return false;

                // Validate task and owner
                let task = await Task.findById(targetID);
                if(!task || str(task.creatorID) !== str(user._id)) return false;

                // Change status
                let result = await task.updateOne({
                    isDone: value
                });

                // Submit success status
                return (result) ? true:false;
            }
        },
        updateTaskLabel: {
            type: GraphQLBoolean,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                authToken: { type: new GraphQLNonNull(GraphQLString) },
                targetsID: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))) },
                label: { type: new GraphQLNonNull(GraphQLString) }
            },
            async resolve(_, { id, authToken, targetsID, label }) {
                // Validate user
                let user = await validateAccount(id, authToken);
                if(!user) return false;

                // Validate task and onwer
                let tasks = await Task.find({
                    _id: {
                        $in: targetsID
                    },
                    creatorID: user._id
                });
                if(!tasks || tasks.length !== targetsID.length) return false;

                // Update arrays
                    // Find all arrays that have this value -> updateMany => pull
                    // Find all arrays that don't have this value -> updateMany => push
                    // ! A little weird.
                
                // XXX
                let a = [];
                let b = [];
                tasks.forEach(io => {
                    if(!io.labels.includes(label)) a.push(io._id);
                    else b.push(io._id);
                });

                await Task.updateMany({ // push
                    _id: {
                        $in: a
                    }
                }, {
                    $addToSet: {
                        labels: label
                    }
                });
                let c = await Task.updateMany({ // pull
                    _id: {
                        $in: b
                    }
                }, {
                    $pull: {
                        labels: label
                    }
                });

                return true; // ! old array
                
            }
        },
        deleteTask: {
            type: GraphQLBoolean,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                authToken: { type: new GraphQLNonNull(GraphQLString) },
                targetID: { type: new GraphQLNonNull(GraphQLID) }
            },
            async resolve(_, { id, authToken, targetID }) {
                // Validate user
                let user = await validateAccount(id, authToken);
                if(!user) return false;

                let result = await Task.findOneAndDelete({
                    _id: targetID,
                    creatorID: user._id
                });

                return (result) ? true:false;
            }
        },
        setTaskName: {
            type: GraphQLBoolean,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                authToken: { type: new GraphQLNonNull(GraphQLString) },
                targetID: { type: new GraphQLNonNull(GraphQLID) },
                value: { type: new GraphQLNonNull(GraphQLString) }
            },
            async resolve(_, { id, authToken, targetID, value }) {
                // Validate user
                let user = await validateAccount(id, authToken);
                if(!user) return false;

                // Submit value
                let result = await Task.findOneAndUpdate({
                    _id: targetID,
                    creatorID: user._id
                }, {
                    name: value
                });

                return (result) ? true:false;
            }
        },
        deleteTodo: {
            type: GraphQLBoolean,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                authToken: { type: new GraphQLNonNull(GraphQLString) },
                targetID: { type: new GraphQLNonNull(GraphQLID) }
            },
            async resolve(_, { id, authToken, targetID }) {
                // Validate user
                let user = await validateAccount(id, authToken);
                if(!user) return false;

                // Validate todo
                let todo = await Todo.findOneAndDelete({
                    _id: targetID,
                    creatorID: user._id
                });

                if(!todo) return null;

                let result = await Task.deleteMany({
                    todoID: targetID
                });

                return (result) ? true:false;
            }
        },
        setTodoName: {
            type: GraphQLBoolean,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                authToken: { type: new GraphQLNonNull(GraphQLString) },
                targetID: { type: new GraphQLNonNull(GraphQLID) },
                value: { type: new GraphQLNonNull(GraphQLString) }
            },
            async resolve(_, { id, authToken, targetID, value }) {
                // Validate user
                let user = await validateAccount(id, authToken);
                if(!user) return false;

                // Submit value
                let result = await Todo.findOneAndUpdate({
                    _id: targetID,
                    creatorID: user._id
                }, {
                    title: value
                });

                return (result) ? true:false;
            }
        },
        setProjectName: {
            type: GraphQLBoolean,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                authToken: { type: new GraphQLNonNull(GraphQLString) },
                targetID: { type: new GraphQLNonNull(GraphQLID) },
                value: { type: new GraphQLNonNull(GraphQLString) }
            },
            async resolve(_, { id, authToken, targetID, value }) {
                // Validate account
                let user = await validateAccount(id, authToken);
                if(!user) return false;

                // Submit value
                let result = await Project.findOneAndUpdate({
                    _id: targetID,
                    creatorID: user._id
                }, {
                    name: value
                });

                return (result) ? true:false;
            }
        },
        deleteProject: {
            type: GraphQLBoolean,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                authToken: { type: new GraphQLNonNull(GraphQLString) },
                targetID: { type: new GraphQLNonNull(GraphQLID) }
            },
            async resolve(_, { id, authToken, targetID }) {
                // Validate user
                let user = await validateAccount(id, authToken);
                if(!user) return false;

                // Delete project
                let project = Project.findOneAndDelete({
                    _id: targetID,
                    creatorID: user._id
                });

                if(!project) return false;

                await Task.deleteMany({
                    projectID: targetID
                });

                await Todo.deleteMany({
                    projectID: targetID
                });

                await Note.deleteMany({
                    projectID: targetID
                });

                await Notebook.deleteMany({
                    projectID: targetID
                });

                await File.deleteMany({
                    projectID: targetID
                });

                return true;
            }
        },
        setTopicName: {
            type: GraphQLBoolean,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                authToken: { type: new GraphQLNonNull(GraphQLString) },
                targetID: { type: new GraphQLNonNull(GraphQLID) },
                value: { type: new GraphQLNonNull(GraphQLString) }
            },
            async resolve(_, { id, authToken, targetID, value }) {
                // Validate account
                let user = await validateAccount(id, authToken);
                if(!user) return false;
                
                // Submit value
                let result = await Topic.findOneAndUpdate({
                    _id: targetID,
                    creatorID: user._id
                }, {
                    name: value
                });

                return (result) ? true:false;
            }
        },
        deleteTopic: {
            type: GraphQLBoolean,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                authToken: { type: new GraphQLNonNull(GraphQLString) },
                targetID: { type: new GraphQLNonNull(GraphQLID) }
            },
            async resolve(_, { id, authToken, targetID }) {
                // Validate user
                let user = await validateAccount(id, authToken);
                if(!user) return false;

                // Delete topic
                let topic = await Topic.findOneAndDelete({
                    _id: targetID,
                    creatorID: user._id
                });

                if(!topic) return false;

                let filter = { topicID: targetID }

                await Task.deleteMany(filter);

                await Todo.deleteMany(filter);

                await Note.deleteMany(filter);

                await Notebook.deleteMany(filter);

                await Project.deleteMany(filter);

                let files = await File.find(filter);
                await File.deleteMany(filter);
                files.forEach(async ({ url }) => {
                    await fileSystem.unlinkSync('.' + url);
                });

                return true;
            }
        },
        updateTopicColor: {
            type: GraphQLBoolean,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                authToken: { type: new GraphQLNonNull(GraphQLString) },
                targetID: { type: new GraphQLNonNull(GraphQLID) },
                color: { type: new GraphQLNonNull(GraphQLString) }
            },
            async resolve(_, { id, authToken, targetID, color }) {
                // Validate account
                let user = await validateAccount(id, authToken);
                if(!user) return false;

                let result = await Topic.findOneAndUpdate({
                    _id: targetID,
                    creatorID: user._id
                }, { color });

                return (result) ? true:false;
            }
        },
        addNotebook: {
            type: NotebookType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                authToken: { type: new GraphQLNonNull(GraphQLString) },
                name: { type: new GraphQLNonNull(GraphQLString) },
                projectID: { type: new GraphQLNonNull(GraphQLID) }
            },
            async resolve(_, { id, authToken, name, projectID }) {
                // Validate account
                let user = await validateAccount(id, authToken);
                if(!user) return;

                // Validate project
                let project = await Project.findById(projectID);
                if(!project || str(project.creatorID) !== str(user._id)) return null;

                // Create pack
                let notes = (new Notebook({
                    creatorID: user._id,
                    name: name,
                    projectID: project._id,
                    topicID: project.topicID,
                    time: new Date()
                }).save());

                return notes;
            }
        },
        deleteNotebook: {
            type: GraphQLBoolean,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                authToken: { type: new GraphQLNonNull(GraphQLString) },
                targetID: { type: new GraphQLNonNull(GraphQLID) }
            },
            async resolve(_, { id, authToken, targetID }) {
                let user = await validateAccount(id, authToken);
                if(!user) return false;

                let notebook = await Notebook.findOneAndDelete({
                    _id: targetID,
                    creatorID: user._id
                });

                if(!notebook) return false;

                let result = await Note.deleteMany({
                    notebookID: notebook._id
                });

                return (result) ? true:false;
            }
        },
        addNote: {
            type: NoteType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                authToken: { type: new GraphQLNonNull(GraphQLString) },
                title: { type: new GraphQLNonNull(GraphQLString) },
                notebookID: { type: new GraphQLNonNull(GraphQLID) },
                content: { type: new GraphQLNonNull(GraphQLString) }
            },
            async resolve(_, { id, authToken, title, notebookID, content }) {
                // Validate account
                let user = await validateAccount(id, authToken);
                if(!user) return;

                // Validate notes
                let notes = await Notebook.findById(notebookID);
                if(!notes || str(notes.creatorID) !== str(user._id)) return null;

                // Create note
                let note = await (new Note({
                    creatorID: user._id,
                    title: title, content,
                    projectID: notes.projectID,
                    notebookID: notes._id,
                    topicID: notes.topicID,
                    label: "",
                    time: new Date()
                }).save());

                return note;
            }
        },
        deleteNote: {
            type: GraphQLBoolean,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                authToken: { type: new GraphQLNonNull(GraphQLString) },
                targetID: { type: new GraphQLNonNull(GraphQLID) }
            },
            async resolve(_, { id, authToken, targetID }) {
                let user = await validateAccount(id, authToken);
                if(!user) return false;

                let result = await Note.findOneAndDelete({
                    _id: targetID,
                    creatorID: user._id
                });

                return (result) ? true:false;
            }
        },
        updateNoteLabel: {
            type: GraphQLBoolean,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                authToken: { type: new GraphQLNonNull(GraphQLString) },
                label: { type: new GraphQLNonNull(GraphQLString) },
                targetsID: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))) }
            },
            async resolve(_, { id, authToken, label, targetsID }) {
                // Validate account
                let user = await validateAccount(id, authToken);
                if(!user) return false;

                // Submit
                let result = await Note.updateMany({
                    _id: {
                        $in: targetsID
                    },
                    creatorID: user._id
                }, {
                    label
                });

                return (result) ? true:false;
            }
        },
        updateNotebookName: {
            type: GraphQLBoolean,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                authToken: { type: new GraphQLNonNull(GraphQLString) },
                name: { type: new GraphQLNonNull(GraphQLString) },
                targetID: { type: new GraphQLNonNull(GraphQLID) }
            },
            async resolve(_, { id, authToken, name, targetID }) {
                // Validate user
                let user = await validateAccount(id, authToken);
                if(!user) return false;

                // Submit
                let result = await Notebook.findOneAndUpdate({
                    _id: targetID,
                    creatorID: user._id
                }, { name });

                return (result) ? true:false;
            }
        },
        updateNote: {
            type: GraphQLBoolean,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                authToken: { type: new GraphQLNonNull(GraphQLString) },
                targetID: { type: new GraphQLNonNull(GraphQLID) },
                title: { type: new GraphQLNonNull(GraphQLString) },
                content: { type: new GraphQLNonNull(GraphQLString) }
            },
            async resolve(_, { id, authToken, targetID, title, content }) {
                // Validate account
                let user = await validateAccount(id, authToken);
                if(!user) return false;

                // Submit
                let result = await Note.findOneAndUpdate({
                    _id: targetID,
                    creatorID: user._id
                }, {
                    title,
                    content
                });

                return (result) ? true:false;
            }
        },
        createFile: {
            type: FileType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                authToken: { type: new GraphQLNonNull(GraphQLString) },
                projectID: { type: new GraphQLNonNull(GraphQLID) },
                file: { type: new GraphQLNonNull(GraphQLUpload) }
            },
            async resolve(_, { id, authToken, projectID, file }) {
                let user = await validateAccount(id, authToken);
                if(!user) return null;

                let project = await Project.findById(projectID);
                if(!project || str(project.creatorID) !== str(user._id)) return null;

                let fPath = "",
                    fName = "",
                    fFormat = "";
                { // receive file
                    let { stream, filename } = await file;

                    fFormat = getExtension(filename);
                    fPath = `${ settings.paths.projectfiles }${ generateNoise(128) }.${ fFormat }`;
                    fName = filename.replace(/\.[^/.]+$/, ""); // without extension
                    
                    stream.pipe(fileSystem.createWriteStream('.' + fPath));                    
                }
                if(!fPath || !fFormat) return null;

                let nFile = (new File({
                    name: fName,
                    format: fFormat,
                    url: fPath,
                    creatorID: user._id,
                    projectID: project._id,
                    topicID: project.topicID,
                    label: "",
                    time: new Date()
                }).save());

                return nFile;
            }
        },
        updateFileName: {
            type: GraphQLBoolean,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                authToken: { type: new GraphQLNonNull(GraphQLString) },
                name: { type: new GraphQLNonNull(GraphQLString) },
                targetID: { type: new GraphQLNonNull(GraphQLID) }
            },
            async resolve(_, { id, authToken, name, targetID }) {
                // Validate user
                let user = await validateAccount(id, authToken);
                if(!user) return false;

                // Validate and Fill
                let result = await File.findOneAndUpdate({
                    _id: targetID,
                    creatorID: user._id
                }, { name });

                return (result) ? true:false;
            }
        },
        deleteFile: {
            type: GraphQLBoolean,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                authToken: { type: new GraphQLNonNull(GraphQLString) },
                targetID: { type: new GraphQLNonNull(GraphQLID) }
            },
            async resolve(_, { id, authToken, targetID }) {
                // Validate account
                let user = await validateAccount(id, authToken);
                if(!user) return false;

                // Delete material file
                {
                    let { url } = await File.findById(targetID);
                    await fileSystem.unlinkSync('.' + url);
                }

                // Delete file from database
                let result = await File.findOneAndDelete({
                    _id: targetID,
                    creatorID: user._id
                });

                return (result) ? true:false;
            }
        },
        updateFileLabel: {
            type: GraphQLBoolean,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                authToken: { type: new GraphQLNonNull(GraphQLString) },
                targetsID: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))) },
                label: { type: new GraphQLNonNull(GraphQLString) }
            },
            async resolve(_, { id, authToken, targetsID, label }) {
                // Validate account
                let user = await validateAccount(id, authToken);
                if(!user) return false;

                // Submit
                let result = await File.updateMany({
                    _id: {
                        $in: targetsID
                    },
                    creatorID: user._id
                }, { label });
                
                return (result) ? true:false;
            }
        },
        updateUserData: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                authToken: { type: new GraphQLNonNull(GraphQLString) }, 
                login: { type: new GraphQLNonNull(GraphQLString) },
                password: { type: new GraphQLNonNull(GraphQLString) },
                name: { type: new GraphQLNonNull(GraphQLString) },
                avatar: { type: new GraphQLNonNull(GraphQLUpload) }
            },
            async resolve(_, { id, authToken, login, password, name, avatar }) {
                // Validate account
                let user = await validateAccount(id, authToken);
                if(!user) return null;

                
                if(avatar) { // receive file
                    var path = "";
                    let { stream, filename } = await avatar;

                    path = `${ settings.paths.avatars }${ generateNoise(128) }.${ getExtension(filename) }`;
                    stream.pipe(fileSystem.createWriteStream('.' + path));
                    if(!path) return null;
                }

                return user.updateOne({
                    login: login || user.login,
                    password: password || user.password,
                    name: name || user.name,
                    avatar: path || user.avatar
                });
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutation
});