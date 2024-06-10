// backend/routes/contract.js
const express = require('express');
const router = express.Router();
const Web3 = require('web3');
const contractABI = require('../contractABI.json');

// Initialize Web3
const web3 = new Web3('https://l1rpc.katla.taiko.xyz'); // Use the correct RPC URL

// Load contract ABI
const contractAddress = '0x324B330F774802aA9D3Dee3D8d3a49Fb20580987'; // Replace with your contract address
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Define API endpoints
router.get('/getData', async (req, res) => {
    try {
        const data = await contract.methods.getData().call();
        res.json({ data });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/setData', async (req, res) => {
    const { newData } = req.body;
    try {
        const accounts = await web3.eth.getAccounts();
        const result = await contract.methods.setData(newData).send({ from: accounts[0] });
        res.json({ transactionHash: result.transactionHash });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
