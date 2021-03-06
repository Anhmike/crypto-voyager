'use strict';
var CryptoJS = require("crypto-js");
var express = require("express");
var bodyParser = require('body-parser');

// var http_port = process.env.HTTP_PORT || 3001;
var http_port = process.env.PORT || 3001;

class Block {
    constructor(index, previousHash, timestamp, data, hash) {
        this.index = index;
        this.previousHash = previousHash.toString();
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash.toString();
    }
}

// index: 0
// pervoiusHash: 0
// timestapm: 1520098489.815
// data: this genesis block!!
// hash: a9d9999af5983ce47ea33feee41a35a076a5c2c4cc6da73edac32227d046c0c6
var getGenesisBlock = () => {
    return new Block(0, "0", "1520098489.815", "this genesis block!!", "a9d9999af5983ce47ea33feee41a35a076a5c2c4cc6da73edac32227d046c0c6");
};

var blockchain = [getGenesisBlock()];

var initHttpServer = () => {
    var app = express();

    app.use(bodyParser.urlencoded());
    app.use(bodyParser.json());

    app.get('/blocks', (req, res) => {

        console.log('get' + JSON.stringify(blockchain));

        res.send(
            JSON.stringify(blockchain)
            // blockchain
        )
    });
    app.post('/nextBlock', (req, res) => {

        var newBlock = generateNextBlock(req.body.data);
        addBlock(newBlock);

        // console.log('block added: ' + JSON.stringify(newBlock));
        res.send();
    });

    app.listen(http_port, () => console.log('Listening http on port: ' + http_port));
};

var generateNextBlock = (blockData) => {
    var previousBlock = getLatestBlock();
    var nextIndex = previousBlock.index + 1;
    var nextTimestamp = new Date().getTime() / 1000;
    var nextHash = calculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockData);
    return new Block(nextIndex, previousBlock.hash, nextTimestamp, blockData, nextHash);
};

var calculateHashForBlock = (block) => {
    return calculateHash(block.index, block.previousHash, block.timestamp, block.data);
};

var calculateHash = (index, previousHash, timestamp, data) => {
    return CryptoJS.SHA256(index + previousHash + timestamp + data).toString();
};

var addBlock = (newBlock) => {
    if (isValidNewBlock(newBlock, getLatestBlock())) {
        blockchain.push(newBlock);
    }
};

var isValidNewBlock = (newBlock, previousBlock) => {
    if (previousBlock.index + 1 !== newBlock.index) {
        console.log('invalid index');
        return false;
    } else if (previousBlock.hash !== newBlock.previousHash) {
        console.log('invalid previoushash');
        return false;
    } else if (calculateHashForBlock(newBlock) !== newBlock.hash) {
        console.log(typeof(newBlock.hash) + ' ' + typeof calculateHashForBlock(newBlock));
        console.log('invalid hash: ' + calculateHashForBlock(newBlock) + ' ' + newBlock.hash);
        return false;
    }
    return true;
};

var getLatestBlock = () => blockchain[blockchain.length - 1];
initHttpServer();