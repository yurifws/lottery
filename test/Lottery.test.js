const assert = require('assert');
const ganache = require('ganache');
const { Web3 } = require('web3');
const web3 = new Web3(ganache.provider());
 
const { abi, evm } = require('../compile');

let lottery;
let accounts;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    
    lottery = await new web3.eth.Contract(abi)
        .deploy({ data: evm.bytecode.object })
        .send({ from: accounts[0], gas: '1000000' }); 
});

describe('Lottery', () => {
    it('deploys a contract', () => {
        assert.ok(lottery.options.address)
    });

    
    it('allows one account to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.01', 'ether')
        })

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.equal(accounts[0], players[0]);
        assert.equal(1, players.length);

    });

    it('allows mutiple accounts to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.01', 'ether')
        })
        
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.01', 'ether')
        })

        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.01', 'ether')
        })

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.equal(accounts[0], players[0]);
        assert.equal(accounts[1], players[1]);
        assert.equal(accounts[2], players[2]);
        assert.equal(3, players.length);

    });

    
    it('require a minimum ammount of ether to enter', async () => {

        let errorCaught = false;

        try {

            await lottery.methods.enter().send({
                from: accounts[0],
                value: 0
            });
        } catch (error) {
            errorCaught = true;
        }
            assert(errorCaught);
    });

    it('only the manager can call pickWinner', async () => {
        const manager = await lottery.methods.manager().call();
        
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether')
        });
        
        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.02', 'ether')
        });
        
        let errorCaught = false;
        
        try {
            const receipt = await lottery.methods.pickWinner().send({
                from: accounts[1],
                gas: '1000000'
            });
        } catch (error) {
            errorCaught = true;
        }
        
        assert(errorCaught);
    });
    
    it('sends money to the winner and resets the player array', async () => {
        
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });

        const initialBalance = await web3.eth.getBalance(accounts[0]);

        await lottery.methods.pickWinner().send({
            from: accounts[0],
        });

        const finalBalance = await web3.eth.getBalance(accounts[0]);

        const difference = finalBalance - initialBalance;

        assert(difference > web3.utils.toWei('0.018', 'ether'));
    });
    
});
