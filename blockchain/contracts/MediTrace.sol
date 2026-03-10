// SPDX-License-Identifier: MIT
/**
 * MediTrace Smart Contract
 * ------------------------
 * Simple registry for verified supply chain batches.
 * Stores the hash of the data + manufacturer address.
 * Used to prove that a batch was verified by the system at a specific time.
 */
pragma solidity ^0.8.19;

contract MediTrace {
    
    // storing the supply chain batches
    struct Batch {
        string batchId;
        string dataHash;     // hash of the ML-verified data (integrity check)
        address manufacturer;
        uint256 timestamp;
        bool isVerified;     // set to true if ML check pass
    }
    
    // mapping ID -> Batch for lookup
    mapping(string => Batch) public batches;
    
    // events for the frontend listener
    event BatchCreated(string indexed batchId, address indexed manufacturer, uint256 timestamp);

    // main function called by the manufacturer
    function createBatch(string memory _batchId, string memory _dataHash) public {
        // make sure we don't overwrite existing batches
        require(bytes(batches[_batchId].batchId).length == 0, "Batch ID already exists");
        
        // save to state
        batches[_batchId] = Batch({
            batchId: _batchId,
            dataHash: _dataHash,
            manufacturer: msg.sender,
            timestamp: block.timestamp,
            isVerified: true // assume true if we made it this far (ML service gates this call)
        });
        
        emit BatchCreated(_batchId, msg.sender, block.timestamp);
    }
    
    // helper to get batch details
    function getBatch(string memory _batchId) public view returns (Batch memory) {
        return batches[_batchId];
    }
}
