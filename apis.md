### citizen

## http://localhost:4500/api/addBlockToProposals

{
"previousHash":"000000",
"nounce":2,
"transactions": [
{
"id": "tx_1",
"sender": "ajit",
"receiver": "someone_else",
"amount": 1000,
"timestamp": "2025-06-21T21:28:30.065Z",
"signature": "9a704f39a59b118928d426d6381155487b850ad3a308b33399d7b5484706dca1"
},
{
"id": "tx_2",
"sender": "ajit",
"receiver": "someone_else",
"amount": 1000,
"timestamp": "2025-06-21T21:28:33.530Z",
"signature": "d5c4cc172bd78f9e6a551194a38de71b28aa87ef183c965afe661950f0de6704"
}
]
}

## http://localhost:5500/addBlockToBlockchain

````{
    "approverCitizen":"ajitesh",
    "VRFValue":"abc",
    "VRFProof":"xyz",
    "previousHash":"111111111111111111111",
    "nounce":4,
    "transactions": [
            {
                "id": "tx_1",
                "sender": "ajit",
                "receiver": "someone_else",
                "amount": 1000,
                "timestamp": "2025-06-21T21:28:30.065Z",
                "signature": "9a704f39a59b118928d426d6381155487b850ad3a308b33399d7b5484706dca1"
            },
            {
                "id": "tx_2",
                "sender": "ajit",
                "receiver": "someone_else",
                "amount": 1000,
                "timestamp": "2025-06-21T21:28:33.530Z",
                "signature": "d5c4cc172bd78f9e6a551194a38de71b28aa87ef183c965afe661950f0de6704"
            }
        ]
}```

## http://localhost:5500/proposeBlockToPoliticians

````

{
"pvtKey":4500
}

````

## http://localhost:5500/signBlockProposal

```{
    "pvtKey":5501,
    "approverCitizen":5501,
    "block": {
                "header": {
                    "noOfTransactions": 2,
                    "prevHash": "4b64cb03c0147b1c3c282e012a5c13f8f7be9bd595bcded6b3c89a1a01e929c0",
                    "nounce": 0
                },
                "data": {
                    "transactions": [
                        {
                            "id": "tx_1",
                            "sender": "ajit",
                            "receiver": "someone_else",
                            "amount": 1000,
                            "timestamp": "2025-06-21T21:28:30.065Z",
                            "signature": "9a704f39a59b118928d426d6381155487b850ad3a308b33399d7b5484706dca1"
                        },
                        {
                            "id": "tx_2",
                            "sender": "ajit",
                            "receiver": "someone_else",
                            "amount": 1000,
                            "timestamp": "2025-06-21T21:28:33.530Z",
                            "signature": "d5c4cc172bd78f9e6a551194a38de71b28aa87ef183c965afe661950f0de6704"
                        }
                    ]
                },
                "hash": "2ed4d3bdac243b1c4c62c713602ef81b2462b7d61b6f93ab69a50a68ce7d5ec7"
            }
}```


## http://localhost:5500/addBlockToBlockchain
```
{
    "previousHash":"000000",
    "nounce":2,
    "transactions": [
            {
                "id": "tx_1",
                "sender": "ajit",
                "receiver": "someone_else",
                "amount": 1000,
                "timestamp": "2025-06-21T21:28:30.065Z",
                "signature": "9a704f39a59b118928d426d6381155487b850ad3a308b33399d7b5484706dca1"
            },
            {
                "id": "tx_2",
                "sender": "ajit",
                "receiver": "someone_else",
                "amount": 1000,
                "timestamp": "2025-06-21T21:28:33.530Z",
                "signature": "d5c4cc172bd78f9e6a551194a38de71b28aa87ef183c965afe661950f0de6704"
            }
        ]
}```

````

## http://localhost:4500/api/addNewProposal

{
"approverCitizen":"ajitesh",
"VRFValue":"abc",
"VRFProof":"xyz",
"previousHash":"111111111111111111111",
"nounce":4,
"transactions": [
{
"id": "tx_1",
"sender": "ajit",
"receiver": "someone_else",
"amount": 1000,
"timestamp": "2025-06-21T21:28:30.065Z",
"signature": "9a704f39a59b118928d426d6381155487b850ad3a308b33399d7b5484706dca1"
},
{
"id": "tx_2",
"sender": "ajit",
"receiver": "someone_else",
"amount": 1000,
"timestamp": "2025-06-21T21:28:33.530Z",
"signature": "d5c4cc172bd78f9e6a551194a38de71b28aa87ef183c965afe661950f0de6704"
}
]
}
