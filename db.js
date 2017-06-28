const MongoClient = require('mongodb').MongoClient

const uri = 'mongodb://admin:nuno5000@cluster0-shard-00-00-3mmqw.mongodb.net:27017,cluster0-shard-00-01-3mmqw.mongodb.net:27017,cluster0-shard-00-02-3mmqw.mongodb.net:27017/my-game?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin'

const Start = (timestamp,location) => ({timestamp})
const BuyIn = (timestamp, amount) => ({timestamp, amount})
const cashOut = (timestamp, amount) => ({timestamp, amount})

const Sessions = collection => {
  
  const sessions = () => 
    collection.find().sort({timestamp: 1}).project({timestamp: 1, location: 1}).toArray()

  const session = sessionId => 
    collection.findOne({_id: sessionId})

  const lastSession = () => 
    collection.findOne({}, {sort: {timestamp: -1}})

  const startSession = (sessionId, timestamp, location) =>
    collection.insertOne({_id: sessionId, location, timestamp})

  const buyIn = (sessionId, timestamp, amount) => 
    collection.updateOne({_id: sessionId}, {$push: {buyIns: {timestamp, amount}}})

  const endSession = (sessionId, timestamp, amount) => 
    collection.updateOne({_id: sessionId}, {$set: {cashOut: {timestamp, amount}}})

  return { sessions, session, lastSession, startSession, buyIn, endSession }
}

const connect = () => MongoClient.connect(uri).then(db => Sessions(db.collection('sessions')))

module.exports = { connect }