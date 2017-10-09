pragma solidity 0.4.15;

/**
 * @title SubscribeGoalFactory
 * @dev This factory is used to create and register new SubscribeGoal.
 */

import "./GoalFactory.sol";
import "./SubscribeGoal.sol";

contract SubscribeGoalFactory is GoalFactory {

    uint public goType = 3;

    function SubscribeGoalFactory(
        address _goalRegistry,
        address _emergencyMultisig)
        GoalFactory(_goalRegistry, _emergencyMultisig)
    {
        // constructor
    }

    function kickNewGoal(
        address _founder,
        address _founderWallet,
        string  _goalTag,
        string  _goalTopic,
        bytes32 _goalContentHash,
        uint    _initialRaiseTarget)
        external
    {
        address newGoal = new SubscribeGoal(
            goalRegistry,
            goType,
            _founder,
            _founderWallet,
            emergencyMultisig,
            _goalTag,
            _goalTopic,
            _goalContentHash,
            _initialRaiseTarget);

        registerGoal(
            newGoal,
            goType,
            _goalTag,
            _founder,
            _founderWallet);
    }

}
