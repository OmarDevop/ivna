const {MongoClient, ObjectID} = require('mongodb')


const connectionURL = process.env.MONGO_URL || 'mongodb://mongo:27017'
const databaseName = 'task-manager'


MongoClient.connect(connectionURL, {useNewUrlParser: true}, (error, client) => {
    if(error){
        return console.log('Unable to connect to database')
       }
       
       
       const db = client.db(databaseName)


       db.collection('tasks').deleteOne({
           description: 'Pot plans'
       }).then((result) => {

        console.log(result)
       }).catch((error) => {
            console.log(error)
       })
    
})