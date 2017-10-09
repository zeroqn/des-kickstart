pragma solidity 0.4.15;

/**
 * @title Goal
 * @dev This is base contract for any type goal. Most of logic code is
 * implement in library. Since there is not way to use modifier in library,
 * we place them here.
 */

import "./GoalLibrary.sol";

contract Goal {

    using GoalLibrary for GoalLibrary.Goal;

    GoalLibrary.Goal public goal;

    modifier onlyFounderOrEmergencyMultiSig() {
        require(goal.isSenderEmergencyMultisig() || goal.isSenderFounder());
        _;
    }

    modifier onlyFounder() {
        require(goal.isSenderFounder());
        _;
    }

    modifier onlyStatus(GoalLibrary.Status _status) {
        require(goal.status == _status);
        _;
    }

    modifier invalidStatus(GoalLibrary.Status _status) {
        require(goal.status != _status);
        _;
    }

    event OnContentHashUpdated(
        uint indexed lastRev,
        bytes32 contentHash,
        uint datetime);
    event OnStatusChanged(GoalLibrary.Status status, uint datetime);

    function Goal(
        address _goalRegistry,
        uint    _goType,
        address _founder,
        address _founderWallet,
        address _emergencyMultisig,
        string  _goalTag,
        string  _goalTopic,
        bytes32 _goalContentHash)
    {
        require(_goalRegistry != 0x0);
        require(_goType > 0);
        require(_founder != 0x0);
        require(_founderWallet != 0x0);
        require(_emergencyMultisig != 0x0);
        // TODO: tag should begin with '#'
        require(bytes(_goalTag).length > 0);
        require(bytes(_goalTopic).length > 0);
        require(_goalContentHash != "");

        // constructor
        goal.construct(
            _goalRegistry,
            _goType,
            _founder,
            _founderWallet,
            _emergencyMultisig,
            _goalTag,
            _goalTopic,
            _goalContentHash
        );
        goal.active();
    }

    function setGoalRegistry(address _registry)
        onlyFounderOrEmergencyMultiSig
        external
    {
        require(_registry != 0x0);
        goal.setRegistry(_registry);
    }

    function setFounderWalletAddress(address _newAddress)
        onlyFounderOrEmergencyMultiSig
        external
    {
        require(_newAddress != 0x0);
        goal.setFounderWalletAddress(_newAddress);
    }

    function getLastContentHash()
        external constant returns (bytes32)
    {
        return goal.getLastContentHash();
    }

    function updateContentHash(bytes32 _contentHash)
        onlyFounderOrEmergencyMultiSig
        external
    {
        require(_contentHash != "");

        uint lastRev = goal.updateContentHash(_contentHash);
        OnContentHashUpdated(lastRev, _contentHash, now);
    }

    // @notive cannot initialize status to Active inside construct function
    // here provide active() function as a workaround.
    function active()
        onlyStatus(GoalLibrary.Status.Uninitialized)
        internal
    {
        goal.active();
        OnStatusChanged(GoalLibrary.Status.Active, now);
    }

    function pause()
        onlyFounderOrEmergencyMultiSig
        onlyStatus(GoalLibrary.Status.Active)
        external
    {
        goal.pause();
        OnStatusChanged(GoalLibrary.Status.Pause, now);
    }

    function cancel()
        onlyFounderOrEmergencyMultiSig
        invalidStatus(GoalLibrary.Status.Finish)
        external
    {
        goal.cancel();
        OnStatusChanged(GoalLibrary.Status.Cancel, now);
    }

    function reviveFromPause()
        onlyFounderOrEmergencyMultiSig
        onlyStatus(GoalLibrary.Status.Pause)
        external
    {
        goal.reviveFromPause();
        OnStatusChanged(GoalLibrary.Status.Active, now);
    }

    function finish()
        onlyFounderOrEmergencyMultiSig
        onlyStatus(GoalLibrary.Status.Active)
        public
    {
        goal.finish();
        OnStatusChanged(GoalLibrary.Status.Finish, now);
    }

}
