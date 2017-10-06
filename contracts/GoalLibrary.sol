pragma solidity 0.4.15;

/**
 * @title GoalLibrary
 * @dev Implement most of logic functions for Goal contract.
 */

import "./GoalRegistry.sol";

library GoalLibrary {

    enum Status { Uninitialized, Active, Pause, Cancel, Finish }

    struct Goal {
        GoalRegistry registry;
        Status       status;
        address      founder;
        address      founderWallet;
        address      emergencyMultisig;     // can pause or cancel a goal
        string       tag;                   // for example: #AirCar
        string       topic;                 // for example: A car can fly
        uint         lastRev;
        mapping (uint => bytes32) contentHashes;
        uint         minFundraiseTarget;
        uint         createdOn;
        uint         modifiedOn;
        uint         finalizedOn;
    }

    function construct(
        Goal storage self,
        address _goalRegistry,
        address _founder,
        address _founderWallet,
        address _emergencyMultisig,
        string  _goalTag,
        string  _goalTopic,
        bytes32 _goalContentHash,
        uint    _minFundraseTarget)
        internal
    {
        self.registry = GoalRegistry(_goalRegistry);
        self.founder = _founder;
        self.founderWallet = _founderWallet;
        self.emergencyMultisig = _emergencyMultisig;
        self.tag = _goalTag;
        self.topic = _goalTopic;
        self.lastRev = 1;
        self.contentHashes[self.lastRev] = _goalContentHash;
        self.minFundraiseTarget = _minFundraseTarget;
        self.createdOn = now;
        self.modifiedOn = now;
    }

    function setRegistry(Goal storage self, address _registry)
        internal
    {
        self.registry = GoalRegistry(_registry);
        self.modifiedOn = now;
    }

    function isSenderEmergencyMultisig(Goal storage self)
        internal constant returns (bool)
    {
        return self.emergencyMultisig == msg.sender;
    }

    function isSenderFounder(Goal storage self)
        internal constant returns (bool)
    {
        return self.founder == msg.sender;
    }

    function setFounderWalletAddress(Goal storage self, address _newAddress)
        internal
    {
        self.founderWallet = _newAddress;
        self.modifiedOn = now;
    }

    function getLastContentHash(Goal storage self)
        internal constant returns (bytes32)
    {
        return self.contentHashes[self.lastRev];
    }

    function updateContentHash(Goal storage self, bytes32 _contentHash)
        internal returns (uint lastRev)
    {
        self.lastRev += 1;
        self.contentHashes[self.lastRev] = _contentHash;
        self.modifiedOn = now;
        return self.lastRev;
    }

    function active(Goal storage self)
        internal
    {
        self.status = Status.Active;
    }

    function pause(Goal storage self)
        internal
    {
        self.status = Status.Pause;
    }

    function cancel(Goal storage self)
        internal
    {
        self.status = Status.Cancel;
    }

    function reviveFromPause(Goal storage self)
        internal
    {
        self.status = Status.Active;
    }

    function finish(Goal storage self)
        internal
    {
        self.status = Status.Finish;
    }

}
