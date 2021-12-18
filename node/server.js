const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

const MongoClient = require('mongodb').MongoClient;

const uri = "mongodb+srv://samruhe:mongopass@recoupdb.sy0im.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
var db;

app.use(bodyParser.json());

client.connect(err => {

  if (err) {
    return console.log(err);
  }

  db = client.db('recoupdb');
  
  app.listen(port, () => {
      console.log(`Listening on ${port}!`);
    });
});


app.get('/', (req, res) => {});
app.get('/users/existing', (req, res) => getExistingUsernames(req, res));
app.get('/:username', (req, res) => getUserChats(req, res));
app.get('/:owner/:recipient/messages', (req, res) => getUserChatMessages(req, res));
app.put('/:sentBy/:sentTo/message', (req, res) => sendMessage(req, res));
app.post('/:sentBy/:sentTo/message', (req, res) => sendNewMessage(req, res));
app.post('/add/user/:username', (req, res) => addNewUser(req, res));

getExistingUsernames = (req, res) => {
    db.collection('users').find().toArray()
        .then(result => {
            var existingUsers = result.map(user => user.username);
            return res.send({ status: 'SUCCESS', usernames: existingUsers });
        })
        .catch(err => {
            console.log(err);
            return res.send({ status: 'ERROR', message: 'DB_ERR' });
        });
}

getUserChats = (req, res) => {
    var username = req.params.username;

    // finds all chats that 'username' has
    db.collection('user_messages').findOne({ username: username })
        .then(result => {
            if (result) {
                // sorts by time
                var chats = result.messages;
                chats.sort((a, b) => {
                    var date1 = new Date(a.lastMessageTime);
                    var date2 = new Date(b.lastMessageTime);
                    return date1 < date2 ? 1 : -1;
                });
    
                return res.send({ status: 'SUCCESS', chats: chats });
            } else
                return res.send({ status: 'SUCCESS', chats: [] });
        })
        .catch(err => {
            console.log(err);
            return res.send({ status: 'ERROR', message: 'DB_ERR' });
        });
}

getUserChatMessages = (req, res) => {
    var { owner, recipient } = req.params;

    // finds id of the chat that two users have together
    db.collection('chat_ids').findOne({ $or:[ { user1: owner, user2: recipient }, { user1: recipient, user2: owner } ]})
        .then(result => {
            if (result) {
                var chat_id = result.chat_id;

                // finds the messages associatied with the chat_id
                db.collection('chat_messages').findOne({ chat_id: chat_id })
                    .then(result => {
                        return res.send({ status: 'SUCCESS', messages: result.messages });
                    })
                    .catch(err => {
                        console.log(err);
                        return res.send({ status: 'ERROR', message: 'DB_ERR' });
                    });
            } else {
                return res.send({ status: 'ERROR', message: 'DB_ERR' });
            }
        })
        .catch(err => {
            console.log(err);
            return res.send({ status: 'ERROR', message: 'DB_ERR' });
        });
}

sendMessage = (req, res) => {
    var { sentBy, sentTo } = req.params;
    var { message } = req.body;
    var timeNow = Date.now();

    // finds chat_id of chat between these two users
    db.collection('chat_ids').findOne({ $or:[ { user1: sentBy, user2: sentTo }, { user1: sentTo, user2: sentBy } ]})
        .then(result => {
            // if chat already exists
            if (result) {
                var chat_id = result.chat_id;

                // update the chat to add new message
                db.collection('chat_messages').updateOne( { chat_id: chat_id}, { $push: { messages: { sentBy: sentBy, message: message, time: timeNow } } })
                    .then(result => {
                        if (result.modifiedCount === 1) {
                            // update table to show most recent message on screen with list of all messages
                            db.collection('user_messages').findOne({ username: sentBy })
                                .then(result => {
                                    var toUpdate = result.messages;
                                    var idx = toUpdate.findIndex(obj => obj.toUsername === sentTo);
                                    toUpdate[idx].lastMessage = message;
                                    toUpdate[idx].lastMessageTime = timeNow;
                                    
                                    db.collection('user_messages').updateOne({ username: sentBy }, { $set: { messages: toUpdate } })
                                        .then(result => {
                                            if (result.modifiedCount === 1) {
                                                db.collection('user_messages').findOne({ username: sentTo })
                                                    .then(result => {
                                                        var toUpdate = result.messages;
                                                        var idx = toUpdate.findIndex(obj => obj.toUsername === sentBy);
                                                        toUpdate[idx].lastMessage = message;
                                                        toUpdate[idx].lastMessageTime = timeNow;

                                                        db.collection('user_messages').updateOne({ username: sentTo }, { $set: { messages: toUpdate } })
                                                            .then(result => {
                                                                if (result.modifiedCount === 1)
                                                                    return res.send({ status: 'SUCCESS', username: sentTo });
                                                                else
                                                                    return res.send({ status: 'ERROR', message: 'DB_ERR' });
                                                            })
                                                            .catch(err => {
                                                                console.log(err);
                                                                return res.send({ status: 'ERROR', message: 'DB_ERR' });
                                                            });
                                                    })
                                                    .catch(err => {
                                                        console.log(err);
                                                        return res.send({ status: 'ERROR', message: 'DB_ERR' });
                                                    });
                                                
                                            }
                                            else
                                                return res.send({ status: 'ERROR', message: 'DB_ERR' });
                                        })
                                        .catch(err => {
                                            console.log(err);
                                            return res.send({ status: 'ERROR', message: 'DB_ERR' });
                                        });
                                })
                                .catch(err => {
                                    console.log(err);
                                    return res.send({ status: 'ERROR', message: 'DB_ERR' });
                                });
                        }
                        else
                            return res.send({ status: 'ERROR', message: 'DB_ERR' });
                    })
                    .catch(err => {
                        console.log(err);
                        return res.send({ status: 'ERROR', message: 'DB_ERR' });
                    });
            } else { // error if chat does not exist
                return res.send({ status: 'ERROR', message: 'DB_ERR' });
            }
        })
        .catch(err => {
            console.log(err);
            return res.send({ status: 'ERROR', message: 'DB_ERR' });
        });
}

sendNewMessage = (req, res) => {
    var { sentBy, sentTo } = req.params;
    var { message } = req.body;
    var timeNow = Date.now();

    // see if recipient exists
    db.collection('users').find().toArray()
        .then(result => {
            var users = result.map(user => user.username);
            if (!users.includes(sentTo))
                return res.send({ status: 'ERROR', message: 'USER DOES NOT EXIST' });
            
            // find chat_id for chat between these two users
            db.collection('chat_ids').findOne({ $or:[ { user1: sentBy, user2: sentTo }, { user1: sentTo, user2: sentBy } ]})
                .then(result => {
                    // if chat exists
                    if (result) {
                        var chat_id = result.chat_id;

                        // update chat to have new message
                        db.collection('chat_messages').updateOne( { chat_id: chat_id}, { $push: { messages: { sentBy: sentBy, message: message, time: timeNow } } })
                            .then(result => {
                                if (result.modifiedCount === 1) {
                                    // updated users messages to show most recent on screen with all messages
                                    db.collection('user_messages').findOne({ username: sentBy })
                                    .then(result => {
                                        // if messages with this user already exist
                                        if (result) {
                                            var toUpdate = result.messages;
                                            var idx = toUpdate.findIndex(obj => obj.toUsername === sentTo);
                                            if (idx != -1) { // if there is already a chat with the user
                                                toUpdate[idx].lastMessage = message;
                                                toUpdate[idx].lastMessageTime = timeNow;

                                                db.collection('user_messages').updateOne({ username: sentBy }, { $set: { messages: toUpdate } })
                                                    .then(result => {
                                                        if (result.modifiedCount === 1)
                                                            return res.send({ status: 'SUCCESS', username: sentTo });
                                                        else
                                                            return res.send({ status: 'ERROR', message: 'DB_ERR' });
                                                    })
                                                    .catch(err => {
                                                        console.log(err);
                                                        return res.send({ status: 'ERROR', message: 'DB_ERR' });
                                                    });
                                            } else { // if no previous chat with this user
                                                db.collection('user_messages').updateOne({ username: sentBy }, { $push: { messages: { toUsername: sentTo, lastMessage: message, lastMessageTime: timeNow } } })
                                                    .then(result => {
                                                        if (result.modifiedCount === 1)
                                                            return res.send({ status: 'SUCCESS', username: sentTo });
                                                        else
                                                            return res.send({ status: 'ERROR', message: 'DB_ERR' });
                                                    })
                                                    .catch(err => {
                                                        console.log(err);
                                                        return res.send({ status: 'ERROR', message: 'DB_ERR' });
                                                    });
                                            }
                                        } 
                                        // else { // if users do not have messages
                                        //     db.collection('user_messages').insert({ username: sentBy, messages: [{ toUsername: sentTo, lastMessage: message, lastMessageTime: timeNow }]})
                                        //         .then(result => {
                                        //             if (result.insertedCount === 1) {
                                        //                 db.collection('user_messages').insert({ username: sentTo, messages: [{ toUsername: sentBy, lastMessage: message, lastMessageTime: timeNow }]})
                                        //                     .then(result => {
                                        //                         if (result.insertedCount === 1)
                                        //                             return res.send({ status: 'SUCCESS' });
                                        //                         else
                                        //                             return res.send({ status: 'ERROR', message: 'DB_ERR' });
                                        //                     })
                                        //                     .catch(err => {
                                        //                         console.log(err);
                                        //                         return res.send({ status: 'ERROR', message: 'DB_ERR' });
                                        //                     });
                                        //             }
                                        //             else {
                                        //                 return res.send({ status: 'ERROR', message: 'DB_ERR' });
                                        //             }
                                        //         })
                                        //         .catch(err => {
                                        //             console.log(err);
                                        //             return res.send({ status: 'ERROR', message: 'DB_ERR' });
                                        //         });
                                        // }
                                    })
                                    .catch(err => {
                                        console.log(err);
                                        return res.send({ status: 'ERROR', message: 'DB_ERR' });
                                    });
                                }
                                else
                                    return res.send({ status: 'ERROR', message: 'DB_ERR' });
                            })
                            .catch(err => {
                                console.log(err);
                                return res.send({ status: 'ERROR', message: 'DB_ERR' });
                            });
                    } else { // if first message between these two users, chat does not currently exist
                        // get highest chat_id to create new id
                        db.collection('chat_ids').find().sort({ chat_id: -1 }).limit(1).toArray()
                            .then(result => {
                                var new_chat_id = 0;
                                if (result.length > 0)
                                    new_chat_id = result[0].chat_id + 1;
                                db.collection('chat_ids').insert({ chat_id: new_chat_id, user1: sentBy, user2: sentTo })
                                    .then(result => {
                                        if (result.insertedCount === 1) {
                                            // insert the chat messages with associated id
                                            db.collection('chat_messages').insert({ chat_id: new_chat_id, messages: [{ sentBy: sentBy, message: message, time: timeNow }]})
                                                .then(result => {
                                                    if (result.insertedCount === 1) {
                                                        // updated users messages to show most recent on screen with all messages
                                                        db.collection('user_messages').findOne({ username: sentBy })
                                                            .then(result => {
                                                                // if messages with this user already exist
                                                                if (result) {
                                                                    var toUpdate = result.messages;
                                                                    var idx = toUpdate.findIndex(obj => obj.toUsername === sentTo);
                                                                    if (idx != -1) { // if there is already a chat with the user
                                                                        toUpdate[idx].lastMessage = message;
                                                                        toUpdate[idx].lastMessageTime = timeNow;

                                                                        db.collection('user_messages').updateOne({ username: sentBy }, { $set: { messages: toUpdate } })
                                                                            .then(result => {
                                                                                if (result.modifiedCount === 1)
                                                                                    return res.send({ status: 'SUCCESS', username: sentTo });
                                                                                else
                                                                                    return res.send({ status: 'ERROR', message: 'DB_ERR' });
                                                                            })
                                                                            .catch(err => {
                                                                                console.log(err);
                                                                                return res.send({ status: 'ERROR', message: 'DB_ERR' });
                                                                            });
                                                                    } else { // if no previous chat with this user
                                                                        db.collection('user_messages').updateOne({ username: sentBy }, { $push: { messages: { toUsername: sentTo, lastMessage: message, lastMessageTime: timeNow } } })
                                                                            .then(result => {
                                                                                if (result.modifiedCount === 1) {
                                                                                    db.collection('user_messages').updateOne({ username: sentTo }, { $push: { messages: { toUsername: sentBy, lastMessage: message, lastMessageTime: timeNow } } })
                                                                                        .then(result => {
                                                                                            if (result.modifiedCount === 1)
                                                                                                return res.send({ status: 'SUCCESS', username: sentTo });
                                                                                            else
                                                                                                return res.send({ status: 'ERROR', message: 'DB_ERR' });
                                                                                        })
                                                                                        .catch(err => {
                                                                                            console.log(err);
                                                                                            return res.send({ status: 'ERROR', message: 'DB_ERR' });
                                                                                        });
                                                                                }
                                                                                else
                                                                                    return res.send({ status: 'ERROR', message: 'DB_ERR' });
                                                                            })
                                                                            .catch(err => {
                                                                                console.log(err);
                                                                                return res.send({ status: 'ERROR', message: 'DB_ERR' });
                                                                            });
                                                                    }
                                                                } else { // if users do not have messages
                                                                    db.collection('user_messages').insert({ username: sentBy, messages: [{ toUsername: sentTo, lastMessage: message, lastMessageTime: timeNow }]})
                                                                        .then(result => {
                                                                            if (result.insertedCount === 1) {
                                                                                db.collection('user_messages').insert({ username: sentTo, messages: [{ toUsername: sentBy, lastMessage: message, lastMessageTime: timeNow }]})
                                                                                    .then(result => {
                                                                                        if (result.insertedCount === 1)
                                                                                            return res.send({ status: 'SUCCESS' });
                                                                                        else
                                                                                            return res.send({ status: 'ERROR', message: 'DB_ERR' });
                                                                                    })
                                                                                    .catch(err => {
                                                                                        console.log(err);
                                                                                        return res.send({ status: 'ERROR', message: 'DB_ERR' });
                                                                                    });
                                                                            }
                                                                            else {
                                                                                return res.send({ status: 'ERROR', message: 'DB_ERR' });
                                                                            }
                                                                        })
                                                                        .catch(err => {
                                                                            console.log(err);
                                                                            return res.send({ status: 'ERROR', message: 'DB_ERR' });
                                                                        });
                                                                }
                                                            })
                                                            .catch(err => {
                                                                console.log(err);
                                                                return res.send({ status: 'ERROR', message: 'DB_ERR' });
                                                            });
                                                    } 
                                                    else {
                                                        return res.send({ status: 'ERROR', message: 'DB_ERR' });
                                                    }
                                                })
                                                .catch(err => {
                                                    console.log(err);
                                                    return res.send({ status: 'ERROR', message: 'DB_ERR' });
                                                });
                                        } else {
                                            return res.send({ status: 'ERROR', message: 'DB_ERR' });
                                        }
                                    })
                                    .catch(err => {
                                        console.log(err);
                                        return res.send({ status: 'ERROR', message: 'DB_ERR' });
                                    });
                            })
                            .catch(err => {
                                console.log(err);
                                return res.send({ status: 'ERROR', message: 'DB_ERR' });
                            });
                    }
                })
                .catch(err => {
                    console.log(err);
                    return res.send({ status: 'ERROR', message: 'DB_ERR' });
                });
        })
        .catch(err => {
            console.log(err);
            return res.send({ status: 'ERROR', message: 'DB_ERR' });
        });
}

addNewUser = (req, res) => {
    var username = req.params.username;

    db.collection('users').insert({ username: username })
        .then(result => {
            if (result.insertedCount === 1)
                return res.send({ status: 'SUCCESS' });
            else
                return res.send({ status: 'ERROR', message: 'DB_ERR' });
        })
        .catch(err => {
            console.log(err);
            return res.send({ status: 'ERROR', message: 'DB_ERR' });
        });
}