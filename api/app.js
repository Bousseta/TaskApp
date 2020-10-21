const express = require('express');
const app =express();
const  {mongoose} = require('./db/mongoose');
const bodyParser =require('body-parser');
const jwt = require('jsonwebtoken');
// load  in the mongoos models
const {Task, List, User} =require('./db/models');


/* MIDDLEWARE  */

// Load middleware
app.use(bodyParser.json());
// CORS HEADERS MIDDLEWARE
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id");

    res.header(
        'Access-Control-Expose-Headers',
        'x-access-token, x-refresh-token'
    );

    next();
});


// check whether the request has a valid JWT access token
let authenticate = (req, res, next) => {
    let token = req.header('x-access-token');

    // verify the JWT
    jwt.verify(token, User.getJWTSecret(), (err, decoded) => {
        if (err) {
            // there was an error
            // jwt is invalid - * DO NOT AUTHENTICATE *
            res.status(401).send(err);
        } else {
            // jwt is valid
            req.user_id = decoded._id;
            next();
        }
    });
}
let verifySession = (req, res, next) => {
    let refreshToken = req.header('x-refresh-token');

    // grab the _id from the request header
    let _id = req.header('_id');

    User.findByIdAndToken(_id, refreshToken).then((user) => {
        if (!user) {
            // user couldn't be found
            return Promise.reject({
                'error': 'User not found. Make sure that the refresh token and user id are correct'
            });
        }
        req.user_id = user._id;
        req.userObject = user;
        req.refreshToken = refreshToken;

        let isSessionValid = false;

        user.sessions.forEach((session) => {
            if (session.token === refreshToken) {
                // check if the session has expired
                if (User.hasRefreshTokenExpired(session.expiresAt) === false) {
                    // refresh token has not expired
                    isSessionValid = true;
                }
            }
        });

        if (isSessionValid) {
            next();
        } else {
            // the session is not valid
            return Promise.reject({
                'error': 'Refresh token has expired or the session is invalid'
            })
        }

    }).catch((e) => {
        res.status(401).send(e);
    })
}
/* END MIDDLEWARE  */
app.get('/lists',authenticate,(req,res)=> {
    // return an array of all the lists in the DB
    List.find({_userId: req.user_id}).then((lists)=> {
        res.send(lists);
    })
})
app.get('/lists/:numPage',authenticate,(req,res)=> {
    const numPage= req.params.numPage ;
    List.find().skip(5*(numPage-1)).limit(5).then((lists)=> {
        res.send(lists);
    })
})
app.get('/list/:numPage',authenticate,(req,res)=> {
    const numPage= req.params.numPage ;
    const { page, perPage } = req.query;
    const options = {
        page: parseInt(page, 10) || numPage,
        limit: parseInt(perPage, 10) || 3,
    };
    List.paginate({},options).then((lists)=> {
        res.send(lists);
    })
})
app.post('/lists',authenticate,(req,res)=> {
    //create a new list and return the new list document back to the user
    let title= req.body.title;
    let newList = new List({
        title,
        _userId: req.user_id
    })
    newList.save().then((listDoc) => {
        res.send(listDoc);
    })
})
app.patch('/lists/:id',authenticate,(req,res)=> {
    List.findOneAndUpdate({_id:req.params.id,_userId: req.user_id}, {
        $set: req.body
    }).then(() => {
        res.sendStatus(200)
    })

})
app.delete('/lists/:id',authenticate,(req,res)=> {
    List.findOneAndRemove({_id:req.params.id,_userId:req.user_id}, {
        $set: req.body
    }).then((removeListDoc) => {
        res.send(removeListDoc);
        deleteTasksFromList(removeListDoc._id)
    })
})
app.get('/lists/:listId/tasks/:numPage',authenticate, (req,res)=> {
    const numPage= req.params.numPage ;
    Task.find({
        _listId: req.params.listId,

    }).skip(5*(numPage-1)).limit(5).then((tasks) => {
        res.send(tasks);
    })
})
app.get('/lists/:listId/tasks/:taskId',authenticate, (req,res)=> {

    Task.findOne({
        _id:req.params.taskId,
        _listId: req.params.listId
    }).then((tasks) => {
        res.send(tasks);
    })
})
app.post('/lists/:listId/tasks', authenticate, (req, res) => {
    // We want to create a new task in a list specified by listId

    List.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list) => {
        if (list) {
            // list object with the specified conditions was found
            // therefore the currently authenticated user can create new tasks
            return true;
        }

        // else - the list object is undefined
        return false;
    }).then((canCreateTask) => {
        if (canCreateTask) {
            let newTask = new Task({
                title: req.body.title,
                _listId: req.params.listId
            });
            newTask.save().then((newTaskDoc) => {
                res.send(newTaskDoc);
            })
        } else {
            res.sendStatus(404);
        }
    })
})
app.patch('/lists/:listId/tasks/:taskId', authenticate, (req, res) => {
    // We want to update an existing task (specified by taskId)

    List.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list) => {
        if (list) {
            // list object with the specified conditions was found
            // therefore the currently authenticated user can make updates to tasks within this list
            return true;
        }

        // else - the list object is undefined
        return false;
    }).then((canUpdateTasks) => {
        if (canUpdateTasks) {
            // the currently authenticated user can update tasks
            Task.findOneAndUpdate({
                    _id: req.params.taskId,
                    _listId: req.params.listId
                }, {
                    $set: req.body
                }
            ).then(() => {
                res.send({ message: 'Updated successfully.' })
            })
        } else {
            res.sendStatus(404);
        }
    })
});
app.delete('/lists/:listId/tasks/:taskId',authenticate, (req,res) => {
    List.findOne({
        _id:req.params._listId,
        _userId:req.params.user_id
    }).then((list)=>{
        if (list){
            return true;
        }
        return false;

    }).then((canDeleteTasks)=>{
        if (canDeleteTasks){
            Task.findOneAndRemove({
                _id:req.params.taskId,
                _listId:req.params.listId
            }).then((removeTaskDoc) => {
                res.sendStatus(removeTaskDoc)
            })
        }else {
            res.sendStatus(404);
        }
    });
});

app.post('/users', (req, res) => {
    // User sign up
    let body = req.body;
    let newUser = new User(body);
    newUser.save().then(() => {
        return newUser.createSession();
    }).then((refreshToken) => {
        // Session created successfully - refreshToken returned.
        // now we geneate an access auth token for the user

        return newUser.generateAccessAuthToken().then((accessToken) => {
            // access auth token generated successfully, now we return an object containing the auth tokens
            return { accessToken, refreshToken }
        });
    }).then((authTokens) => {
        // Now we construct and send the response to the user with their auth tokens in the header and the user object in the body
        res
            .header('x-refresh-token', authTokens.refreshToken)
            .header('x-access-token', authTokens.accessToken)
            .send(newUser);
    }).catch((e) => {
        res.status(400).send(e);
    })
})
app.post('/users/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    User.findByCredentials(email, password).then((user) => {
        return user.createSession().then((refreshToken) => {
            // Session created successfully - refreshToken returned.
            // now we geneate an access auth token for the user

            return user.generateAccessAuthToken().then((accessToken) => {
                // access auth token generated successfully, now we return an object containing the auth tokens
                return { accessToken, refreshToken }
            });
        }).then((authTokens) => {
            // Now we construct and send the response to the user with their auth tokens in the header and the user object in the body
            res
                .header('x-refresh-token', authTokens.refreshToken)
                .header('x-access-token', authTokens.accessToken)
                .send(user);
        })
    }).catch((e) => {
        res.status(400).send(e);
    });
})
//generates and returns an access token
app.get('/users/me/access-token', verifySession, (req, res) => {
    // we know that the user/caller is authenticated and we have the user_id and user object available to us
    req.userObject.generateAccessAuthToken().then((accessToken) => {
        res.header('x-access-token', accessToken).send({ accessToken });
    }).catch((e) => {
        res.status(400).send(e);
    });
})

let deleteTasksFromList = (_listId) => {
    Task.deleteMany({
        _listId
    }).then(() => {
        console.log("Tasks from " + _listId + " were deleted!");
    })
}
app.listen(3000, () => {
    console.log("Server is listening")
})
